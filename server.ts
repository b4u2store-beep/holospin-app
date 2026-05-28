import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock API routes to mimic ESP32
  app.post("/config", (req, res) => {
    console.log("Received config:", req.body);
    res.json({ status: "ok" });
  });

  let deviceStatus = "ready";
  let calibrationTimeout: NodeJS.Timeout | null = null;

  app.post("/reset", (req, res) => {
    console.log("Resetting device");
    deviceStatus = "ready";
    res.json({ status: "ok" });
  });

  app.post("/calibrate", (req, res) => {
    console.log("Calibrating device");
    deviceStatus = "calibrating";
    if (calibrationTimeout) {
      clearTimeout(calibrationTimeout);
    }
    calibrationTimeout = setTimeout(() => {
      deviceStatus = "ready";
      console.log("Calibration complete on backend");
    }, 4500); // 4.5 seconds of simulated calibration time
    res.json({ status: "calibrating" });
  });

  app.get("/status", (req, res) => {
    // Generate fluctuating dummy values
    const baseVoltage = 3.7;
    const baseTemp = 42;
    const voltage = baseVoltage + (Math.random() * 0.2 - 0.1);
    const temperature = baseTemp + (Math.random() * 2 - 1);
    const pulse1 = 150 + Math.floor(Math.random() * 10 - 5);
    const pulse2 = 155 + Math.floor(Math.random() * 10 - 5);
    const pulse3 = 148 + Math.floor(Math.random() * 10 - 5);

    res.json({
        pulses: [pulse1, pulse2, pulse3],
        pattern: "Spiral Wave",
        voltage: voltage,
        temperature: temperature,
        status: deviceStatus
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical server startup failure:", err);
  process.exit(1);
});
