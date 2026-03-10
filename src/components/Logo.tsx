export default function Logo({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: 24,
    md: 32,
    lg: 48,
  };
  
  const s = sizes[size];
  
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="24"
        cy="24"
        r="21.5"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[#e50914]"
      />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        <line x1="11.8942" y1="11.85" x2="17.9471" y2="36.15" />
        <line x1="24" y1="11.85" x2="17.9471" y2="36.15" />
        <line x1="24" y1="11.85" x2="30.0529" y2="36.15" />
        <line x1="36.1058" y1="11.85" x2="30.0529" y2="36.15" />
      </g>
    </svg>
  );
}
