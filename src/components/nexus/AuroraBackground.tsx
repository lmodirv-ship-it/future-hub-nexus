export function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="aurora" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, oklch(0.65 0.25 290 / 0.25), transparent 50%), radial-gradient(ellipse at 80% 90%, oklch(0.85 0.18 200 / 0.2), transparent 50%), radial-gradient(ellipse at 50% 50%, oklch(0.7 0.28 330 / 0.12), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, oklch(0.08 0.02 280 / 0.4) 100%)",
        }}
      />
    </div>
  );
}