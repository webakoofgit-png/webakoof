import { useInteractive } from "@/hooks/use-interactive";
import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  Download,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { InnerHero, Heading } from "@/components/shared/page";
import { submitEnquiry } from "@/lib/enquiry";
import { useContent } from "@/lib/cms/context";
import {
  enquiryServices,
  enquiryBudgets,
  type EnquiryService,
  type EnquiryBudget,
} from "@/data/enquiry";
export function ContactPage() {
  const { settings } = useContent();
  const interactive = useInteractive();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [brief, setBrief] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) || "").trim();
    setBrief(
      [
        "Webakoof project enquiry",
        ...["name", "business", "phone", "email", "service", "budget", "message"].map(
          (k) => `${k}: ${value(k)}`,
        ),
      ].join("\n\n"),
    );
    setPending(true);
    setStatus(null);
    try {
      const result = await submitEnquiry({
        data: {
          name: value("name"),
          business: value("business"),
          phone: value("phone"),
          email: value("email"),
          service: value("service") as EnquiryService,
          budget: value("budget") as EnquiryBudget,
          message: value("message"),
          consent: true,
          website: value("website"),
        },
      });
      setStatus(result);
      if (result.ok) {
        form.reset();
        setBrief("");
      }
    } catch {
      setStatus({
        ok: false,
        message:
          "Your enquiry could not be sent. Check your details and try again. Your entries have been kept.",
      });
    } finally {
      setPending(false);
    }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([brief], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "webakoof-project-brief.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <InnerHero
        label="Let’s work together"
        title="Have an idea? Let’s turn it into something powerful."
        description="A new website, a better online store or a digital challenge you haven’t quite defined. Tell us what you have in mind."
      />
      <section className="section-space">
        <div className="section-shell contact-grid">
          <div>
            <Heading
              label="THE FIRST STEP IS A CONVERSATION"
              title="Tell us about your project."
              text="Share your goals, your current challenges and where you want to go. A little context helps us understand the right next step."
            />
            <div className="contact-methods">
              {[
                [
                  Phone,
                  "Call Us",
                  settings.phone || "Phone details will be published once confirmed.",
                ],
                [
                  Mail,
                  "Email Us",
                  settings.email || "Email details will be published once confirmed.",
                ],
                [
                  MessageCircle,
                  "WhatsApp",
                  settings.whatsapp || "A direct WhatsApp number is not yet available.",
                ],
                [MapPin, "Office", settings.address || "Office address to be confirmed."],
              ].map(([Icon, title, text]) => {
                const I = Icon as typeof Phone;
                return (
                  <div key={String(title)}>
                    <I size={21} />
                    <div>
                      <h3>{String(title)}</h3>
                      <p>{String(text)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="contact-note">
              <span>GOOD TO KNOW</span>
              <p>You don’t need a finished brief. Start with the problem you want to solve.</p>
            </div>
          </div>
          <div className="enquiry-panel">
            <div className="form-heading">
              <span>YOUR NEXT CHAPTER</span>
              <ArrowUpRight />
              <h2>Let’s hear your idea.</h2>
            </div>
            <form onSubmit={submit} className="enquiry-form">
              <label>
                Full Name <span>*</span>
                <input
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Your full name"
                />
              </label>
              <label>
                Business Name <span>*</span>
                <input
                  name="business"
                  autoComplete="organization"
                  required
                  minLength={2}
                  maxLength={160}
                  placeholder="Company or brand"
                />
              </label>
              <label>
                Phone Number <span>*</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  pattern="(?=(?:[^0-9]*[0-9]){7})[+\(\)0-9\s.\-]{7,25}"
                  title="Enter 7–25 characters using digits, spaces, +, parentheses, dots or hyphens."
                  placeholder="Your phone number"
                />
              </label>
              <label>
                Email Address <span>*</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="you@company.com"
                />
              </label>
              <label>
                Service Required <span>*</span>
                <select name="service" required defaultValue="">
                  <option value="" disabled>
                    Select a service
                  </option>
                  {enquiryServices.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Budget Range
                <select name="budget" defaultValue="To be discussed">
                  {enquiryBudgets.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="form-full">
                Project Description <span>*</span>
                <textarea
                  name="message"
                  required
                  minLength={20}
                  maxLength={5000}
                  rows={5}
                  placeholder="What would you like to build or improve? Tell us a little about your goals."
                />
                <small>
                  At least 20 characters. Please don’t include passwords or sensitive information.
                </small>
              </label>
              <div className="honeypot" aria-hidden="true">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <label className="consent form-full">
                <input name="consent" type="checkbox" required />
                <span>
                  I agree to be contacted about this enquiry and have read the{" "}
                  <Link to="/privacy-policy">Privacy Policy</Link>.
                </span>
              </label>
              <button type="submit" disabled={pending || !interactive} className="action form-full">
                {pending ? "Sending your enquiry…" : "Send Project Enquiry"}
                <ArrowUpRight size={18} />
              </button>
              <p className="form-note form-full">
                A confirmation appears only after successful delivery.
              </p>
              {status && (
                <div
                  tabIndex={-1}
                  className={`form-status form-full ${status.ok ? "success" : "error"}`}
                  role={status.ok ? "status" : "alert"}
                >
                  {status.ok && <CheckCircle2 />}
                  <p>{status.message}</p>
                  {!status.ok && brief && (
                    <button type="button" className="text-link" onClick={download}>
                      Download your brief <Download size={17} />
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
      <section className="section-space surface">
        <div className="section-shell">
          <Heading label="WHAT HAPPENS NEXT?" title="From hello to a clear plan." />
          <ol className="next-steps">
            {[
              ["We review your requirement", "Understand your business and the challenge."],
              ["Our team connects with you", "Clarify the details and the best way forward."],
              ["We discuss scope & strategy", "Agree the priorities, approach and deliverables."],
              ["You receive the proposal", "Review the scope, investment and next steps."],
            ].map(([title, text], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
