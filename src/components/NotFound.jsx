import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const MIN_DIST = 14;     // px between recorded points — also interpolated on fast swipes
const MAX_POINTS = 800;  // safety net only — normal drawing sessions won't come close
const GROW_MS = 160;     // time for a new paint spot to pop to full size (then stays forever)
const POINT_R = 26;      // base radius of a drawn blob

export default function NotFound() {
  const mainContainerRef = useRef(null);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const pointsRef = useRef([]);   // mutable — read during render, mutated in handlers/rAF
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const rafRef = useRef(null);
  const navigate = useNavigate();

  const [, forceRender] = useState(0);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Only runs while at least one point is still in its grow-in animation.
  // Stops itself once everything has settled — idle page burns zero CPU.
  const ensureLoop = useCallback(() => {
    if (rafRef.current) return;
    const tick = (t) => {
      const stillGrowing = pointsRef.current.some((p) => t - p.spawnTime < GROW_MS);
      forceRender((n) => n + 1);
      rafRef.current = stillGrowing ? requestAnimationFrame(tick) : null;
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const pushPoint = (x, y) => {
    const next = [
      ...pointsRef.current,
      { id: `${performance.now()}-${Math.random()}`, x, y, spawnTime: performance.now() },
    ];
    // FIFO trim — only ever triggers on extreme scribbling, not normal use
    pointsRef.current = next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
    ensureLoop();
  };

  const addPoint = useCallback((x, y) => {
    const last = lastPointRef.current;
    if (last) {
      const dx = x - last.x;
      const dy = y - last.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MIN_DIST) return;
      const steps = Math.min(20, Math.floor(dist / MIN_DIST));
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        pushPoint(last.x + dx * t, last.y + dy * t);
      }
    } else {
      pushPoint(x, y);
    }
    lastPointRef.current = { x, y };
  }, []);

  const getLocalPoint = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handlePointerDown = (e) => {
    drawingRef.current = true;
    e.target.setPointerCapture?.(e.pointerId);
    lastPointRef.current = null;
    const { x, y } = getLocalPoint(e);
    addPoint(x, y);
  };

  const handlePointerMove = (e) => {
    if (!drawingRef.current) return;
    const { x, y } = getLocalPoint(e);
    addPoint(x, y);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const clearCanvas = () => {
    pointsRef.current = [];
    lastPointRef.current = null;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    forceRender((n) => n + 1);
  };

  const radiusFor = (spawnTime) => {
    const age = performance.now() - spawnTime;
    return age >= GROW_MS ? POINT_R : POINT_R * (age / GROW_MS);
  };

  // Same auth flag ProtectedRoute checks — logged-in users go to their
  // dashboard, everyone else goes to the public landing page.
  const goHome = () => {
    const isLoggedIn = localStorage.getItem("updo_auth") === "true";
    navigate(isLoggedIn ? "/dashboard" : "/");
  };

  const { w, h } = dims;
  const fontSize = Math.min(w * 0.24, 260);
  const titleY = h * 0.42;
  const subY = titleY + fontSize * 0.55;

  return (
    <div
      ref={mainContainerRef}
      tabIndex={-1}
      className="relative w-full h-screen outline-none overflow-hidden select-none"
      style={{ background: "linear-gradient(to bottom, #000B2E 0%, #091333 100%)" }}
    >
      <div className="absolute inset-0" ref={containerRef}>
        <svg
          ref={svgRef}
          className="w-full h-full touch-none"
          viewBox={`0 0 ${w} ${h}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
        >
          <defs>
            {/* Ink-spread filter: blur + turbulence displacement (organic edges) + threshold merge */}
            <filter id="gooey-filter" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap in="blur" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" result="displaced" />
              <feColorMatrix
                in="displaced"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>

            <filter id="glow-404" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
            </filter>
          </defs>

          {/* Glow layer — behind everything, reduced intensity */}
          <text
            x={w / 2} y={titleY}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize} fontWeight="800"
            fill="#F5F7FA" fillOpacity="0.35"
            filter="url(#glow-404)"
          >
            404
          </text>

          {/* Interactive 404 + drawn ink — share one gooey filter, no crisp border */}
          <g filter="url(#gooey-filter)">
            <text
              x={w / 2} y={titleY}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={fontSize} fontWeight="800"
              fill="#F5F7FA"
            >
              404
            </text>

            {pointsRef.current.map((p) => (
              <circle key={p.id} cx={p.x} cy={p.y} r={radiusFor(p.spawnTime)} fill="#F5F7FA" />
            ))}
          </g>

          {/* NOT FOUND label */}
          <text
            x={w / 2} y={subY}
            textAnchor="middle"
            fontSize={Math.max(18, fontSize * 0.09)}
            letterSpacing="6" fontWeight="600"
            fill="#D0BCFF" fillOpacity="0.9"
            style={{ mixBlendMode: "screen" }}
          >
            NOT FOUND
          </text>
        </svg>
      </div>

      {/* Buttons */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex gap-4"
        style={{ top: `${subY + 48}px`, mixBlendMode: "screen", opacity: 0.8 }}
      >
        <button
          onClick={goHome}
          className="px-6 py-3 rounded-full border border-[#D0BCFF]/40 font-semibold tracking-wide text-sm"
          style={{ color: "#D0BCFF" }}
        >
          GO TO HOME
        </button>
        <button
          onClick={clearCanvas}
          className="px-6 py-3 rounded-full border border-[#D0BCFF]/40 font-semibold tracking-wide text-sm"
          style={{ color: "#D0BCFF" }}
        >
          ↺ RESET
        </button>
      </div>
    </div>
  );
}