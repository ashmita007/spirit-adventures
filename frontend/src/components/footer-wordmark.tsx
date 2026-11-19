"use client";

import React from "react";
import { MotionConfig, motion } from "framer-motion";
import { Small } from "@/components/mix-heading";

const WORD = "SPIRIT";

/**
 * Closing wordmark: "SPIRIT" set across the footer, letters rising one by one as the
 * footer comes into view, with "adventures" beside it as the amber ticket sticker.
 * Decorative (the brand name is already in the footer logo), so hidden from screen readers.
 */
export default function FooterWordmark() {
  return (
    <MotionConfig reducedMotion="user">
    <div aria-hidden="true" className="pointer-events-none select-none overflow-hidden pb-2 pt-10 sm:pt-14">
      <p className="flex items-end justify-center font-display font-black uppercase leading-[0.8] tracking-[-0.04em] text-white/[0.07] [font-size:clamp(4.5rem,21vw,18rem)]">
        {Array.from(WORD).map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
          >
            {ch}
          </motion.span>
        ))}
        <span className="mb-[0.12em] ml-[0.1em] inline-block text-[0.12em]">
          <Small className="mx-0" style={{ fontSize: "1em" }}>adventures</Small>
        </span>
      </p>
    </div>
    </MotionConfig>
  );
}
