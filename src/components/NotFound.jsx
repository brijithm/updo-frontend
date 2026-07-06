import { useEffect, useRef, useState, useCallback } from "react";

const MIN_DIST = 14;    // px between recorded points — also interpolated on fast swipes
const MAX_POINTS = 60;  // hard cap, safety net
const GROW_MS = 120;    // time to reach full size
const HOLD_MS = 250;    // time held at full size
const SHRINK_MS = 500;  // time to shrink to 0 and get removed
const POINT_R = 26;     // base radius of a drawn blob

export default function NotFound() {
  const mainContainerRef = useRef(null);
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const pointsRef = useRef([]);      // mutable — read during render, mutated in handlers/rAF
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const rafRef = useRef(null);

  const [, forceRender] = useState(0);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // rAF loop: ages out + prunes points every frame, then triggers a re-render
  useEffect(() => {
    const tick = (t) => {
      const pts = pointsRef.current;
      if (pts.length) {
        pointsRef.current = pts.filter(
          (p) => t - p.spawnTime < GROW_MS + HOLD_MS + SHRINK_MS
        );
      }
      forceRender((n) => n + 1);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const pushPoint = (x, y) => {
    const next = [
      ...pointsRef.current,
      { id: `${performance.now()}-${Math.random()}`, x, y, spawnTime: performance.now() },
    ];
    pointsRef.current = next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
  };

  const addPoint = useCallback((x, y) => {
    const last = lastPointRef.current;
    if (last) {
      const dx = x - last.x;
      const dy = y - last.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MIN_DIST) return;
      // interpolate so a fast swipe doesn't leave gaps in the trail
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
    forceRender((n) => n + 1);
  };

  const radiusFor = (spawnTime) => {
    const age = performance.now() - spawnTime;
    if (age < GROW_MS) return POINT_R * (age / GROW_MS);
    if (age < GROW_MS + HOLD_MS) return POINT_R;
    const shrinkAge = age - GROW_MS - HOLD_MS;
    return Math.max(0, POINT_R * (1 - shrinkAge / SHRINK_MS));
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
            <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>

            <filter id="glow-404" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
            </filter>
          </defs>

          {/* Glow layer — behind everything */}
          <text
            x={w / 2} y={titleY}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={fontSize} fontWeight="800"
            fill="#F5F7FA" fillOpacity="0.55"
            filter="url(#glow-404)"
          >
            404
          </text>

          {/* Interactive 404 + drawn shapes — share one gooey filter */}
          <g filter="url(#gooey-filter)">
            <text
              x={w / 2} y={titleY}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={fontSize} fontWeight="800"
              fill="#F5F7FA" stroke="black" strokeWidth="3"
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
        
        <a  href="/"
          className="px-6 py-3 rounded-full border border-[#D0BCFF]/40 font-semibold tracking-wide text-sm"
          style={{ color: "#D0BCFF" }}
        >
          GO TO HOME
        </a>
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