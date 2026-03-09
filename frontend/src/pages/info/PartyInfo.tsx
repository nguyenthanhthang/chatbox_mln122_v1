/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { SmartToy, MenuBook } from "@mui/icons-material";
import Lenis from "lenis";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function Magnetic({
  children,
  onHover,
  onLeave,
}: {
  children: React.ReactElement;
  onHover?: () => void;
  onLeave?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;

    const { height, width, left, top } =
      ref.current!.getBoundingClientRect();

    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    x.set(middleX * 0.3);
    y.set(middleY * 0.3);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
    if (onLeave) onLeave();
  };

  return (
    <motion.div
      className="inline-block"
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onMouseEnter={onHover}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

const SplitText = ({
  text,
  delayOffset = 0,
}: {
  text: string;
  delayOffset?: number;
}) => {
  const words = text.split(" ");

  return (
    <span className="inline-block">
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-3">
          <motion.span
            className="inline-block"
            initial={{ y: "100%", opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: delayOffset + i * 0.04,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

function HighlightedText({
  children,
  onHover,
  onLeave,
}: {
  children: React.ReactNode;
  onHover?: () => void;
  onLeave?: () => void;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.5 }
    );

    if (spanRef.current) observer.observe(spanRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <span
      ref={spanRef}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="relative inline-block text-[#FFEA98] drop-shadow-[0_0_25px_rgba(255,234,152,0.6)] cursor-none z-30"
    >
      {children}

      <svg
        className="absolute -bottom-1 left-0 w-full h-4 overflow-visible"
        viewBox="0 0 200 12"
        preserveAspectRatio="none"
      >
        <path
          d="M0 8 Q50 2, 100 6 T200 8"
          stroke="#FFEA98"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            strokeDasharray: 200,
            strokeDashoffset: isVisible ? 0 : 200,
            filter: "drop-shadow(0px 0px 8px rgba(255,234,152,0.8))",
          }}
        />
      </svg>
    </span>
  );
}

const sections = [
  {
    id: "ii",
    title: "1. Tự do, dân chủ và Nhà nước Xã hội chủ nghĩa",
    content:
      "Độc lập dân tộc phải gắn liền với chủ nghĩa xã hội. Nếu đất nước giành được độc lập nhưng nhân dân không có cuộc sống ấm no, tự do thì nền độc lập đó chưa trọn vẹn.",
    image: "/party-img-order-1.jpg",
  },
];

export default function PartyInfo() {
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  return (
    <div className="bg-black text-white min-h-screen">

      <section className="max-w-6xl mx-auto py-32 px-6">
        <h1 className="text-4xl font-bold mb-10">
          Dân chủ xã hội chủ nghĩa
        </h1>

        {sections.map((section) => (
          <div key={section.id} className="mb-20">
            <h2 className="text-2xl mb-4">{section.title}</h2>

            <p className="text-gray-300 leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </section>

      <div className="text-center pb-20">
        <button
          onClick={() => navigate("/")}
          className="border border-white px-8 py-3 hover:bg-white hover:text-black transition"
        >
          QUAY LẠI TRANG CHỦ
        </button>
      </div>

    </div>
  );
}