'use client';

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MediaConnection, Peer } from "peerjs";

const TARGET_WIDTH = 1920;
const TARGET_HEIGHT = 1080;
const TARGET_FPS = 30;
const MAX_BITRATE = 4_000_000;

type StatusKind = "idle" | "ready" | "error";
type ViewerPresence = { id: string; name: string; connected: boolean };

export default function PresenterPage() {
  const [status, setStatus] = useState("Pronto para iniciar");
  const [statusDetail, setStatusDetail] = useState("Sua tela ainda não está sendo compartilhada.");
  const [statusKind, setStatusKind] = useState<StatusKind>("idle");
  const [peerId, setPeerId] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [viewers, setViewers] = useState<ViewerPresence[]>([]);
  const previewRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureCleanupRef = useRef<(() => void) | null>(null);
  const callsRef = useRef(new Map<string, MediaConnection>());
  const connectionsRef = useRef(new Map<string, ReturnType<Peer["connect"]>>());
  const lastSeenRef = useRef(new Map<string, number>());
  const viewersRef = useRef(new Set<string>());
  const isStoppingRef = useRef(false);

  const stopBroadcast = () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    captureCleanupRef.current?.();
    callsRef.current.forEach((call) => call.close());
    callsRef.current.clear();
    connectionsRef.current.clear();
    lastSeenRef.current.clear();
    viewersRef.current.clear();
    peerRef.current?.destroy();
    streamRef.current = null;
    captureCleanupRef.current = null;
    peerRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
    setViewerCount(0);
    setViewers([]);
    setIsStarting(false);
    setIsLive(false);
    setPeerId("");
    setIsCopied(false);
    setStatusKind("idle");
    setStatus("Transmissão encerrada");
    setStatusDetail("Você pode iniciar uma nova transmissão.");
    isStoppingRef.current = false;
  };

  useEffect(() => {
    const presenceCheck = setInterval(() => {
      const now = Date.now();
      lastSeenRef.current.forEach((lastSeen, id) => {
        if (now - lastSeen <= 12000) return;
        viewersRef.current.delete(id);
        callsRef.current.delete(id);
        connectionsRef.current.get(id)?.close();
        connectionsRef.current.delete(id);
        lastSeenRef.current.delete(id);
        setViewerCount(viewersRef.current.size);
        setViewers((current) => current.map((viewer) => viewer.id === id ? { ...viewer, connected: false } : viewer));
      });
    }, 4000);

    return () => clearInterval(presenceCheck);
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    captureCleanupRef.current?.();
    callsRef.current.forEach((call) => call.close());
    peerRef.current?.destroy();
  }, []);

  const updateViewerCount = () => setViewerCount(viewersRef.current.size);

  const configureVideo = async (connection: MediaConnection) => {
    const sender = connection.peerConnection?.getSenders().find((item) => item.track?.kind === "video");
    if (!sender) return;
    const params = sender.getParameters();
    params.encodings = params.encodings?.length ? params.encodings : [{}];
    params.encodings[0].maxBitrate = MAX_BITRATE;
    params.encodings[0].maxFramerate = TARGET_FPS;
    params.encodings[0].scaleResolutionDownBy = 1;
    params.degradationPreference = "maintain-resolution";
    await sender.setParameters(params).catch(() => undefined);
  };

  const removeViewer = (id: string) => {
    viewersRef.current.delete(id);
    callsRef.current.delete(id);
    connectionsRef.current.get(id)?.close();
    connectionsRef.current.delete(id);
    lastSeenRef.current.delete(id);
    updateViewerCount();
    setViewers((current) => current.map((viewer) => viewer.id === id ? { ...viewer, connected: false } : viewer));
  };

  const addViewer = (id: string, name: string) => {
    viewersRef.current.add(id);
    setViewers((current) => {
      const existing = current.find((viewer) => viewer.id === id);
      if (existing) return current.map((viewer) => viewer.id === id ? { ...viewer, name, connected: true } : viewer);
      return [...current, { id, name, connected: true }];
    });
    updateViewerCount();
  };

  const copyPeerId = async () => {
    if (!peerId) return;
    const liveUrl = `${window.location.origin}/espectador?id=${encodeURIComponent(peerId)}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(liveUrl);
    } else {
      const input = document.createElement("textarea");
      input.value = liveUrl;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2200);
  };

  const captureMedia = async () => {
    const screen = await navigator.mediaDevices.getDisplayMedia({ video: { width: { ideal: TARGET_WIDTH, max: TARGET_WIDTH, preferCurrentTab: true }, height: { ideal: TARGET_HEIGHT, max: TARGET_HEIGHT }, frameRate: { ideal: TARGET_FPS, max: TARGET_FPS } }, audio: true });
    let microphone: MediaStream | null = null;
    try { microphone = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); } catch { setStatusDetail("Microfone indisponível. A transmissão seguirá com o áudio da tela."); }
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    if (screen.getAudioTracks()[0]) audioContext.createMediaStreamSource(new MediaStream([screen.getAudioTracks()[0]])).connect(destination);
    if (microphone?.getAudioTracks()[0]) audioContext.createMediaStreamSource(microphone).connect(destination);
    const videoTrack = screen.getVideoTracks()[0];
    videoTrack.contentHint = "detail";
    await videoTrack.applyConstraints({ width: { max: TARGET_WIDTH }, height: { max: TARGET_HEIGHT }, frameRate: { ideal: TARGET_FPS, max: TARGET_FPS } }).catch(() => undefined);
    return { stream: new MediaStream([videoTrack, ...destination.stream.getAudioTracks()]), stop: () => { screen.getTracks().forEach((track) => track.stop()); microphone?.getTracks().forEach((track) => track.stop()); void audioContext.close(); } };
  };

  const startBroadcast = async () => {
    if (isStarting || isLive) return;
    setIsStarting(true); setStatus("Solicitando permissões"); setStatusDetail("Escolha uma janela ou tela para compartilhar.");
    try {
      const captured = await captureMedia();
      streamRef.current = captured.stream;
      captureCleanupRef.current = captured.stop;
      if (previewRef.current) { previewRef.current.srcObject = captured.stream; await previewRef.current.play().catch(() => undefined); }
      const peer = new Peer({ config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] } });
      peerRef.current = peer;
      peer.on("open", (id) => { setPeerId(id); setIsLive(true); setIsStarting(false); setStatusKind("ready"); setStatus("Transmitindo ao vivo"); setStatusDetail("Compartilhe o ID abaixo com seus espectadores."); });
      peer.on("connection", (connection) => {
        const viewerId = connection.peer;
        connectionsRef.current.set(viewerId, connection);
        lastSeenRef.current.set(viewerId, Date.now());
        connection.on("open", () => {
          const call = peer.call(viewerId, streamRef.current as MediaStream);
          callsRef.current.set(viewerId, call); addViewer(viewerId, "Espectador"); void configureVideo(call);
          call.on("close", () => removeViewer(viewerId)); call.on("error", () => removeViewer(viewerId));
        });
        connection.on("data", (data) => {
          if (!data || typeof data !== "object" || !("type" in data)) return;
          lastSeenRef.current.set(viewerId, Date.now());
          if (data.type === "viewer-heartbeat") return;
          if (data.type !== "viewer-presence" || !("username" in data) || typeof data.username !== "string") return;
          addViewer(viewerId, data.username);
        });
        connection.on("close", () => removeViewer(viewerId)); connection.on("error", () => removeViewer(viewerId));
      });
      peer.on("error", (error) => { setStatusKind("error"); setStatus("Falha na conexão"); setStatusDetail(error.message); setIsStarting(false); });
      captured.stream.getVideoTracks()[0].onended = stopBroadcast;
    } catch (error) { setIsStarting(false); setStatusKind("error"); setStatus("Não foi possível iniciar"); setStatusDetail(error instanceof Error ? error.message : "Permissão de captura recusada."); }
  };

  return <div className="app-shell"><header className="topbar"><Link className="brand" href="/"><span className="brand-mark" />tela ao vivo</Link><span className="topbar-note">modo apresentador</span></header><main className="workspace"><div className="workspace-header"><div><p className="eyebrow">sala de transmissão</p><h1>Apresente sua tela.</h1></div><Link className="back-link" href="/">Trocar de modo</Link></div><div className="workspace-grid"><section className="stage"><video ref={previewRef} autoPlay playsInline muted aria-label="Prévia da tela compartilhada" />{!isLive && <div className="stage-empty"><strong>A prévia aparecerá aqui</strong><span>O navegador pedirá sua autorização antes de começar.</span></div>}{isLive && <div className="stage-live"><span className="live-dot" />Ao vivo</div>}</section><aside className="control-panel"><span className="panel-label">Controle da sala</span><div className="status-line"><span className={`status-dot ${statusKind}`} /><div><strong>{status}</strong><span>{statusDetail}</span></div></div><button className="primary-button" type="button" onClick={startBroadcast} disabled={isStarting || isLive}>{isStarting ? "Preparando transmissão..." : isLive ? "Transmissão ativa" : "Iniciar compartilhamento"}</button>{isLive && <button className="stop-button" type="button" onClick={stopBroadcast}>Encerrar transmissão</button>}{peerId && <div className="share-id"><small>Link para espectadores</small><div className="share-id-row"><code>/espectador?id={peerId}</code><button className="copy-button" type="button" onClick={copyPeerId} aria-label="Copiar link da transmissão">{isCopied ? "Copiado" : "Copiar link"}</button></div></div>}<div className="metric-row"><span>Espectadores conectados</span><strong>{String(viewerCount).padStart(2, "0")}</strong></div>{viewers.length > 0 && <div className="viewer-list"><div className="viewer-list-heading"><span>Presença na sala</span><strong>{viewers.length}</strong></div>{viewers.map((viewer) => <div className="viewer-item" key={viewer.id}><span className={`viewer-avatar ${viewer.connected ? "online" : "offline"}`}>{viewer.name.slice(0, 1).toUpperCase()}</span><span className="viewer-name">{viewer.name}</span><span className={`viewer-status ${viewer.connected ? "online" : "offline"}`}>{viewer.connected ? "Conectado" : "Desconectado"}</span></div>)}</div>}</aside></div></main></div>;
}
