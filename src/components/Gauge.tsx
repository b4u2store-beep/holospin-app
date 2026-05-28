import React from 'react';

export function Gauge({ 
    value, 
    min = 0, 
    max = 100, 
    label, 
    unit = '', 
    colorClass = 'text-blue-500' 
}: { 
    value: number; 
    min?: number; 
    max?: number; 
    label: string; 
    unit?: string; 
    colorClass?: string;
}) {
    // Math for half-circle SVG gauge
    const radius = 40;
    const circumference = Math.PI * radius;
    const safeValue = Math.min(Math.max(value, min), max);
    const percent = (safeValue - min) / (max - min);
    const offset = circumference - (percent * circumference);

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-32 h-20 overflow-hidden flex items-end justify-center">
                <svg className="absolute top-0 rotate-180 w-32 h-32" viewBox="0 0 100 100">
                    {/* Background Arc */}
                    <circle 
                        cx="50" cy="50" r={radius} 
                        fill="transparent" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        strokeDasharray={`${circumference} ${circumference}`}
                        className="text-slate-800"
                    />
                    {/* Value Arc */}
                    <circle 
                        cx="50" cy="50" r={radius} 
                        fill="transparent" 
                        stroke="currentColor" 
                        strokeWidth="8" 
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={offset}
                        className={`${colorClass} transition-all duration-500 ease-out`}
                    />
                </svg>
                <div className="absolute flex flex-col items-center bottom-0">
                    <span className="text-2xl font-mono font-bold">{value.toFixed(1)}<span className="text-sm font-sans">{unit}</span></span>
                </div>
            </div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-2">{label}</span>
        </div>
    );
}
