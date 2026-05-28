import React from "react";

interface Props {
  strips: number;
  pins?: string;
}

export const LedVisualizer: React.FC<Props> = ({ strips, pins = "" }) => {
  const pinArray = pins ? pins.split(",").map(p => p.trim()) : [];

  const getStripInfo = (index: number) => {
    // index is 0..strips-1
    // The user wants Right: 1, 3, 5; Left: 2, 4, 6
    // Which means:
    // Right: 0, 2, 4 -> mapped to strips 1, 3, 5 (1-based)
    // Left: 1, 3, 5 -> mapped to strips 2, 4, 6 (1-based)
    
    // User order: Strip 1 (Right), Strip 2 (Left), Strip 3 (Right), Strip 4 (Left), Strip 5 (Right), Strip 6 (Left)
    // If strips = 3:
    // Right: 1, 3
    // Left: 2
    
    const isRight = index % 2 === 0;
    const pos = Math.floor(index / 2); // 0, 1, 2 for top, mid, bot
    
    return {
      side: isRight ? "right" : "left",
      pos,
      stripNumber: index + 1,
      pin: pinArray[index] || "-"
    };
  };

  return (
    <div className="w-full h-48 bg-slate-950/50 rounded-2xl border border-slate-800 relative flex items-center justify-center p-4">
      <svg viewBox="0 0 400 150" className="w-full h-full">
        {/* Central Base */}
        <circle cx="200" cy="75" r="25" fill="black" />
        
        {/* Horizontal Arms */}
        <rect x="225" y="65" width="150" height="20" fill="#d97706" rx="4" />
        <rect x="25" y="65" width="150" height="20" fill="#06b6d4" rx="4" />
        
        {/* Labels */}
        <text x="300" y="50" fill="white" className="text-xl font-bold" textAnchor="middle">ימין</text>
        <text x="100" y="50" fill="white" className="text-xl font-bold" textAnchor="middle">שמאל</text>
        
        {/* Strips */}
        {Array.from({ length: Math.ceil(Math.min(strips, 6) / 2) * 2 }).map((_, i) => {
          if (i >= strips) return null;
          const info = getStripInfo(i);
          const isRight = info.side === "right";
          
          // Stacking positions
          // Right strips: 1, 3, 5 -> pos 0, 1, 2
          // Left strips: 2, 4, 6 -> pos 0, 1, 2
          // Each arm is horizontal rect from y=65 to y=85 (height 20).
          // Stacking 3 strips vertically inside height 20.
          // Let's place them at y=66, 71.5, 77.
          
          const yPos = 66 + (info.pos * 5); 
          
          return (
            <g key={i}>
              <rect 
                x={isRight ? 225 + 5 : 25 + 5}
                y={yPos}
                width="140"
                height="4"
                fill="white"
                rx="1"
              />
              <text
                x={isRight ? 225 + 75 : 25 + 75}
                y={yPos + 3}
                fill="black"
                className="text-[4px] font-bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                Strip {info.stripNumber}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
