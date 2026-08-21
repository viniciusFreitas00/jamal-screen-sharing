import Link from "next/link";

export default function Home() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/"><span className="brand-mark" />tela ao vivo</Link>
        <span className="topbar-note">conexão direta · WebRTC</span>
      </header>
      <main className="route-main">
        <p className="eyebrow">sala de transmissão</p>
        <h1 className="hero-title">Uma tela.<br /><em>Dois lugares.</em></h1>
        <p className="hero-copy">Compartilhe sua tela e sua voz diretamente no navegador. Sem upload, sem cadastro, sem deixar a transmissão passar por um servidor.</p>
        <div className="role-grid">
          <Link className="role-card" href="/apresentador"><span className="role-number">01 / HOST</span><h2>Apresentar uma tela</h2><p>Inicie uma sala e envie sua tela com áudio para quem tiver o seu ID.</p></Link>
          <Link className="role-card" href="/espectador"><span className="role-number">02 / GUEST</span><h2>Assistir uma tela</h2><p>Cole o ID de uma sala aberta e acompanhe a transmissão ao vivo.</p></Link>
        </div>
      </main>
    </div>
  );
}
