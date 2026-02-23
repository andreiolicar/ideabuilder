import { Link } from "react-router-dom";
import logoIcon from "../../assets/branding/logo-tib-icon.png";

function LandingFooter({ anchorPrefix = "" }) {
  return (
    <footer className="lp-footer">
      <div className="footer-inner">
        <div className="footer-logo">
          <img src={logoIcon} alt="TCC Idea Builder" className="footer-logo-image" />
          <div>
            <div className="footer-brand-name">TCC Idea Builder</div>
            <div className="footer-copy">© 2026</div>
          </div>
        </div>
        <div className="footer-links">
          <Link to="/login" className="footer-link">Entrar</Link>
          <Link to="/register" className="footer-link">Criar conta</Link>
          <a href={`${anchorPrefix}#faq`} className="footer-link">FAQ</a>
          <a href={`${anchorPrefix}#precos`} className="footer-link">Precos</a>
        </div>
      </div>
    </footer>
  );
}

export default LandingFooter;
