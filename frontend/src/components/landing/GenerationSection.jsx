function GenerationSection() {
  return (
    <section className="gen-section" id="geracao">
      <div className="container">
        <div className="gen-layout">
          <div className="reveal">
            <span className="section-label">// 02 — Geracao com IA</span>
            <h2>
              Formulario guiado,
              <br />
              <em>resultado imediato</em>
            </h2>
            <p className="section-sub" style={{ marginBottom: 0 }}>
              Descreva sua ideia, escolha tags e areas de atuacao. A IA faz o trabalho pesado enquanto voce acompanha em tempo real.
            </p>
            <div className="gen-steps">
              <div className="gen-step">
                <div className="gen-step-index">1</div>
                <div>
                  <div className="gen-step-title">Preencha o formulario</div>
                  <div className="gen-step-desc">Categoria, tags, area de atuacao, descricao e restricoes do projeto.</div>
                </div>
              </div>
              <div className="gen-step">
                <div className="gen-step-index">2</div>
                <div>
                  <div className="gen-step-title">Confirme o consumo de 1 credito</div>
                  <div className="gen-step-desc">Rastreabilidade total com ledger de creditos. Sem surpresas.</div>
                </div>
              </div>
              <div className="gen-step">
                <div className="gen-step-index">3</div>
                <div>
                  <div className="gen-step-title">Receba os 3 documentos prontos</div>
                  <div className="gen-step-desc">Visualize em abas, copie o Markdown ou exporte em PDF por documento ou projeto completo.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mock-modal-wrap gen-visual-wrap reveal" style={{ transitionDelay: "150ms", paddingBottom: "48px" }}>
            <div className="mock-modal">
              <div className="modal-title">Criar projeto</div>
              <div className="modal-sub">Preencha os campos para gerar os 3 documentos automaticamente.</div>
              <div className="mock-form-grid">
                <div className="mock-field">
                  <div className="mock-label">Categoria (opcional)</div>
                  <div className="mock-input"><span className="mock-input-text">Mobile</span></div>
                </div>
                <div className="mock-field">
                  <div className="mock-label">Preferencias (opcional)</div>
                  <div className="mock-input"><span className="mock-input-text">React Native, offline-first</span></div>
                </div>
                <div className="mock-field mock-span-2">
                  <div className="mock-label">Tags</div>
                  <div className="mock-tags-box">
                    <span className="tag-chip tag-selected">IA</span>
                    <span className="tag-chip tag-selected">Mobile</span>
                    <span className="tag-chip tag-selected">Dados</span>
                    <span className="tag-chip tag-default">IoT</span>
                    <span className="tag-chip tag-default">Web</span>
                    <span className="tag-chip tag-default">Cloud</span>
                  </div>
                </div>
                <div className="mock-field mock-span-2">
                  <div className="mock-label">Areas de atuacao</div>
                  <div className="mock-tags-box">
                    <span className="tag-chip tag-info">Acessibilidade</span>
                    <span className="tag-chip tag-default">Educacao</span>
                    <span className="tag-chip tag-default">Saude</span>
                  </div>
                </div>
                <div className="mock-textarea mock-span-2">
                  Aplicativo para auxiliar pessoas com deficiencia visual na navegacao urbana usando IA e GPS, com rotas acessiveis em tempo real...
                </div>
              </div>
              <div className="mock-modal-footer">
                <div className="mock-btn mock-btn-ghost">Cancelar</div>
                <div className="mock-btn mock-btn-primary">Gerar projeto →</div>
              </div>
            </div>
            <div className="mock-loading">
              <div className="spinner" />
              <div>
                <div className="loading-text">Gerando documentacoes com IA...</div>
                <div className="loading-sub">Estruturando os 3 documentos do projeto</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GenerationSection;
