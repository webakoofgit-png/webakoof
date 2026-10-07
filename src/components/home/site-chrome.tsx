import { useInteractive } from "@/hooks/use-interactive";
import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react";
import { services } from "@/data/services";
import { useContent } from "@/lib/cms/context";
import webakoofLogo from "@/assets/webakoof_logo.png";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
const navigation = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Portfolio", "/portfolio"],
  ["Blog", "/blog"],
  ["Contact", "/contact"],
] as const;
export function Brand() {
  const { settings } = useContent();
  return (
    <Link to="/" className="brand" aria-label="Webakoof home">
      <img
        src={settings.logo || webakoofLogo}
        alt={`${settings.name} logo`}
        width={56}
        height={56}
        style={{
          width: 56,
          height: 56,
          objectFit: settings.logo ? "contain" : "cover",
          borderRadius: settings.logo ? 0 : "50%",
        }}
      />
      <span>
        <strong>
          {settings.name === "Webakoof" ? "webakoof" : settings.name}
          <span>.</span>
        </strong>
        <small>by Praavi Consultants</small>
      </span>
    </Link>
  );
}
export function Navbar() {
  const interactive = useInteractive();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [pathname]);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  const active = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));
  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="section-shell header-row">
        <Brand />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map(([label, path]) => (
            <div
              key={path}
              className="nav-entry"
              onMouseEnter={() => path === "/services" && setMega(true)}
              onMouseLeave={() => setMega(false)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setMega(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setMega(false);
              }}
            >
              <Link
                to={path}
                aria-current={active(path) ? "page" : undefined}
                className={active(path) ? "nav-active" : ""}
              >
                {label}
              </Link>
              {path === "/services" && (
                <>
                  <button
                    disabled={!interactive}
                    className="menu-chevron"
                    aria-label="Explore services"
                    aria-expanded={mega}
                    aria-controls="service-menu"
                    onClick={() => setMega(!mega)}
                  >
                    <ChevronDown size={14} />
                  </button>
                  {mega && (
                    <div className="mega-menu" id="service-menu">
                      <div className="mega-intro">
                        <span className="eyebrow">OUR EXPERTISE</span>
                        <h2>
                          Built around
                          <br />
                          your next move.
                        </h2>
                        <Link to="/services" onClick={() => setMega(false)}>
                          Explore all services <ArrowUpRight size={16} />
                        </Link>
                      </div>
                      <div className="mega-links">
                        {services.map((s) => (
                          <Link
                            key={s.slug}
                            to="/services/$slug"
                            params={{ slug: s.slug }}
                            onClick={() => setMega(false)}
                          >
                            <s.icon size={22} />
                            <span>
                              <strong>{s.title}</strong>
                              <small>{s.description}</small>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
        <Link to="/contact" className="action header-cta">
          Get Free Consultation <ArrowUpRight size={17} />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button disabled={!interactive} className="mobile-toggle" aria-label="Open navigation">
              <Menu />
            </button>
          </SheetTrigger>
          <SheetContent className="mobile-drawer">
            <SheetTitle>Explore Webakoof</SheetTitle>
            <SheetDescription>Websites, technology and digital growth.</SheetDescription>
            <nav aria-label="Mobile navigation">
              {navigation.map(([label, path]) =>
                path === "/services" ? (
                  <div key={path}>
                    <Link to={path} onClick={() => setOpen(false)}>
                      Services <ArrowUpRight size={20} />
                    </Link>
                    <details>
                      <summary>Explore our services</summary>
                      {services.map((s) => (
                        <Link
                          key={s.slug}
                          to="/services/$slug"
                          params={{ slug: s.slug }}
                          onClick={() => setOpen(false)}
                        >
                          {s.title}
                        </Link>
                      ))}
                    </details>
                  </div>
                ) : (
                  <Link
                    key={path}
                    to={path}
                    aria-current={active(path) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {label}
                    <ArrowUpRight size={20} />
                  </Link>
                ),
              )}
            </nav>
            <Link to="/contact" className="action" onClick={() => setOpen(false)}>
              Get Free Consultation <ArrowUpRight size={18} />
            </Link>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
export function Footer() {
  const { settings } = useContent();
  return (
    <footer className="site-footer">
      <div className="section-shell">
        <div className="footer-cta">
          <div>
            <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
            <h2>
              Let's build
              <br />
              something great<span>.</span>
            </h2>
          </div>
          <Link to="/contact" className="circle-link" aria-label="Start your project">
            <ArrowUpRight />
          </Link>
        </div>
        <div className="footer-grid">
          <div>
            <Brand />
            <p>
              Thoughtful websites.
              <br />
              Useful technology.
              <br />
              Room for your business to grow.
            </p>
          </div>
          <div>
            <h3>Services</h3>
            {services.map((s) => (
              <Link key={s.slug} to="/services/$slug" params={{ slug: s.slug }}>
                {s.title}
              </Link>
            ))}
          </div>
          <div>
            <h3>Company</h3>
            {navigation
              .filter(([label]) => ["About", "Portfolio", "Contact"].includes(label))
              .map(([label, path]) => (
                <Link key={path} to={path}>
                  {label}
                </Link>
              ))}
          </div>
          <div>
            <h3>Resources</h3>
            <Link to="/blog">Insights & ideas</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms & Conditions</Link>
            <h3 className="footer-contact-title">Let's connect</h3>
            <Link to="/contact">Discuss your project ↗</Link>
            {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
            {settings.phone && <a href={`tel:${settings.phone}`}>{settings.phone}</a>}
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp ↗
              </a>
            )}
            {settings.address && <p>{settings.address}</p>}
            {(["instagram", "facebook", "linkedin", "youtube"] as const).map(
              (key) =>
                settings[key] && (
                  <a key={key} href={settings[key]} target="_blank" rel="noreferrer">
                    {key.charAt(0).toUpperCase() + key.slice(1)} ↗
                  </a>
                ),
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Webakoof by Praavi Consultants.</span>
          <span>Strategy · Design · Development · Growth</span>
        </div>
      </div>
    </footer>
  );
}
