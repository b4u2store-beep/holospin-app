import React from "react";
import { Esp32Board } from "./Esp32Board";

interface Props {
  pins: string;
}

export const WiringGuide: React.FC<Props> = ({ pins }) => {
  const pinArray = pins.split(",").map(p => p.trim());
  
  const dynamicConnections = pinArray.map((pin, i) => ({
    component: `LED Strip ${String.fromCharCode(65 + i)}`,
    pin: `GPIO ${pin}`
  }));

  const staticConnections = [
    { component: "Hall Sensor", pin: "GPIO 4" },
    { component: "Motor Control", pin: "GPIO 17" },
    { component: "SD Card MOSI", pin: "GPIO 23" },
    { component: "SD Card MISO", pin: "GPIO 19" },
    { component: "SD Card SCK", pin: "GPIO 18" },
    { component: "SD Card CS", pin: "GPIO 5" },
  ];

  const allConnections = [...dynamicConnections, ...staticConnections];

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg mx-auto">
      <h3 className="text-lg font-bold text-white mb-4">Wiring Diagram (ESP32)</h3>
      
      <div className="mb-6">
        <Esp32Board activePins={allConnections.map(c => c.pin.replace("GPIO ", ""))} />
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm text-purple-400 font-bold mb-2">LED Pinout Map</h4>
          <div className="space-y-2">
            {dynamicConnections.map((conn) => (
              <div key={conn.component} className="flex justify-between items-center bg-slate-950 p-2 px-3 rounded-lg border border-purple-900/30">
                <span className="text-slate-300 font-mono text-xs">{conn.component}</span>
                <span className="text-purple-400 font-bold font-mono text-sm">{conn.pin}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm text-slate-400 font-bold mb-2">System Pinout</h4>
          <div className="space-y-2">
            {staticConnections.map((conn) => (
              <div key={conn.component} className="flex justify-between items-center bg-slate-950 p-2 px-3 rounded-lg border border-slate-800">
                <span className="text-slate-300 font-mono text-xs">{conn.component}</span>
                <span className="text-slate-500 font-bold font-mono text-sm">{conn.pin}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <p className="text-xs text-slate-500 mt-4 leading-relaxed">
        Note: Ensure common ground (GND) is connected between all power sources 
        (Motor supply, LED supply, and ESP32).
      </p>
    </div>
  );
};
