'use client';

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { DataConnection, MediaConnection, Peer } from "peerjs";

type StatusKind = "idle" | "ready" | "error";

export default function ViewerPage() {
  const [username, setUsername] = useState("");
  const [transmitterId, setTransmitterId] = useState("");
  const [status, setStatus] = useState("Inicializando serviço");
  const [statusDetail, setStatusDetail] = useState("Aguarde enquanto preparamos sua conexão.");
  const [statusKind, setStatusKind] = useState<StatusKind>("idle");
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const peerRef = useRef<Peer | null>(null);
  const dataConnectionRef = useRef<DataConnection | null>(null);
  const mediaCallRef = useRef<MediaConnection | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const peer = new Peer({ config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] } });
    peerRef.current = peer;
    const liveId = new URLSearchParams(window.location.search).get("id");
    const queryTimer = liveId ? window.setTimeout(() => setTransmitterId(liveId), 0) : null;
    peer.on("open", () => { setIsReady(true); setStatusKind("ready"); setStatus("Pronto para assistir"); setStatusDetail("Cole o ID do apresentador para solicitar acesso."); });
    peer.on("call", (call) => { mediaCallRef.current = call; call.answer(); call.on("stream", async (stream) => { if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play().catch(() => undefined); } setIsConnected(true); setIsConnecting(false); setStatus("Conectado ao vivo"); setStatusDetail("A transmissão está sendo recebida diretamente do apresentador."); }); call.on("close", () => { setIsConnected(false); setStatus("Transmissão encerrada"); setStatusDetail("O apresentador encerrou a sala."); }); call.on("error", () => { setIsConnected(false); setIsConnecting(false); setStatusKind("error"); setStatus("Falha na transmissão"); setStatusDetail("Não foi possível manter o vídeo conectado."); }); });
    peer.on("error", (error) => { setIsConnecting(false); setStatusKind("error"); setStatus("Erro de conexão"); setStatusDetail(error.message); });
    return () => { if (queryTimer) clearTimeout(queryTimer); if (heartbeatRef.current) clearInterval(heartbeatRef.current); dataConnectionRef.current?.close(); mediaCallRef.current?.close(); peer.destroy(); };
  }, []);

  const connect = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = transmitterId.trim();
    const name = username.trim();
    if (!name || !id || !peerRef.current || !isReady) return;
    setIsConnecting(true); setStatusKind("idle"); setStatus("Solicitando acesso"); setStatusDetail("Esperando o apresentador aceitar sua conexão.");
    const dataConnection = peerRef.current.connect(id);
    dataConnectionRef.current = dataConnection;
    dataConnection.on("open", () => {
      dataConnection.send({ type: "viewer-presence", username: name });
      heartbeatRef.current = setInterval(() => {
        if (dataConnection.open) dataConnection.send({ type: "viewer-heartbeat" });
      }, 4000);
      setStatusDetail("Sinal recebido. Negociando vídeo e áudio.");
    });
    dataConnection.on("error", () => { setIsConnecting(false); setStatusKind("error"); setStatus("Apresentador indisponível"); setStatusDetail("Confira o ID e tente novamente."); });
    dataConnection.on("close", () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); if (!isConnected) { setIsConnecting(false); setStatus("Conexão recusada"); setStatusDetail("A sala não está mais disponível."); } });
  };

  return <div className="app-shell"><header className="topbar"><Link className="brand" href="/"><span className="brand-mark" />tela ao vivo</Link><span className="topbar-note">modo espectador</span></header><main className="workspace"><div className="workspace-header"><div><p className="eyebrow">sala de transmissão</p><h1>Assista de qualquer lugar.</h1></div><Link className="back-link" href="/">Trocar de modo</Link></div><div className="workspace-grid"><section className="stage"><video ref={videoRef} autoPlay playsInline controls aria-label="Transmissão recebida" />{!isConnected && <div className="stage-empty"><strong>A transmissão aparecerá aqui</strong><span>Conecte-se a uma sala para começar a assistir.</span></div>}{isConnected && <div className="stage-live"><span className="live-dot" />Ao vivo</div>}</section><aside className="control-panel"><span className="panel-label">Entrar em uma sala</span><div className="status-line"><span className={`status-dot ${statusKind}`} /><div><strong>{status}</strong><span>{statusDetail}</span></div></div><form className="viewer-form" onSubmit={connect}><label htmlFor="username">Seu nome</label><input id="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Como podemos te chamar?" autoComplete="name" maxLength={40} /><label htmlFor="transmitter-id">ID do apresentador</label><input id="transmitter-id" value={transmitterId} onChange={(event) => setTransmitterId(event.target.value)} placeholder="Cole o ID aqui" autoComplete="off" spellCheck={false} /><button className="primary-button" type="submit" disabled={!isReady || isConnecting || isConnected || !username.trim() || !transmitterId.trim()}>{isConnecting ? "Conectando..." : isConnected ? "Você está assistindo" : "Conectar à transmissão"}</button></form></aside></div></main></div>;
}