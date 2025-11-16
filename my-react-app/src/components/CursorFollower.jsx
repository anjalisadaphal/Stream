import { useEffect, useRef } from "react";

export function CursorFollower() {
  const cursorRef = useRef(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      isVisibleRef.current = true;
      if (cursor) {
        cursor.style.opacity = "0.6";
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      if (cursor) {
        cursor.style.opacity = "0";
      }
    };

    const animateCursor = () => {
      // Smooth interpolation
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;

      if (cursor) {
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
      }

      requestAnimationFrame(animateCursor);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    animateCursor();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] w-32 h-32 rounded-full bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 blur-2xl transition-opacity duration-500"
      style={{
        transform: "translate(-50%, -50%)",
        willChange: "transform",
        opacity: 0,
        left: "-100px",
        top: "-100px",
      }}
    />
  );
}

