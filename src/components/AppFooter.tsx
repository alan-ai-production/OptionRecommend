import { DISCLAIMER } from "./disclaimer";

export function AppFooter() {
  return (
    <footer className="site-footer">
      <section className="footer-disclaimer" aria-label="Disclaimer">
        <h2>Disclaimer</h2>
        <p>{DISCLAIMER}</p>
      </section>
    </footer>
  );
}
