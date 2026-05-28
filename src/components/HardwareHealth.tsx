import React, { useEffect, useState } from "react";
import { Activity, Cpu, Lightbulb, RotateCcw } from "lucide-react";

export function HardwareHealth({ esp32Ip }: { esp32Ip: string }) {
  const [healthData, setHealthData] = useState<any>(null);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    if (!isPolling) return;

    const fetchHealth = async () => {
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000);
        const urlBase = esp32Ip ? (esp32Ip.startsWith('http') ? esp32Ip : `http://${esp32Ip}`) : "";
        const url = urlBase ? `${urlBase}/api/diagnostic` : "/api/diagnostic";
        
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        if (res.ok) {
          const data = await res.json();
          setHealthData(data);
        }
      } catch (err) {
        // Silent fail on polling to avoid jitter
        setHealthData(null);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 3000);
    return () => clearInterval(interval);
  }, [isPolling]);

  const getActivityColor = (status: string) => {
    switch (status) {
      case "ok":
      case "healthy": return "text-emerald-400";
      case "warning": return "text-amber-400";
      case "error": return "text-red-500";
      default: return "text-slate-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ok":
      case "healthy": return "OK";
      case "warning": return "WARN";
      case "error": return "ERR";
      default: return "N/A";
    }
  };

  const hallStatus = healthData?.sensor?.status || "unknown";
  const ledStatus = healthData?.leds?.status || "unknown";
  const motorStatus = healthData?.motor?.status || "unknown";

  return (
    <div className="w-full bg-[#050608] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#a855f7]" />
          Real-Time Health
        </h4>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${healthData ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-600'} animate-pulse`} />
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">{healthData ? 'Live' : 'Waiting'}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {/* Hall Sensor */}
        <div className="bg-[#0b0d14] rounded-xl p-3 border border-slate-800/80 flex flex-col items-center justify-center gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1">
             <div className={`w-1.5 h-1.5 rounded-full ${hallStatus === 'ok' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-slate-600'}`}></div>
          </div>
          <Activity className={`w-6 h-6 ${getActivityColor(hallStatus)}`} />
          <div className="text-center">
            <div className="text-[10px] font-bold text-white uppercase tracking-widest">Hall Sensor</div>
            <div className={`text-[9px] font-mono mt-0.5 ${getActivityColor(hallStatus)}`}>{getStatusText(hallStatus)}</div>
          </div>
        </div>

        {/* Leds */}
        <div className="bg-[#0b0d14] rounded-xl p-3 border border-slate-800/80 flex flex-col items-center justify-center gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1">
             <div className={`w-1.5 h-1.5 rounded-full ${ledStatus === 'healthy' || ledStatus === 'ok' ? 'bg-[#00b4d8] shadow-[0_0_5px_#00b4d8]' : 'bg-slate-600'}`}></div>
          </div>
          <Lightbulb className={`w-6 h-6 ${getActivityColor(ledStatus)}`} />
          <div className="text-center">
            <div className="text-[10px] font-bold text-white uppercase tracking-widest">LED Strip</div>
            <div className={`text-[9px] font-mono mt-0.5 ${getActivityColor(ledStatus)}`}>{getStatusText(ledStatus)}</div>
          </div>
        </div>

        {/* Motor */}
        <div className="bg-[#0b0d14] rounded-xl p-3 border border-slate-800/80 flex flex-col items-center justify-center gap-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-1">
             <div className={`w-1.5 h-1.5 rounded-full ${motorStatus === 'ok' ? 'bg-[#a855f7] shadow-[0_0_5px_#a855f7]' : 'bg-slate-600'}`}></div>
          </div>
          <RotateCcw className={`w-6 h-6 ${getActivityColor(motorStatus)}`} />
          <div className="text-center">
            <div className="text-[10px] font-bold text-white uppercase tracking-widest">Motor</div>
            <div className={`text-[9px] font-mono mt-0.5 ${getActivityColor(motorStatus)}`}>{getStatusText(motorStatus)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
