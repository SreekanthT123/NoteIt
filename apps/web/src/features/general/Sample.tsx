import { useEffect, useRef, useState, type ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feature {
  icon: string;
  accent: string;
  title: string;
  desc: string;
}

interface Step {
  num: string;
  title: string;
  body: string;
}

interface NavLink {
  label: string;
  href: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Sign in", href: "#signin" },
];

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

const STEPS: Step[] = [
  {
    num: "01",
    title: "Write freely",
    body: "Open NoteIt and type. A rich-text editor that gets out of your way — no templates, no friction.",
  },
  {
    num: "02",
    title: "AI enriches",
    body: "Summaries, extracted tasks, smart tags, and relationship links appear automatically on save.",
  },
  {
    num: "03",
    title: "Act on insights",
    body: "Review your daily digest, check the calendar view, close the loop. Ship faster with clarity.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function MockEditorCard() {
  return (
    <div style={s.mockCard}>
      <div style={s.mockDots}>
        {(["#FF6B6B", "#FFB347", "#00D4AA"] as const).map((c) => (
          <span key={c} style={{ ...s.mockDot, background: c }} />
        ))}
      </div>
      <div style={s.mockFileName}>Q4 Strategy Notes.md</div>
      <div style={s.mockHr} />
      {[
        { w: "92%", hl: false },
        { w: "74%", hl: false },
        { w: "85%", hl: true },
        { w: "60%", hl: false },
        { w: "78%", hl: false },
        { w: "50%", hl: false },
      ].map((l, i) => (
        <div
          key={i}
          style={{
            ...s.mockLine,
            width: l.w,
            background: l.hl ? "#7C6FFF28" : "#10101e",
            borderLeft: l.hl ? "3px solid #7C6FFF" : "none",
          }}
        />
      ))}
      <div style={s.mockAiTag}>
        <span style={{ color: "#7C6FFF" }}>✦</span>
        AI Summary ready
      </div>
      <div style={{ height: 7, width: "88%", background: "#7C6FFF18", borderRadius: 4, marginTop: 8 }} />
      <div style={{ height: 7, width: "64%", background: "#7C6FFF18", borderRadius: 4, marginTop: 6 }} />
    </div>
  );
}

function MockAiCard() {
  return (
    <div style={{ ...s.mockCard, width: 300 }}>
      <div style={s.mockDots}>
        {(["#FF6B6B", "#FFB347", "#00D4AA"] as const).map((c) => (
          <span key={c} style={{ ...s.mockDot, background: c }} />
        ))}
      </div>
      <div style={s.mockFileName}>AI Analysis</div>
      <div style={s.mockHr} />
      {/* Summary block */}
      <div style={s.aiBlock}>
        <div style={{ ...s.aiBlockLabel, color: "#7C6FFF" }}>✦ Summary</div>
        {["90%", "76%", "83%"].map((w, i) => (
          <div key={i} style={{ height: 6, width: w, background: "#7C6FFF28", borderRadius: 3, marginBottom: 6 }} />
        ))}
      </div>
      {/* Tasks block */}
      <div style={{ ...s.aiBlock, borderColor: "#00D4AA30", background: "#00D4AA0a" }}>
        <div style={{ ...s.aiBlockLabel, color: "#00D4AA" }}>◈ Tasks extracted (3)</div>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <span style={s.aiCheckbox} />
            <div style={{ height: 5, width: `${70 - i * 8}%`, background: "#00D4AA1e", borderRadius: 3 }} />
          </div>
        ))}
      </div>
      {/* Tags */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
        {["strategy", "Q4", "product"].map((t) => (
          <span key={t} style={s.aiTag}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ feature }: { feature: Feature }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...s.featureCard,
        borderColor: hovered ? feature.accent + "55" : "#0f0f1a",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          ...s.featureIcon,
          color: feature.accent,
          borderColor: feature.accent + "30",
          background: feature.accent + "0e",
        }}
      >
        {feature.icon}
      </div>
      <div style={s.featureTitle}>{feature.title}</div>
      <div style={s.featureDesc}>{feature.desc}</div>
      <div
        style={{
          ...s.featureBarLeft,
          background: feature.accent,
          opacity: hovered ? 1 : 0,
        }}
      />
    </div>
  );
}

function StepCard({ step, index }: { step: Step; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeIn delay={index * 120}>
      <div
        style={{
          ...s.stepCard,
          borderColor: hovered ? "#7C6FFF44" : "#0f0f1a",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={s.stepNum}>{step.num}</div>
        <div style={s.stepTitle}>{step.title}</div>
        <div style={s.stepBody}>{step.body}</div>
      </div>
    </FadeIn>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NoteItLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:ital,wght@0,400;0,500;1,400&family=DM+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: #050508;
          color: #d8d8e8;
          font-family: 'Sora', system-ui, sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        ::selection { background: #7C6FFF44; color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050508; }
        ::-webkit-scrollbar-thumb { background: #1a1a2e; border-radius: 4px; }

        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .35; transform: scale(1.55); }
        }
        @keyframes float {
          0%, 100% { transform: perspective(1100px) rotateY(-8deg) rotateX(3deg) translateY(0px); }
          50% { transform: perspective(1100px) rotateY(-8deg) rotateX(3deg) translateY(-10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: perspective(1100px) rotateY(8deg) rotateX(-3deg) translateY(0px); }
          50% { transform: perspective(1100px) rotateY(8deg) rotateX(-3deg) translateY(-10px); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0,0); }
          10% { transform: translate(-1%,-1%); }
          30% { transform: translate(1%,-2%); }
          50% { transform: translate(-1%,1%); }
          70% { transform: translate(2%,1%); }
          90% { transform: translate(-2%,2%); }
        }

        .grain-overlay::after {
          content: '';
          position: fixed;
          inset: -200%;
          width: 400%; height: 400%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.025;
          animation: grain 8s steps(10) infinite;
          pointer-events: none;
          z-index: 999;
        }

        .grid-bg {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(#ffffff05 1px, transparent 1px),
            linear-gradient(90deg, #ffffff05 1px, transparent 1px);
          background-size: 64px 64px;
        }

        /* Nav link hover */
        .nav-link { color: #555; text-decoration: none; font-size: 13px; font-family: 'DM Sans', sans-serif; transition: color .2s; }
        .nav-link:hover { color: #c0c0d0; }

        /* Button hover */
        .btn-primary:hover { opacity: .85; transform: translateY(-1px); }
        .btn-ghost:hover { border-color: #3a3a5a; color: #aaa; }
        .footer-btn:hover { background: #9a8fff; }

        /* Feature card transition */
        .feature-card { transition: border-color .3s ease, transform .3s ease; }

        /* Step card */
        .step-card { transition: border-color .3s ease; }
      `}</style>

      <div className="grain-overlay" style={{ position: "relative", minHeight: "100vh" }}>

        {/* ══════════════════════════════════════════
            NAV
        ══════════════════════════════════════════ */}
        {/* <nav
          style={{
            ...s.nav,
            background: scrolled ? "rgba(5,5,8,0.88)" : "transparent",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottomColor: scrolled ? "#111" : "transparent",
          }}
        >
          <div style={s.navInner}>
            <span style={s.logo}>
              NoteIt<span style={{ color: "#7C6FFF" }}>.</span>
            </span>
            <div style={s.navLinks}>
              {NAV_LINKS.map((l) => (
                <a key={l.label} href={l.href} className="nav-link">{l.label}</a>
              ))}
            </div>
            <div style={s.navRight}>
              <a href="#signin" className="nav-link" style={{ fontSize: 13 }}>Sign in</a>
              <button style={s.navCta}>Get started free</button>
            </div>
          </div>
        </nav> */}

        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
        <section style={s.hero}>
          <div className="grid-bg" />
          {/* Blobs */}
          <div style={{ ...s.blob, width: 800, height: 800, left: "30%", top: "40%", background: "radial-gradient(circle,#7C6FFF18 0%,transparent 65%)" }} />
          <div style={{ ...s.blob, width: 500, height: 500, left: "70%", top: "20%", background: "radial-gradient(circle,#00D4AA0d 0%,transparent 65%)" }} />

          <div style={s.heroInner}>
            {/* Left copy */}
            <div style={s.heroCopy}>
              <div style={s.heroBadge}>
                <span style={s.badgeDot} />
                AI-POWERED KNOWLEDGE PLATFORM
              </div>

              <h1 style={s.heroH1}>
                Think more.<br />
                <em style={s.heroEm}>Remember</em><br />
                everything.
              </h1>

              <p style={s.heroP}>
                NoteIt captures your ideas, extracts your tasks, and summarises your knowledge — powered by AI that understands context, not just keywords.
              </p>

              <div style={s.heroBtns}>
                <button className="btn-primary" style={s.btnPrimary}>Start for free</button>
                <button className="btn-ghost" style={s.btnGhost}>Watch demo ↗</button>
              </div>

              <div style={s.heroStats}>
                {(
                  [
                    ["10k+", "NOTES CREATED"],
                    ["99%", "UPTIME SLA"],
                    ["< 1s", "AI RESPONSE"],
                  ] as [string, string][]
                ).map(([n, l]) => (
                  <div key={l} style={s.heroStat}>
                    <span style={s.heroStatNum}>{n}</span>
                    <span style={s.heroStatLbl}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating card */}
            <div style={s.heroCardWrap}>
              <MockEditorCard />
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={s.scrollIndicator}>
            <div style={s.scrollLine} />
            <span style={s.scrollText}>scroll</span>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MARQUEE STRIP
        ══════════════════════════════════════════ */}
        <div style={s.marqueeWrap}>
          <div style={s.marqueeFade} />
          <div style={s.marqueeTrack}>
            {[...Array(2)].map((_, gi) => (
              <div key={gi} style={s.marqueeInner}>
                {["AI Summaries", "Task Extraction", "Calendar View", "Note Relationships", "Daily Digest", "Rich-text Editor", "Secure Auth", "Knowledge Graph"].map((t) => (
                  <span key={t} style={s.marqueeItem}>
                    <span style={{ color: "#7C6FFF", marginRight: 8 }}>✦</span>
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div style={{ ...s.marqueeFade, right: 0, left: "auto", transform: "scaleX(-1)" }} />
          <style>{`
            @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
            .marquee-track { animation: marquee 28s linear infinite; display: flex; }
          `}</style>
        </div>

        {/* ══════════════════════════════════════════
            FEATURES
        ══════════════════════════════════════════ */}
        <section id="features" style={s.section}>
          <div style={s.sectionInner}>
            <FadeIn>
              <div style={s.sectionHead}>
                <p style={s.eyebrow}>Everything you need</p>
                <h2 style={s.sectionTitle}>
                  Built for <em style={{ color: "#7C6FFF", fontStyle: "italic" }}>thinking</em> people.
                </h2>
                <p style={s.sectionSub}>
                  From a single note to a full personal knowledge graph — NoteIt gives your ideas the structure they deserve.
                </p>
              </div>
            </FadeIn>

            <div style={s.featuresGrid}>
              {FEATURES.map((f, i) => (
                <FadeIn key={f.title} delay={i * 80}>
                  <FeatureCard feature={f} />
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SHOWCASE — split section
        ══════════════════════════════════════════ */}
        <section style={{ ...s.section, background: "#07070d" }}>
          <div className="grid-bg" style={{ opacity: 0.5 }} />
          <div style={{ ...s.blob, width: 600, height: 600, left: "60%", top: "50%", background: "radial-gradient(circle,#00D4AA0f 0%,transparent 65%)", transform: "translate(-50%,-50%)" }} />

          <div style={{ ...s.sectionInner, position: "relative", zIndex: 1 }}>
            <div style={s.splitRow}>
              {/* Left */}
              <FadeIn>
                <div style={s.splitCopy}>
                  <p style={{ ...s.eyebrow, color: "#00D4AA" }}>02 — Understand</p>
                  <h2 style={s.sectionTitle}>
                    AI that <em style={{ color: "#00D4AA", fontStyle: "italic" }}>reads</em><br />
                    between lines.
                  </h2>
                  <p style={{ ...s.sectionSub, textAlign: "left" as const }}>
                    Summaries, task extraction, smart tagging, and note linking — all happen automatically the moment you save. You focus on thinking; NoteIt handles the rest.
                  </p>
                  <ul style={s.checkList}>
                    {[
                      "Instant AI-generated summaries on every note",
                      "Due-date-aware task extraction with reminders",
                      "Automatic tags based on note content",
                      "Bidirectional note relationship linking",
                    ].map((item) => (
                      <li key={item} style={s.checkItem}>
                        <span style={s.checkIcon}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className="btn-primary" style={{ ...s.btnPrimary, marginTop: 36 }}>See AI features</button>
                </div>
              </FadeIn>

              {/* Right: AI card */}
              <FadeIn delay={150}>
                <div style={s.splitCard}>
                  <MockAiCard />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════ */}
        <section id="how" style={s.section}>
          <div style={s.sectionInner}>
            <FadeIn>
              <div style={s.sectionHead}>
                <p style={s.eyebrow}>Simple by design</p>
                <h2 style={s.sectionTitle}>Three steps to clarity.</h2>
                <p style={s.sectionSub}>No onboarding maze. Just open, type, and let NoteIt do its thing.</p>
              </div>
            </FadeIn>

            <div style={s.stepsGrid}>
              {STEPS.map((step, i) => (
                <StepCard key={step.num} step={step} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SOCIAL PROOF / STATS BAND
        ══════════════════════════════════════════ */}
        <section style={s.statsBand}>
          <div style={s.statsInner}>
            {(
              [
                ["10,000+", "Notes created daily"],
                ["< 1s", "Average AI response time"],
                ["99.9%", "Uptime guaranteed"],
                ["6", "AI-powered features"],
              ] as [string, string][]
            ).map(([n, l]) => (
              <FadeIn key={l}>
                <div style={s.statItem}>
                  <span style={s.statNum}>{n}</span>
                  <span style={s.statLbl}>{l}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CTA / FOOTER
        ══════════════════════════════════════════ */}
        <footer style={s.footer}>
          <div className="grid-bg" style={{ opacity: 0.4 }} />
          <div style={{ ...s.blob, width: 700, height: 400, left: "50%", top: "50%", background: "radial-gradient(ellipse,#7C6FFF14 0%,transparent 68%)", transform: "translate(-50%,-50%)" }} />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center" as const }}>
            <FadeIn>
              <p style={s.eyebrow}>Start today</p>
              <h2 style={s.footerH}>
                Your best thinking,<br />
                <em style={{ color: "#7C6FFF", fontStyle: "italic" }}>amplified.</em>
              </h2>
              <p style={{ ...s.sectionSub, marginBottom: 40 }}>
                Free to start. No credit card. Unlimited notes forever.
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" as const }}>
                <button className="footer-btn" style={s.footerBtn}>Begin for free →</button>
                <button className="btn-ghost" style={{ ...s.btnGhost, padding: "15px 32px" }}>View demo ↗</button>
              </div>
            </FadeIn>

            <div style={s.footerDivider} />

            <div style={s.footerMeta}>
              <span style={{ color: "#7C6FFF", fontWeight: 600 }}>NoteIt.</span>
              <span style={{ color: "#222" }}> · </span>
              {["Privacy", "Terms", "Docs", "Status"].map((l) => (
                <a key={l} href="#" style={s.footerLink}>{l}</a>
              ))}
              <span style={{ color: "#222", marginLeft: "auto" }}>© 2026 NoteIt</span>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  // NAV
  nav: {
    position: "fixed",
    top: 0, left: 0, right: 0,
    zIndex: 100,
    borderBottom: "1px solid transparent",
    transition: "background .4s, border-color .4s, backdrop-filter .4s",
  },
  navInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 40px",
    height: 64,
    display: "flex",
    alignItems: "center",
    gap: 40,
  },
  logo: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "#fff",
    marginRight: "auto",
  },
  navLinks: {
    display: "flex",
    gap: 32,
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 24,
    marginLeft: "auto",
  },
  navCta: {
    background: "#7C6FFF",
    color: "#fff",
    border: "none",
    padding: "9px 20px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "opacity .2s",
  },

  // HERO
  hero: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingTop: 64,
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: "50%",
    pointerEvents: "none",
    transform: "translate(-50%,-50%)",
  },
  heroInner: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "80px 40px",
    display: "flex",
    alignItems: "center",
    gap: 80,
    position: "relative",
    zIndex: 2,
    width: "100%",
  },
  heroCopy: {
    flex: "0 0 520px",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 14px",
    border: "1px solid #7C6FFF44",
    borderRadius: 40,
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    color: "#7C6FFF",
    background: "#7C6FFF0c",
    letterSpacing: "0.08em",
    marginBottom: 32,
  },
  badgeDot: {
    display: "block",
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "#7C6FFF",
    animation: "blink 2s infinite",
  },
  heroH1: {
    fontSize: "clamp(52px, 6.5vw, 90px)",
    fontWeight: 700,
    lineHeight: 0.97,
    letterSpacing: "-0.04em",
    color: "#fff",
    marginBottom: 26,
  },
  heroEm: {
    color: "#7C6FFF",
    fontStyle: "italic",
  },
  heroP: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    color: "#4a4a62",
    lineHeight: 1.72,
    maxWidth: 430,
    marginBottom: 40,
  },
  heroBtns: {
    display: "flex",
    gap: 14,
    marginBottom: 52,
  },
  btnPrimary: {
    background: "#7C6FFF",
    color: "#fff",
    border: "none",
    padding: "13px 28px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "opacity .2s, transform .2s",
  },
  btnGhost: {
    background: "transparent",
    color: "#555",
    border: "1px solid #1a1a2e",
    padding: "13px 28px",
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    transition: "border-color .2s, color .2s",
  },
  heroStats: {
    display: "flex",
    gap: 44,
  },
  heroStat: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  heroStatNum: {
    fontSize: 26,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },
  heroStatLbl: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    color: "#333348",
    letterSpacing: "0.07em",
  },
  heroCardWrap: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    animation: "float 6s ease-in-out infinite",
  },
  scrollIndicator: {
    position: "absolute",
    bottom: 36,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    zIndex: 2,
  },
  scrollLine: {
    width: 1,
    height: 40,
    background: "linear-gradient(to bottom, transparent, #7C6FFF)",
    animation: "blink 2s ease-in-out infinite",
  },
  scrollText: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    color: "#333",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
  },

  // MARQUEE
  marqueeWrap: {
    position: "relative",
    borderTop: "1px solid #0e0e1a",
    borderBottom: "1px solid #0e0e1a",
    background: "#07070d",
    overflow: "hidden",
    height: 48,
  },
  marqueeFade: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 120,
    background: "linear-gradient(to right, #07070d, transparent)",
    zIndex: 2,
    pointerEvents: "none",
  },
  marqueeTrack: {
    display: "flex",
    animation: "marquee 28s linear infinite",
  },
  marqueeInner: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    whiteSpace: "nowrap" as const,
  },
  marqueeItem: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    color: "#2a2a40",
    letterSpacing: "0.1em",
    padding: "0 32px",
    lineHeight: "48px",
    borderRight: "1px solid #0e0e1a",
  },

  // SECTIONS
  section: {
    position: "relative",
    padding: "100px 40px",
    overflow: "hidden",
  },
  sectionInner: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  sectionHead: {
    textAlign: "center",
    marginBottom: 64,
  },
  eyebrow: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    color: "#7C6FFF",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: "clamp(36px, 4vw, 56px)",
    fontWeight: 700,
    letterSpacing: "-0.04em",
    color: "#fff",
    lineHeight: 1.08,
    marginBottom: 16,
  },
  sectionSub: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16,
    color: "#40405a",
    maxWidth: 520,
    margin: "0 auto",
    lineHeight: 1.74,
  },

  // FEATURES GRID
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 14,
  },
  featureCard: {
    background: "#09090f",
    border: "1px solid #0f0f1a",
    borderRadius: 16,
    padding: "28px 24px",
    position: "relative",
    overflow: "hidden",
    cursor: "default",
    height: "100%",
  },
  featureIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 10,
    border: "1px solid",
    fontSize: 18,
    marginBottom: 16,
    fontFamily: "monospace",
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#c8c8d8",
    marginBottom: 8,
    letterSpacing: "-0.02em",
  },
  featureDesc: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: "#343450",
    lineHeight: 1.65,
  },
  featureBarLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 3,
    height: "100%",
    borderRadius: "16px 0 0 16px",
    transition: "opacity .3s",
  },

  // SPLIT SECTION
  splitRow: {
    display: "flex",
    alignItems: "center",
    gap: 80,
  },
  splitCopy: {
    flex: "0 0 480px",
  },
  splitCard: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    animation: "float2 6s ease-in-out infinite",
  },
  checkList: {
    listStyle: "none",
    marginTop: 28,
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  checkItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    color: "#4a4a62",
    lineHeight: 1.55,
  },
  checkIcon: {
    color: "#00D4AA",
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 1,
  },

  // STEPS
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },
  stepCard: {
    padding: "32px 28px",
    background: "#09090f",
    border: "1px solid #0f0f1a",
    borderRadius: 16,
    cursor: "default",
  },
  stepNum: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    color: "#7C6FFF",
    letterSpacing: "0.1em",
    marginBottom: 16,
    display: "block",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#c8c8d8",
    marginBottom: 10,
    letterSpacing: "-0.02em",
  },
  stepBody: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: "#343450",
    lineHeight: 1.66,
  },

  // STATS BAND
  statsBand: {
    borderTop: "1px solid #0e0e1a",
    borderBottom: "1px solid #0e0e1a",
    background: "#07070d",
    padding: "60px 40px",
  },
  statsInner: {
    maxWidth: 1000,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 40,
    textAlign: "center" as const,
  },
  statItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 6,
  },
  statNum: {
    fontSize: 36,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.04em",
  },
  statLbl: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    color: "#343450",
  },

  // FOOTER
  footer: {
    position: "relative",
    padding: "120px 40px 60px",
    borderTop: "1px solid #0e0e1a",
    overflow: "hidden",
  },
  footerH: {
    fontSize: "clamp(44px, 6vw, 80px)",
    fontWeight: 700,
    letterSpacing: "-0.04em",
    color: "#fff",
    lineHeight: 1.05,
    marginBottom: 16,
  },
  footerBtn: {
    background: "#7C6FFF",
    color: "#fff",
    border: "none",
    padding: "15px 36px",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
    transition: "background .2s",
  },
  footerDivider: {
    height: 1,
    background: "#0e0e1a",
    margin: "60px 0 28px",
  },
  footerMeta: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    fontFamily: "'DM Mono', monospace",
    fontSize: 12,
    color: "#2a2a3a",
    flexWrap: "wrap" as const,
  },
  footerLink: {
    color: "#2a2a3a",
    textDecoration: "none",
    transition: "color .2s",
  },

  // MOCK CARD
  mockCard: {
    background: "#0c0c16",
    border: "1px solid #15152a",
    borderRadius: 18,
    padding: "22px 22px 20px",
    width: 300,
    boxShadow: "0 48px 80px rgba(0,0,0,.8), 0 0 0 1px #ffffff06",
  },
  mockDots: {
    display: "flex",
    gap: 6,
    marginBottom: 16,
  },
  mockDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
  },
  mockFileName: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    color: "#28283e",
    marginBottom: 12,
  },
  mockHr: {
    height: 1,
    background: "#0f0f1e",
    marginBottom: 14,
  },
  mockLine: {
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  mockAiTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    padding: "5px 12px",
    background: "#7C6FFF12",
    border: "1px solid #7C6FFF2c",
    borderRadius: 20,
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    color: "#7C6FFF",
  },
  aiBlock: {
    padding: "10px 12px",
    background: "#7C6FFF0a",
    border: "1px solid #7C6FFF28",
    borderRadius: 10,
    marginBottom: 10,
  },
  aiBlockLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    marginBottom: 8,
  },
  aiCheckbox: {
    display: "block",
    width: 12,
    height: 12,
    border: "1px solid #00D4AA44",
    borderRadius: 3,
    flexShrink: 0,
  },
  aiTag: {
    padding: "3px 9px",
    background: "#FFB34718",
    border: "1px solid #FFB34740",
    borderRadius: 20,
    fontSize: 9,
    color: "#FFB347",
    fontFamily: "'DM Mono', monospace",
  },
};