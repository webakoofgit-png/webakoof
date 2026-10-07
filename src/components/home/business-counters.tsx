import { useEffect, useRef, useState } from "react";
import { Rocket, CalendarDays, Layers3, Route, Code2 } from "lucide-react";
import { services } from "@/data/services";
import { process, technologies } from "./content";
import { useContent } from "@/lib/cms/context";
import { cmsIcon } from "./cms-icons";
const metrics = [
  {
    icon: Rocket,
    value: 150,
    suffix: "+",
    title: "Projects Deployed",
    description: "Ideas brought to life online.",
  },
  {
    icon: CalendarDays,
    value: 2,
    suffix: "+",
    title: "Years of Experience",
    description: "Practical expertise, every step.",
  },
  {
    icon: Layers3,
    value: services.length,
    suffix: "",
    title: "Digital Services",
    description: "From your website to digital growth.",
  },
  {
    icon: Route,
    value: process.length,
    suffix: "",
    title: "Delivery Stages",
    description: "A clear path from discovery to support.",
  },
  {
    icon: Code2,
    value: technologies.length,
    suffix: "",
    title: "Technologies",
    description: "The right tools for your business.",
  },
];
function Metric({ metric }: { metric: (typeof metrics)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(metric.value);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || !("IntersectionObserver" in window)) return;
    setCount(0);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / 1600, 1);
          setCount(Math.floor(metric.value * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    const finish = () => {
      if (motion.matches) {
        observer.disconnect();
        cancelAnimationFrame(frame);
        setCount(metric.value);
      }
    };
    motion.addEventListener("change", finish);
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      motion.removeEventListener("change", finish);
    };
  }, [metric.value]);
  const Icon = metric.icon;
  return (
    <div ref={ref} className="counter-item">
      <span className="counter-icon" aria-hidden="true">
        <Icon size={26} strokeWidth={1.7} />
      </span>
      <strong className="counter-value" aria-label={`${metric.value}${metric.suffix}`}>
        <span aria-hidden="true">
          {count}
          <span className="counter-suffix">{metric.suffix}</span>
        </span>
      </strong>
      <h2>{metric.title}</h2>
      <p>{metric.description}</p>
    </div>
  );
}
export function BusinessCounters() {
  const { sections } = useContent();
  const values =
    sections["counters"]?.items.map((s) => ({ ...s, icon: cmsIcon(s.icon) })) || metrics;
  return (
    <section className="business-proof" aria-label="Webakoof in numbers">
      <div className="section-shell counter-grid">
        {values.map((metric) => (
          <Metric key={metric.title} metric={metric} />
        ))}
      </div>
    </section>
  );
}
