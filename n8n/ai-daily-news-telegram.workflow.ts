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
  { label: 'MIT Tech Rev',  url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed' },

  // ── اكتشاف الأدوات والمواقع الجديدة ──
  { label: 'Product Hunt',  url: 'https://www.producthunt.com/feed?category=artificial-intelligence' },
  { label: 'Hacker News',   url: 'https://hnrss.org/newest?q=AI+OR+LLM+OR+Claude+OR+GPT&points=100' },
  { label: 'Simon Willison', url: 'https://simonwillison.net/atom/everything/' },
  { label: 'r/LocalLLaMA',  url: 'https://www.reddit.com/r/LocalLLaMA/top/.rss?t=day' },
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
    onError: 'continueRegularOutput',
    retryOnFail: true,
    maxTries: 2,
    waitBetweenTries: 2000,
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
        maxUses: 4,
        system:
          'أنت محرر نشرة تقنية عربية متخصص في الذكاء الاصطناعي. تكتب تقريراً يومياً واحداً يُرسل على تليجرام لقارئ محترف يبني أنظمة أتمتة ومحتوى بالذكاء الاصطناعي، ويريد أن يعرف كل تحديث عملي فور نزوله.\n\n' +
          'مصادرك:\n' +
          '1) العناصر الخام المرفقة هي الأساس.\n' +
          '2) مسموح لك باستخدام البحث على الويب. استخدمه تحديداً للتحقق من تحديثات Claude و ChatGPT و Gemini، ولقراءة صفحات release notes و changelog الرسمية، ولاكتشاف أداة أو موقع ذكاء اصطناعي جديد انتشر حديثاً.\n' +
          '3) ممنوع منعاً تاماً اختراع خبر أو رابط. كل بند يجب أن يستند إلى عنصر خام أو نتيجة بحث فعلية. إذا لم تجد محتوى لقسم، احذف القسم بالكامل ولا تكتب أنه فارغ.\n\n' +
          'التنسيق (HTML مبسّط لتليجرام، وليس ماركداون):\n' +
          '- للتعريض استخدم <b>هكذا</b> فقط، وأغلق كل وسم تفتحه في نفس السطر.\n' +
          '- ممنوع # و * و ** والعلامة المائلة الخلفية والجداول وكتل الكود، وممنوع أي وسم HTML آخر غير <b>.\n' +
          '- كل نقطة تبدأ بـ •\n' +
          '- الرابط يُكتب عارياً في سطر مستقل تحت النقطة، وتليجرام يحوّله إلى رابط تلقائياً.\n\n' +
          'هيكل النشرة (احذف أي قسم لا محتوى له):\n\n' +
          '⭐ <b>خبر اليوم</b>\n' +
          'سطران: ماذا حدث، ولماذا يهمك عملياً. ثم الرابط.\n\n' +
          '🤖 <b>Claude و Anthropic</b>\n' +
          '• العنوان [جديد] — ما الذي تغيّر بالضبط وما أثره العملي عليك.\n' +
          'الرابط\n\n' +
          '💬 <b>ChatGPT و OpenAI</b>\n' +
          'نفس الأسلوب.\n\n' +
          '✨ <b>Gemini ونماذج أخرى</b>\n' +
          'نفس الأسلوب (Gemini، Llama، Mistral، Grok، DeepSeek، Qwen، GLM).\n\n' +
          '🛠️ <b>تحديثات أدوات تستخدمها</b>\n' +
          'أدوات مثل Cursor و n8n و ComfyUI و Ollama و Hugging Face وأدوات الصور والفيديو والصوت.\n\n' +
          '🚀 <b>اكتشاف اليوم</b>\n' +
          'أداة أو موقع ذكاء اصطناعي قوي ظهر أو انتشر حديثاً ويؤدي شغلاً حقيقياً. سطر عن ما يفعله، سطر عن لماذا يستحق التجربة، ثم الرابط.\n\n' +
          '⚡ <b>سريع</b>\n' +
          '• من 3 إلى 6 عناوين قصيرة جداً، كل واحد مع رابطه.\n\n' +
          'قواعد المحتوى:\n' +
          '- ركّز على ما هو عملي: ميزة جديدة، نموذج جديد، تغيير تسعير أو حدود، إتاحة عامة، أداة جديدة، تحديث API.\n' +
          '- تجاهل أخبار التمويل والاستثمار إلا إذا كانت ضخمة ومؤثرة، وتجاهل مقالات الرأي والتحليلات العامة والأخبار المكررة.\n' +
          '- ضع وسم [جديد] بعد عنوان أي ميزة أُضيفت خلال 24 ساعة.\n' +
          '- العربية الفصحى المبسطة، وأسماء المنتجات والمصطلحات التقنية تبقى بالإنجليزية.\n' +
          '- الطول المستهدف بين 1500 و 3500 حرف، ولا تتجاوز 6000 حرف أبداً.\n' +
          '- ابدأ مباشرة بالمحتوى: بلا مقدمة ولا ترحيب ولا خاتمة ولا تعليق على عملك.\n' +
          '- إذا كانت العناصر قليلة جداً ولم يجد البحث شيئاً يستحق: اكتب سطرين فقط أن اليوم كان هادئاً، مع أبرز ما يستحق المتابعة.',
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
    '22 مصدر RSS/Atom:\n' +
    '• مدونات OpenAI و Anthropic و Google و DeepMind و Microsoft و AWS و Hugging Face\n' +
    '• سجلات إصدارات Claude Code و OpenAI Codex و Gemini CLI و Ollama و ComfyUI و n8n — هذه تلتقط كل ميزة جديدة فور نزولها\n' +
    '• TechCrunch و VentureBeat و The Verge و Ars Technica و MIT Tech Review\n' +
    '• Product Hunt و Hacker News و Simon Willison و r/LocalLLaMA — لاكتشاف الأدوات والمواقع الجديدة\n\n' +
    'عدّل القائمة داخل عقدة **Feed Sources**.\n\n' +
    'عقدة Read Feed مضبوطة على `continueRegularOutput`، فأي مصدر يسقط لا يوقف التشغيل — يُتجاهل ويُسجَّل في `deadFeedList`.\n\n' +
    '⚠️ افتح مخرجات Build Digest Brief وانظر `deadFeedList` واحذف أي مصدر يفشل باستمرار.',
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
  '## 🧠 التحرير بالعربية\n\n' +
    'Claude (`claude-sonnet-5`) يحوّل العناصر الخام إلى نشرة عربية مقسّمة:\n' +
    'خبر اليوم • Claude/Anthropic • ChatGPT/OpenAI • Gemini ونماذج أخرى • تحديثات الأدوات • اكتشاف اليوم • أخبار سريعة\n\n' +
    '**Web Search مفعّل** (4 عمليات كحد أقصى) ليقرأ صفحات changelog الرسمية ويسدّ ما تفوته الـ RSS.\n\n' +
    'ممنوع عليه اختراع خبر أو رابط — كل بند لازم له مصدر حقيقي.\n\n' +
    'كل التعليمات في حقل **System** داخل Options. عدّل الأقسام أو الطول أو الأسلوب من هناك.',
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
