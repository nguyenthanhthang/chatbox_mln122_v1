import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useMotionValue, useSpring } from "framer-motion";
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
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        xmlns="http://www.w3.org/2000/svg"
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
  {
    id: "iii",
    title: "2. Tại sao lại là hình thức nhà nước này?",
    content:
      "Việc lựa chọn con đường xã hội chủ nghĩa không phải cảm tính mà là kết quả phân tích sâu sắc điều kiện lịch sử, kinh tế, xã hội của Việt Nam.",
    image: "/party-img-order-2.jpg",
  },
  {
    id: "1",
    title: "3. Cơ sở lý luận thực tiễn",
    content:
      "Xuất phát từ một nước thuộc địa, nửa phong kiến, việc đi lên chủ nghĩa xã hội là con đường thiết thực với hoàn cảnh cụ thể nhất.",
    image: "/party-img-order-3.jpg",
  },
  {
    id: "2",
    title: "4. Nhà nước pháp quyền do toàn dân",
    content:
      "Chủ nghĩa xã hội là chế độ do nhân dân làm chủ, vì nhân dân và phục vụ lợi ích của nhân dân, phù hợp với khát vọng giải phóng con người.",
    image: "/party-img-order-4.jpg",
  },
];

const PartyInfo: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.25,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [revealedImages, setRevealedImages] = useState<Set<string>>(new Set());
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = imageRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (index !== -1) {
              setRevealedImages((prev) => new Set(prev).add(sections[index].id));
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, []);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 350, mass: 0.1 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const [cursorVariant, setCursorVariant] = useState("default");

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", mouseMove);
    return () => window.removeEventListener("mousemove", mouseMove);
  }, [cursorX, cursorY]);

  const variants = {
    default: {
      x: "-50%",
      y: "-50%",
      width: 16,
      height: 16,
      backgroundColor: "#FFEA98",
      opacity: 1,
      mixBlendMode: "normal" as const,
    },
    hoverImage: {
      x: "-50%",
      y: "-50%",
      width: 80,
      height: 80,
      backgroundColor: "rgba(255, 234, 152, 0.4)",
      mixBlendMode: "screen" as const,
    },
    hoverText: {
      x: "-50%",
      y: "-50%",
      width: 80,
      height: 80,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      mixBlendMode: "difference" as const,
    },
  };

  const cursorEnterImage = () => setCursorVariant("hoverImage");
  const cursorEnterText = () => setCursorVariant("hoverText");
  const cursorLeave = () => setCursorVariant("default");

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden selection:bg-[#FFEA98] selection:text-black cursor-none">
      {/* FILM GRAIN OVERLAY */}
      <div
        className="pointer-events-none fixed inset-0 z-[100] w-full h-full opacity-10"
        style={{
          backgroundImage:
            'url("https://upload.wikimedia.org/wikipedia/commons/1/16/Appearance_of_sky_for_weather_forecast%2C_Dhaka%2C_Bangladesh.JPG")',
          backgroundBlendMode: "screen",
          filter: "grayscale(1) contrast(1.5)",
        }}
      />

      {/* DYNAMIC AMBIENT GLOW */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.3, 0.15],
          x: [0, 150, -100, 0],
          y: [0, -100, 150, 0],
        }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="fixed top-1/4 -left-32 w-[600px] h-[600px] bg-[#FFEA98] rounded-full blur-[180px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, -150, 100, 0],
          y: [0, 100, -150, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 25,
          ease: "linear",
          delay: 2,
        }}
        className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#FF6B6B] rounded-full blur-[180px] pointer-events-none z-0"
      />

      {/* CUSTOM CURSOR */}
      <motion.div
        className="fixed top-0 left-0 bg-[#FFEA98] rounded-full pointer-events-none z-[9999] flex items-center justify-center text-black font-bold text-xs"
        style={{ left: cursorXSpring, top: cursorYSpring }}
        variants={variants}
        animate={cursorVariant}
        initial="default"
      >
        {cursorVariant === "hoverImage" && (
          <span className="opacity-100 uppercase tracking-widest text-[9px] -mt-px scale-75 animate-pulse">
            View
          </span>
        )}
      </motion.div>

      {/* NAVBAR */}
      <header className="fixed top-0 inset-x-0 h-24 z-[60] flex items-center justify-between px-8 md:px-16 mix-blend-difference pb-8">
        <a
          href="/"
          className="text-white text-xl md:text-2xl font-medium tracking-tighter cursor-none"
          onMouseEnter={cursorEnterText}
          onMouseLeave={cursorLeave}
        >
          MLN131*
        </a>
        <nav className="hidden md:flex gap-8 text-[10px] tracking-[0.2em] font-medium text-white/70 uppercase pt-1 z-50">
          <button
            type="button"
            onClick={() =>
              document.getElementById("ii")?.scrollIntoView({ behavior: "smooth" })
            }
            className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0"
            onMouseEnter={cursorEnterText}
            onMouseLeave={cursorLeave}
          >
            Chương 4
          </button>
        </nav>
        <div className="flex items-center gap-6 pt-1">
          <Magnetic onHover={cursorEnterImage} onLeave={cursorLeave}>
            <button
              onClick={() => navigate("/login")}
              className="text-[10px] tracking-[0.2em] text-white/70 font-medium uppercase hover:text-white transition-colors cursor-none"
            />
          </Magnetic>
          <Magnetic onHover={cursorEnterImage} onLeave={cursorLeave}>
            <button
              onClick={() => navigate("/login")}
              className="text-[10px] tracking-[0.2em] font-medium uppercase text-white hover:text-[#FFEA98] transition-colors cursor-none"
            >
              Trò chuyện cùng AI
            </button>
          </Magnetic>
        </div>
      </header>

      {/* HERO SECTION */}
      <section ref={heroRef} className="relative h-screen bg-black">
        <div className="h-screen w-full overflow-hidden flex flex-col justify-end pb-0 px-8 md:px-16 bg-black relative z-10">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/hero-bg-new.jpg"
              alt="Background"
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-110"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>

          <div className="relative z-20 w-full flex flex-col mb-8">
            <div className="w-full text-left overflow-hidden pt-4 pb-2">
              <motion.h1
                initial={{ y: "150%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-[12vw] leading-[1.1] font-normal tracking-tighter text-white"
                onMouseEnter={cursorEnterText}
                onMouseLeave={cursorLeave}
              >
                DÂN CHỦ
              </motion.h1>
            </div>

            <div className="w-full text-center overflow-hidden pt-4 pb-2">
              <motion.h1
                initial={{ y: "150%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.2,
                  delay: 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-[12vw] leading-[1.1] font-normal tracking-tighter text-white"
                onMouseEnter={cursorEnterText}
                onMouseLeave={cursorLeave}
              >
                <span className="text-white/40 text-[4vw] uppercase tracking-[0.4em] font-medium align-middle mr-8 lg:mr-32">
                  [ VÀ ]
                </span>
                NHÀ NƯỚC
              </motion.h1>
            </div>

            <div className="w-full text-right overflow-hidden pt-4 pb-2 flex items-end justify-between">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="hidden md:block text-[10px] tracking-[0.2em] font-medium text-white/50 uppercase mb-4 cursor-none"
                onMouseEnter={cursorEnterText}
                onMouseLeave={cursorLeave}
              >
                [ SCROLL ]
              </motion.span>
              <motion.h1
                initial={{ y: "150%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 1.2,
                  delay: 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="text-[12vw] leading-[1.1] font-normal tracking-tighter text-[#FFEA98] drop-shadow-2xl"
                onMouseEnter={cursorEnterText}
                onMouseLeave={cursorLeave}
              >
                XHCN
              </motion.h1>
            </div>
          </div>
        </div>
      </section>

      {/* NỘI DUNG CHÍNH */}
      <section className="relative z-30 pb-40 px-6 lg:px-12 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 relative">
          {/* CỘT TRÁI */}
          <aside className="lg:w-1/3 flex-shrink-0 relative">
            <div className="lg:sticky lg:top-40 pt-10">
              <p className="text-xs tracking-[0.3em] text-[#FFEA98] uppercase font-bold mb-10">
                Lộ trình chương
              </p>
              <ul className="space-y-6 border-l border-white/10 pl-6">
                {sections.map((section, idx) => (
                  <motion.li
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        document
                          .getElementById(section.id)
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="text-lg lg:text-xl text-gray-500 hover:text-white transition-colors cursor-pointer group flex items-center gap-4 bg-transparent border-0 p-0 text-left"
                      onMouseEnter={cursorEnterText}
                      onMouseLeave={cursorLeave}
                    >
                      <span className="w-8 h-[1px] bg-white/20 group-hover:bg-[#FFEA98] transition-colors origin-left scale-0 group-hover:scale-100" />
                      {section.title}
                    </button>
                  </motion.li>
                ))}
              </ul>

              <div
                className="mt-20 p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 relative overflow-hidden group cursor-none"
                onMouseEnter={cursorEnterImage}
                onMouseLeave={cursorLeave}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFEA98] opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700" />
                <h4 className="text-[#FFEA98] font-medium text-2xl mb-4 relative z-10">
                  Hỏi đáp bằng AI
                </h4>
                <p className="text-gray-400 text-base leading-relaxed mb-8 relative z-10">
                  Bạn có thắc mắc về nội dung bài học? Trợ lý AI MLN131 luôn sẵn
                  sàng giải đáp 24/7.
                </p>
                <Magnetic onHover={cursorEnterImage} onLeave={cursorLeave}>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-4 px-6 bg-[#FFEA98]/10 border border-[#FFEA98]/30 hover:bg-[#FFEA98] text-[#FFEA98] hover:text-black rounded-xl font-bold uppercase tracking-widest text-sm transition-all duration-500 cursor-none relative z-10"
                  >
                    Đăng nhập ngay
                  </button>
                </Magnetic>
              </div>
            </div>
          </aside>

          {/* CỘT PHẢI */}
          <main className="lg:w-2/3 flex flex-col gap-32 lg:pt-10">
            {sections.map((section, index) => (
              <motion.article
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-150px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
                onMouseEnter={() => setHoveredId(section.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div
                  ref={(el) => {
                    imageRefs.current[index] = el;
                  }}
                  onMouseEnter={cursorEnterImage}
                  onMouseLeave={cursorLeave}
                  className="relative overflow-hidden aspect-[16/10] mb-10 w-full bg-[#111] rounded-[2rem] cursor-none shadow-2xl"
                >
                  <img
                    src={section.image}
                    alt={section.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1541888031549-01456942adbc?auto=format&fit=crop&q=80&w=2000";
                    }}
                    className={cn(
                      "w-full h-full object-cover transition-transform duration-[2s] ease-[cubic-bezier(0.25,1,0.5,1)]",
                      hoveredId === section.id ? "scale-105" : "scale-110"
                    )}
                  />
                  <div
                    className="absolute inset-0 bg-[#111] origin-top z-10"
                    style={{
                      transform: revealedImages.has(section.id)
                        ? "scaleY(0)"
                        : "scaleY(1)",
                      transition:
                        "transform 1.8s cubic-bezier(0.8, 0, 0.2, 1) 0.1s",
                    }}
                  />
                </div>

                <div className="pl-8 border-l border-white/10 group-hover:border-[#FFEA98] transition-colors duration-700 delay-100">
                  <h3
                    className="text-3xl lg:text-5xl font-medium mb-6 text-white group-hover:text-[#FFEA98] transition-colors duration-500 tracking-tight"
                    onMouseEnter={cursorEnterText}
                    onMouseLeave={cursorLeave}
                  >
                    {section.title}
                  </h3>
                  <p className="text-gray-400 text-xl leading-relaxed font-light mt-4">
                    {section.content}
                  </p>
                </div>
              </motion.article>
            ))}

            <div className="pt-24 mt-16 border-t border-white/10 flex justify-between text-sm text-gray-500 font-medium tracking-widest uppercase">
              <span>© 2026 AI MLN131</span>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="hover:text-white transition-colors cursor-none bg-transparent border-0 p-0"
                onMouseEnter={cursorEnterText}
                onMouseLeave={cursorLeave}
              >
                QUAY LẠI TRANG CHỦ
              </button>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
};

export default PartyInfo;
