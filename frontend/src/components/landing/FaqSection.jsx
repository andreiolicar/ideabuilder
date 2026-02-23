import { faqItems } from "./landingData.js";

function FaqSection({ openIndex, onToggle }) {
  return (
    <section className="faq-section" id="faq">
      <div className="container">
        <div className="faq-layout">
          <div className="reveal">
            <span className="section-label">// 04 — FAQ</span>
            <h2>
              Perguntas
              <br />
              <em>frequentes</em>
            </h2>
            <p className="faq-intro">
              Ainda tem duvidas? Nosso suporte esta disponivel por e-mail.
            </p>
          </div>
          <div className="faq-list reveal" style={{ transitionDelay: "150ms" }}>
            {faqItems.map((item, index) => {
              const open = openIndex === index;
              return (
                <div key={item.question} className={`faq-item ${open ? "open" : ""}`}>
                  <button type="button" className="faq-question" onClick={() => onToggle(index)}>
                    {item.question}
                    <span className="faq-icon">+</span>
                  </button>
                  <div className="faq-answer">{item.answer}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
