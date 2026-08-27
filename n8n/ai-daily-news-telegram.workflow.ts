/**
 * نشرة الذكاء الاصطناعي اليومية → تليجرام
 *
 * كود مصدري لـ n8n Workflow SDK. هذا هو المرجع للـ workflow المنشور،
 * فأي تعديل تعمله على الكانفس عدّله هنا أيضاً حتى يبقى المصدر مطابقاً.
 *
 * المسار: جدولة يومية → 22 مصدر RSS/Atom → تنظيف وفلترة → منع تكرار عبر
 * التشغيلات → تحرير بالعربية عبر Claude مع بحث ويب → تنظيف HTML وتقسيم →
 * إرسال على تليجرام.
 *
 * إعدادات على مستوى الـ workflow (تُضبط من واجهة n8n، ليست جزءاً من الكود):
 *   timezone: Asia/Riyadh
 *   executionTimeout: 180
 *   saveDataErrorExecution: all
 */

import {
  workflow,
  node,
  trigger,
  sticky,
  placeholder,
  newCredential,
  expr,
} from '@n8n/workflow-sdk';

const dailyTrigger = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.4,
  config: {
    name: 'Daily 09:00 Riyadh',
    position: [-460, 0],
    parameters: {
      rule: {
        interval: [{ field: 'cronExpression', expression: '0 9 * * *' }],
      },
    },
  },
  output: [{}],
});

const feedSources = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Feed Sources',
    position: [-240, 0],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `// قائمة مصادر الأخبار. أضف أو احذف سطراً لتغيير التغطية.
//
// ⚠️ المصادر تُقرأ واحداً وراء الآخر، وحد التنفيذ 180 ثانية للـ workflow كله.
//    فمصدر واحد بطيء يعلّق الطابور. لا تتجاوز 20 مصدراً، وتجنّب المواقع
//    التي تحجب عناوين السحابة (Reddit و Product Hunt و MIT Tech Review حُذفت لهذا السبب).
const feeds = [
  // ── المصادر الرسمية للشركات ──
  { label: 'OpenAI',        url: 'https://openai.com/news/rss.xml' },
  { label: 'Anthropic',     url: 'https://www.anthropic.com/rss.xml' },
  { label: 'Google AI',     url: 'https://blog.google/technology/ai/rss/' },
  { label: 'DeepMind',      url: 'https://deepmind.google/blog/rss.xml' },
  { label: 'Microsoft AI',  url: 'https://blogs.microsoft.com/ai/feed/' },
  { label: 'AWS ML',        url: 'https://aws.amazon.com/blogs/machine-learning/feed/' },
  { label: 'Hugging Face',  url: 'https://huggingface.co/blog/feed.xml' },

  // ── سجلات إصدارات الأدوات (تلتقط كل ميزة جديدة فور نزولها) ──
  { label: 'Claude Code',   url: 'https://github.com/anthropics/claude-code/releases.atom' },
  { label: 'OpenAI Codex',  url: 'https://github.com/openai/codex/releases.atom' },
  { label: 'Gemini CLI',    url: 'https://github.com/google-gemini/gemini-cli/releases.atom' },
  { label: 'Ollama',        url: 'https://github.com/ollama/ollama/releases.atom' },
  { label: 'ComfyUI',       url: 'https://github.com/comfyanonymous/ComfyUI/releases.atom' },
  { label: 'n8n',           url: 'https://github.com/n8n-io/n8n/releases.atom' },

  // ── المواقع الإخبارية ──
  { label: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { label: 'VentureBeat',   url: 'https://venturebeat.com/category/ai/feed/' },
  { label: 'The Verge AI',  url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
  { label: 'Ars Technica',  url: 'https://arstechnica.com/ai/feed/' },

  // ── اكتشاف الأدوات والمواقع الجديدة ──
  { label: 'Hacker News',   url: 'https://hnrss.org/newest?q=AI+OR+LLM+OR+Claude+OR+GPT&points=100' },
  { label: 'Simon Willison', url: 'https://simonwillison.net/atom/everything/' },
];

return feeds.map((f) => ({ json: f }));`,
    },
  },
  output: [{ label: 'OpenAI', url: 'https://openai.com/news/rss.xml' }],
});

const readFeed = node({
  type: 'n8n-nodes-base.rssFeedRead',
  version: 1.2,
  config: {
    name: 'Read Feed',
    position: [-20, 0],
    // بلا إعادة محاولة عمداً: المصادر تُقرأ بالتسلسل وحد التنفيذ 180 ثانية،
    // فإعادة المحاولة كانت تضاعف زمن أي مصدر معلّق وتقطع التشغيل كله.
    onError: 'continueRegularOutput',
    parameters: {
      url: expr('{{ $json.url }}'),
      options: { customFields: 'author, contentSnippet, summary' },
    },
  },
  output: [
    {
      title: 'Claude Code v2.1.247',
      link: 'https://github.com/anthropics/claude-code/releases/tag/v2.1.247',
      isoDate: '2026-08-26T23:06:00.000Z',
      contentSnippet: 'Added the SendFeedback tool.',
    },
  ],
});

const normalizeItems = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Normalize And Filter',
    position: [200, 0],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `// نافذة زمنية: كل ما نُشر خلال آخر 30 ساعة (تغطي فجوة التشغيل اليومي بأمان)
const WINDOW_HOURS = 30;
const MAX_ITEMS = 110;
const PER_SOURCE = 8; // سقف لكل مصدر حتى لا يزاحم مصدر ثرثار بقية المصادر
const cutoff = Date.now() - WINDOW_HOURS * 3600 * 1000;

const seen = new Set();
const collected = [];
const deadFeeds = [];

for (const item of $input.all()) {
  const j = item.json || {};

  // مصدر فشل: onError=continueRegularOutput يمرّر عنصر الإدخال {label,url} كما هو
  if (j.error || (!j.title && !j.link)) {
    if (j.url) { deadFeeds.push((j.label || '?') + ' -> ' + j.url); }
    continue;
  }

  const link = String(j.link || j.guid || '').trim();
  const title = String(j.title || '').replace(/\\s+/g, ' ').trim();
  if (!link || !title) { continue; }

  const key = link.split('?')[0].replace(/\\/+$/, '');
  if (seen.has(key)) { continue; }
  seen.add(key);

  const rawDate = j.isoDate || j.pubDate || j.published || j.updated || j.date;
  const ts = rawDate ? Date.parse(rawDate) : NaN;
  if (!Number.isNaN(ts) && ts < cutoff) { continue; }

  // صندوق Code في n8n لا يوفر URL، لذلك نستخرج المضيف بتعبير نمطي
  const hostMatch = link.match(/^https?:\\/\\/([^\\/?#]+)/i);
  const host = hostMatch ? hostMatch[1].toLowerCase().replace(/^www\\./, '') : 'unknown';

  const body = String(j.contentSnippet || j.summary || j.content || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\\s+/g, ' ')
    .trim();

  collected.push({
    title,
    link,
    source: host,
    publishedAt: Number.isNaN(ts) ? null : new Date(ts).toISOString(),
    snippet: body.slice(0, 400),
    sortKey: Number.isNaN(ts) ? 0 : ts,
  });
}

collected.sort((a, b) => b.sortKey - a.sortKey);

// موازنة: الأحدث أولاً، مع حد أقصى لكل مصدر
const perSource = {};
const balanced = [];
for (const row of collected) {
  const n = (perSource[row.source] || 0) + 1;
  perSource[row.source] = n;
  if (n > PER_SOURCE) { continue; }
  balanced.push(row);
  if (balanced.length >= MAX_ITEMS) { break; }
}

return balanced.map((row) => ({
  json: Object.assign({}, row, {
    deadFeedCount: deadFeeds.length,
    deadFeedList: deadFeeds,
  }),
}));`,
    },
  },
  output: [
    {
      title: 'Claude Code v2.1.247',
      link: 'https://github.com/anthropics/claude-code/releases/tag/v2.1.247',
      source: 'github.com',
      publishedAt: '2026-08-26T23:06:00.000Z',
      snippet: 'Added the SendFeedback tool.',
      sortKey: 1787871960000,
      deadFeedCount: 0,
      deadFeedList: [],
    },
  ],
});

const dropAlreadySent = node({
  type: 'n8n-nodes-base.removeDuplicates',
  version: 2,
  config: {
    name: 'Drop Already Sent',
    position: [420, 0],
    alwaysOutputData: true,
    parameters: {
      operation: 'removeItemsSeenInPreviousExecutions',
      logic: 'removeItemsWithAlreadySeenKeyValues',
      dedupeValue: expr('{{ $json.link }}'),
      options: { scope: 'workflow', historySize: 20000 },
    },
  },
  output: [
    {
      title: 'Claude Code v2.1.247',
      link: 'https://github.com/anthropics/claude-code/releases/tag/v2.1.247',
      source: 'github.com',
      publishedAt: '2026-08-26T23:06:00.000Z',
      snippet: 'Added the SendFeedback tool.',
      sortKey: 1787871960000,
      deadFeedCount: 0,
      deadFeedList: [],
    },
  ],
});

const buildBrief = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Digest Brief',
    position: [640, 0],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `const items = $input.all().filter((i) => i.json && i.json.title && i.json.link);
const now = new Date();

let dateLabel = now.toISOString().slice(0, 10);
try {
  dateLabel = new Intl.DateTimeFormat('ar', {
    timeZone: 'Asia/Riyadh',
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    calendar: 'gregory',
  }).format(now);
} catch (e) { /* نبقي على الصيغة الافتراضية */ }

const lines = items.map((i, n) => {
  const j = i.json;
  const when = j.publishedAt ? j.publishedAt.slice(0, 16).replace('T', ' ') + 'Z' : 'بدون تاريخ';
  const parts = [
    (n + 1) + '. [' + j.source + ' | ' + when + '] ' + j.title,
    'URL: ' + j.link,
  ];
  if (j.snippet) { parts.push('ملخص: ' + j.snippet); }
  return parts.join('\\n');
});

const first = items.length ? items[0].json : {};
const deadFeedList = Array.isArray(first.deadFeedList) ? first.deadFeedList : [];

// عدّ العناصر لكل مصدر — مفيد لمراقبة صحة المصادر من سجل التنفيذ
const perSource = {};
for (const i of items) {
  perSource[i.json.source] = (perSource[i.json.source] || 0) + 1;
}

return [{
  json: {
    count: items.length,
    perSource,
    deadFeedCount: deadFeedList.length,
    deadFeedList,
    dateLabel,
    dateIso: now.toISOString(),
    feedBundle: lines.length
      ? lines.join('\\n\\n')
      : 'لا توجد عناصر جديدة من مصادر RSS اليوم. اعتمد على البحث على الويب فقط.',
  },
}];`,
    },
  },
  output: [
    {
      count: 34,
      perSource: { 'github.com': 8, 'techcrunch.com': 8 },
      deadFeedCount: 0,
      deadFeedList: [],
      dateLabel: 'الخميس، 27 أغسطس 2026',
      dateIso: '2026-08-27T06:00:00.000Z',
      feedBundle: '1. [github.com | 2026-08-26 23:06Z] Claude Code v2.1.247',
    },
  ],
});

/**
 * ملاحظة: claude-sonnet-5 يرفض المعامل temperature ويرجع 400.
 * لا تضفه هنا مرة أخرى.
 */
const writeDigest = node({
  type: '@n8n/n8n-nodes-langchain.anthropic',
  version: 1,
  config: {
    name: 'Write Arabic Digest',
    position: [860, 0],
    retryOnFail: true,
    maxTries: 2,
    waitBetweenTries: 5000,
    credentials: { anthropicApi: newCredential('Anthropic account') },
    parameters: {
      resource: 'text',
      operation: 'message',
      modelId: {
        __rl: true,
        mode: 'list',
        value: 'claude-sonnet-5',
        cachedResultName: 'claude-sonnet-5',
      },
      simplify: true,
      addAttachments: false,
      messages: {
        values: [
          {
            role: 'user',
            content: expr(
              'تاريخ اليوم: {{ $json.dateLabel }}\n' +
                'عدد العناصر الجديدة من مصادر RSS: {{ $json.count }}\n' +
                'مصادر فشلت في التحميل اليوم: {{ $json.deadFeedCount }}\n\n' +
                'العناصر الخام (آخر 30 ساعة):\n' +
                '<<<RAW\n' +
                '{{ $json.feedBundle }}\n' +
                'RAW>>>\n\n' +
                'اكتب نشرة اليوم بالكامل حسب التعليمات في رسالة النظام. أخرج النص النهائي فقط.',
            ),
          },
        ],
      },
      options: {
        includeMergedResponse: true,
        maxTokens: 8000,
        webSearch: true,
        maxUses: 3,
        system:
          'إنت محرر نشرة تقنية بالعامية الشامية، متخصص بالذكاء الاصطناعي. بتكتب تقرير يومي بيوصل على تليجرام لشخص عم يبني أنظمة أتمتة ومحتوى بالذكاء الاصطناعي، وبدو يعرف كل تحديث عملي أول ما ينزل.\n\n' +
          '═══ قاعدة اللغة — أهم شي بالمطلق ═══\n\n' +
          '1) اكتب كلشي بالعربي العامي الشامي، زي ما عم تحكي مع صاحبك وبتشرحلو شي مفيد.\n' +
          '   استعمل: هلق، صار فيك، طلّعوا، زادوا، بيفيدك، شغلة، يعني، بيخليك، لازم، منيح.\n' +
          '   ممنوع الفصحى المتكلّفة: لا تكتب "تجدر الإشارة" ولا "إذ يُعدّ" ولا "الأمر الذي" ولا "ممّا يتيح".\n\n' +
          '2) ممنوع تترك جملة أو نص جملة بالإنجليزي. كل الشرح عربي.\n\n' +
          '3) أسماء المنتجات والشركات بتضل بالإنجليزي لأنها أسماء وما بتنترجم: Claude ، ChatGPT ، Gemini ، OpenAI ، n8n ، Ollama.\n\n' +
          '4) أي مصطلح تقني إنجليزي — **وأي اختصار بحروف كبيرة كمان** — لازم تشرحو: اكتب المعنى بالعربي أولاً، وبعدين حط المصطلح بين قوسين وجوّاته شرح قصير بكلمتين تلاتة.\n\n' +
          'أمثلة صح:\n' +
          '• واجهة برمجية (API — الطريقة يلي بتخلي برنامج يحكي مع برنامج تاني)\n' +
          '• صفحة سجل التحديثات (changelog — صفحة بتسجّل كل تغيير جديد بالبرنامج)\n' +
          '• طلّعوا خيار جديد اسمو (--restricted) بيمنع البرنامج يشغّل أوامر على جهازك\n' +
          '• مساحة تخزين مؤقتة (cache — ذاكرة بتحفظ النتيجة لتوفّر وقت ومصاري بالمرة الجاية)\n' +
          '• تسجيل دخول موحّد (OAuth — طريقة تخليك تدخل على خدمة بحسابك بخدمة تانية بلا ما تعطيها كلمة السر)\n' +
          '• خدمة أمازون لتشغيل نماذج الذكاء الاصطناعي (Bedrock)\n\n' +
          'أمثلة غلط — ممنوعة منعاً باتاً:\n' +
          '✗ "أتاحت AWS نموذجي Terra وLuna عبر Bedrock مع بقاء الاستدلال داخل الهند" — فصحى ومصطلحات بلا شرح\n' +
          '✗ "توثيق أقوى (OAuth وOIDC)" — اختصارات مرمية بلا تعريف\n' +
          '✗ "إعداد تجريبي في frontmatter الخاص بالـ agent" — كلمات إنجليزية مرمية بنص الجملة\n\n' +
          '5) **ممنوع تكتب كلمة إنجليزية بحروف عربية.** يا تترجمها يا تكتبها بحروفها الإنجليزية بين قوسين مع شرح.\n' +
          '   ✗ غلط: "الدفع بالفرونتير" ، "الـكاش" ، "برومبت"\n' +
          '   ✓ صح: "النماذج المتقدمة (frontier)" ، "التعليمة يلي بتعطيها للنموذج (prompt)"\n\n' +
          '6) إذا ذكرت المصطلح وشرحتو مرة، بعدها بتقدر تستعملو بلا شرح بنفس النشرة.\n\n' +
          '7) قبل ما تخلّص، اقرأ نشرتك مرة تانية ودوّر على كل كلمة إنجليزية وكل اختصار: إذا ما إلها شرح وما هي اسم منتج، رجّع اكتبها.\n\n' +
          '═══ مصادرك ═══\n\n' +
          '1) العناصر المرفقة هي الأساس.\n' +
          '2) مسموح لك تبحث على الويب. استعملو للتأكد من تحديثات Claude و ChatGPT و Gemini، ولتقرأ صفحات سجل التحديثات الرسمية، ولتلاقي أداة أو موقع ذكاء اصطناعي جديد انتشر هالفترة.\n' +
          '3) ممنوع تخترع خبر أو رابط. كل بند لازم يكون من عنصر مرفق أو من نتيجة بحث حقيقية. إذا ما لقيت شي لقسم، احذف القسم كلو ولا تكتب إنو فاضي.\n\n' +
          '═══ التنسيق ═══\n\n' +
          'HTML مبسّط لتليجرام، مو ماركداون:\n' +
          '- للتعريض استعمل <b>هيك</b> فقط، وسكّر كل وسم بتفتحو بنفس السطر.\n' +
          '- ممنوع # و * و ** والعلامة المائلة الخلفية والجداول، وممنوع أي وسم تاني غير <b>.\n' +
          '- كل نقطة بتبلّش بـ •\n' +
          '- الرابط بينكتب عاري بسطر لحالو تحت النقطة، وتليجرام بيحوّلو لرابط لحالو.\n' +
          '- حط رابط تحت كل نقطة لحالها، مو رابط واحد لآخر القسم.\n\n' +
          '═══ هيكل النشرة ═══\n\n' +
          '(احذف أي قسم ما إلو محتوى)\n\n' +
          '⭐ <b>خبر اليوم</b>\n' +
          'سطرين تلاتة: شو صار، وليش بيهمك إنت بالذات. بعدين الرابط.\n\n' +
          '🤖 <b>أخبار Claude</b>\n' +
          '• العنوان [جديد] — شو تغيّر بالضبط، وشو بيعني لإلك عملياً.\n' +
          'الرابط\n\n' +
          '💬 <b>أخبار ChatGPT</b>\n' +
          'نفس الأسلوب.\n\n' +
          '✨ <b>أخبار Gemini وبقية النماذج</b>\n' +
          'نفس الأسلوب.\n\n' +
          '🛠️ <b>أدوات بتستعملها</b>\n' +
          'أدوات متل Cursor و n8n و ComfyUI و Ollama وأدوات الصور والفيديو والصوت.\n\n' +
          '🚀 <b>اكتشاف اليوم</b>\n' +
          'أداة أو موقع ذكاء اصطناعي قوي طلع أو انتشر هالفترة وبيعمل شغل حقيقي. سطر شو بيعمل، سطر ليش يستاهل تجرّبو، بعدين الرابط.\n\n' +
          '⚡ <b>عالسريع</b>\n' +
          '• من 3 لـ 6 عناوين قصيرة كتير، كل واحد مع رابطو تحتو.\n\n' +
          '═══ قواعد المحتوى ═══\n\n' +
          '- ركّز على العملي: ميزة جديدة، نموذج جديد، تغيير بالأسعار أو بالحدود، شي صار متاح للكل، أداة جديدة.\n' +
          '- تجاهل أخبار التمويل والاستثمار إلا إذا كانت ضخمة، وتجاهل مقالات الرأي والتحليلات العامة والأخبار المكررة.\n' +
          '- حط وسم [جديد] بعد عنوان أي ميزة نزلت خلال 24 ساعة.\n' +
          '- الطول بين 1500 و 3500 حرف، ولا تتجاوز 6000 حرف أبداً.\n' +
          '- بلّش علطول بالمحتوى: بلا مقدمة ولا ترحيب ولا خاتمة ولا تعليق على شغلك.\n' +
          '- إذا العناصر قليلة كتير والبحث ما طلّع شي يستاهل: اكتب سطرين بس إنو اليوم كان هادي، مع أبرز شي يستاهل تتابعو.',
      },
    },
  },
  output: [{ text: '⭐ <b>خبر اليوم</b>\n...' }],
});

const splitForTelegram = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Split For Telegram',
    position: [1080, 0],
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode: `// حد رسالة تليجرام 4096 حرفاً — نبقى تحته بهامش أمان يكفي رموز HTML
const LIMIT = 3500;

const src = $input.first().json || {};

// شكل مخرجات عقدة Anthropic يختلف حسب الإعدادات، لذلك نقرأه بعدة طرق
let text = '';
if (typeof src.text === 'string' && src.text.trim()) {
  text = src.text;
} else if (typeof src.mergedResponse === 'string' && src.mergedResponse.trim()) {
  text = src.mergedResponse;
} else if (typeof src.output === 'string' && src.output.trim()) {
  text = src.output;
} else if (Array.isArray(src.content)) {
  text = src.content
    .filter((c) => c && (c.type === 'text' || typeof c.text === 'string'))
    .map((c) => c.text)
    .join('\\n');
} else if (typeof src.content === 'string') {
  text = src.content;
}

if (!text || !text.trim()) {
  throw new Error('لم تُرجِع عقدة Anthropic أي نص. افتح مخرجات العقدة وعدّل أسماء الحقول هنا.');
}

// 1) البحث على الويب يلفّ النص المقتبس بأسطر جديدة فتنكسر الجملة في منتصفها.
//    ندمج السطر المفرد المكسور مع سابقه، مع إبقاء الفواصل المزدوجة
//    والأسطر التي تبدأ بنقطة أو وسم أو إيموجي أو رابط، والسطر التالي لعنوان ينتهي بـ >
text = text
  .replace(/([^\\n>])\\n(?!\\n)(?![•<⭐🤖💬✨🛠🚀⚡—-]|https?:)/g, '$1 ')
  .replace(/[ \\t]{2,}/g, ' ')
  .replace(/[ \\t]+([.،؛:!?؟])/g, '$1')
  .replace(/\\n{3,}/g, '\\n\\n')
  .trim();

// 2) تليجرام في وضع HTML يقبل وسوماً محدودة جداً، وأي وسم غير مغلق يجعله يرفض الرسالة
//    بالكامل (خطأ 400). لذلك نهرّب كل شيء ثم نعيد المسموح فقط.
const html = text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/&lt;b&gt;/g, '<b>')
  .replace(/&lt;\\/b&gt;/g, '</b>')
  .replace(/&lt;i&gt;/g, '<i>')
  .replace(/&lt;\\/i&gt;/g, '</i>')
  .replace(/&lt;code&gt;/g, '<code>')
  .replace(/&lt;\\/code&gt;/g, '</code>');

const dateLabel = $('Build Digest Brief').first().json.dateLabel;
const header = '🗞️ <b>نشرة الذكاء الاصطناعي اليومية</b>\\n📅 ' + dateLabel + '\\n\\n';

const chunks = [];
let cur = '';
for (const line of (header + html).split('\\n')) {
  const candidate = cur ? cur + '\\n' + line : line;
  if (candidate.length > LIMIT) {
    if (cur.trim()) { chunks.push(cur.trim()); }
    cur = line.length > LIMIT ? line.slice(0, LIMIT) : line;
  } else {
    cur = candidate;
  }
}
if (cur.trim()) { chunks.push(cur.trim()); }

// 3) حارس: لو انقسم وسم بين رسالتين، أقفله وافتحه حتى لا يرفض تليجرام الرسالة
function balanceTags(s) {
  const open = (s.match(/<b>/g) || []).length;
  const close = (s.match(/<\\/b>/g) || []).length;
  if (open > close) { return s + '</b>'.repeat(open - close); }
  if (close > open) { return '<b>'.repeat(close - open) + s; }
  return s;
}

const total = chunks.length;

return chunks.map((c, i) => ({
  json: {
    text: balanceTags(total > 1 ? c + '\\n\\n— (' + (i + 1) + '/' + total + ')' : c),
    part: i + 1,
    totalParts: total,
    dateLabel,
  },
}));`,
    },
  },
  output: [
    {
      text: '🗞️ <b>نشرة الذكاء الاصطناعي اليومية</b>',
      part: 1,
      totalParts: 2,
      dateLabel: 'الخميس، 27 أغسطس 2026',
    },
  ],
});

const sendTelegram = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Send Digest On Telegram',
    position: [1300, 0],
    retryOnFail: true,
    maxTries: 3,
    waitBetweenTries: 3000,
    // بوت مستقل عن بوت المشروع الآخر — أنشئه من @BotFather وأضف اعتماده باسم AI News Bot
    credentials: { telegramApi: newCredential('AI News Bot') },
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: placeholder('معرّف المحادثة أو القناة الجديدة — رقم مثل 123456789 أو -1001234567890'),
      text: expr('{{ $json.text }}'),
      additionalFields: {
        parse_mode: 'HTML',
        appendAttribution: false,
        disable_web_page_preview: true,
      },
    },
  },
  output: [{ ok: true, result: { message_id: 1234 } }],
});

const noteSchedule = sticky(
  '## ⏰ التوقيت — جاهز\n\n' +
    'توقيت هذا الـ workflow مضبوط على **Asia/Riyadh** من إعداداته، والجدولة على cron:\n\n' +
    '`0 9 * * *`\n\n' +
    'يعني **9:00 صباحاً بتوقيت الرياض كل يوم**. لا تحتاج تعديل شيء.\n\n' +
    'لتغيير الساعة: غيّر الرقم 9 فقط (مثلاً `0 20 * * *` لـ 8 مساءً).',
  [dailyTrigger],
  { color: 4 },
);

const noteSources = sticky(
  '## 📡 المصادر\n\n' +
    '19 مصدر RSS/Atom:\n' +
    '• مدونات OpenAI و Anthropic و Google و DeepMind و Microsoft و AWS و Hugging Face\n' +
    '• سجلات إصدارات Claude Code و OpenAI Codex و Gemini CLI و Ollama و ComfyUI و n8n — هذه تلتقط كل ميزة جديدة فور نزولها\n' +
    '• TechCrunch و VentureBeat و The Verge و Ars Technica\n' +
    '• Hacker News و Simon Willison — لاكتشاف الأدوات والمواقع الجديدة\n\n' +
    'عدّل القائمة داخل عقدة **Feed Sources**.\n\n' +
    'عقدة Read Feed مضبوطة على `continueRegularOutput`، فأي مصدر يسقط لا يوقف التشغيل — يُتجاهل ويُسجَّل في `deadFeedList`.\n\n' +
    '⚠️ المصادر تُقرأ بالتسلسل وحد التنفيذ 180 ثانية. مصدر واحد بطيء يقطع التشغيل كله — لا تتجاوز 20 مصدراً.\n\n' +
    'افتح مخرجات Build Digest Brief وانظر `deadFeedList` واحذف أي مصدر يفشل باستمرار.',
  [feedSources, readFeed],
  { color: 5 },
);

const noteDedupe = sticky(
  '## 🔁 التنظيف ومنع التكرار\n\n' +
    '**Normalize And Filter**\n' +
    '• يبقي فقط ما نُشر خلال آخر 30 ساعة\n' +
    '• ينظّف HTML ويوحّد الروابط\n' +
    '• يرتّب حسب الأحدث\n' +
    '• سقف 8 عناصر لكل مصدر حتى لا يزاحم مصدر ثرثار (مثل Reddit) بقية المصادر\n' +
    '• سقف إجمالي 110 عنصر\n\n' +
    '**Drop Already Sent**\n' +
    'يخزّن رابط كل خبر أُرسل سابقاً (20 ألف رابط) فلا يصلك نفس الخبر مرتين أبداً — ولو ظل في الـ feed لأيام.\n\n' +
    '`alwaysOutputData` مفعّل عمداً حتى تصلك رسالة يومية حتى لو لم يكن هناك جديد إطلاقاً.',
  [normalizeItems, dropAlreadySent, buildBrief],
  { color: 3 },
);

const noteModel = sticky(
  '## 🧠 التحرير بالعامية\n\n' +
    'Claude (`claude-sonnet-5`) يحوّل العناصر الخام إلى نشرة مقسّمة:\n' +
    'خبر اليوم • Claude • ChatGPT • Gemini وبقية النماذج • أدوات بتستعملها • اكتشاف اليوم • عالسريع\n\n' +
    '**قاعدة اللغة:**\n' +
    '• النشرة بالعامية الشامية، ممنوع الفصحى المتكلّفة\n' +
    '• أسماء المنتجات تبقى بالإنجليزي (Claude ، ChatGPT)\n' +
    '• أي مصطلح تقني أو اختصار يُشرح بالعربي أولاً ثم يوضع بين قوسين مع تعريف قصير\n' +
    '• ممنوع كتابة كلمة إنجليزية بحروف عربية\n\n' +
    '**Web Search مفعّل** (3 عمليات كحد أقصى) ليقرأ صفحات التحديثات الرسمية ويسدّ ما تفوته الـ RSS.\n\n' +
    'كل التعليمات في حقل **System** داخل Options. عدّل اللهجة أو الأقسام أو الطول من هناك.',
  [writeDigest],
  { color: 6 },
);

const noteTelegram = sticky(
  '## 🤖 بوت ومحادثة مستقلّين\n\n' +
    '### 1) أنشئ البوت الجديد\n' +
    'في تليجرام افتح **@BotFather** وأرسل `/newbot`، اختر اسم عرض ثم username ينتهي بـ `bot`. يرد عليك بتوكن شكله `8123456789:AAH...`\n\n' +
    '### 2) أضف الاعتماد في n8n\n' +
    'Credentials ← New ← **Telegram API**، الاسم `AI News Bot`، الصق التوكن، ثم اختره في خانة Credential في هذه العقدة.\n\n' +
    '### 3) اختر وجهة النشرة\n' +
    '**أ) محادثة خاصة مع البوت — الأسرع:** أرسل `/start` لبوتك الجديد مرة واحدة، وخذ رقمك من @get_id_bot.\n\n' +
    '**ب) قناة خاصة — الأنظف:** أنشئ قناة Private، أضف البوت فيها كـ Admin مع صلاحية Post Messages، وخذ معرّفها من @get_id_bot — رقم سالب يبدأ بـ `-100`.\n\n' +
    'خطوة `/start` إلزامية في الخيار (أ): تليجرام يمنع البوت من بدء محادثة معك، وبدونها يرجع chat not found.\n\n' +
    '**التنسيق**\n' +
    'النشرة تُرسل بـ parse_mode = HTML. عقدة Split For Telegram تهرّب كل الرموز ثم تعيد وسوم b و i و code فقط، وتوازن الوسوم في كل رسالة، لأن أي وسم غير مغلق يجعل تليجرام يرفض الرسالة بالكامل.\n\n' +
    'النص يُقسّم تلقائياً إلى رسائل بحد 3500 حرف مع ترقيم (1/2).\n' +
    'معاينة الروابط معطّلة، وتوقيع n8n ملغي.',
  [splitForTelegram, sendTelegram],
  { color: 2 },
);

export default workflow('ai-daily-news-telegram', 'نشرة الذكاء الاصطناعي اليومية → تليجرام')
  .add(dailyTrigger)
  .to(feedSources)
  .to(readFeed)
  .to(normalizeItems)
  .to(dropAlreadySent)
  .to(buildBrief)
  .to(writeDigest)
  .to(splitForTelegram)
  .to(sendTelegram)
  .add(noteSchedule)
  .add(noteSources)
  .add(noteDedupe)
  .add(noteModel)
  .add(noteTelegram);
