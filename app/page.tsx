import { CreativeOSExperience } from "@/components/creative-os/CreativeOSExperience";

export default function Home() {
  return (
    <main className="relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-ink-950" />
        <div className="noise-veil absolute inset-0" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <span className="font-mono text-sm font-semibold tracking-[0.2em] text-fg">BAIGR</span>
        <span className="hidden font-mono text-[11px] tracking-wide text-fg-subtle sm:block">
          Creative Operating System
        </span>
      </header>

      <CreativeOSExperience />

      <footer className="mx-auto mt-10 flex w-full max-w-6xl flex-col items-center gap-4 border-t border-white/[0.06] px-6 py-12 text-center sm:px-8">
        <p className="max-w-md text-sm leading-7 text-fg-subtle">
          هذا عرض مفاهيمي تفاعلي لآلية عمل النظام. البيانات المعروضة تجريبية بالكامل ولا تستدعي أي
          خدمة إنتاجية.
        </p>
        <span className="font-mono text-[11px] tracking-widest text-fg-subtle">
          © {new Date().getFullYear()} BAIGR
        </span>
      </footer>
    </main>
  );
}
