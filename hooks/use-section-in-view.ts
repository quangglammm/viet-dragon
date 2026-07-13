"use client";

import { useRef } from "react";
import { useInView, type UseInViewOptions } from "motion/react";

export function useSectionInView<T extends HTMLElement = HTMLDivElement>(
  margin: NonNullable<UseInViewOptions["margin"]> = "-80px"
) {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, margin });
  return { ref, inView };
}
