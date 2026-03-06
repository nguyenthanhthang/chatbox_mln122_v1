import { useEffect, useRef, useState } from "react";

/**
 * Hook hiệu ứng scroll reveal - trượt lên khi element vào viewport,
 * trượt xuống khi scroll lên (element ra khỏi viewport phía trên).
 */
export function useScrollReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const wasVisibleRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          wasVisibleRef.current = true;
        } else {
          const rect = entry.boundingClientRect;
          if (wasVisibleRef.current && rect.bottom < 0) {
            setIsVisible(false);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );

    const handleScroll = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (wasVisibleRef.current && rect.bottom < -80) {
        setIsVisible(false);
      }
    };

    observer.observe(el);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return { ref, isVisible };
}
