import { motion } from "framer-motion";

export const EASE = [0.22, 1, 0.36, 1];

export const Reveal = ({ children, delay = 0, y = 40, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.8, ease: EASE, delay }}
  >
    {children}
  </motion.div>
);

export const PageHero = ({ eyebrow, title, subtitle, children }) => (
  <section className="relative overflow-hidden bg-[#05070E] text-white grain" data-testid="page-hero">
    <div className="absolute -top-28 -right-24 w-[28rem] h-[28rem] bg-[#003DA5]/25 rounded-full blur-3xl" />
    <div className="absolute -bottom-32 -left-24 w-[26rem] h-[26rem] bg-[#DC1C2E]/15 rounded-full blur-3xl" />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        {eyebrow && (
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#DC1C2E]">{eyebrow}</span>
        )}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.03em] mt-4 leading-[1.0] max-w-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-2xl">{subtitle}</p>
        )}
        {children}
      </motion.div>
    </div>
  </section>
);
