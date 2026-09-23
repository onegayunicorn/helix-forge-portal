import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Beaker,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  FlaskConical,
  Grid3X3,
  Layers3,
  LockKeyhole,
  Menu,
  Pause,
  Play,
  Search,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const HERO_VIDEO = "/manus-storage/VID_20260923_173705_d9436185.mp4";
const visualAssets = [
  "/manus-storage/image_editor_0f2f3879-bc9d-4069-953a-2279d6446e8a_d4b0e0ff.jpg",
  "/manus-storage/image_editor_dac7fcfc-01ae-4583-bf32-df17e44cf820_deae7e15.jpg",
  "/manus-storage/image_editor_92caed35-e524-47b0-b85c-f7bed69052fd_23deac88.jpg",
  "/manus-storage/image_editor_fcb7d7cb-7a5d-47da-af19-fec7da2c564e_8faff1fe.jpg",
];

const workspaces = [
  { id: "overview", label: "Overview", icon: Grid3X3 },
  { id: "locus", label: "Locus map", icon: Layers3 },
  { id: "evidence", label: "Evidence ledger", icon: BookOpen },
  { id: "runs", label: "Sandbox runs", icon: Activity },
];

const evidence = [
  ["ClinVar", "Curated", "del52 remains in-frame", "98%", "SUPPORTED"],
  ["LOVD", "Curated", "Exon boundary agrees", "94%", "SUPPORTED"],
  ["Literature", "Text mined", "Rescue route reported", "78%", "EMERGING"],
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-mark ${compact ? "compact" : ""}`}>
      <span className="brand-orbit"><span /></span>
      <span className="brand-name">HELIX <b>FORGE</b></span>
    </div>
  );
}

function InstallButton({ onInstall }: { onInstall: () => void }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  if (!deferredPrompt) return null;
  return <button className="install-button" onClick={async () => { await deferredPrompt.prompt(); setDeferredPrompt(null); onInstall(); }}><Download size={14} /> Install app</button>;
}

function EntryScreen({ onEnter }: { onEnter: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setPlaying(false));
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setPlaying(true); } else { video.pause(); setPlaying(false); }
  };

  return (
    <main className="entry-screen" onMouseMove={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
      <video ref={videoRef} className="entry-video" autoPlay muted={muted} loop playsInline poster={visualAssets[0]} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}>
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <div className="entry-vignette" />
      <div className="entry-grid" />
      <div className="entry-topline"><BrandMark /><span className="entry-status"><span className="pulse-dot" /> Research workspace · ready</span></div>
      <div className="entry-copy">
        <div className="eyebrow"><Sparkles size={14} /> DMD gene informatics</div>
        <h1>See the signal<br /><em>between the strands.</em></h1>
        <p>A calm, auditable workspace for locus verification, evidence concordance, and repair-route exploration.</p>
        <button className="enter-button" onClick={onEnter}><span>Enter the forge</span><ArrowUpRight size={18} /></button>
        <div className="entry-note"><LockKeyhole size={13} /> Offline-ready · synthetic sandbox · no external calls</div>
      </div>
      <div className="entry-bottom"><div className="video-caption"><span className="caption-line" /><span>HELIX FORGE / MOTION STUDY 01</span></div><div className={`video-controls ${showControls ? "visible" : ""}`}><button onClick={togglePlay} aria-label={playing ? "Pause video" : "Play video"}>{playing ? <Pause size={15} /> : <Play size={15} />}</button><button onClick={() => { setMuted(!muted); if (videoRef.current) videoRef.current.muted = !muted; }} aria-label={muted ? "Unmute video" : "Mute video"}>{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button><span className="video-progress"><i /></span></div></div>
    </main>
  );
}

function Workspace({ onExit }: { onExit: () => void }) {
  const [active, setActive] = useState("overview");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [installVisible, setInstallVisible] = useState(false);
  const filteredEvidence = useMemo(() => evidence.filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <main className="workspace-shell">
      <header className="workspace-header"><button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button><button className="brand-button" onClick={onExit}><BrandMark compact /></button><div className="header-breadcrumb"><span>WORKSPACE</span><ChevronRight size={13} /><b>Whole-locus verification</b></div><div className="header-actions"><div className="connection-pill"><span className="pulse-dot" /> Sandbox live</div><button className="icon-button" onClick={() => setInstallVisible(!installVisible)} aria-label="Install app"><Download size={17} /></button><button className="avatar-button">HF</button></div>{installVisible && <InstallButton onInstall={() => toast.success("Helix Forge added to your home screen")} />}</header>
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}><div className="side-label">WORKSPACES</div>{workspaces.map(({ id, label, icon: Icon }) => <button key={id} className={`side-link ${active === id ? "active" : ""}`} onClick={() => { setActive(id); setMenuOpen(false); }}><Icon size={17} /><span>{label}</span>{active === id && <span className="side-arrow">→</span>}</button>)}<div className="side-divider" /><div className="side-label">REFERENCE</div><button className="side-link" onClick={() => toast("Reference data is locked to GRCh38 sandbox fixtures") }><ShieldCheck size={17} /><span>Provenance policy</span></button><button className="side-link" onClick={() => toast("Help centre coming soon") }><CircleHelp size={17} /><span>Help centre</span></button><div className="sidebar-footer"><div className="tiny-orbit"><span /></div><div><b>Offline-ready</b><small>All systems nominal</small></div></div></aside>
      <section className="workspace-content"><div className="content-head"><div><div className="eyebrow purple"><span className="eyebrow-mark" /> {active === "overview" ? "CONTROL ROOM" : active.replace("-", " ").toUpperCase()}</div><h2>{active === "overview" ? "Good evening, researcher." : workspaces.find((item) => item.id === active)?.label}</h2><p>{active === "overview" ? "Your DMD integration workspace is ready for the next verification run." : "A focused view into the synthetic Helix Forge environment."}</p></div><button className="primary-action" onClick={() => toast.success("Verification run queued", { description: "Synthetic sandbox · 6,319 blocks" })}><Zap size={16} /> Run verification</button></div>
        {active === "overview" && <><div className="stat-grid"><div className="stat-card hero-stat"><div className="stat-top"><span>LOCUS INTEGRITY</span><ShieldCheck size={17} /></div><strong>100<span>%</span></strong><div className="stat-foot"><span className="status-tag">PASS</span><span>3 derivations aligned</span></div></div><div className="stat-card"><div className="stat-top"><span>REFERENCE BLOCKS</span><Layers3 size={17} /></div><strong>6,319</strong><div className="stat-foot"><span>79 exons</span><span>GRCh38</span></div></div><div className="stat-card"><div className="stat-top"><span>OPEN SIGNALS</span><Activity size={17} /></div><strong>04</strong><div className="stat-foot"><span className="status-tag amber">REVIEW</span><span>2 evidence conflicts</span></div></div></div><div className="feature-grid"><div className="panel locus-panel"><div className="panel-heading"><div><span className="panel-kicker">WHOLE-LOCUS VERIFICATION</span><h3>Reading frame integrity</h3></div><span className="pass-badge"><Check size={13} /> PASS</span></div><p className="panel-copy">Three independent derivations agree across the DMD locus. Select a region to inspect its repair route.</p><div className="locus-visual"><div className="locus-axis"><span>EXON 01</span><span>EXON 40</span><span>EXON 79</span></div><div className="exon-row">{Array.from({ length: 36 }).map((_, index) => <button key={index} className={`exon ${index === 23 || index === 24 ? "selected" : index % 7 === 0 ? "hot" : ""}`} onClick={() => toast(`Exon ${String(index + 1).padStart(2, "0")} selected`)} aria-label={`Exon ${index + 1}`} />)}</div><div className="locus-legend"><span><i className="legend-dot selected-dot" /> Selected repair route</span><span><i className="legend-dot hot-dot" /> Review signal</span><span><i className="legend-dot clean-dot" /> Verified</span></div></div><button className="text-action" onClick={() => setActive("locus")}>Open locus map <ArrowUpRight size={15} /></button></div><div className="panel variant-panel"><div className="panel-heading"><div><span className="panel-kicker">SELECTED VARIANT</span><h3>del52</h3></div><span className="variant-chip">IN-FRAME</span></div><div className="variant-visual"><img src={visualAssets[2]} alt="Helix Forge frame skip analysis" /></div><div className="detail-list"><div><span>Repair route</span><b>Exon skipping</b></div><div><span>Reference</span><b>GRCh38 / DMD</b></div><div><span>Provenance</span><b>Sandbox synthetic</b></div></div><button className="secondary-action" onClick={() => toast("Variant detail view coming soon")}>Inspect variant <ChevronRight size={16} /></button></div></div><div className="panel evidence-panel"><div className="panel-heading"><div><span className="panel-kicker">EVIDENCE CONCORDANCE</span><h3>Source ledger</h3></div><button className="text-action" onClick={() => setActive("evidence")}>View full ledger <ArrowUpRight size={15} /></button></div><div className="evidence-table">{evidence.map(([source, type, claim, confidence, state]) => <div className="evidence-row" key={source}><div className="source-name"><span className="source-icon"><BookOpen size={14} /></span><b>{source}</b></div><span className="evidence-type">{type}</span><span className="evidence-claim">{claim}</span><div className="confidence"><i style={{ width: confidence }} /><b>{confidence}</b></div><span className={`grade ${state.toLowerCase()}`}>{state}</span></div>)}</div></div></>}
        {active === "locus" && <div className="panel expanded-panel"><div className="panel-heading"><div><span className="panel-kicker">GENOMIC REFERENCE · GRCH38</span><h3>DMD exon map</h3></div><span className="pass-badge"><Check size={13} /> 79 / 79 VERIFIED</span></div><div className="expanded-visual"><img src={visualAssets[0]} alt="Helix Forge locus map" /><div><p>Click any exon to inspect the reference sequence, frame arithmetic, and available repair routes.</p><div className="exon-matrix">{Array.from({ length: 79 }).map((_, i) => <button key={i} className={i === 51 ? "selected" : i % 13 === 0 ? "hot" : ""} onClick={() => toast(`Exon ${i + 1} selected`)}>{String(i + 1).padStart(2, "0")}</button>)}</div></div></div></div>}
        {active === "evidence" && <div className="panel expanded-panel"><div className="panel-heading"><div><span className="panel-kicker">EVIDENCE CONCORDANCE</span><h3>Source ledger</h3></div><div className="search-box"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter evidence" /></div></div><div className="evidence-table detailed">{filteredEvidence.map(([source, type, claim, confidence, state]) => <div className="evidence-row" key={source}><div className="source-name"><span className="source-icon"><BookOpen size={14} /></span><b>{source}</b></div><span className="evidence-type">{type}</span><span className="evidence-claim">{claim}</span><div className="confidence"><i style={{ width: confidence }} /><b>{confidence}</b></div><span className={`grade ${state.toLowerCase()}`}>{state}</span></div>)}</div></div>}
        {active === "runs" && <div className="runs-layout"><div className="panel expanded-panel"><div className="panel-heading"><div><span className="panel-kicker">OFFLINE EXECUTION</span><h3>Sandbox runs</h3></div><span className="status-tag">ALL CLEAR</span></div><p className="panel-copy">Synthetic data is active. No external calls or credentials are required for this workspace.</p>{["whole_locus_verification", "concordance_grade_del52", "frame_rescue_simulation"].map((run, i) => <button key={run} className="run-row" onClick={() => toast("Run detail opened", { description: run })}><span className="run-icon"><Check size={15} /></span><span><b>{run}</b><small>{i === 0 ? "6,319 blocks · 0 disagreements" : i === 1 ? "3 sources · supported" : "del44 + del45–53 · in-frame"}</small></span><time>{i + 4} min ago</time><ChevronRight size={16} /></button>)}</div><div className="run-aside"><div className="aside-orb"><FlaskConical size={25} /></div><span className="panel-kicker">DETERMINISTIC MODE</span><h3>Build confidence<br /><em>before you ship.</em></h3><p>Every run is reproducible, traceable, and safe to repeat.</p></div></div>}
      </section>
    </main>
  );
}

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }>; }

export default function Home() {
  const [entered, setEntered] = useState(() => sessionStorage.getItem("helix-entered") === "true");
  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined); }, []);
  const enter = () => { sessionStorage.setItem("helix-entered", "true"); setEntered(true); };
  return entered ? <Workspace onExit={() => { sessionStorage.removeItem("helix-entered"); setEntered(false); }} /> : <EntryScreen onEnter={enter} />;
}
