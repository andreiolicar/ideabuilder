import { Link } from "react-router-dom";

function HeroSection({ isAuthenticated }) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content reveal">
          <div className="hero-label">
            <span className="hero-label-dot" />
            SaaS para estudantes de TCC
          </div>
          <h1>
            Do caos de ideias
            <br />
            a um plano <em>estruturado</em>
          </h1>
          <p className="hero-sub">
            Preencha um formulario guiado e a IA gera automaticamente Documento Geral,
            Especificacoes Tecnicas e Roadmap para o seu TCC.
          </p>
          <div className="hero-actions">
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="btn-primary hero-action-btn">
              {isAuthenticated ? "Ir para dashboard" : "Comecar gratuitamente"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a href="#como-funciona" className="btn-secondary hero-action-btn">Ver como funciona</a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-num">3</div>
              <div className="stat-label">Documentos gerados</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">1</div>
              <div className="stat-label">Credito por geracao</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">&lt; 30s</div>
              <div className="stat-label">Tempo medio de geracao</div>
            </div>
          </div>
        </div>

        <div className="hero-visual reveal" style={{ transitionDelay: "150ms" }}>
          <div className="glow-blob glow-blob-1" />
          <div className="glow-blob glow-blob-2" />

          <div className="app-window">
            <div className="window-bar">
              <div className="dot dot-r" />
              <div className="dot dot-y" />
              <div className="dot dot-g" />
              <div className="window-title">tcc-idea-builder.app — Dashboard</div>
            </div>

            <div className="window-body">
              <div className="win-sidebar">
                <div className="win-user">
                  <div className="win-avatar">ES</div>
                  <div>
                    <div className="win-username">Eduardo S.</div>
                    <div className="win-email">edu@faculdade.com</div>
                  </div>
                </div>
                <div className="win-credits-row">
                  <span className="chip chip-blue">4 creditos</span>
                  <span className="chip chip-cyan">USER</span>
                </div>
                <div className="win-sep" />
                <div className="win-section-label">Menu</div>
                <div className="win-nav-item active">Dashboard</div>
                <div className="win-sep" />
                <div className="win-section-label">Preferencias</div>
                <div className="win-nav-item">Perfil</div>
                <div className="win-nav-item">Configuracoes</div>
              </div>

              <div className="win-main">
                <div className="win-topbar">
                  <div>
                    <div className="win-topbar-title">Dashboard</div>
                    <div className="win-topbar-sub">Seu hub de projetos e documentacoes</div>
                  </div>
                  <div className="win-create-btn">Criar</div>
                </div>
                <div className="win-search">
                  <span className="win-search-text">Buscar projetos...</span>
                </div>
                <div className="win-cards">
                  <div className="win-card">
                    <div className="win-card-title">App Acessibilidade</div>
                    <div className="win-card-cat">Mobile</div>
                    <div className="win-card-tags">
                      <span className="win-tag">IA</span>
                      <span className="win-tag">Saude</span>
                    </div>
                  </div>
                  <div className="win-card" style={{ borderColor: "var(--border-glow)" }}>
                    <div className="win-card-title">Gestao Escolar</div>
                    <div className="win-card-cat">Web</div>
                    <div className="win-card-tags">
                      <span className="win-tag">Educacao</span>
                      <span className="win-tag">Cloud</span>
                    </div>
                  </div>
                  <div className="win-card">
                    <div className="win-card-title">Monitoramento IoT</div>
                    <div className="win-card-cat">IoT</div>
                    <div className="win-card-tags">
                      <span className="win-tag">Dados</span>
                      <span className="win-tag">IoT</span>
                    </div>
                  </div>
                  <div className="win-card">
                    <div className="win-card-title">Plataforma EAD</div>
                    <div className="win-card-cat">Web</div>
                    <div className="win-card-tags">
                      <span className="win-tag">Mobile</span>
                      <span className="win-tag">Cloud</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
