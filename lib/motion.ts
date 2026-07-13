import type { Variants } from "motion/react";

// Clip-path "wipe down" reveal for feature/hero images.
// Pair with initial="hidden" + whileInView="visible" (viewport once, margin "-80px"),
// or animate={inView ? "visible" : "hidden"} with useInView — matches this project's
// existing entrance-animation convention (see AGENTS.md "Animation patterns").
export const imageWipeReveal: Variants = {
  hidden: { clipPath: "inset(0% 0% 100% 0%)", opacity: 0, y: "-4%" },
  visible: {
    clipPath: "inset(0% 0% 0% 0%)",
    opacity: 1,
    y: 0,
    transition: { duration: 1.1, ease: [0.645, 0.045, 0.355, 1] },
  },
};
