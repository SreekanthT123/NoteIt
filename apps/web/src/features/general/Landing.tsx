import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature {
  icon: string;
  accent: string;
  title: string;
  desc: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES: Feature[] = [
  {
    icon: "✦",
    accent: "#7C6FFF",
    title: "AI Summaries",
    desc: "Every note distilled into crisp insights. Claude reads your chaos so you don't have to.",
  },
  {
    icon: "◈",
    accent: "#00D4AA",
    title: "Smart Task Extraction",
    desc: "Deadlines mentioned anywhere in your notes become actionable tasks with due dates — automatically.",
  },
  {
    icon: "⬡",
    accent: "#FF6B6B",
    title: "Calendar Planning",
    desc: "Attach notes to dates. Navigate your ideas across time. See the full picture of your thinking.",
  },
  {
    icon: "⟡",
    accent: "#FFB347",
    title: "Note Relationships",
    desc: "Discover hidden connections between ideas. Your knowledge graph, built and visualised for you.",
  },
  {
    icon: "◎",
    accent: "#7C6FFF",
    title: "Daily Digest",
    desc: "Wake up to a curated briefing of yesterday's notes, today's tasks, and upcoming deadlines.",
  },
  {
    icon: "⬢",
    accent: "#00D4AA",
    title: "Secure by Design",
    desc: "JWT + Google OAuth authentication with per-user AI usage tracking and configurable limits.",
  },
];

const MARQUEE_ITEMS = [
  "AI Summaries",
  "Task Extraction",
  "Calendar View",
  "Note Relationships",
  "Daily Digest",
  "Rich-text Editor",
  "Secure Auth",
  "Knowledge Graph",
];

const STATS: [string, string][] = [
  ["10k+", "NOTES CREATED"],
  ["99%", "UPTIME SLA"],
  ["< 1s", "AI RESPONSE"],
];

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── FadeIn wrapper ───────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.8s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.8s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── FeatureCard ──────────────────────────────────────────────────────────────

function FeatureCard({ feature }: { feature: Feature }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden bg-white rounded-2xl p-7 cursor-default h-full border-2 shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
      style={{
        borderColor: hovered ? feature.accent + "66" : "#e5e7eb",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "border-color 0.3s ease, transform 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Coloured left accent bar */}
      <div
        className="absolute top-0 left-0 w-[3px] h-full rounded-l-2xl"
        style={{
          background: feature.accent,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />

      {/* Icon bubble */}
      <div
        className="inline-flex items-center justify-center w-10 h-10 rounded-xl border text-[18px] font-mono mb-4"
        style={{
          color: feature.accent,
          borderColor: feature.accent + "30",
          background: feature.accent + "0e",
        }}
      >
        {feature.icon}
      </div>

      <div className="text-[15px] font-semibold text-slate-900 mb-2 tracking-tight">
        {feature.title}
      </div>
      <div className="text-[13px] text-slate-500 leading-relaxed font-sans">
        {feature.desc}
      </div>
    </div>
  );
}

// ─── MockAiCard ───────────────────────────────────────────────────────────────

function MockAiCard() {
  return (
    <div className="bg-white border border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-[18px] p-[22px] w-[300px]">
      {/* Traffic lights */}
      <div className="flex gap-1.5 mb-4">
        {(["#FF6B6B", "#FFB347", "#00D4AA"] as const).map((c) => (
          <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
        ))}
      </div>

      <div className="font-mono text-[11px] text-slate-400 mb-3">
        AI Analysis
      </div>
      <div className="h-px bg-slate-200 mb-3.5" />

      {/* Summary block */}
      <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl mb-2.5">
        <div className="font-mono text-[10px] text-violet-500 mb-2">✦ Summary</div>
        {["90%", "76%", "83%"].map((w, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full mb-1.5"
            style={{ width: w, background: "#7C6FFF28" }}
          />
        ))}
      </div>

      {/* Tasks block */}
      <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl mb-2.5">
        <div className="font-mono text-[10px] text-teal-600 mb-2">
          ◈ Tasks extracted (3)
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1.5 mb-1">
            <span className="block w-3 h-3 border border-teal-300 rounded-[3px] shrink-0" />
            <div
              className="h-[5px] rounded-full"
              style={{ width: `${70 - i * 8}%`, background: "#00D4AA1e" }}
            />
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 flex-wrap">
        {["strategy", "Q4", "product"].map((t) => (
          <span
            key={t}
            className="px-2.5 py-0.5 bg-orange-50 border border-orange-200 text-orange-600 rounded-full text-[9px] font-mono"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── StepCard ─────────────────────────────────────────────────────────────────

function StepCard({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="p-8 bg-white rounded-2xl border-2 cursor-default"
      style={{
        borderColor: hovered ? "#7C6FFF44" : "#e5e7eb",
        transition: "border-color 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="block font-mono text-[11px] text-violet-500 tracking-[0.1em] mb-4">
        {num}
      </span>
      <div className="text-[18px] font-semibold text-slate-900 mb-2.5 tracking-tight">
        {title}
      </div>
      <p className="font-sans text-[13px] text-slate-400 leading-[1.66]">
        {body}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NoteItLanding({
  setShowLanding,
}: {
  setShowLanding: (show: boolean) => void;
}) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:ital,wght@0,400;0,500;1,400&family=DM+Mono&display=swap');

        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: .35; transform: scale(1.55); }
        }
        @keyframes float {
          0%, 100% { transform: perspective(1100px) rotateY(-8deg) rotateX(3deg) translateY(0px); }
          50%       { transform: perspective(1100px) rotateY(-8deg) rotateX(3deg) translateY(-10px); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          10%  { transform: translate(-1%,-1%); }
          30%  { transform: translate(1%,-2%); }
          50%  { transform: translate(-1%,1%); }
          70%  { transform: translate(2%,1%); }
          90%  { transform: translate(-2%,2%); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .grain-overlay::after {
          content: '';
          position: fixed;
          inset: -200%;
          width: 400%; height: 400%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.018;
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
          z-index: 999;
        }

        .grid-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(#00000006 1px, transparent 1px),
            linear-gradient(90deg, #00000006 1px, transparent 1px);
          background-size: 64px 64px;
        }

        .badge-dot  { animation: blink 2s infinite; }
        .scroll-line{ animation: blink 2s ease-in-out infinite; }
        .hero-card  { animation: float 6s ease-in-out infinite; }
        .marquee-track { animation: marquee 28s linear infinite; }

        .btn-primary:hover { opacity: .85 !important; transform: translateY(-1px) !important; }
        .btn-ghost:hover   { border-color: #cbd5e1 !important; color: #334155 !important; }
      `}</style>

      <div className="grain-overlay overflow-auto bg-[#f7f8fc]" style={{ fontFamily: "'Sora', system-ui, sans-serif" }}>

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section className="relative min-h-[85vh] flex flex-col justify-center pt-12 overflow-hidden bg-[#f7f8fc]">
          <div className="grid-bg" />

          {/* Ambient blobs */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{ width: 800, height: 800, left: "30%", top: "40%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle,#7C6FFF10 0%,transparent 70%)" }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{ width: 500, height: 500, left: "70%", top: "20%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle,#00D4AA08 0%,transparent 70%)" }}
          />

          <div className="relative z-[2] max-w-[1200px] w-full mx-auto px-10 py-20 flex items-center gap-20">

            {/* Left copy */}
            <div className="flex-[0_0_520px]">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-violet-300/40 rounded-full font-mono text-[10px] text-violet-500 bg-violet-50/70 tracking-[0.08em] mb-8">
                <span className="badge-dot block w-[5px] h-[5px] rounded-full bg-violet-500" />
                AI-POWERED KNOWLEDGE PLATFORM
              </div>

              {/* Heading */}
              <h1
                className="font-bold leading-[0.97] tracking-[-0.04em] text-slate-900 mb-6"
                style={{ fontSize: "clamp(52px, 6.5vw, 90px)", fontFamily: "'Sora', sans-serif" }}
              >
                Think more.
                <br />
                <em className="text-violet-500 italic">Remember</em>
                <br />
                everything.
              </h1>

              {/* Sub */}
              <p className="text-base text-slate-500 leading-[1.72] max-w-[430px] mb-10 font-sans">
                <span className="font-semibold tracking-[0.2rem] text-base">
                  Note<span className="text-indigo-500 text-lg">!</span>t
                </span>{" "}
                captures your ideas, extracts your tasks, and summarises your
                knowledge — powered by AI that understands context, not just keywords.
              </p>

              {/* CTAs */}
              <div className="flex gap-3.5 mb-[52px]">
                <button
                  className="btn-primary text-white border-none px-7 py-3 rounded-[10px] text-sm cursor-pointer transition-all duration-200 font-sans shadow-[0_8px_24px_rgba(124,111,255,0.25)]"
                  style={{ background: "#7C6FFF" }}
                  onClick={() => setShowLanding(false)}
                >
                  Login to NoteIt
                </button>
                <button
                  className="btn-ghost text-slate-500 border border-slate-200 bg-white px-7 py-3 rounded-[10px] text-sm font-sans cursor-pointer transition-all duration-200"
                  onClick={() => toast.info("Demo coming soon — stay tuned!")}
                >
                  Watch demo ↗
                </button>
              </div>

              {/* Stats row */}
              <div className="flex gap-11">
                {STATS.map(([n, l]) => (
                  <div key={l} className="flex flex-col gap-1">
                    <span
                      className="font-bold text-slate-900 tracking-[-0.03em] leading-none"
                      style={{ fontSize: 26, fontFamily: "'Sora', sans-serif" }}
                    >
                      {n}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 tracking-[0.07em]">
                      {l}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating AI mockup card */}
            <div className="hero-card flex-1 flex justify-center">
              <MockAiCard />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[2]">
            <div className="scroll-line w-px h-10 bg-gradient-to-b from-transparent to-violet-400" />
            <span className="font-mono text-[9px] text-slate-400 tracking-[0.18em] uppercase">
              scroll
            </span>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MARQUEE STRIP
        ══════════════════════════════════════════ */}
        <div className="relative bg-white border-y border-slate-200 overflow-hidden h-12">
          {/* Fade masks */}
          <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white to-transparent z-[2] pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-white to-transparent z-[2] pointer-events-none" />

          <div className="marquee-track flex">
            {[0, 1].map((gi) => (
              <div key={gi} className="flex items-center whitespace-nowrap">
                {MARQUEE_ITEMS.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[11px] text-slate-800 border-r border-slate-200 tracking-[0.1em] px-8 leading-[48px]"
                  >
                    <span className="text-violet-500 mr-2">✦</span>
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════
            FEATURES
        ══════════════════════════════════════════ */}
        <section id="features" className="relative bg-[#f7f8fc] py-24 px-10 overflow-hidden">
          <div className="max-w-[1200px] mx-auto">
            <FadeIn>
              <div className="text-center mb-16">
                <p className="font-mono text-[10px] text-violet-500 tracking-[0.18em] uppercase mb-4">
                  Everything you need
                </p>
                <h2
                  className="font-bold tracking-[-0.04em] text-slate-900 leading-[1.08] mb-4"
                  style={{ fontSize: "clamp(36px, 4vw, 56px)", fontFamily: "'Sora', sans-serif" }}
                >
                  Built for{" "}
                  <em className="text-violet-500 italic">thinking</em> people.
                </h2>
                <p className="font-sans text-base text-slate-500 max-w-[520px] mx-auto leading-[1.74]">
                  From a single note to a full personal knowledge graph — NoteIt
                  gives your ideas the structure they deserve.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-3 gap-3.5">
              {FEATURES.map((f, i) => (
                <FadeIn key={f.title} delay={i * 80}>
                  <FeatureCard feature={f} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════ */}
        <section id="how" className="bg-white py-24 px-10">
          <div className="max-w-[1200px] mx-auto">
            <FadeIn>
              <div className="text-center mb-16">
                <p className="font-mono text-[10px] text-violet-500 tracking-[0.18em] uppercase mb-4">
                  Simple by design
                </p>
                <h2
                  className="font-bold tracking-[-0.04em] text-slate-900 leading-[1.08] mb-4"
                  style={{ fontSize: "clamp(36px, 4vw, 56px)", fontFamily: "'Sora', sans-serif" }}
                >
                  Three steps to clarity.
                </h2>
                <p className="font-sans text-base text-slate-500 max-w-[520px] mx-auto leading-[1.74]">
                  No onboarding maze. Just open, type, and let NoteIt do its thing.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-3 gap-4">
              {(
                [
                  { num: "01", title: "Write freely",    body: "Open NoteIt and type. A rich-text editor that gets out of your way — no templates, no friction." },
                  { num: "02", title: "AI enriches",     body: "Summaries, extracted tasks, smart tags, and relationship links appear automatically on save." },
                  { num: "03", title: "Act on insights", body: "Review your daily digest, check the calendar view, close the loop. Ship faster with clarity." },
                ] as { num: string; title: string; body: string }[]
              ).map((step, i) => (
                <FadeIn key={step.num} delay={i * 120}>
                  <StepCard {...step} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            STATS BAND
        ══════════════════════════════════════════ */}
        <section className="border-y border-slate-200 bg-slate-50 py-16 px-10">
          <div className="max-w-[1000px] mx-auto grid grid-cols-4 gap-10 text-center">
            {(
              [
                ["10,000+", "Notes created daily"],
                ["< 1s",    "Average AI response"],
                ["99.9%",   "Uptime guaranteed"],
                ["6",       "AI-powered features"],
              ] as [string, string][]
            ).map(([n, l], i) => (
              <FadeIn key={l} delay={i * 80}>
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className="font-bold text-slate-900 tracking-[-0.04em]"
                    style={{ fontSize: 36, fontFamily: "'Sora', sans-serif" }}
                  >
                    {n}
                  </span>
                  <span className="font-sans text-[13px] text-slate-400">{l}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FOOTER CTA
        ══════════════════════════════════════════ */}
        <footer className="relative bg-[#f7f8fc] border-t border-slate-200 py-28 px-10 overflow-hidden text-center">
          <div className="grid-bg" style={{ opacity: 0.5 }} />

          {/* Soft glow */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 600, height: 300,
              background: "radial-gradient(ellipse,#7C6FFF12 0%,transparent 70%)",
              top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
            }}
          />

          <div className="relative z-[1]">
            <FadeIn>
              <p className="font-mono text-[10px] text-violet-500 tracking-[0.18em] uppercase mb-4">
                Start today
              </p>
              <h2
                className="font-bold tracking-[-0.04em] text-slate-900 leading-[1.05] mb-4"
                style={{ fontSize: "clamp(44px, 6vw, 72px)", fontFamily: "'Sora', sans-serif" }}
              >
                Your best thinking,
                <br />
                <em className="text-violet-500 italic">amplified.</em>
              </h2>
              <p className="font-sans text-[15px] text-slate-400 mb-10">
                Free to start. No credit card. Unlimited notes forever.
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  className="btn-primary text-white border-none px-9 py-4 rounded-[10px] text-[15px] font-bold cursor-pointer transition-all duration-200 shadow-[0_8px_24px_rgba(124,111,255,0.25)]"
                  style={{ background: "#7C6FFF", fontFamily: "'Sora', sans-serif" }}
                  onClick={() => setShowLanding(false)}
                >
                  Begin for free →
                </button>
                <button className="btn-ghost text-slate-500 border border-slate-200 bg-white px-9 py-4 rounded-[10px] text-[15px] font-sans cursor-pointer transition-all duration-200">
                  View demo ↗
                </button>
              </div>
            </FadeIn>

            <div className="h-px bg-slate-200 mt-16 mb-7" />

            <div className="flex items-center gap-5 font-mono text-xs text-slate-300 flex-wrap">
              <span className="text-violet-500 font-semibold">NoteIt.</span>
              <span className="text-slate-200">·</span>
              {["Privacy", "Terms", "Docs", "Status"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="text-slate-300 no-underline transition-colors duration-200 hover:text-violet-500"
                >
                  {l}
                </a>
              ))}
              <span className="ml-auto text-slate-300">© 2026 NoteIt</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}