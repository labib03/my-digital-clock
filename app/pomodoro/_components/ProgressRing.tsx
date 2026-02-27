// ─── ProgressRing ─────────────────────────────────────────────────────────────

interface ProgressRingProps {
    pct: number;
    color: string;
}

export default function ProgressRing({ pct, color }: ProgressRingProps) {
    const r = 120;
    const circ = 2 * Math.PI * r;
    return (
        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r={r} fill="none" strokeWidth="6" stroke="currentColor" className="text-white/10" />
            <circle cx="140" cy="140" r={r} fill="none" strokeWidth="6"
                stroke={color} strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct)}
                style={{ transition: "stroke-dashoffset 0.9s linear" }}
            />
        </svg>
    );
}
