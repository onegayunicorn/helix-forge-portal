import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDownAZ,
  ArrowUpRight,
  ArrowUpAZ,
  Beaker,
  BookOpen,
  Check,
  ChevronRight,
  ChevronDown,
  CircleHelp,
  Download,
  FileDown,
  FlaskConical,
  Grid3X3,
  Layers3,
  LockKeyhole,
  Menu,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
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

type EvidenceRow = { source: string; type: string; claim: string; confidence: number; state: "SUPPORTED" | "EMERGING"; };
const evidence: EvidenceRow[] = [
  { source: "ClinVar", type: "Curated", claim: "del52 remains in-frame", confidence: 98, state: "SUPPORTED" },
  { source: "LOVD", type: "Curated", claim: "Exon boundary agrees", confidence: 94, state: "SUPPORTED" },
  { source: "Literature", type: "Text mined", claim: "Rescue route reported", confidence: 78, state: "EMERGING" },
];
const sandboxRuns = [
  { name: "whole_locus_verification", detail: "6,319 blocks · 0 disagreements", age: 4, status: "PASS", duration: 188 },
  { name: "concordance_grade_del52", detail: "3 sources · supported", age: 18, status: "PASS", duration: 42 },
  { name: "frame_rescue_simulation", detail: "del44 + del45–53 · in-frame", age: 32, status: "PASS", duration: 71 },
  { name: "reference_manifest_check", detail: "79 exons · checksums aligned", age: 47, status: "PASS", duration: 16 },
];

function downloadCSV(filename: string, rows: Record<string, string | number>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename} downloaded`, { description: `${rows.length} rows exported` });
}

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
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setPlaying(false));
    const fallback = window.setTimeout(() => setReady(true), 2200);
    return () => window.clearTimeout(fallback);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setPlaying(true); } else { video.pause(); setPlaying(false); }
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  const seek = (value: number) => { if (videoRef.current) videoRef.current.currentTime = value; setCurrentTime(value); };

  return (
    <main className="entry-screen" onMouseMove={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
      <video ref={videoRef} className={`entry-video ${ready ? "ready" : ""}`} autoPlay muted={muted} loop playsInline poster={visualAssets[0]} onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); setReady(true); }} onCanPlay={() => setReady(true)} onError={() => setReady(true)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}>
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      {!ready && <div className="brand-loader"><div className="loader-orbit"><span /></div><BrandMark /><div className="loader-copy">Loading motion study <i /></div></div>}
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
      <div className="entry-bottom"><div className="video-caption"><span className="caption-line" /><span>HELIX FORGE / MOTION STUDY 01</span></div><div className={`video-controls ${showControls ? "visible" : ""}`}><button onClick={togglePlay} aria-label={playing ? "Pause video" : "Play video"}>{playing ? <Pause size={15} /> : <Play size={15} />}</button><button onClick={() => { setMuted(!muted); if (videoRef.current) videoRef.current.muted = !muted; }} aria-label={muted ? "Unmute video" : "Mute video"}>{muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button><span className="video-time">{formatTime(currentTime)}</span><input className="video-scrubber" aria-label="Seek video" type="range" min="0" max={duration || 0} step="0.1" value={currentTime} onChange={(event) => seek(Number(event.target.value))} /><span className="video-time muted-time">{formatTime(duration)}</span><button className="reset-video" onClick={() => seek(0)} aria-label="Restart video"><RotateCcw size={14} /></button></div></div>
    </main>
  );
}

function Workspace({ onExit }: { onExit: () => void }) {
  const [active, setActive] = useState("overview");
  const [query, setQuery] = useState("");
  const [evidenceSort, setEvidenceSort] = useState<"source" | "confidence" | "state">("confidence");
  const [evidenceAscending, setEvidenceAscending] = useState(false);
  const [runQuery, setRunQuery] = useState("");
  const [runSort, setRunSort] = useState<"age" | "name" | "duration">("age");
  const [runAscending, setRunAscending] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [installVisible, setInstallVisible] = useState(false);
  const filteredEvidence = useMemo(() => [...evidence].filter((row) => Object.values(row).join(" ").toLowerCase().includes(query.toLowerCase())).sort((a, b) => { const av = evidenceSort === "source" ? a.source : evidenceSort === "state" ? a.state : a.confidence; const bv = evidenceSort === "source" ? b.source : evidenceSort === "state" ? b.state : b.confidence; return (av < bv ? -1 : av > bv ? 1 : 0) * (evidenceAscending ? 1 : -1); }), [query, evidenceSort, evidenceAscending]);
  const filteredRuns = useMemo(() => [...sandboxRuns].filter((run) => Object.values(run).join(" ").toLowerCase().includes(runQuery.toLowerCase())).sort((a, b) => { const av = a[runSort]; const bv = b[runSort]; return (av < bv ? -1 : av > bv ? 1 : 0) * (runAscending ? 1 : -1); }), [runQuery, runSort, runAscending]);
  const exportEvidence = () => downloadCSV("helix-forge-evidence-ledger.csv", filteredEvidence.map((row) => ({ source: row.source, evidence_type: row.type, claim: row.claim, confidence_percent: row.confidence, grade: row.state })));
  const exportLocus = () => downloadCSV("helix-forge-locus-map.csv", Array.from({ length: 79 }, (_, index) => ({ exon: index + 1, frame_state: index === 51 ? "SELECTED_REPAIR_ROUTE" : index % 13 === 0 ? "REVIEW_SIGNAL" : "VERIFIED", reference: "GRCh38 / DMD" })));

  return (
    <main className="workspace-shell">
      <header className="workspace-header"><button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button><button className="brand-button" onClick={onExit}><BrandMark compact /></button><div className="header-breadcrumb"><span>WORKSPACE</span><ChevronRight size={13} /><b>Whole-locus verification</b></div><div className="header-actions"><div className="connection-pill"><span className="pulse-dot" /> Sandbox live</div><button className="icon-button" onClick={() => setInstallVisible(!installVisible)} aria-label="Install app"><Download size={17} /></button><button className="avatar-button">HF</button></div>{installVisible && <InstallButton onInstall={() => toast.success("Helix Forge added to your home screen")} />}</header>
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}><div className="side-label">WORKSPACES</div>{workspaces.map(({ id, label, icon: Icon }) => <button key={id} className={`side-link ${active === id ? "active" : ""}`} onClick={() => { setActive(id); setMenuOpen(false); }}><Icon size={17} /><span>{label}</span>{active === id && <span className="side-arrow">→</span>}</button>)}<div className="side-divider" /><div className="side-label">REFERENCE</div><button className="side-link" onClick={() => toast("Reference data is locked to GRCh38 sandbox fixtures") }><ShieldCheck size={17} /><span>Provenance policy</span></button><button className="side-link" onClick={() => toast("Help centre coming soon") }><CircleHelp size={17} /><span>Help centre</span></button><div className="sidebar-footer"><div className="tiny-orbit"><span /></div><div><b>Offline-ready</b><small>All systems nominal</small></div></div></aside>
      <section className="workspace-content"><div className="content-head"><div><div className="eyebrow purple"><span className="eyebrow-mark" /> {active === "overview" ? "CONTROL ROOM" : active.replace("-", " ").toUpperCase()}</div><h2>{active === "overview" ? "Good evening, researcher." : workspaces.find((item) => item.id === active)?.label}</h2><p>{active === "overview" ? "Your DMD integration workspace is ready for the next verification run." : "A focused view into the synthetic Helix Forge environment."}</p></div><button className="primary-action" onClick={() => toast.success("Verification run queued", { description: "Synthetic sandbox · 6,319 blocks" })}><Zap size={16} /> Run verification</button></div>
        {active === "overview" && <><div className="stat-grid"><div className="stat-card hero-stat"><div className="stat-top"><span>LOCUS INTEGRITY</span><ShieldCheck size={17} /></div><strong>100<span>%</span></strong><div className="stat-foot"><span className="status-tag">PASS</span><span>3 derivations aligned</span></div></div><div className="stat-card"><div className="stat-top"><span>REFERENCE BLOCKS</span><Layers3 size={17} /></div><strong>6,319</strong><div className="stat-foot"><span>79 exons</span><span>GRCh38</span></div></div><div className="stat-card"><div className="stat-top"><span>OPEN SIGNALS</span><Activity size={17} /></div><strong>04</strong><div className="stat-foot"><span className="status-tag amber">REVIEW</span><span>2 evidence conflicts</span></div></div></div><div className="feature-grid"><div className="panel locus-panel"><div className="panel-heading"><div><span className="panel-kicker">WHOLE-LOCUS VERIFICATION</span><h3>Reading frame integrity</h3></div><span className="pass-badge"><Check size={13} /> PASS</span></div><p className="panel-copy">Three independent derivations agree across the DMD locus. Select a region to inspect its repair route.</p><div className="locus-visual"><div className="locus-axis"><span>EXON 01</span><span>EXON 40</span><span>EXON 79</span></div><div className="exon-row">{Array.from({ length: 36 }).map((_, index) => <button key={index} className={`exon ${index === 23 || index === 24 ? "selected" : index % 7 === 0 ? "hot" : ""}`} onClick={() => toast(`Exon ${String(index + 1).padStart(2, "0")} selected`)} aria-label={`Exon ${index + 1}`} />)}</div><div className="locus-legend"><span><i className="legend-dot selected-dot" /> Selected repair route</span><span><i className="legend-dot hot-dot" /> Review signal</span><span><i className="legend-dot clean-dot" /> Verified</span></div></div><button className="text-action" onClick={() => setActive("locus")}>Open locus map <ArrowUpRight size={15} /></button></div><div className="panel variant-panel"><div className="panel-heading"><div><span className="panel-kicker">SELECTED VARIANT</span><h3>del52</h3></div><span className="variant-chip">IN-FRAME</span></div><div className="variant-visual"><img src={visualAssets[2]} alt="Helix Forge frame skip analysis" /></div><div className="detail-list"><div><span>Repair route</span><b>Exon skipping</b></div><div><span>Reference</span><b>GRCh38 / DMD</b></div><div><span>Provenance</span><b>Sandbox synthetic</b></div></div><button className="secondary-action" onClick={() => toast("Variant detail view coming soon")}>Inspect variant <ChevronRight size={16} /></button></div></div><div className="panel evidence-panel"><div className="panel-heading"><div><span className="panel-kicker">EVIDENCE CONCORDANCE</span><h3>Source ledger</h3></div><button className="text-action" onClick={() => setActive("evidence")}>View full ledger <ArrowUpRight size={15} /></button></div><div className="evidence-table">{evidence.map((row) => <div className="evidence-row" key={row.source}><div className="source-name"><span className="source-icon"><BookOpen size={14} /></span><b>{row.source}</b></div><span className="evidence-type">{row.type}</span><span className="evidence-claim">{row.claim}</span><div className="confidence"><i style={{ width: `${row.confidence}%` }} /><b>{row.confidence}%</b></div><span className={`grade ${row.state.toLowerCase()}`}>{row.state}</span></div>)}</div></div></>}
        {active === "locus" && <div className="panel expanded-panel"><div className="panel-heading"><div><span className="panel-kicker">GENOMIC REFERENCE · GRCH38</span><h3>DMD exon map</h3></div><div className="heading-actions"><button className="export-button" onClick={exportLocus}><FileDown size={14} /> Export CSV</button><span className="pass-badge"><Check size={13} /> 79 / 79 VERIFIED</span></div></div><div className="expanded-visual"><img src={visualAssets[0]} alt="Helix Forge locus map" /><div><p>Click any exon to inspect the reference sequence, frame arithmetic, and available repair routes.</p><div className="exon-matrix">{Array.from({ length: 79 }).map((_, i) => <button key={i} className={i === 51 ? "selected" : i % 13 === 0 ? "hot" : ""} onClick={() => toast(`Exon ${i + 1} selected`)}>{String(i + 1).padStart(2, "0")}</button>)}</div></div></div></div>}
        {active === "evidence" && <div className="panel expanded-panel"><div className="panel-heading"><div><span className="panel-kicker">EVIDENCE CONCORDANCE</span><h3>Source ledger</h3></div><div className="table-tools"><div className="search-box"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter evidence" /></div><label className="sort-select"><SlidersHorizontal size={14} /><select value={evidenceSort} onChange={(event) => setEvidenceSort(event.target.value as typeof evidenceSort)}><option value="confidence">Confidence</option><option value="source">Source</option><option value="state">Grade</option></select><ChevronDown size={13} /></label><button className="sort-direction" onClick={() => setEvidenceAscending(!evidenceAscending)} aria-label="Toggle evidence sort direction">{evidenceAscending ? <ArrowUpAZ size={15} /> : <ArrowDownAZ size={15} />}</button><button className="export-button" onClick={exportEvidence}><FileDown size={14} /> Export CSV</button></div></div><div className="filter-summary">Showing {filteredEvidence.length} of {evidence.length} evidence lines <span>·</span> sorted by {evidenceSort}</div><div className="evidence-table detailed">{filteredEvidence.map((row) => <div className="evidence-row" key={row.source}><div className="source-name"><span className="source-icon"><BookOpen size={14} /></span><b>{row.source}</b></div><span className="evidence-type">{row.type}</span><span className="evidence-claim">{row.claim}</span><div className="confidence"><i style={{ width: `${row.confidence}%` }} /><b>{row.confidence}%</b></div><span className={`grade ${row.state.toLowerCase()}`}>{row.state}</span></div>)}</div></div>}
        {active === "runs" && <div className="runs-layout"><div className="panel expanded-panel"><div className="panel-heading"><div><span className="panel-kicker">OFFLINE EXECUTION</span><h3>Sandbox runs</h3></div><span className="status-tag">ALL CLEAR</span></div><p className="panel-copy">Synthetic data is active. No external calls or credentials are required for this workspace.</p><div className="run-toolbar"><div className="search-box"><Search size={15} /><input value={runQuery} onChange={(event) => setRunQuery(event.target.value)} placeholder="Filter runs" /></div><label className="sort-select"><SlidersHorizontal size={14} /><select value={runSort} onChange={(event) => setRunSort(event.target.value as typeof runSort)}><option value="age">Recent</option><option value="name">Name</option><option value="duration">Duration</option></select><ChevronDown size={13} /></label><button className="sort-direction" onClick={() => setRunAscending(!runAscending)} aria-label="Toggle run sort direction">{runAscending ? <ArrowUpAZ size={15} /> : <ArrowDownAZ size={15} />}</button></div><div className="filter-summary">Showing {filteredRuns.length} of {sandboxRuns.length} runs <span>·</span> sorted by {runSort === "age" ? "recency" : runSort}</div>{filteredRuns.map((run) => <button key={run.name} className="run-row" onClick={() => toast("Run detail opened", { description: run.name })}><span className="run-icon"><Check size={15} /></span><span><b>{run.name}</b><small>{run.detail} · {run.duration}s</small></span><time>{run.age} min ago</time><ChevronRight size={16} /></button>)}</div><div className="run-aside"><div className="aside-orb"><FlaskConical size={25} /></div><span className="panel-kicker">DETERMINISTIC MODE</span><h3>Build confidence<br /><em>before you ship.</em></h3><p>Every run is reproducible, traceable, and safe to repeat.</p></div></div>}
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
