import React, { useState } from "react";

interface PinDef {
  pcb: string;
  gpio: string;
  labelHe: string;
  labelEn: string;
  type: "power" | "gnd" | "gpio" | "led" | "sensor" | "motor" | "sd" | "control";
}

interface Props {
  activePins: string[];
}

export const Esp32Board: React.FC<Props> = ({ activePins }) => {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  const leftPins: PinDef[] = [
    { pcb: "3V3", gpio: "3.3V", labelHe: "מתח 3.3V", labelEn: "3.3V Power Out", type: "power" },
    { pcb: "EN", gpio: "EN", labelHe: "פין איפוס / EN", labelEn: "Enable / Reset", type: "control" },
    { pcb: "VP", gpio: "GPIO36", labelHe: "חיישן כניסה VP", labelEn: "GPI36 / SENSOR_VP", type: "gpio" },
    { pcb: "VN", gpio: "GPIO39", labelHe: "חיישן כניסה VN", labelEn: "GPI39 / SENSOR_VN", type: "gpio" },
    { pcb: "34", gpio: "GPIO34", labelHe: "פין כניסה GPI34", labelEn: "GPI34", type: "gpio" },
    { pcb: "35", gpio: "GPIO35", labelHe: "פין כניסה GPI35", labelEn: "GPI35", type: "gpio" },
    { pcb: "32", gpio: "GPIO32", labelHe: "פין דיגיטלי 32", labelEn: "GPIO32", type: "gpio" },
    { pcb: "33", gpio: "GPIO33", labelHe: "פין דיגיטלי 33", labelEn: "GPIO33", type: "gpio" },
    { pcb: "25", gpio: "GPIO25", labelHe: "פס לדים א' (LED A)", labelEn: "LED Strip A Out", type: "led" },
    { pcb: "26", gpio: "GPIO26", labelHe: "פס לדים ב' (LED B)", labelEn: "LED Strip B Out", type: "led" },
    { pcb: "27", gpio: "GPIO27", labelHe: "פין דיגיטלי 27", labelEn: "GPIO27", type: "gpio" },
    { pcb: "14", gpio: "GPIO14", labelHe: "פין דיגיטלי 14", labelEn: "GPIO14", type: "gpio" },
    { pcb: "12", gpio: "GPIO12", labelHe: "פין דיגיטלי 12", labelEn: "GPIO12", type: "gpio" },
    { pcb: "GND", gpio: "GND", labelHe: "אדמה (GND)", labelEn: "Ground", type: "gnd" },
    { pcb: "13", gpio: "GPIO13", labelHe: "פין דיגיטלי 13", labelEn: "GPIO13", type: "gpio" },
    { pcb: "D2", gpio: "GPIO9", labelHe: "פלאש פנימי D2", labelEn: "GPIO9 / SD2", type: "gpio" },
    { pcb: "D3", gpio: "GPIO10", labelHe: "פלאש פנימי D3", labelEn: "GPIO10 / SD3", type: "gpio" },
    { pcb: "CMD", gpio: "GPIO11", labelHe: "פלאש פנימי CMD", labelEn: "GPIO11 / CMD", type: "gpio" },
    { pcb: "5V", gpio: "5V0", labelHe: "מהזנת מתח 5V", labelEn: "5V Power Input", type: "power" }
  ];

  const rightPins: PinDef[] = [
    { pcb: "GND", gpio: "GND", labelHe: "אדמה (GND)", labelEn: "Ground", type: "gnd" },
    { pcb: "23", gpio: "GPIO23", labelHe: "כרטיס SD SPI MOSI", labelEn: "SD MOSI (GPIO23)", type: "sd" },
    { pcb: "22", gpio: "GPIO22", labelHe: "פין דיגיטלי 22", labelEn: "GPIO22", type: "gpio" },
    { pcb: "TX", gpio: "GPIO1", labelHe: "תקשורת טורית TX", labelEn: "UART TXD0 (GPIO1)", type: "gpio" },
    { pcb: "RX", gpio: "GPIO3", labelHe: "תקשורת טורית RX", labelEn: "UART RXD0 (GPIO3)", type: "gpio" },
    { pcb: "21", gpio: "GPIO21", labelHe: "פין דיגיטלי 21", labelEn: "GPIO21", type: "gpio" },
    { pcb: "GND", gpio: "GND", labelHe: "אדמה (GND)", labelEn: "Ground", type: "gnd" },
    { pcb: "19", gpio: "GPIO19", labelHe: "כרטיס SD SPI MISO", labelEn: "SD MISO (GPIO19)", type: "sd" },
    { pcb: "18", gpio: "GPIO18", labelHe: "כרטיס SD SPI SCK", labelEn: "SD SCK (GPIO18)", type: "sd" },
    { pcb: "5", gpio: "GPIO5", labelHe: "כרטיס SD SPI CS", labelEn: "SD CS (GPIO5)", type: "sd" },
    { pcb: "17", gpio: "GPIO17", labelHe: "בקרת מנוע PWM", labelEn: "Motor Control (GPIO17)", type: "motor" },
    { pcb: "16", gpio: "GPIO16", labelHe: "פין דיגיטלי 16", labelEn: "GPIO16", type: "gpio" },
    { pcb: "4", gpio: "GPIO4", labelHe: "חיישן היכל (Hall)", labelEn: "Hall Sensor (GPIO4)", type: "sensor" },
    { pcb: "0", gpio: "GPIO0", labelHe: "פין בוט (Boot/GPIO0)", labelEn: "Boot Select (GPIO0)", type: "gpio" },
    { pcb: "2", gpio: "GPIO2", labelHe: "לד מובנה / GPIO2", labelEn: "Onboard LED (GPIO2)", type: "gpio" },
    { pcb: "15", gpio: "GPIO15", labelHe: "פין דיגיטלי 15", labelEn: "GPIO15", type: "gpio" },
    { pcb: "D1", gpio: "GPIO8", labelHe: "פלאש פנימי D1", labelEn: "GPIO8 / SD1", type: "gpio" },
    { pcb: "D0", gpio: "GPIO7", labelHe: "פלאש פנימי D0", labelEn: "GPIO7 / SD0", type: "gpio" },
    { pcb: "CLK", gpio: "GPIO6", labelHe: "פלאש פנימי CLK", labelEn: "GPIO6 / CLK", type: "gpio" }
  ];

  // Check if a pin is active based on the app state (e.g. 25, 26, 4, 17, 23, 19, 18, 5)
  const isPinActive = (pin: PinDef) => {
    const rawNumber = pin.gpio.replace("GPIO", "");
    return (
      activePins.includes(rawNumber) ||
      activePins.includes(pin.pcb) ||
      (pin.pcb === "5V" && activePins.includes("5V")) ||
      (pin.pcb === "3V3" && activePins.includes("3.3V"))
    );
  };

  const getPinColorClass = (pin: PinDef) => {
    if (pin.type === "power") return "bg-red-600 text-white border-red-500";
    if (pin.type === "gnd") return "bg-black text-white border-slate-700";
    if (pin.type === "control") return "bg-amber-600 text-white border-amber-500";
    if (isPinActive(pin)) return "bg-purple-600 text-white border-purple-400 font-bold shadow-lg shadow-purple-500/30 animate-pulse";
    return "bg-green-600/90 text-white border-green-500";
  };

  return (
    <div className="w-full bg-[#0b0e14] border border-slate-800/80 rounded-2xl p-4 sm:p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 border-b border-slate-800 pb-4">
        <div>
          <h4 className="text-md sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            מיפוי חיבורים אינטראקטיבי (ESP32)
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            הזז את העכבר או לחץ על הפינים כדי לראות את תיאור החיבור המורחב בעברית.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-950/40 text-red-400 border border-red-950">
            <span className="w-2 h-2 rounded-full bg-red-600"></span> מתח 5V/3.3V
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-950/40 text-purple-400 border border-purple-900/40">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span> בשימוש פעיל
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-950/40 text-green-400 border border-green-950">
            <span className="w-2 h-2 rounded-full bg-green-600"></span> GPIO חופשי
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-black border border-slate-600"></span> GND
          </span>
        </div>
      </div>

      {/* SVG ESP32 Board Container */}
      <div className="relative overflow-x-auto w-full flex justify-center py-2">
        <svg
          viewBox="0 0 740 920"
          className="w-full max-w-[620px] h-auto select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Card background grid pattern */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff04" strokeWidth="1" />
            </pattern>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="#0a0c10" rx="16" />
          <rect width="100%" height="100%" fill="url(#grid)" rx="16" />

          {/* MAIN ESP32 PCB BOARD */}
          {/* Outer edge of PCB */}
          <rect x="230" y="80" width="280" height="740" rx="12" fill="#18181c" stroke="#2d2d34" strokeWidth="6" />
          {/* Inner routing lines detail */}
          <path d="M 240,180 L 240,780 M 500,180 L 500,780" stroke="#ffd7001c" strokeWidth="1.5" strokeDasharray="5,15" />
          <rect x="250" y="320" width="240" height="420" rx="8" fill="#1b1c22" stroke="#25262c" strokeWidth="3" />

          {/* ESP32 WROOM METAL SHIELD INTEGRATED MODULE */}
          <rect x="260" y="110" width="220" height="230" rx="8" fill="#b0b3b8" stroke="#8d9095" strokeWidth="2" />
          {/* Antenna Serpentine Track (Black part at top of module) */}
          <rect x="260" y="80" width="220" height="50" rx="4" fill="#040404" />
          <path d="M 280,105 L 280,90 L 300,90 L 300,105 L 320,105 L 320,90 L 340,90 L 340,105 L 360,105 L 360,90 L 380,90 L 380,105 L 400,105 L 400,90 L 420,90 L 420,105 L 440,105 L 440,90 L 460,90" fill="none" stroke="#7d7301" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* metal shield labels */}
          <text x="370" y="185" fill="#303133" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="1">ESPRESSIF</text>
          <text x="370" y="225" fill="#4a4b4f" fontSize="20" fontWeight="bold" textAnchor="middle" letterSpacing="0.5">ESP32-WROOM-32D</text>
          <text x="370" y="255" fill="#5c5e63" fontSize="11" fontStyle="italic" textAnchor="middle">FCC ID: 2AC7Z-ESPWR32</text>
          <rect x="275" y="275" width="190" height="52" rx="4" fill="#1e2025" opacity="0.1" />
          
          {/* Gold solder pads under the shield */}
          {[...Array(12)].map((_, i) => (
            <rect key={i} x={268 + i * 16} y={328} width="10" height="12" fill="#d3b03b" rx="1" />
          ))}

          {/* CP2102 INTERFACE CHIP */}
          <rect x="335" y="470" width="70" height="70" rx="4" fill="#202024" stroke="#403f44" strokeWidth="2" />
          <circle cx="345" cy="480" r="4" fill="#555" />
          <text x="370" y="512" fill="#5c5e63" fontSize="10" fontFamily="monospace" textAnchor="middle">SILICON</text>
          <text x="370" y="524" fill="#5c5e63" fontSize="10" fontFamily="monospace" textAnchor="middle">CP2102</text>
          {/* Chip pins */}
          {[...Array(6)].map((_, i) => (
            <g key={i}>
              <line x1="326" y1={478 + i * 10} x2="335" y2={478 + i * 10} stroke="#8a8d94" strokeWidth="2" />
              <line x1="405" y1={478 + i * 10} x2="414" y2={478 + i * 10} stroke="#8a8d94" strokeWidth="2" />
            </g>
          ))}

          {/* AUTO-RESET/TACTILE BUTTONS (EN and BOOT) */}
          {/* EN Button Left */}
          <rect x="260" y="715" width="45" height="55" rx="6" fill="#323336" stroke="#525357" strokeWidth="2" />
          <rect x="270" y="725" width="25" height="35" rx="3" fill="#101011" />
          <text x="282" y="700" fill="#a0a4b0" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">EN</text>
          
          {/* BOOT Button Right */}
          <rect x="435" y="715" width="45" height="55" rx="6" fill="#323336" stroke="#525357" strokeWidth="2" />
          <rect x="445" y="725" width="25" height="35" rx="3" fill="#101011" />
          <text x="458" y="700" fill="#a0a4b0" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">BOOT</text>

          {/* MICRO USB CONNECTOR AT BOTTOM */}
          <path d="M 330,780 L 410,780 L 400,830 L 340,830 Z" fill="#8d9199" stroke="#5c5e63" strokeWidth="3" />
          <rect x="345" y="810" width="50" height="15" rx="2" fill="#202022" />
          {/* Solder mounting tags */}
          <rect x="323" y="788" width="10" height="20" rx="1" fill="#c3c6cc" />
          <rect x="407" y="788" width="10" height="20" rx="1" fill="#c3c6cc" />

          {/* LEFT HEADER COLUMN & PINOUTS (19 pins) */}
          {leftPins.map((pin, index) => {
            const yPos = 160 + index * 32;
            const active = isPinActive(pin);
            const isHovered = hoveredPin === `left-${index}`;
            const pinColor = getPinColorClass(pin);

            return (
              <g
                key={`left-${index}`}
                onMouseEnter={() => setHoveredPin(`left-${index}`)}
                onMouseLeave={() => setHoveredPin(null)}
                className="cursor-pointer transition-all duration-200"
              >
                {/* Visual Connector Wires (Zig-zag line to left labels) */}
                <path
                  d={`M 245,${yPos} L 210,${yPos} L 180,${yPos}`}
                  fill="none"
                  stroke={active ? "#a855f7" : isHovered ? "#3b82f6" : "#475569"}
                  strokeWidth={active || isHovered ? "2.5" : "1.2"}
                  strokeDasharray={active ? "none" : "none"}
                  filter={active ? "url(#glow)" : "none"}
                  className="transition-all"
                />

                {/* Left Pin Header Hole on PCB (Gold Outer, Dark Inner) */}
                <circle
                  cx="245"
                  cy={yPos}
                  r="7"
                  fill="#ffd700"
                  stroke={active ? "#a855f7" : "#000"}
                  strokeWidth="2.5"
                  className={active ? "animate-pulse" : ""}
                />
                <circle cx="245" cy={yPos} r="3.5" fill="#1e2025" />

                {/* Silk print label on PCB board */}
                <text
                  x="262"
                  y={yPos + 4}
                  fill={active ? "#f3e8ff" : "#cbd5e1"}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight={active ? "bold" : "normal"}
                  textAnchor="start"
                >
                  {pin.pcb}
                </text>

                {/* Outer Wire Bubble Label (Left) */}
                <g transform={`translate(10, ${yPos - 12})`}>
                  <rect
                    x="0"
                    y="0"
                    width="155"
                    height="24"
                    rx="5"
                    fill={active ? "#1e113a" : isHovered ? "#1e293b" : "#11141b"}
                    stroke={active ? "#a855f7" : isHovered ? "#3b82f6" : "#334155"}
                    strokeWidth={active || isHovered ? "2" : "1"}
                  />
                  {/* Pin Circle Indicator Inside Label */}
                  <rect
                    x="4"
                    y="4"
                    width="44"
                    height="16"
                    rx="3"
                    fill={pin.type === "power" ? "#b91c1c" : pin.type === "gnd" ? "#000000" : pin.type === "control" ? "#b45309" : active ? "#a855f7" : "#15803d"}
                  />
                  <text
                    x="26"
                    y="15"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {pin.gpio}
                  </text>
                  {/* Function Description Text */}
                  <text
                    x="150"
                    y="15"
                    fill={active ? "#e9d5ff" : "#94a3b8"}
                    fontSize="9.5"
                    fontWeight={active ? "600" : "400"}
                    textAnchor="end"
                    fontFamily="sans-serif"
                  >
                    {pin.labelHe}
                  </text>
                </g>

                {/* Extended Details Tooltip on Hover */}
                {isHovered && (
                  <g transform="translate(60, 480)">
                    <rect x="0" y="0" width="180" height="52" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))" />
                    <text x="10" y="20" fill="#ffffff" fontSize="11" fontWeight="bold">{pin.gpio} ({pin.pcb})</text>
                    <text x="10" y="38" fill="#94a3b8" fontSize="10">{pin.labelEn}</text>
                  </g>
                )}
              </g>
            );
          })}

          {/* RIGHT HEADER COLUMN & PINOUTS (19 pins) */}
          {rightPins.map((pin, index) => {
            const yPos = 160 + index * 32;
            const active = isPinActive(pin);
            const isHovered = hoveredPin === `right-${index}`;
            const pinColor = getPinColorClass(pin);

            return (
              <g
                key={`right-${index}`}
                onMouseEnter={() => setHoveredPin(`right-${index}`)}
                onMouseLeave={() => setHoveredPin(null)}
                className="cursor-pointer transition-all duration-200"
              >
                {/* Visual Connector Wires (Zig-zag line to right labels) */}
                <path
                  d={`M 495,${yPos} L 530,${yPos} L 560,${yPos}`}
                  fill="none"
                  stroke={active ? "#a855f7" : isHovered ? "#3b82f6" : "#475569"}
                  strokeWidth={active || isHovered ? "2.5" : "1.2"}
                  filter={active ? "url(#glow)" : "none"}
                  className="transition-all"
                />

                {/* Right Pin Header Hole on PCB (Gold Outer, Dark Inner) */}
                <circle
                  cx="495"
                  cy={yPos}
                  r="7"
                  fill="#ffd700"
                  stroke={active ? "#a855f7" : "#000"}
                  strokeWidth="2.5"
                  className={active ? "animate-pulse" : ""}
                />
                <circle cx="495" cy={yPos} r="3.5" fill="#1e2025" />

                {/* Silk print label on PCB board */}
                <text
                  x="478"
                  y={yPos + 4}
                  fill={active ? "#f3e8ff" : "#cbd5e1"}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight={active ? "bold" : "normal"}
                  textAnchor="end"
                >
                  {pin.pcb}
                </text>

                {/* Outer Wire Bubble Label (Right) */}
                <g transform={`translate(565, ${yPos - 12})`}>
                  <rect
                    x="0"
                    y="0"
                    width="155"
                    height="24"
                    rx="5"
                    fill={active ? "#1e113a" : isHovered ? "#1e293b" : "#11141b"}
                    stroke={active ? "#a855f7" : isHovered ? "#3b82f6" : "#334155"}
                    strokeWidth={active || isHovered ? "2" : "1"}
                  />
                  {/* Pin Circle Indicator Inside Label */}
                  <rect
                    x="4"
                    y="4"
                    width="44"
                    height="16"
                    rx="3"
                    fill={pin.type === "power" ? "#b91c1c" : pin.type === "gnd" ? "#000000" : active ? "#a855f7" : pin.type === "sd" ? "#2563eb" : pin.type === "sensor" ? "#d97706" : pin.type === "motor" ? "#7c3aed" : "#15803d"}
                  />
                  <text
                    x="26"
                    y="15"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {pin.gpio}
                  </text>
                  {/* Function Description Text */}
                  <text
                    x="150"
                    y="15"
                    fill={active ? "#e9d5ff" : "#94a3b8"}
                    fontSize="9.5"
                    fontWeight={active ? "600" : "400"}
                    textAnchor="end"
                    fontFamily="sans-serif"
                  >
                    {pin.labelHe}
                  </text>
                </g>

                {/* Extended Details Tooltip on Hover */}
                {isHovered && (
                  <g transform="translate(480, 480)">
                    <rect x="0" y="0" width="180" height="52" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))" />
                    <text x="10" y="20" fill="#ffffff" fontSize="11" fontWeight="bold">{pin.gpio} ({pin.pcb})</text>
                    <text x="10" y="38" fill="#94a3b8" fontSize="10">{pin.labelEn}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered pin dynamic description detail panel */}
      <div className="bg-[#0e1117] border border-slate-800 p-4 rounded-xl mt-4">
        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">מידע מפורט על הרכיבים המחוברים:</h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="bg-slate-950/50 p-2.5 rounded border border-slate-900">
            <span className="text-purple-400 font-bold font-mono">GPIO 25, 26</span>
            <p className="mt-1 text-slate-300">יציאות מידע עבור פסי הלדים. דואגות לשלוח פולסים מהירים עם אותות הצבע ללדים.</p>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded border border-slate-900">
            <span className="text-amber-500 font-bold font-mono">GPIO 4</span>
            <p className="mt-1 text-slate-300">חיישן אפקט הול (Hall Sensor). מזהה מעבר של מגנט קבוע לחישוב מהירות וזווית המאוורר.</p>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded border border-slate-900">
            <span className="text-indigo-400 font-bold font-mono">GPIO 17</span>
            <p className="mt-1 text-slate-300">בקרת מנוע (PWM). קובע את מהירות הסיבוב של מאוורר ההולוגרמה.</p>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded border border-slate-900">
            <span className="text-blue-400 font-bold font-mono">GPIO 5, 18, 19, 23</span>
            <p className="mt-1 text-slate-300">חיבור כרטיס זיכרון MicroSD (פרוטוקול SPI). משמש לטעינת אנימציות הולוגרמיות בזמן אמת.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
