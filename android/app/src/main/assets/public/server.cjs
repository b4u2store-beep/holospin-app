var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/config", (req, res) => {
    console.log("Received config:", req.body);
    res.json({ status: "ok" });
  });
  let deviceStatus = "ready";
  let calibrationTimeout = null;
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
    }, 4500);
    res.json({ status: "calibrating" });
  });
  app.get("/status", (req, res) => {
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
      voltage,
      temperature,
      status: deviceStatus
    });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Critical server startup failure:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
