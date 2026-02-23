import { Link } from "react-router-dom";
import logoFull from "../../assets/branding/logo-tib-full.png";

function LandingNavbar({ isAuthenticated, anchorPrefix = "" }) {
  return (
    <nav className="lp-nav">
      <Link to="/" className="nav-logo" aria-label="TCC Idea Builder">
        <img src={logoFull} alt="TCC Idea Builder" className="nav-logo-image" />
      </Link>

      <div className="nav-links">
        <a href={`${anchorPrefix}#como-funciona`} className="nav-link">Como funciona</a>
        <a href={`${anchorPrefix}#geracao`} className="nav-link">Geracao com IA</a>
        <a href={`${anchorPrefix}#precos`} className="nav-link">Precos</a>
        <a href={`${anchorPrefix}#faq`} className="nav-link">FAQ</a>
      </div>

      <div className="nav-actions">
        <Link to="/login" className="btn-secondary">Entrar</Link>
        <Link to={isAuthenticated ? "/dashboard" : "/register"} className="btn-primary">
          {isAuthenticated ? "Ir para dashboard" : "Criar conta"}
        </Link>
      </div>
    </nav>
  );
}

export default LandingNavbar;
