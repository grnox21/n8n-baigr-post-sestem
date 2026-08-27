# BAIGR Creative OS — Animation

A cinematic, interactive Next.js experience that visually explains the BAIGR
AI content-generation pipeline: a Telegram-driven Creative Operating System
that lets a user pick a content type, an AI model, an aspect ratio and a
quality level, then watches the system build a creative concept, route the
job to the right generation engine, auto-format the output when a model
(GPT2) doesn't natively support the requested ratio, and deliver the result
back to Telegram for publish / revise / delete.

The UI is fully in Arabic (RTL).

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Structure

- `components/creative-os/hero` — the looping cinematic autoplay showcase
  (both the direct-generation and the GPT2 auto-resize scenarios).
- `components/creative-os/sections` — the nine scroll-driven narrative
  stages (Telegram → model → format/quality → topic → AI intelligence →
  router → generation/resize → Telegram preview → distribution).
- `components/creative-os/controls` — the real interactive selectors
  (content type, model, aspect ratio, quality).
- `components/creative-os/primitives` — shared visual building blocks
  (glass panels, metadata badges, flow connectors, status pills).
- `lib/creative-os` — the state machine, constants, and the GPT2 ratio
  compatibility logic that decides direct generation vs. smart resize.

All generation state is simulated client-side — no production API is
called and no credentials are involved.

## أنظمة n8n

- [`n8n/`](./n8n) — نشرة الذكاء الاصطناعي اليومية على تليجرام: workflow مجدول
  يجمع الأخبار وتحديثات الأدوات من 22 مصدراً، يحرّرها Claude بالعربية، ويرسلها
  كل صباح. التفاصيل وخطوات التشغيل في [`n8n/README.md`](./n8n/README.md).
