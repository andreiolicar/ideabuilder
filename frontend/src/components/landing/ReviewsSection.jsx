function ReviewsSection() {
  return (
    <section className="reviews-section" id="reviews">
      <div className="rv-bg-word" aria-hidden="true">
        {"o que\ndizem?"}
      </div>

      <div className="reviews-inner">
        <div className="rv-stars reveal" aria-label="Avaliacao cinco estrelas">
          {Array.from({ length: 5 }).map((_, index) => (
            <svg key={index} viewBox="0 0 24 24">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          ))}
        </div>

        <div className="rv-grid">
          <div className="rv-card rv-card-01 reveal" style={{ transitionDelay: "100ms" }}>
            <div className="rv-num">(01)</div>
            <p className="rv-text">
              Finalmente sai do zero com meu TCC. Preenchi o formulario, a IA gerou os tres documentos em menos de
              um minuto e o orientador aprovou a proposta na primeira reuniao.{" "}
              <span className="rv-fade">Nunca imaginei que ia ser tao direto.</span>
            </p>
            <div className="rv-author">- Lucas M., Analise e Desenvolvimento de Sistemas</div>
          </div>

          <div className="rv-card rv-card-02 reveal" style={{ transitionDelay: "200ms" }}>
            <div className="rv-num">(02)</div>
            <p className="rv-text">
              Estava completamente perdida na etapa de escopo. A plataforma estruturou tudo - problema, objetivos,
              stack e cronograma - de forma coerente e alinhada com o que o orientador pediu. Exportei o PDF direto e
              apresentei sem nenhuma revisao. <span className="rv-fade">Poupou semanas de retrabalho.</span>
            </p>
            <div className="rv-author">- Fernanda C., Engenharia de Software</div>
          </div>

          <div className="rv-stats reveal" style={{ transitionDelay: "280ms" }}>
            <div>
              <div className="rv-stat-num">500+</div>
              <div className="rv-stat-label">Projetos gerados</div>
            </div>
            <div>
              <div className="rv-stat-num">98%</div>
              <div className="rv-stat-label">Aprovacao na proposta</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReviewsSection;
