import LandingFooter from "./LandingFooter.jsx";
import LandingNavbar from "./LandingNavbar.jsx";
import "../../pages/Home.css";

function PublicAuthLayout({ isAuthenticated, children }) {
  return (
    <div className="lp-auth-page">
      <LandingNavbar isAuthenticated={isAuthenticated} anchorPrefix="/" />
      <main className="lp-auth-main">
        {children}
      </main>
      <LandingFooter anchorPrefix="/" />
    </div>
  );
}

export default PublicAuthLayout;
