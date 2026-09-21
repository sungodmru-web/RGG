import React, { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackEvent } from '@/lib/analytics';

const FadeIn = ({
  children,
  delay = 0,
  className = "",
  margin = "-80px",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  margin?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: margin as any });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const JOURNAL_ARTICLES = [
  { img: `${import.meta.env.BASE_URL}images/journal-governance.png`, cat: "Governance", title: "Institutional Sequencing in Emerging Markets", read: "8 MIN READ" },
  { img: `${import.meta.env.BASE_URL}images/journal-health.png`, cat: "Public Health", title: "Data Infrastructures for Therapeutic Access", read: "6 MIN READ" },
  { img: `${import.meta.env.BASE_URL}images/journal-sustainability.png`, cat: "Sustainable Development", title: "Ecological Metrics for Agricultural Transitions", read: "10 MIN READ" },
  { img: `${import.meta.env.BASE_URL}images/journal-justice.png`, cat: "Justice", title: "Frameworks for Historical Repair", read: "7 MIN READ" },
  { img: `${import.meta.env.BASE_URL}images/journal-hemp.png`, cat: "Industrial Hemp", title: "Supply Chain Architectures for Biomass", read: "5 MIN READ" },
  { img: `${import.meta.env.BASE_URL}images/journal-economy.png`, cat: "Economic Transformation", title: "Value Capture Strategies for Producer States", read: "9 MIN READ" },
];

const GOVERNANCE_LAYERS = [
  { num: "01", title: "Evidence Credibility", desc: "Capacity to generate, interpret, and apply scientific and administrative data to inform policy. Without credible evidence, policy becomes vulnerable to ideology and misinformation." },
  { num: "02", title: "Differentiated Public Health", desc: "Ability to balance therapeutic access with proportionate safeguards and harm reduction calibrated to the actual distribution of risk across populations and products." },
  { num: "03", title: "Value Capture", desc: "Institutional capacity to retain economic benefits domestically through processing, standards, and value-chain upgrading. Without deliberate investment, producer countries risk the \"raw material trap.\"" },
  { num: "04", title: "Justice Repair", desc: "Mechanisms for addressing historical harms: expungement, community reinvestment, and inclusive pathways for legacy actors. Justice repair transforms reform into a visible social settlement." },
  { num: "05", title: "Inclusive Finance", desc: "Financial systems enabling participation by smallholders, cooperatives, women, and SMEs rather than concentrating capital among well-resourced firms." },
  { num: "06", title: "Digital Trust", desc: "Traceability, data governance, and cybersecurity systems that build regulatory credibility without sacrificing sovereignty. The informational backbone of modern cannabis governance." },
  { num: "07", title: "Adaptive Institutional Legitimacy", desc: "Capacity to learn, recalibrate, and maintain public trust as conditions evolve. Ensures governance remains responsive to emerging evidence rather than ossifying over time." },
];

const BOOK_PARTS = [
  { num: "I", title: "Cannabis at the Crossroads", chapters: "Ch. 1–5", subtitle: "History, Culture & Legitimacy", desc: "Legitimacy is foundational — where formal rules align with cultural norms, compliance follows. Reform design must begin with historical and cultural literacy." },
  { num: "II", title: "Science, Health & Risk Governance", chapters: "Ch. 6–8", subtitle: "From Prohibition to Evidence-Based Policy", desc: "The endocannabinoid system repositions cannabis within human biology. Therapeutic potential for chronic pain, epilepsy, and chemotherapy-induced nausea examined with clear-eyed rigour." },
  { num: "III", title: "Sustainable Cannabis Economy", chapters: "Ch. 9–11", subtitle: "Value Chains & Structural Risks", desc: "Cultivation accounts for only 10–20% of final product value. The remaining 80–90% is in processing, extraction, formulation, branding. Producer countries risk the \"raw material trap.\" This outcome is not inevitable. It is a governance choice." },
  { num: "IV", title: "Governance & Development Pathways", chapters: "Ch. 12–17", subtitle: "Regulatory design, justice repair, institutions & finance", desc: "Eight country archetypes: Canada, Uruguay, Germany, Jamaica, Lesotho, Morocco, Colombia, South Africa. Communities that bore prohibition's heaviest costs are owed recognition, repair, and genuine participation." },
  { num: "V", title: "System Design & Futures", chapters: "Ch. 18–20", subtitle: "Implementation, digital sovereignty & adaptive learning", desc: "For developing countries: the imperative to avoid foreign-hosted traceability platforms that harvest commercial intelligence. Regional cooperation as collective digital statecraft." },
];

const WHY_MATTERS = [
  { num: "01", title: "Governance", desc: "Durable reform depends on coherent governance architectures that align regulatory design, institutional capacity, inclusive participation, and sustainable finance. Weakness in any dimension can destabilise the entire transition." },
  { num: "02", title: "Justice", desc: "Communities that bore prohibition's heaviest costs are owed recognition, repair, and genuine participation in governing the systems now built in their name. Reforms that fail here reproduce the asymmetries they claim to leave behind." },
  { num: "03", title: "Sustainable Development", desc: "Industrial hemp aligns with sustainable production, climate resilience, and circular economy strategies. Cannabis offers developing countries economic pathways unimaginable a decade ago." },
  { num: "04", title: "Economic Transformation", desc: "Countries that do not invest now in governance capacities risk being confined to supplying raw biomass while value is captured elsewhere. This outcome is not inevitable — it is a governance choice." },
  { num: "05", title: "Adaptive Governance", desc: "Policy must be treated as testable hypotheses — monitored, evaluated, and refined over time. The ones succeeding are those building systems capable of honest self-assessment and continuous adaptation." },
];

export default function Home() {
  const particleContainerRef = useRef<HTMLDivElement>(null);

  // Spawn floating particles in hero
  useEffect(() => {
    const container = particleContainerRef.current;
    if (!container) return;
    const count = 28;
    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 2.5 + 1;
      const left = Math.random() * 100;
      const duration = Math.random() * 12 + 8;
      const delay = Math.random() * 10;
      const opacity = Math.random() * 0.35 + 0.1;
      p.style.cssText = `
        position:absolute; bottom:0; left:${left}%;
        width:${size}px; height:${size}px;
        background:${Math.random() > 0.6 ? '#C8A96B' : '#0D3B2E'};
        border-radius:50%;
        animation: float-up ${duration}s ${delay}s linear infinite;
        opacity:${opacity};
        pointer-events:none;
      `;
      container.appendChild(p);
      particles.push(p);
    }
    return () => { particles.forEach(p => p.remove()); };
  }, []);

  return (
    <div className="bg-[#0B0B0B] text-[#F4F1EA] min-h-screen font-sans selection:bg-[#C8A96B] selection:text-[#0B0B0B] relative overflow-x-hidden">

      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px] opacity-30 pointer-events-none" />
        {/* Ambient emerald glow */}
        <div className="absolute bottom-0 right-0 w-[70vw] h-[70vh] bg-[radial-gradient(ellipse_at_bottom_right,rgba(13,59,46,0.5)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute top-0 left-0 w-[40vw] h-[40vh] bg-[radial-gradient(ellipse_at_top_left,rgba(13,59,46,0.2)_0%,transparent_65%)] pointer-events-none" />
        {/* Particles */}
        <div ref={particleContainerRef} className="absolute inset-0 pointer-events-none overflow-hidden" />

        <div className="container mx-auto px-6 relative z-10 pt-28 pb-16 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <div className="max-w-2xl">
            <FadeIn margin="0px">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-8 bg-[#9A7A3A]" />
                <span className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] font-bold">A Global Handbook on Cannabis Economy · 2026</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} margin="0px">
              <h1 className="font-serif text-[clamp(52px,8vw,96px)] leading-[1.02] text-[#F4F1EA] mb-6">
                Reclaiming the{' '}
                <span className="italic text-[#EDD99A]">Green Gold</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.22} margin="0px">
              <p className="text-lg md:text-xl text-[#C8BFA0] font-light mb-10 leading-relaxed max-w-lg">
                Cannabis at the Crossroads of Health, Justice and Sustainable Development
              </p>
            </FadeIn>

            <FadeIn delay={0.34} margin="0px">
              <div className="border-l-2 border-[#C8A96B] pl-5 bg-[#0F1A14]/40 py-4 pr-6 mb-10 inline-block">
                <p className="font-serif text-xl md:text-2xl text-[#C8A96B] italic leading-snug">
                  "Legalisation is the easy part.<br />Readiness is the work."
                </p>
                <p className="text-[9px] uppercase tracking-[2px] text-[#4A6055] mt-3">— Central Thesis</p>
              </div>
            </FadeIn>

            <FadeIn delay={0.46} margin="0px">
              <div className="flex flex-wrap gap-3 mb-12">
                <Button asChild className="bg-[#C8A96B] text-[#0B0B0B] hover:bg-[#EDD99A] rounded-none px-7 h-12 uppercase tracking-[2px] text-[10px] font-bold">
                  <a href="#editions" onClick={() => trackEvent('edition_interest_clicked', { edition: 'hardcover', location: 'hero' })}>Buy Hardcover</a>
                </Button>
                <Button asChild variant="outline" className="border-[#C8A96B]/60 text-[#C8A96B] hover:bg-[#C8A96B]/10 hover:border-[#C8A96B] rounded-none px-7 h-12 uppercase tracking-[2px] text-[10px] bg-transparent">
                  <a href="#editions" onClick={() => trackEvent('edition_interest_clicked', { edition: 'paperback', location: 'hero' })}>Buy Paperback</a>
                </Button>
                <Button asChild variant="outline" className="border-[#C8A96B]/60 text-[#C8A96B] hover:bg-[#C8A96B]/10 hover:border-[#C8A96B] rounded-none px-7 h-12 uppercase tracking-[2px] text-[10px] bg-transparent">
                  <a href="#editions" onClick={() => trackEvent('edition_interest_clicked', { edition: 'ebook', location: 'hero' })}>Buy Ebook</a>
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.58} margin="0px">
              <div className="flex flex-wrap gap-8">
                {[
                  { label: "Structure", value: "5 Parts · 20 Chapters" },
                  { label: "Length", value: "460 Pages" },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-[9px] uppercase tracking-[2px] text-[#9A7A3A] mb-1">{s.label}</div>
                    <div className="text-[13px] text-[#C8BFA0] font-light">{s.value}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right — 3D book with real cover */}
          <div className="hidden lg:flex justify-center items-center">
            <FadeIn delay={0.3} margin="0px">
              <motion.div
                animate={{ y: [-14, 14, -14] }}
                transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
                style={{ perspective: "1200px" }}
              >
                <div style={{ position: "relative", transformStyle: "preserve-3d" }}>
                  {/* Drop shadow */}
                  <div style={{
                    position: "absolute",
                    bottom: "-28px",
                    left: "8%",
                    right: "8%",
                    height: "40px",
                    background: "rgba(0,0,0,0.55)",
                    filter: "blur(18px)",
                    borderRadius: "50%",
                  }} />
                  {/* Book cover image with 3D tilt */}
                  <div style={{
                    transform: "rotateY(-22deg) rotateX(4deg)",
                    transformStyle: "preserve-3d",
                    position: "relative",
                    borderRadius: "3px 6px 6px 3px",
                    boxShadow: "20px 24px 60px rgba(0,0,0,0.85), -2px 0 4px rgba(200,169,107,0.15)",
                    overflow: "hidden",
                    width: "320px",
                  }}>
                    <img
                      src={`${import.meta.env.BASE_URL}images/cover-front.png`}
                      alt="Reclaiming the Green Gold — Front Cover"
                      style={{ display: "block", width: "320px", height: "auto" }}
                    />
                    {/* Specular gloss overlay */}
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)",
                      pointerEvents: "none",
                    }} />
                  </div>
                  {/* Spine */}
                  <div style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "22px",
                    background: "linear-gradient(90deg, #1a0e04, #3a2208)",
                    transform: "rotateY(90deg) translateX(-11px)",
                    transformOrigin: "left center",
                  }} />
                </div>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────── */}
      <div className="bg-[#0D1410] backdrop-blur-md border-y border-[#1a2e20] py-6">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-0">
            {[
              { value: "460", label: "Pages" },
              { value: "20", label: "Chapters" },
              { value: "$40B", label: "Market 2024" },
              { value: "$100B+", label: "Projected 2030" },
              { value: "7", label: "Governance Layers" },
            ].map((stat, i) => (
              <FadeIn key={i} delay={i * 0.08} className="text-center md:border-r md:border-[#1a2e20] last:border-0 py-2">
                <div className="font-serif text-3xl md:text-4xl text-[#EDD99A] mb-1 font-light">{stat.value}</div>
                <div className="text-[9px] uppercase tracking-[3px] text-[#4A6055]">{stat.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* ── ENDORSEMENT QUOTES ──────────────────────────────────── */}
      <section className="py-24 bg-[#0B0B0B] border-b border-[#1a2e20] relative overflow-hidden">
        {/* background watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.025]">
          <span className="font-serif text-[28vw] text-[#C8A96B] leading-none">"</span>
        </div>
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-4">
            <span className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A]">From the back cover</span>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {[
              {
                quote: "Drugs have destroyed many lives, but wrong government policies have destroyed many more.",
                name: "Kofi Annan",
                title: "Former UN Secretary-General, Global Statesman",
                year: "2018",
              },
              {
                quote: "Injustice anywhere is a threat to justice everywhere. We are caught in an inescapable network of mutuality, tied in a single garment of destiny.",
                name: "Martin Luther King Jr.",
                title: "Leader of the American Civil Rights Movement",
                year: "1963",
              },
            ].map((q, i) => (
              <FadeIn key={i} delay={i * 0.18}>
                <div className="relative p-10 border border-[#1a2e20] hover:border-[#C8A96B]/30 transition-colors duration-500 group">
                  {/* gold corner ornament */}
                  <div className="absolute top-4 left-4 w-5 h-5 border-t border-l border-[#C8A96B]/40 group-hover:border-[#C8A96B]/70 transition-colors duration-500" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-[#C8A96B]/40 group-hover:border-[#C8A96B]/70 transition-colors duration-500" />
                  {/* big quote mark */}
                  <div className="font-serif text-6xl text-[#C8A96B]/20 leading-none mb-2 select-none">"</div>
                  <blockquote className="font-serif text-xl md:text-2xl text-[#F4F1EA] leading-relaxed mb-8 italic">
                    {q.quote}
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-[#C8A96B]/30 to-transparent" />
                    <div className="text-right">
                      <div className="text-[#C8A96B] text-sm font-medium tracking-wide">{q.name}</div>
                      <div className="text-[#4A6055] text-[10px] uppercase tracking-widest mt-0.5">{q.title} · {q.year}</div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOBAL GOVERNANCE TRANSITION ───────────────────────── */}
      <section id="framework" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5">
              <FadeIn>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px w-8 bg-[#9A7A3A]" />
                  <span className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A]">The Argument</span>
                </div>
                <h2 className="font-serif text-4xl md:text-5xl text-[#EDD99A] mb-8 leading-tight">
                  A Global Governance Transition
                </h2>
                <p className="text-lg text-[#F4F1EA] leading-relaxed mb-5 font-light">
                  Cannabis reform is not a binary legal choice between prohibition and legalisation — it is a governance transition.
                </p>
                <p className="text-[#C8BFA0] leading-relaxed font-light">
                  Outcomes depend less on legal status than on the quality of institutions, coherence of policies, and adaptive learning capacity states bring to implementation.
                </p>
              </FadeIn>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
              {[
                {
                  label: "The Governance Gap",
                  text: "Countries are legalising faster than they are governing. Licences are issued before laboratories exist. Export frameworks are announced before certification systems are built.",
                },
                {
                  label: "The Stakes for Developing Nations",
                  text: "For LMICs and Small Island Developing States, the stakes are especially high. The window for deliberate appropriation is open — but it will not remain so indefinitely.",
                },
                {
                  label: "The Defining Challenge",
                  text: "The gap between legislative ambition and institutional reality is not a minor detail — it is the defining challenge of this transition. Markets are consolidating. Standards are being set.",
                },
              ].map((card, i) => (
                <FadeIn key={i} delay={0.15 + i * 0.12} className={i === 2 ? "sm:col-span-2" : ""}>
                  <div className="bg-[linear-gradient(145deg,#162B1E_0%,#0F1A14_100%)] border border-[#C8A96B]/20 hover:border-[#C8A96B]/60 p-8 h-full transition-all duration-500 group hover:-translate-y-1">
                    <div className="text-[9px] uppercase tracking-[2px] text-[#9A7A3A] mb-4">{card.label}</div>
                    <p className="text-[#F4F1EA] leading-relaxed font-light">{card.text}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FIVE PARTS ─────────────────────────────────────────── */}
      <section id="book" className="py-32 bg-[#0E0E0E] border-t border-[#1a2e20]">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-6">
            <div className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] mb-5">The Book · 5 Parts · 20 Chapters</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#EDD99A] leading-tight max-w-2xl mx-auto">
              A Governance Handbook, Not a Legal Manifesto
            </h2>
          </FadeIn>
          <FadeIn delay={0.1} className="text-center mb-20">
            <p className="font-serif text-lg italic text-[#C8BFA0] max-w-2xl mx-auto leading-relaxed">
              "Cannabis reform is not a binary legal choice. It is a governance transition."
            </p>
          </FadeIn>

          <div className="max-w-4xl mx-auto">
            {BOOK_PARTS.map((part, i) => (
              <FadeIn key={i} delay={i * 0.09}>
                <div className="flex gap-8 md:gap-14 group border-t border-[#1a2e20] py-10 hover:border-[#C8A96B]/40 transition-colors duration-500">
                  <div className="font-serif text-5xl md:text-7xl text-[#C8A96B]/20 group-hover:text-[#C8A96B]/50 transition-colors duration-500 w-14 md:w-20 shrink-0 leading-none pt-1">
                    {part.num}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-3 mb-2">
                      <h3 className="font-serif text-xl md:text-2xl text-[#EDD99A]">{part.title}</h3>
                      <span className="text-[9px] uppercase tracking-[2px] text-[#4A6055]">{part.chapters}</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-[2px] text-[#C8A96B]/70 mb-4">{part.subtitle}</div>
                    <p className="text-[#C8BFA0] leading-relaxed font-light">{part.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
            <div className="border-t border-[#1a2e20]" />
          </div>
        </div>
      </section>

      {/* ── SEVEN GOVERNANCE LAYERS ────────────────────────────── */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(13,59,46,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <FadeIn>
              <div className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] mb-5">The Cannabis Governance Transition Model</div>
              <h2 className="font-serif text-4xl md:text-5xl text-[#EDD99A] mb-6 leading-tight">
                Seven Interdependent Governance Layers
              </h2>
              <p className="text-[#C8BFA0] text-lg font-light">
                Weakness in any single layer can generate cascading effects that destabilise the entire transition. The model functions as both an assessment tool and a guide for sequencing governance investments.
              </p>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1a2e20]">
            {GOVERNANCE_LAYERS.map((layer, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="bg-[#0B0B0B] hover:bg-[#0F1A14] p-8 h-full transition-colors duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#C8A96B]/0 via-[#C8A96B]/70 to-[#C8A96B]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="font-mono text-[11px] text-[#9A7A3A] mb-5 tracking-wider">{layer.num}</div>
                  <h3 className="font-serif text-xl text-[#F4F1EA] mb-4 group-hover:text-[#EDD99A] transition-colors duration-300">{layer.title}</h3>
                  <p className="text-[#C8BFA0] text-sm leading-relaxed font-light">{layer.desc}</p>
                </div>
              </FadeIn>
            ))}
            {/* 8th cell — pull quote */}
            <FadeIn delay={0.7}>
              <div className="bg-[#0D3B2E]/20 p-8 flex flex-col justify-center items-start">
                <p className="font-serif text-xl text-[#C8A96B] italic leading-relaxed mb-4">
                  "Cannabis is a governance issue, not a legal one."
                </p>
                <div className="text-[9px] uppercase tracking-[2px] text-[#4A6055]">— Core Argument</div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── WHY THIS WORK MATTERS ──────────────────────────────── */}
      <section className="py-32 bg-[#0E0E0E] border-t border-[#1a2e20]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Sticky left */}
            <div className="lg:col-span-2">
              <FadeIn>
                <div className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] mb-5">Why It Matters</div>
                <h2 className="font-serif text-4xl md:text-5xl text-[#EDD99A] mb-8 leading-tight">Why This Work Matters</h2>
                <div className="w-12 h-px bg-[#C8A96B] mb-8" />
                <p className="font-serif text-2xl text-[#C8A96B] italic leading-snug mb-6">
                  "Legalisation is the easy part. Readiness is the work."
                </p>
                <p className="text-[#C8BFA0] text-sm font-light leading-relaxed">
                  The book is written for policymakers navigating reform with limited resources, development practitioners building capacity where it is scarce, and governance reformers who understand that durable change is built slowly, institutionally, and inclusively.
                </p>
              </FadeIn>
            </div>

            {/* Right items */}
            <div className="lg:col-span-3 space-y-0">
              {WHY_MATTERS.map((block, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="flex gap-8 border-t border-[#1a2e20] py-8 group hover:border-[#C8A96B]/30 transition-colors duration-300">
                    <div className="font-mono text-[11px] text-[#9A7A3A] pt-1 w-8 shrink-0">{block.num}</div>
                    <div>
                      <h3 className="text-[11px] uppercase tracking-[3px] text-[#C8A96B] font-bold mb-3 group-hover:text-[#EDD99A] transition-colors duration-300">{block.title}</h3>
                      <p className="text-[#C8BFA0] font-light leading-relaxed">{block.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
              <div className="border-t border-[#1a2e20]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRACTICAL TOOLKIT ──────────────────────────────────── */}
      <section className="py-32 relative border-t border-[#1a2e20]">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-20">
            <div className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] mb-5">The Practical Toolkit · 3 Annexes</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#EDD99A]">From Analysis to Action</h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-px bg-[#1a2e20] max-w-5xl mx-auto">
            {[
              {
                num: "Annexe 1",
                title: "Global Cannabis Economy Snapshot",
                desc: "Market size $35–40B in 2024, projected $100B+ by 2030. Three growth scenarios: conservative, base, accelerated.",
                stat: "$100B+",
                statLabel: "Projected 2030",
              },
              {
                num: "Annexe 2",
                title: "Comparative Governance Models",
                desc: "8 country archetypes: Uruguay, Canada, USA, Jamaica, South Africa, Lesotho, Morocco, Colombia. Governance readiness diagnostic.",
                stat: "8",
                statLabel: "Country Models",
              },
              {
                num: "Annexe 3 — NCE-SAF",
                title: "National Readiness Toolkit",
                desc: "13 readiness dimensions across 3 clusters. Traffic-light scoring (Green/Orange/Red). Designed for multi-ministry facilitated workshops.",
                stat: "13",
                statLabel: "Readiness Dimensions",
              },
            ].map((a, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div className="bg-[#0B0B0B] hover:bg-[#0F1A14] p-10 text-center flex flex-col items-center transition-colors duration-500 h-full">
                  <div className="text-[9px] uppercase tracking-[2px] text-[#9A7A3A] mb-4">{a.num}</div>
                  <div className="font-serif text-4xl text-[#EDD99A] mb-1">{a.stat}</div>
                  <div className="text-[9px] uppercase tracking-[2px] text-[#4A6055] mb-7">{a.statLabel}</div>
                  <div className="w-6 h-px bg-[#C8A96B]/40 mb-7 mx-auto" />
                  <h3 className="font-serif text-xl text-[#F4F1EA] mb-4">{a.title}</h3>
                  <p className="text-[#C8BFA0] text-sm leading-relaxed font-light">{a.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOK EDITIONS ──────────────────────────────────────── */}
      <section id="editions" className="py-32 bg-[#0E0E0E] border-t border-[#1a2e20]">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-6">
            <div className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] mb-5">The Editions</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#EDD99A]">Proposed Editions</h2>
          </FadeIn>
          <FadeIn delay={0.1} className="text-center mb-20">
            <p className="text-[#C8BFA0] font-light">Printed and fulfilled by BookVault. Worldwide delivery.</p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                badge: "Collector",
                type: "Hardcover",
                desc: "The collector's institutional edition. Printed and fulfilled by BookVault.",
                price: "$49",
                btn: "Order Hardcover",
                primary: true,
              },
              {
                badge: "Standard",
                type: "Paperback",
                desc: "The accessible strategic edition. Worldwide delivery.",
                price: "$28",
                btn: "Order Paperback",
                primary: false,
              },
              {
                badge: "Digital",
                type: "Kindle / eBook",
                desc: "The portable global handbook. Instant delivery to any device.",
                price: "$14",
                btn: "Download eBook",
                primary: false,
              },
              {
                badge: "Executive",
                type: "Licensed PDF",
                desc: "Individually watermarked. Personal licence for professional use.",
                price: "$22",
                btn: "Get Licensed PDF",
                primary: false,
              },
            ].map((ed, i) => (
              <FadeIn key={i} delay={i * 0.14}>
                <div className={`flex flex-col items-center text-center p-10 h-full border transition-all duration-500 hover:-translate-y-2 ${ed.primary ? 'bg-[#0F1A14] border-[#C8A96B] shadow-[0_0_60px_rgba(200,169,107,0.08)]' : 'bg-[#0B0B0B] border-[#1a2e20] hover:border-[#C8A96B]/40'}`}>
                  <div className="text-[8px] uppercase tracking-[2px] text-[#9A7A3A] border border-[#9A7A3A]/40 px-3 py-1 mb-8">{ed.badge}</div>
                  {/* Book mockup mini — real cover */}
                  <div className="mb-8" style={{ perspective: "700px" }}>
                    <div style={{
                      transform: "rotateY(-18deg) rotateX(3deg)",
                      transformStyle: "preserve-3d",
                      position: "relative",
                      width: "112px",
                      borderRadius: "2px 5px 5px 2px",
                      boxShadow: "10px 14px 32px rgba(0,0,0,0.75)",
                      overflow: "hidden",
                    }}>
                      <img
                        src={`${import.meta.env.BASE_URL}images/cover-front.png`}
                        alt="Book cover"
                        style={{ display: "block", width: "112px", height: "auto" }}
                      />
                      <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 55%)",
                        pointerEvents: "none",
                      }} />
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl text-[#EDD99A] mb-2">{ed.type}</h3>
                  <p className="text-[#C8BFA0] text-sm mb-6 font-light flex-1">{ed.desc}</p>
                  <div className="mb-8">
                    <span className="font-serif text-3xl text-[#C8A96B]">{ed.price}</span>
                    <span className="text-[10px] uppercase tracking-[1px] text-[#4A6055] ml-2">from</span>
                  </div>
                  <Button
                    className={`w-full rounded-none uppercase tracking-[2px] text-[10px] h-12 font-bold ${ed.primary ? 'bg-[#C8A96B] text-[#0B0B0B] hover:bg-[#EDD99A]' : 'bg-transparent border border-[#C8A96B] text-[#C8A96B] hover:bg-[#C8A96B]/10'}`}
                    variant={ed.primary ? "default" : "outline"}
                    onClick={() => trackEvent('edition_selected', {
                      edition: ed.type.toLowerCase().replaceAll(' ', '_').replaceAll('/', '_'),
                      price: ed.price,
                      location: 'editions',
                    })}
                  >
                    {ed.btn}
                  </Button>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── AUTHORS ────────────────────────────────────────────── */}
      <section id="authors" className="py-32 relative border-t border-[#1a2e20]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(13,59,46,0.1)_0%,transparent_60%)] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <FadeIn className="text-center mb-20">
            <div className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] mb-5">The Authors · Intergenerational · Interdisciplinary</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#EDD99A]">Sunil & Sunny Sweenarain</h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
            {[
              {
                name: "Dr Soobaschand (Sunil) Sweenarain",
                role: "Natural Resource Economist",
                initial: "S",
                bio1: "Senior natural resource economist with over three decades of international experience in sustainable development, renewable resource management, economic governance, and policy advisory.",
                bio2: "He has centred his career on the African continent, where he has led and advised on complex programmes in resource management, regional cooperation, and economic integration. Author of numerous technical and strategic reports.",
              },
              {
                name: "Sunny Sweenarain",
                role: "Medical Cannabis Specialist",
                initial: "S",
                bio1: "Researcher and international consultant spanning clinical, humanitarian, cultural, and ethical dimensions of medical cannabis. Studied cannabis science in Canada with over ten years of work in developing states worldwide.",
                bio2: "Patient-oriented medical cannabis applications, clinical interpretation, and translation of medical knowledge into responsible regulatory and practice frameworks. Committed to patient dignity, informed choice, and continuity of care.",
              },
            ].map((author, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="border border-[#1a2e20] hover:border-[#C8A96B]/30 p-10 bg-[#0F1A14]/30 h-full transition-colors duration-500">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0D3B2E] to-[#0A1812] border border-[#C8A96B]/25 flex items-center justify-center shrink-0">
                      <span className="font-serif text-3xl text-[#C8A96B]/30 font-light">{author.initial}</span>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-[#EDD99A] mb-1">{author.name}</h3>
                      <div className="text-[9px] uppercase tracking-[2px] text-[#9A7A3A]">{author.role}</div>
                    </div>
                  </div>
                  <p className="text-[#C8BFA0] text-sm leading-relaxed font-light mb-4">{author.bio1}</p>
                  <p className="text-[#C8BFA0] text-sm leading-relaxed font-light">{author.bio2}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#C8A96B]/30" />
                <div className="w-2 h-2 bg-[#9A7A3A] rotate-45" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#C8A96B]/30" />
              </div>
              <p className="font-serif text-2xl md:text-3xl text-[#F4F1EA] italic leading-relaxed mb-6">
                "The cannabis future will not be inherited passively. It will be woven through deliberate choices about institutions, inclusion, evidence, and trust."
              </p>
              <p className="text-[10px] uppercase tracking-[3px] text-[#9A7A3A]">
                — Sunil & Sunny Sweenarain, 2026
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── JOURNAL ────────────────────────────────────────────── */}
      <section id="journal" className="py-32 bg-[#0E0E0E] border-t border-[#1a2e20]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <FadeIn>
              <div className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] mb-5">The Green Gold Journal</div>
              <h2 className="font-serif text-4xl md:text-5xl text-[#EDD99A] mb-4">Weekly Dispatches</h2>
              <p className="text-[#C8BFA0] max-w-lg font-light">Intelligence on governance, public health, sustainable development and global reform.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <a href="#" className="text-[10px] uppercase tracking-[2px] text-[#C8A96B] hover:text-[#EDD99A] transition-colors shrink-0">
                View All Articles →
              </a>
            </FadeIn>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {JOURNAL_ARTICLES.map((article, i) => (
              <FadeIn key={i} delay={i * 0.09}>
                <a href="#" className="block group">
                  <div className="aspect-[4/3] overflow-hidden mb-6 bg-[#0F1A14]">
                    <img
                      src={article.img}
                      alt={article.title}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] uppercase tracking-[2px] text-[#9A7A3A]">{article.cat}</span>
                    <span className="text-[9px] uppercase tracking-[1px] text-[#4A6055]">{article.read}</span>
                  </div>
                  <h3 className="font-serif text-xl text-[#F4F1EA] group-hover:text-[#C8A96B] transition-colors duration-300 leading-snug">
                    {article.title}
                  </h3>
                  <div className="mt-4 h-px w-0 bg-[#C8A96B] group-hover:w-full transition-all duration-500" />
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADVISORY ───────────────────────────────────────────── */}
      <section id="advisory" className="py-32 border-t border-[#1a2e20] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(13,59,46,0.1)_0%,transparent_60%)] pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <div>
              <FadeIn>
                <div className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] mb-5">Advisory Division</div>
                <h2 className="font-serif text-4xl md:text-5xl text-[#EDD99A] mb-8 leading-tight">
                  Governance & Strategic Advisory
                </h2>
                <p className="text-[#C8BFA0] font-light leading-relaxed mb-14 text-lg max-w-lg">
                  As an institutional think tank, we partner with governments, multilateral organisations, and strategic entities to design robust, evidence-based frameworks for the cannabis governance transition.
                </p>
              </FadeIn>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-[#1a2e20]">
                {[
                  "Governance readiness assessments",
                  "Institutional capacity building",
                  "Regulatory strategy",
                  "Public health frameworks",
                  "Sustainable cannabis economy development",
                  "Policy sequencing",
                  "Justice and inclusion frameworks",
                  "Digital governance strategy",
                ].map((item, i) => (
                  <FadeIn key={i} delay={0.05 * i}>
                    <div className="flex items-center gap-4 p-5 border-b border-r border-[#1a2e20] text-sm text-[#F4F1EA] font-light hover:bg-[#0F1A14] hover:text-[#C8A96B] transition-all duration-300">
                      <div className="w-1 h-1 bg-[#C8A96B] rounded-full shrink-0" />
                      {item}
                    </div>
                  </FadeIn>
                ))}
              </div>

              <FadeIn delay={0.4}>
                <Button
                  className="mt-10 bg-transparent border border-[#C8A96B] text-[#C8A96B] hover:bg-[#C8A96B]/10 rounded-none px-10 h-12 uppercase tracking-[2px] text-[10px] font-bold"
                  onClick={() => trackEvent('briefing_requested', { location: 'advisory' })}
                >
                  Request a Briefing
                </Button>
              </FadeIn>
            </div>

            {/* Newsletter */}
            <FadeIn delay={0.2}>
              <div className="bg-[#0D1410] border border-[#1a2e20] p-12">
                <div className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] mb-5">The Green Gold Brief</div>
                <h3 className="font-serif text-3xl text-[#EDD99A] mb-4 leading-tight">Weekly Intelligence Dispatches</h3>
                <p className="text-[#C8BFA0] font-light mb-10 text-sm leading-relaxed">
                  Policy analysis, research updates, and governance insights from the cannabis frontier. One substantive article, every Tuesday.
                </p>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    trackEvent('newsletter_signup_attempted', { location: 'advisory' });
                  }}
                >
                  <Input
                    type="email"
                    placeholder="Your institutional email address"
                    className="bg-[#0B0B0B] border-[#1a2e20] text-[#F4F1EA] h-12 rounded-none focus-visible:ring-[#C8A96B] focus-visible:border-[#C8A96B] placeholder:text-[#4A6055]"
                  />
                  <Button type="submit" className="w-full bg-[#C8A96B] text-[#0B0B0B] hover:bg-[#EDD99A] rounded-none h-12 uppercase tracking-[2px] text-[10px] font-bold">
                    Subscribe to The Brief
                  </Button>
                </form>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#1a2e20]" />
                  <span className="text-[8px] uppercase tracking-[1.5px] text-[#4A6055] whitespace-nowrap">No advertising · No data selling · Unsubscribe at any time</span>
                  <div className="h-px flex-1 bg-[#1a2e20]" />
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FOR POLICYMAKERS ────────────────────────────────────── */}
      <section className="py-32 bg-[#0B0B0B] border-t border-[#1a2e20]">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-20">
            <div className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] mb-5">Who This Book Serves</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#EDD99A] mb-6">For Every Institution at the Crossroads</h2>
            <p className="text-[#C8BFA0] font-light max-w-xl mx-auto">
              Practical tools to design fair laws, responsible governance, and sustainable national and regional strategies — for the full spectrum of decision-makers.
            </p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                num: "01",
                title: "Governments & Regulators",
                desc: "National ministries, health authorities, and regulatory agencies designing or reforming cannabis frameworks.",
              },
              {
                num: "02",
                title: "Regional Economic Communities",
                desc: "AU, CARICOM, ASEAN, MERCOSUR, and Commonwealth bodies building harmonised regional approaches.",
              },
              {
                num: "03",
                title: "Development Partners",
                desc: "International organisations, donors, and agencies supporting evidence-based governance transitions.",
              },
              {
                num: "04",
                title: "Research Institutions",
                desc: "Universities, think tanks, and policy institutes conducting comparative and applied governance research.",
              },
              {
                num: "05",
                title: "Civil Society & Advocates",
                desc: "Organisations ensuring that reform serves equity, justice, and community benefit at every level.",
              },
              {
                num: "06",
                title: "Investors & Industry",
                desc: "Businesses and investors requiring credible regulatory intelligence to operate responsibly across jurisdictions.",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="border border-[#1a2e20] hover:border-[#C8A96B]/30 p-8 transition-all duration-500 group h-full">
                  <div className="font-serif text-3xl text-[#C8A96B]/20 group-hover:text-[#C8A96B]/40 transition-colors mb-4 font-bold">{item.num}</div>
                  <h3 className="font-serif text-lg text-[#EDD99A] mb-3">{item.title}</h3>
                  <p className="text-[#C8BFA0] text-sm font-light leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGIONAL PARTNERSHIPS ────────────────────────────────── */}
      <section id="partnerships" className="py-32 bg-[#060D08] border-t border-[#1a2e20]">
        <div className="container mx-auto px-6">
          <FadeIn className="text-center mb-20">
            <div className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] mb-5">Institutional Cooperation</div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#EDD99A] mb-6">Seven Pillars of Regional Cooperation</h2>
            <p className="text-[#C8BFA0] font-light max-w-xl mx-auto">
              Connecting knowledge, policy, and practice across continents — framed around the world's leading regional institutions.
            </p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-6xl mx-auto mb-16">
            {[
              {
                abbr: "AU",
                name: "African Union Commission",
                scope: "54 Member States",
                desc: "Continental governance, harmonisation of national frameworks, and pan-African regulatory cooperation.",
              },
              {
                abbr: "RECs",
                name: "AU Regional Economic Communities",
                scope: "8 recognised bodies",
                desc: "ECOWAS, SADC, EAC, IGAD, AMU, CEN-SAD, ECCAS, COMESA — sub-regional coordination and policy alignment.",
              },
              {
                abbr: "CARICOM",
                name: "Caribbean Community",
                scope: "20 Members & Associates",
                desc: "Small island states and developing economies addressing legalisation, trade, and healthcare governance.",
              },
              {
                abbr: "ASEAN",
                name: "Association of Southeast Asian Nations",
                scope: "10 Member States",
                desc: "Emerging regulatory transitions in a region at the forefront of medicinal cannabis development.",
              },
              {
                abbr: "MERCOSUR",
                name: "Southern Common Market",
                scope: "South America",
                desc: "Regional trade harmonisation and shared frameworks for cultivation, processing, and export.",
              },
              {
                abbr: "CS",
                name: "The Commonwealth Secretariat",
                scope: "56 Nations",
                desc: "Cross-continental capacity building across diverse legal, health, and governance traditions.",
              },
              {
                abbr: "OIF",
                name: "Organisation Internationale de la Francophonie",
                scope: "88 Member States",
                desc: "French-speaking nations across Africa, the Caribbean, and beyond navigating shared reform pathways.",
              },
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div className="border border-[#1a2e20] hover:border-[#C8A96B]/30 p-7 transition-all duration-500 group h-full">
                  <div className="text-[9px] uppercase tracking-[2px] text-[#9A7A3A] border border-[#9A7A3A]/30 inline-block px-2 py-0.5 mb-4 font-bold">{p.scope}</div>
                  <div className="font-serif text-2xl text-[#C8A96B]/30 group-hover:text-[#C8A96B]/60 transition-colors mb-2 font-bold">{p.abbr}</div>
                  <h3 className="font-serif text-base text-[#EDD99A] mb-3 leading-snug">{p.name}</h3>
                  <p className="text-[#4A6055] text-sm font-light leading-relaxed">{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3} className="text-center">
            <Button asChild className="bg-transparent border border-[#C8A96B]/50 text-[#C8A96B] hover:bg-[#C8A96B]/10 rounded-none px-10 h-11 uppercase tracking-[2px] text-[10px] font-bold">
              <a
                href="mailto:contact@reclaimingthegreengold.com"
                onClick={() => trackEvent('contact_link_clicked', { inquiry_type: 'institutional_partnership', location: 'regional_partnerships' })}
              >
                Explore Institutional Partnerships
              </a>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* ── CONTACT ────────────────────────────────────────────── */}
      <section id="contact" className="py-32 bg-[#0E0E0E] border-t border-[#1a2e20]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <FadeIn className="text-center mb-20">
              <div className="text-[9px] uppercase tracking-[3px] text-[#9A7A3A] mb-5">Get in Touch</div>
              <h2 className="font-serif text-4xl md:text-5xl text-[#EDD99A] mb-6">Contact & Partnerships</h2>
              <p className="text-[#C8BFA0] font-light max-w-lg mx-auto">
                For endorsements, institutional partnerships, media inquiries, and advisory engagements.
              </p>
            </FadeIn>

            <div className="grid md:grid-cols-4 gap-px bg-[#1a2e20]">
              {[
                {
                  label: "Institutional Email",
                  title: "contact@reclaimingthegreengold.com",
                  lines: ["Policy dialogue", "Technical assistance"],
                },
                {
                  label: "Authors Direct",
                  title: "Dr Sunil & Sunny Sweenarain",
                  lines: ["sweenmru@gmail.com", "sunnysweeni2503@gmail.com"],
                },
                {
                  label: "WhatsApp",
                  title: "+230 5255 3890",
                  lines: ["Available Mon–Fri"],
                },
                {
                  label: "Website",
                  title: "reclaimingthegreengold.com",
                  lines: ["Media inquiries", "Institutional orders"],
                },
              ].map((c, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="bg-[#0B0B0B] hover:bg-[#0F1A14] p-8 text-center transition-colors duration-500">
                    <div className="text-[9px] uppercase tracking-[2px] text-[#9A7A3A] mb-4">{c.label}</div>
                    <div className="font-serif text-base text-[#F4F1EA] mb-4 break-all leading-snug">{c.title}</div>
                    {c.lines.map(line => (
                      <div key={line} className="text-sm text-[#4A6055] font-light">{line}</div>
                    ))}
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={0.3} className="mt-16 text-center">
              <p className="text-[9px] uppercase tracking-[3px] text-[#4A6055] mb-6">Policy dialogue · Technical assistance · Institutional collaboration · Media</p>
              <Button asChild className="bg-transparent border border-[#C8A96B] text-[#C8A96B] hover:bg-[#C8A96B]/10 rounded-none px-12 h-12 uppercase tracking-[2px] text-[10px] font-bold">
                <a
                  href="mailto:contact@reclaimingthegreengold.com"
                  onClick={() => trackEvent('contact_link_clicked', { inquiry_type: 'general', location: 'contact_section' })}
                >
                  Send an Inquiry
                </a>
              </Button>
            </FadeIn>
          </div>
        </div>
      </section>

    </div>
  );
}
