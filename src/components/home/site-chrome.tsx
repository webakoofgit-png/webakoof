import { useInteractive } from "@/hooks/use-interactive";
import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, Menu, Facebook, Instagram, Linkedin } from "lucide-react";
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
const socialPlatforms = [
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
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
  const whatsappNumber = settings.whatsapp.replace(/\D/g, "");
  return (
    <footer className="site-footer">
      <a
        className="floating-whatsapp"
        href={
          whatsappNumber
            ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi WEBakoof, I'd like to discuss my project.")}`
            : "/contact"
        }
        target={whatsappNumber ? "_blank" : undefined}
        rel="noopener noreferrer"
        aria-label={
          whatsappNumber
            ? "Chat with WEBakoof on WhatsApp (opens in a new tab)"
            : "Contact WEBakoof"
        }
        title={whatsappNumber ? "Chat on WhatsApp" : "Contact WEBakoof"}
      >
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" aria-hidden="true">
          <path d="M20.52 3.48A11.91 11.91 0 0 0 12.05 0C5.47 0 .12 5.35.12 11.93c0 2.1.55 4.16 1.59 5.97L0 24l6.26-1.64a11.94 11.94 0 0 0 5.79 1.47h.01c6.58 0 11.94-5.35 11.94-11.93a11.85 11.85 0 0 0-3.48-8.42ZM12.05 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.22-3.71.97.99-3.62-.24-.37a9.86 9.86 0 0 1-1.52-5.25c0-5.46 4.44-9.9 9.9-9.9a9.82 9.82 0 0 1 7 2.9 9.83 9.83 0 0 1 2.9 7c0 5.45-4.44 9.87-9.92 9.87Zm5.43-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.03 1.01-1.03 2.46s1.06 2.85 1.2 3.05c.15.2 2.1 3.2 5.09 4.49.71.3 1.26.48 1.69.61.71.23 1.35.2 1.86.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
        </svg>
      </a>
      <div className="section-shell">
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
            <div className="footer-social-icons" aria-label="Social media">
              {socialPlatforms.map(({ key, label, icon: Icon }) =>
                settings[key] ? (
                  <a
                    className={`footer-social-icon social-${key}`}
                    key={key}
                    href={settings[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (opens in a new tab)`}
                  >
                    <Icon size={22} aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    className={`footer-social-icon social-${key}`}
                    key={key}
                    role="img"
                    aria-label={label}
                  >
                    <Icon size={22} aria-hidden="true" />
                  </span>
                ),
              )}
            </div>
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
            <a href="/sitemap.xml">Sitemap</a>
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
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} All Rights Reserved By Webakoof</span>
          <span>Strategy · Design · Development · Growth</span>
        </div>
      </div>
    </footer>
  );
}
