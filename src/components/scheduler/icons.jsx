const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const ChevronLeft = () => (
  <svg {...base}><path d="m15 18-6-6 6-6" /></svg>
);
export const ChevronRight = () => (
  <svg {...base}><path d="m9 18 6-6-6-6" /></svg>
);
export const Plus = () => (
  <svg {...base}><path d="M12 5v14M5 12h14" /></svg>
);
export const Close = () => (
  <svg {...base}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const Trash = () => (
  <svg {...base}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
  </svg>
);