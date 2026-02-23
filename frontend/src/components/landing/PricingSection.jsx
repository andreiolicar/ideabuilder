function PricingSection() {
  return (
    <section className="pricing-section" id="precos">
      <div className="container">
        <div className="pricing-header reveal">
          <span className="section-label">// 03 — Planos</span>
          <h2>Simples e <em>transparente</em></h2>
          <p className="section-sub">Comece gratuitamente. Escale conforme sua necessidade. Cada credito = uma geracao completa de 3 documentos.</p>
        </div>
        <div className="pricing-grid">
          <div className="plan-card reveal">
            <div className="plan-name">Free</div>
            <div className="plan-price">
              <sup>R$</sup>0<span>/mes</span>
            </div>
            <div className="plan-desc">Tudo que voce precisa para comecar a estruturar sua ideia.</div>
            <div className="plan-divider" />
            <div className="plan-features">
              <div className="plan-feature">Creditos iniciais gratuitos</div>
              <div className="plan-feature">Geracao de 3 documentos</div>
              <div className="plan-feature">Exportacao PDF por documento</div>
              <div className="plan-feature disabled">Exportacao em lote</div>
              <div className="plan-feature disabled">Creditos adicionais</div>
            </div>
            <button className="plan-btn plan-btn-ghost" type="button">Comecar gratis</button>
          </div>

          <div className="plan-card featured reveal" style={{ transitionDelay: "100ms" }}>
            <div className="plan-tag">Mais popular</div>
            <div className="plan-name">Pro</div>
            <div className="plan-price">
              <sup>R$</sup>19<span>/mes</span>
            </div>
            <div className="plan-desc">Para o estudante que leva o TCC a serio e quer velocidade.</div>
            <div className="plan-divider" />
            <div className="plan-features">
              <div className="plan-feature">Tudo do plano Free</div>
              <div className="plan-feature">20 creditos mensais</div>
              <div className="plan-feature">Exportacao em lote (PDF)</div>
              <div className="plan-feature">Projetos ilimitados</div>
              <div className="plan-feature">Suporte prioritario</div>
            </div>
            <button className="plan-btn plan-btn-accent" type="button">Assinar Pro</button>
          </div>

          <div className="plan-card reveal" style={{ transitionDelay: "200ms" }}>
            <div className="plan-name">Turma</div>
            <div className="plan-price">
              <sup>R$</sup>9<span className="plan-suffix-small">/aluno·mes</span>
            </div>
            <div className="plan-desc">Para professores e instituicoes que orientam multiplos TCCs.</div>
            <div className="plan-divider" />
            <div className="plan-features">
              <div className="plan-feature">Tudo do plano Pro</div>
              <div className="plan-feature">Gestao de creditos por aluno</div>
              <div className="plan-feature">Painel administrativo</div>
              <div className="plan-feature">Ledger de auditoria completo</div>
              <div className="plan-feature">Minimo 10 alunos</div>
            </div>
            <button className="plan-btn plan-btn-ghost" type="button">Falar com equipe</button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
