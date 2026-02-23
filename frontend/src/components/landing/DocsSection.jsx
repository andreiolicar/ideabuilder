function DocsSection() {
  return (
    <section className="docs-section" id="como-funciona">
      <div className="container">
        <div className="docs-layout">
          <div className="docs-visual reveal">
            <div className="floating-badge">Documento Geral · Gerado com IA</div>
            <div className="mock-viewer">
              <div className="mock-viewer-header">
                <div className="mock-tabs">
                  <div className="mock-tab active">Geral</div>
                  <div className="mock-tab">Tech</div>
                  <div className="mock-tab">Roadmap</div>
                </div>
                <div className="mock-copy-btn">Copiar Markdown</div>
              </div>
              <div className="mock-body">
                <div className="md-h1"># Documento Geral do Projeto</div>
                <div className="md-p" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
                  Gerado automaticamente · 1 credito consumido
                </div>
                <br />
                <div className="md-h2">## Visao Geral</div>
                <div className="md-p">
                  Aplicativo mobile para auxiliar pessoas com deficiencia visual na navegacao urbana, utilizando{" "}
                  <span className="md-code">IA + GPS</span> para rotas acessiveis em tempo real.
                </div>
                <div className="md-h2">## Problema</div>
                <div className="md-p">
                  Pessoas com deficiencia visual enfrentam dificuldades significativas para se deslocar de forma independente em ambientes urbanos complexos.
                </div>
                <div className="md-h2">## Objetivos</div>
                <div className="md-list-item"><span className="md-bullet">▸</span> Mapeamento colaborativo de rotas acessiveis</div>
                <div className="md-list-item"><span className="md-bullet">▸</span> Integracao com transporte publico via API</div>
                <div className="md-list-item"><span className="md-bullet">▸</span> Feedback de audio em tempo real</div>
                <div className="md-h2">## Stack Recomendado</div>
                <table className="md-table">
                  <tbody>
                    <tr><th>Camada</th><th>Tecnologia</th></tr>
                    <tr><td>Mobile</td><td><span className="md-code">React Native</span></td></tr>
                    <tr><td>Backend</td><td><span className="md-code">Node.js + Express</span></td></tr>
                    <tr><td>IA</td><td><span className="md-code">Gemini API</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="docs-content reveal" style={{ transitionDelay: "150ms" }}>
            <span className="section-label">// 01 — Documentacao</span>
            <h2>
              Tres documentos,
              <br />
              <em>um formulario</em>
            </h2>
            <p className="section-sub" style={{ marginBottom: 0 }}>
              A IA estrutura sua ideia em documentacao profissional pronta para apresentar ao orientador.
            </p>
            <div className="docs-features">
              <div className="doc-feature">
                <div className="doc-feature-icon icon-blue">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.7">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                  </svg>
                </div>
                <div>
                  <div className="doc-feature-title">Documento Geral</div>
                  <div className="doc-feature-desc">
                    Contexto, problema, objetivos e justificativa estruturados em Markdown exportavel para PDF.
                  </div>
                </div>
              </div>
              <div className="doc-feature">
                <div className="doc-feature-icon icon-cyan">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.7">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <div>
                  <div className="doc-feature-title">Especificacoes Tecnicas</div>
                  <div className="doc-feature-desc">
                    Stack, arquitetura, requisitos funcionais e nao-funcionais detalhados pela IA com base no seu contexto.
                  </div>
                </div>
              </div>
              <div className="doc-feature">
                <div className="doc-feature-icon icon-green">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.7">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <div className="doc-feature-title">Roadmap de 2 anos</div>
                  <div className="doc-feature-desc">
                    Cronograma realista com fases, marcos e entregas definidos automaticamente para o periodo do TCC.
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

export default DocsSection;
