import React, { useEffect, useRef } from 'react';

interface HologramSimulatorProps {
  effect: string;
  speed: number;
  brightness: number;
  customColor?: string | null;
  logoUrl?: string | null;
  povText?: string;
  logoRotation?: number;
  logoTintColor?: string | null;
  povTextAnimation?: string;
  effectSpeedRate?: number;
  effectScale?: number;
  effectComplexity?: number;
  videoUrl?: string | null;
  ledCount?: number;
  kaleidoShape?: string;
  kaleidoLines?: string;
  kaleidoMorphSpeed?: number;
}

export const HologramSimulator: React.FC<HologramSimulatorProps> = ({
  effect = 'rainbow',
  speed = 80,
  brightness = 150,
  customColor = '#00b4d8',
  logoUrl,
  povText = "POV SYSTEM HOLOSPIN 3D ",
  logoRotation = 0,
  logoTintColor = null,
  povTextAnimation = 'fade',
  effectSpeedRate = 1.0,
  effectScale = 1.0,
  effectComplexity = 8,
  videoUrl = null,
  ledCount = 44,
  kaleidoShape = 'morphing',
  kaleidoLines = 'hybrid',
  kaleidoMorphSpeed = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const tintedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const updateLogo = () => {
      if (logoUrl) {
        const img = new Image();
        img.src = logoUrl;
        img.onload = () => {
          logoImgRef.current = img;
          applyTint(img);
        };
        img.onerror = () => {
          console.error("Failed to load logo image:", logoUrl);
          logoImgRef.current = null;
          tintedCanvasRef.current = null;
        };
      } else {
        logoImgRef.current = null;
        tintedCanvasRef.current = null;
      }
    };

    const applyTint = (img: HTMLImageElement) => {
      if (logoTintColor) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          ctx.globalCompositeOperation = 'source-in';
          ctx.fillStyle = logoTintColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          tintedCanvasRef.current = canvas;
        } else {
          tintedCanvasRef.current = null;
        }
      } else {
        tintedCanvasRef.current = null;
      }
    };

    updateLogo();
  }, [logoUrl, logoTintColor]);

  useEffect(() => {
    if (videoUrl) {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      video.play().catch(err => console.log("Hologram video auto-play prevented/failed", err));
      videoRef.current = video;
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current = null;
      }
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current = null;
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI Canvas support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;
    
    // Scale radius based on LED count (ref: 44 LEDs is standard)
    const safeLedCount = typeof ledCount === 'number' && !isNaN(ledCount) ? ledCount : 44;
    const ledScaling = Math.min(1.15, Math.max(0.3, safeLedCount / 44));
    const radius = Math.min(cx, cy) * 0.95 * ledScaling;

    let animationFrameId: number;
    let rotation = 0;
    let time = 0;

    const parseHsl = (hslStr: string) => {
      // Very basic extraction, safely handled
      return hslStr;
    };

    const drawEffect = (c: CanvasRenderingContext2D, t: number, rot: number) => {
      c.save();
      c.translate(cx, cy);

      switch (effect) {
        case 'solid': {
          c.save();
          // High-fidelity Volumetric Holographic Fusion Core reactor with shape morphing and slow pastel hue shifting
          const solidHueRef = (t * 0.03) % 360;
          const themeColor = customColor || `hsl(${solidHueRef}, 95%, 60%)`;
          const secondaryColor = `hsl(${(solidHueRef + 120) % 360}, 95%, 60%)`;
          const tertiaryColor = `hsl(${(solidHueRef + 240) % 360}, 15%, 85%)`;

          c.globalCompositeOperation = 'screen';
          
          // Shape morphing parameter: 0.0 (circle) to 1.0 (polygon / star)
          const shapeMorph = Math.sin(t * 0.0008) * 0.5 + 0.5;
          const morphSides = 3 + Math.floor((Math.sin(t * 0.0004) * 0.5 + 0.5) * 5); // morphs from triangle to octagon

          // Helper to draw morphed HUD telemetry geometry
          const drawMorphedGeometry = (radiusSize: number, sides: number, dotRotation: number, isDashed = false, dashPattern = [8, 12]) => {
              c.save();
              c.rotate(dotRotation);
              if (isDashed) {
                  c.setLineDash(dashPattern.map(d => d * effectScale));
              }
              c.beginPath();
              for (let s = 0; s <= sides; s++) {
                  const angleVal = (s * Math.PI * 2) / sides;
                  
                  // Interpolated radius between perfect circle and sharp star/polygon
                  const rCircle = radiusSize;
                  // Star-burst variation
                  const spike = s % 2 === 0 ? 1.15 : 0.85;
                  const rPolygon = radiusSize * (0.95 + 0.1 * spike * Math.cos(angleVal * 2));
                  const currentR = rCircle * (1 - shapeMorph) + rPolygon * shapeMorph;
                  
                  const px = Math.cos(angleVal) * currentR;
                  const py = Math.sin(angleVal) * currentR;
                  if (s === 0) c.moveTo(px, py);
                  else c.lineTo(px, py);
              }
              c.stroke();
              c.restore();
          };

          // 1. Ambient magnetic core light with shifting colors
          const coreLight = c.createRadialGradient(0, 0, 0, 0, 0, radius * effectScale);
          coreLight.addColorStop(0, themeColor);
          coreLight.addColorStop(0.35, `hsla(${(solidHueRef + 60) % 360}, 90%, 55%, 0.25)`);
          coreLight.addColorStop(1.0, 'transparent');
          c.fillStyle = coreLight;
          c.beginPath();
          c.arc(0, 0, radius * effectScale, 0, Math.PI * 2);
          c.fill();

          // 2. Spinning telemetry dials / HUD circles changing shapes
          c.strokeStyle = themeColor;
          c.lineWidth = 2 * effectScale;
          drawMorphedGeometry(radius * 0.85 * effectScale, morphSides, t * 0.0012);

          // Outer tick sectors morphing shape with dashes
          c.strokeStyle = secondaryColor;
          c.lineWidth = 1 * effectScale;
          drawMorphedGeometry(radius * 0.9 * effectScale, morphSides + 2, -t * 0.0006, true, [10, 15]);

          // Inner ring with alternate rotation and complex lines
          c.strokeStyle = tertiaryColor;
          c.lineWidth = 1.5 * effectScale;
          drawMorphedGeometry(radius * 0.72 * effectScale, 6, t * 0.0007, true, [40, 20, 10, 20]);

          // 3. Central Core Plasma Nodes & Sparks
          const mainReactorSize = radius * 0.24 * effectScale;
          const reatGlow = c.createRadialGradient(-3, -3, 0, 0, 0, mainReactorSize);
          reatGlow.addColorStop(0, '#ffffff');
          reatGlow.addColorStop(0.5, themeColor);
          reatGlow.addColorStop(1.0, '#1e1b4b');
          c.fillStyle = reatGlow;
          c.beginPath();
          c.arc(0, 0, mainReactorSize, 0, Math.PI * 2);
          c.fill();

          // Sweeping radar rangefinder vector line
          c.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          c.lineWidth = 2 * effectScale;
          c.beginPath();
          c.moveTo(0, 0);
          c.lineTo(Math.cos(t * 0.002) * radius * 0.95 * effectScale, Math.sin(t * 0.002) * radius * 0.95 * effectScale);
          c.stroke();

          // Floating reactor energy particulates changing colors
          const dotCount = Math.max(6, Math.round(effectComplexity * 0.8));
          for (let i = 0; i < dotCount; i++) {
              const dProg = (t * 0.001 + i * 0.17) % 1.0;
              const dDist = dProg * radius * 0.82 * effectScale;
              const dAngle = i * (Math.PI * 2 / dotCount) + t * 0.0003;
              const partHue = (solidHueRef + i * (360 / dotCount)) % 360;
              c.fillStyle = `hsl(${partHue}, 100%, 80%)`;
              c.beginPath();
              c.arc(Math.cos(dAngle) * dDist, Math.sin(dAngle) * dDist, 2.5 * (1.1 - dProg) * effectScale, 0, Math.PI * 2);
              c.fill();
          }

          c.restore();
          break;
        }
        case 'rainbow': {
          c.save();
          // Hyper-vibrant Solar Rainbow spiral vortex nebula with shape-shifting mechanics
          c.globalCompositeOperation = 'screen';

          // Center black hole core to mask colors beautifully
          const vortexScale = effectScale;
          const numVortexArms = 6;
          const spiralMorph = Math.sin(t * 0.001) * 0.5 + 0.5;
          
          for (let i = 0; i < numVortexArms; i++) {
              c.save();
              const baseAngle = i * (Math.PI * 2 / numVortexArms) + t * 0.0012;
              c.rotate(baseAngle);
              
              // Dynamic rainbow gradient for each spiraling arm list path
              const armGrad = c.createLinearGradient(0, 0, radius * vortexScale, 0);
              const armHue = (i * (360 / numVortexArms) + t * 0.05) % 360;
              armGrad.addColorStop(0, `hsl(${armHue}, 100%, 70%)`);
              armGrad.addColorStop(0.3, `hsl(${(armHue + 60) % 360}, 100%, 65%)`);
              armGrad.addColorStop(0.6, `hsl(${(armHue + 140) % 360}, 100%, 60%)`);
              armGrad.addColorStop(0.9, `hsl(${(armHue + 240) % 360}, 100%, 55%)`);
              armGrad.addColorStop(1.0, 'transparent');
              
              c.strokeStyle = armGrad;
              c.lineWidth = (3 + spiralMorph * 3) * vortexScale;
              c.beginPath();
              c.moveTo(0, 0);
              
              const spiralCurveR = radius * 0.45 * vortexScale;
              const waveDamp = Math.sin(t * 0.002 + i) * (12 + spiralMorph * 35 * effectScale);
              
              if (spiralMorph > 0.65) {
                // Morph 1: Crystalline zigzag lightning streams
                const steps = 6;
                for (let k = 1; k <= steps; k++) {
                    const ratio = k / steps;
                    const rX = radius * vortexScale * ratio;
                    const jitterY = Math.sin(t * 0.01 + k * 1.5) * 15 * (1 - ratio) * effectScale;
                    c.lineTo(rX, waveDamp * ratio + jitterY);
                }
              } else if (spiralMorph < 0.3) {
                // Morph 2: Bold mechanical segmented steps
                c.lineTo(spiralCurveR, waveDamp);
                c.lineTo(radius * vortexScale, Math.cos(t * 0.001) * 12);
              } else {
                // Morph 3: Normal fluid gravitational curve
                c.quadraticCurveTo(spiralCurveR, waveDamp, radius * vortexScale, Math.cos(t * 0.001) * 12);
              }
              c.stroke();
              c.restore();
          }

          // Cosmic rainbow particle stardust emissions in spiraling shapes
          const starLimit = Math.max(10, Math.round(effectComplexity * 1.5));
          for (let s = 0; s < starLimit; s++) {
              const pSeed = s * 741.2 + t * 0.0008;
              const progress = pSeed % 1.0;
              const angle = s * (Math.PI * 2 / starLimit) + progress * 1.2;
              
              // Let star coordinates morph from circle to star orbits
              const starMorphVal = Math.sin(t * 0.0015 + s) * 0.5 + 0.5;
              const pathSpike = s % 2 === 0 ? 1.2 : 0.8;
              const starRadiusScale = progress * radius * 0.95 * vortexScale * (1 - starMorphVal + pathSpike * starMorphVal);
              
              const starX = Math.cos(angle) * starRadiusScale;
              const starY = Math.sin(angle) * starRadiusScale;
              
              const pHue = (s * 35 + t * 0.04) % 360;
              c.fillStyle = `hsla(${pHue}, 100%, 75%, ${0.9 - progress * 0.8})`;
              c.beginPath();
              c.arc(starX, starY, (1.2 + (s % 3) * 1.3) * vortexScale * (1.1 - progress), 0, Math.PI * 2);
              c.fill();
          }

          c.restore();
          break;
        }
        case 'fire':
          // Enhanced Hyper-Realistic Flame Simulation: Rising organic tongues with composite lighter shading, dynamic shifting hues, and shape transitions
          c.save();
          c.globalCompositeOperation = 'screen'; // Creates beautiful hot overlapping color additive blending
          
          // Shifting fire base hue parameter for diverse color shifts
          const fireHueBase = (t * 0.04) % 360;
          const fireShapeShift = Math.sin(t * 0.001) * 0.5 + 0.5; // Morphs the bezier flame contours

          // Background soft ambient heat flare glow
          const ambientGlow = c.createRadialGradient(0, radius * 0.4, 0, 0, radius * 0.4, radius * 1.1);
          ambientGlow.addColorStop(0, `hsla(${fireHueBase}, 90%, 55%, 0.25)`); // dynamic color spectrum
          ambientGlow.addColorStop(0.5, `hsla(${(fireHueBase + 55) % 360}, 90%, 50%, 0.1)`); 
          ambientGlow.addColorStop(1.0, 'transparent');
          c.fillStyle = ambientGlow;
          c.beginPath();
          c.arc(0, 0, radius, 0, Math.PI * 2);
          c.fill();

          // 1. Core Heatbed (White-hot Ellipse at base)
          const coreY = radius * 0.65;
          const coreGrad = c.createRadialGradient(0, coreY, 0, 0, coreY, radius * 0.35 * effectScale);
          coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); // hyper-hot white
          coreGrad.addColorStop(0.25, `hsla(${(fireHueBase + 35) % 360}, 100%, 75%, 0.9)`); 
          coreGrad.addColorStop(0.65, `hsla(${fireHueBase}, 100%, 50%, 0.55)`); 
          coreGrad.addColorStop(1.0, `hsla(${fireHueBase}, 100%, 40%, 0)`);
          c.fillStyle = coreGrad;
          c.beginPath();
          c.ellipse(0, coreY, radius * 0.48 * effectScale, radius * 0.18 * effectScale, 0, 0, Math.PI * 2);
          c.fill();

          // 2. Overlapping Flame Langues / Tongues (Flickering and swaying with multiple wave harmonics)
          const numTongues = 9;
          for (let i = 0; i < numTongues; i++) {
              const phase = i * (Math.PI * 2 / numTongues);
              // Distribute tongue anchors horizontally along the bottom burning base
              const startX = -radius * 0.45 + (i / (numTongues - 1)) * radius * 0.9;
              const startY = radius * 0.68 + Math.sin(phase * 3 + t * 0.005) * 5;
              
              // Dynamic height containing primary frequency + high frequency turbulence (air flickering)
              const baseHeight = radius * (0.7 + 0.4 * Math.sin(t * 0.003 + phase * 2.3)) * effectScale;
              const turbulentFlicker = 1.0 + Math.sin(t * 0.02 + phase * 7) * 0.12; 
              const tongueHeight = baseHeight * turbulentFlicker;

              // Left-right wave thermal sway
              const swayAmt = Math.sin(t * 0.0022 + phase * 3.7) * (radius * 0.22);
              const peakX = startX + swayAmt;
              const peakY = startY - tongueHeight;

              // Distinct dynamic width per flame
              const tongueWidth = radius * 0.16 * (0.6 + 0.4 * Math.cos(t * 0.0016 + phase)) * effectScale;

              // Linear heat-map gradient mapped onto the specific flame height
              const tongueGrad = c.createLinearGradient(startX, startY, peakX, peakY);
              const peakHue = (fireHueBase + i * 15) % 360;
              tongueGrad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)'); // ultra-white base
              tongueGrad.addColorStop(0.2, `hsla(${(peakHue + 40) % 360}, 100%, 75%, 0.95)`); 
              tongueGrad.addColorStop(0.45, `hsla(${(peakHue + 20) % 360}, 100%, 60%, 0.85)`); 
              tongueGrad.addColorStop(0.7, `hsla(${peakHue}, 100%, 50%, 0.45)`); 
              tongueGrad.addColorStop(1.0, 'transparent'); // fade into dark smoke

              c.fillStyle = tongueGrad;
              c.beginPath();
              c.moveTo(startX, startY);

              // Draw curves up to the flickering peak and back down, with shape morphing parameters
              const skewYMod = i % 2 === 0 ? 1.1 : 0.9;
              const ctrlX1 = startX - tongueWidth * (1.0 - fireShapeShift * 0.2) + Math.sin(t * 0.003 + phase) * 12;
              const ctrlY1 = startY - tongueHeight * 0.4 * skewYMod;
              const ctrlX2 = peakX - tongueWidth * (0.15 + fireShapeShift * 0.15);
              const ctrlY2 = startY - tongueHeight * 0.75;
              
              const ctrlX3 = peakX + tongueWidth * (0.15 + fireShapeShift * 0.15);
              const ctrlY3 = startY - tongueHeight * 0.75;
              const ctrlX4 = startX + tongueWidth * (1.0 - fireShapeShift * 0.2) + Math.sin(t * 0.003 + phase) * 12;
              const ctrlY4 = startY - tongueHeight * 0.4 * skewYMod;

              c.bezierCurveTo(ctrlX1, ctrlY1, ctrlX2, ctrlY2, peakX, peakY);
              c.bezierCurveTo(ctrlX3, ctrlY3, ctrlX4, ctrlY4, startX + tongueWidth, startY);
              c.closePath();
              c.fill();
          }

          // 3. Thermal Floating Embers (Upward drifting high-velocity sparks/particles)
          const numParticles = 25;
          for (let p = 0; p < numParticles; p++) {
              // Deterministic seed values keyed per particle to maintain consistent individual physical paths
              const seed_SpeedScale = Math.sin(p * 415.7) * 0.5 + 0.5;
              const seed_XOffset = Math.cos(p * 289.4) * 0.5 + 0.5;
              const seed_Phase = Math.sin(p * 812.3) * Math.PI * 2;

              // Calculate looping linear progress [0.0 - 1.0] from base core up to top smoke level
              const particleVelocity = 0.0012 + seed_SpeedScale * 0.0016;
              const progress = ((t * particleVelocity + p * (1 / numParticles)) % 1.0);

              // Layout positions
              const initialX = -radius * 0.42 + seed_XOffset * radius * 0.84;
              const emberY = radius * 0.62 - progress * radius * 1.5;
              const xSway = Math.sin(t * 0.0045 + seed_Phase) * (18 + seed_SpeedScale * 25) * progress;
              const emberX = initialX + xSway;

              // Size shrinks as it rises and cools down
              const emberSize = (1.5 + seed_XOffset * 2.5) * (1.1 - progress) * effectScale;
              
              if (emberSize > 0) {
                  // Temperature colors mapping (shorter lifespans turn redder/darker, matching shifting fire colors)
                  const alpha = (0.7 + 0.3 * Math.sin(t * 0.015 + p)) * (1.0 - progress);
                  const emberHue = (fireHueBase + p * 10) % 360;
                  c.fillStyle = `hsla(${emberHue}, 100%, ${Math.floor(45 + 50 * (1.0 - progress))}%, ${alpha})`;
                  
                  c.beginPath();
                  c.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
                  c.fill();

                  // Subtle high-temperature halo on larger sparks
                  if (emberSize > 2.2 && progress < 0.5) {
                      c.fillStyle = `hsla(${(emberHue + 30) % 360}, 100%, 75%, ${0.12 * alpha})`;
                      c.beginPath();
                      c.arc(emberX, emberY, emberSize * 2.5, 0, Math.PI * 2);
                      c.fill();
                  }
              }
          }
          
          c.restore();
          break;
        case 'matrix':
          // Authentic Cascading Matrix Digital-Rain Code Streams masked to the rounded hologram disk with multi-color spectrum shifts and Hebrew runes / geometric symbols
          c.save();
          c.beginPath();
          c.arc(0, 0, radius * 1.02, 0, Math.PI * 2);
          c.clip();

          const colSpacing = 16 * effectScale;
          const matrixCycleTime = Math.floor(t * 0.00015) % 3; // Cycle through char sets over time
          for (let x = -radius + 8 * effectScale; x < radius; x += colSpacing) {
              const speed = 0.06 + Math.abs(Math.sin(x * 123.4)) * 0.14;
              const y = ((t * speed + Math.abs(Math.cos(x * 56.7)) * 500) % (radius * 2.3)) - radius * 1.15;
              
              // Shift the color of individual columns beautifully using a sinusoidal hue index
              const colHue = (Math.abs(Math.sin(x * 999)) * 360 + t * 0.04) % 360;

              const numChars = Math.max(5, Math.round(5 + 8 * effectScale));
              for (let j = 0; j < numChars; j++) {
                  const charY = y - j * 14 * effectScale;
                  // Contain within the round boundaries
                  if (Math.sqrt(x * x + charY * charY) > radius) continue;
                  
                  let fillStyle = '';
                  if (j === 0) {
                      fillStyle = '#ffffff'; // White leading head
                  } else if (j < 3) {
                      fillStyle = customColor || `hsl(${colHue}, 100%, 75%)`; // super bright spectrum
                  } else if (j < 7) {
                      fillStyle = customColor || `hsl(${(colHue + 30) % 360}, 90%, 55%)`; // mid tail spectrum
                  } else {
                      fillStyle = customColor || `hsl(${colHue}, 100%, 25%)`; // dim static tail spectrum
                  }
                  
                  c.fillStyle = fillStyle;
                  const fontSize = Math.max(8, Math.round(11 * effectScale));
                  c.font = `bold ${fontSize}px monospace`;
                  
                  // Semi-randomly changing glyph values
                  const charIndex = Math.floor(t * 0.005 + Math.abs(x) + j) % 22;
                  let char = '';
                  
                  if (matrixCycleTime === 0) {
                      // Classic hybrid alphanumeric
                      char = ['0', '1', '7', 'X', 'Y', 'Z', '9', 'V', 'K', 'O', '8', '3'][charIndex % 12];
                  } else if (matrixCycleTime === 1) {
                      // Mystical Hebrew Letters
                      char = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'][charIndex % 22];
                  } else {
                      // Cybernetic geometric symbols, runes and stars
                      char = ['▲', '▼', '◆', '○', '◼', '⬢', '✚', '⚡', '☯', '★', '✦', '✳'][charIndex % 12];
                  }
                  
                  c.fillText(char, x, charY);
              }
          }
          c.restore();
          break;
        case 'hypno': {
          // Hyper-Interactive Hypnotic Cyber-Torus Warp Tunnel with dynamic multi-polygon shape-morphing and vibrant hue shifting
          c.save();
          c.globalCompositeOperation = 'screen';
          
          const maxHypnoRings = Math.max(4, Math.round(effectComplexity * 0.9));
          const warpPulseOffset = Math.sin(t * 0.003) * 12;

          // Slower visual shape-morphing parameter from 0.0 (circle) to 1.0 (polygon, gear or star)
          const hypnoShapeMorph = Math.sin(t * 0.001) * 0.5 + 0.5;

          for (let i = 0; i < maxHypnoRings; i++) {
              // Zoom progress traveling into or from the core
              const progress = ((t * 0.0016 + i * (1.0 / maxHypnoRings)) % 1.0);
              
              // Exponential zoom rate to emphasize portal depth scaling
              const r = Math.pow(progress, 1.8) * radius * effectScale;
              
              c.save();
              c.rotate(t * 0.0006 * (i % 2 === 0 ? 1 : -1) + progress * 0.5);

              // 3D torus radial bands with color shifting
              const hue = (t * 0.04 + i * (360 / maxHypnoRings) + Math.sin(t * 0.0002) * 120) % 360;
              c.strokeStyle = customColor || `hsla(${hue}, 100%, 65%, ${progress * 0.8})`;
              c.lineWidth = (3.5 + progress * 6) * effectScale;
              
              // Draw dash segment with orbiting blanks
              c.setLineDash([20 * effectScale, 15 * effectScale]);
              
              c.beginPath();
              // Morph polygon loops dynamically
              const sides = 4 + (i % 5); // 4-sided to 8-sided base
              for (let k = 0; k <= sides; k++) {
                  const angleVal = (k * Math.PI * 2) / sides;
                  
                  // Radial offset to create gear-teeth effect
                  const gearOffset = 1.0 + 0.16 * Math.sin(angleVal * 4 + t * 0.004) * hypnoShapeMorph;
                  const currentR = Math.max(2, r * ((1.0 - hypnoShapeMorph) + hypnoShapeMorph * gearOffset));
                  
                  const px = Math.cos(angleVal) * currentR;
                  const py = Math.sin(angleVal) * currentR;
                  if (k === 0) c.moveTo(px, py);
                  else c.lineTo(px, py);
              }
              c.stroke();
              
              c.setLineDash([]);
              c.restore();

              // Subtle connecting vortex filaments that morph along with the ring depth
              const secondaryHue = (hue + 180) % 360;
              c.strokeStyle = customColor || `hsla(${secondaryHue}, 95%, 70%, ${0.12 * progress})`;
              c.lineWidth = 1 * effectScale;
              c.beginPath();
              c.arc(warpPulseOffset, 0, Math.max(1, r * 1.08), 0, Math.PI * 2);
              c.stroke();
          }

          // Warp center focus point
          const focusGrad = c.createRadialGradient(0, 0, 0, 0, 0, 15);
          focusGrad.addColorStop(0, '#ffffff');
          focusGrad.addColorStop(1, 'transparent');
          c.fillStyle = focusGrad;
          c.beginPath();
          c.arc(0, 0, 15, 0, Math.PI * 2);
          c.fill();

          c.restore();
          break;
        }
        case 'space': {
          // Deep Cosmic Nebula & Spinning Star system with Shooting Stars (Morphing pulsar stars & galaxy spectrums)
          c.save();
          c.globalCompositeOperation = 'screen';

          // 1. Swirling gaseous nebula background shifting colors (warm pink birth and electrical cold cyan)
          const spaceGlowGrad = c.createRadialGradient(0, 0, 0, 0, 0, radius * effectScale);
          const pinkHue = (330 + t * 0.04) % 360;
          const cyanHue = (190 + t * 0.04) % 360;
          const goldHue = (45 + t * 0.02) % 360;
          spaceGlowGrad.addColorStop(0, `hsla(${pinkHue}, 90%, 55%, 0.16)`);   // warm star birth
          spaceGlowGrad.addColorStop(0.5, `hsla(${cyanHue}, 95%, 50%, 0.11)`); // electrical cold gas
          spaceGlowGrad.addColorStop(0.8, `hsla(${goldHue}, 100%, 60%, 0.05)`); // cosmic dust
          spaceGlowGrad.addColorStop(1.0, 'transparent');
          c.fillStyle = spaceGlowGrad;
          c.beginPath();
          c.arc(0, 0, radius * effectScale, 0, Math.PI * 2);
          c.fill();

          // 2. Central spinning ringed orbital node (gas giant planet / morphing sun pulsar)
          c.save();
          c.rotate(t * 0.0006);
          
          const spaceMorph = Math.sin(t * 0.0009) * 0.5 + 0.5; // slow morphology
          const planetHue = (t * 0.035) % 360;
          const planetSize = 14 * (1.0 + spaceMorph * 0.25) * effectScale;

          // Planetary sphere / Pulsar morphology
          const sphereGrad = c.createRadialGradient(-4 * effectScale, -4 * effectScale, 0, 0, 0, planetSize);
          sphereGrad.addColorStop(0, '#ffffff');
          sphereGrad.addColorStop(0.4, `hsl(${planetHue}, 95%, 65%)`); // moving planet hue
          sphereGrad.addColorStop(1.0, `hsl(${(planetHue + 140) % 360}, 95%, 25%)`); // deep shadow
          c.fillStyle = sphereGrad;
          c.beginPath();
          
          if (spaceMorph > 0.65) {
             // Pulsar starburst shape!
             const starSides = 8;
             for (let j = 0; j <= starSides * 2; j++) {
                const subA = (j * Math.PI) / starSides;
                const subR = (j % 2 === 0) ? planetSize * 1.35 : planetSize * 0.65;
                const px = Math.cos(subA) * subR;
                const py = Math.sin(subA) * subR;
                if (j === 0) c.moveTo(px, py);
                else c.lineTo(px, py);
             }
          } else {
             // Rounded sphere
             c.arc(0, 0, planetSize, 0, Math.PI * 2);
          }
          c.fill();

          // Planetary orbiting rings morphing tilt and scales
          c.strokeStyle = customColor || `hsla(${(planetHue + 120) % 360}, 95%, 65%, 0.85)`;
          c.lineWidth = 2 * effectScale;
          c.beginPath();
          const ringTilt = -Math.PI / 8 + Math.sin(t * 0.001) * 0.15;
          const ringRadW = (32 + Math.cos(t * 0.002) * 6) * effectScale;
          const ringRadH = (8 + Math.sin(t * 0.001) * 3) * effectScale;
          c.ellipse(0, 0, ringRadW, ringRadH, ringTilt, 0, Math.PI * 2);
          c.stroke();
          c.restore();

          // 3. Orbiting stellar star cluster changing colors
          c.fillStyle = '#ffffff';
          const spaceStars = Math.max(12, Math.round(effectComplexity * 2));
          for (let i = 0; i < spaceStars; i++) {
              const angle = (i * 153.2 + t * 0.0005) % (Math.PI * 2);
              const dist = (i * 29.5 + t * 0.035) % (radius * 0.92 * effectScale);
              c.save();
              // Sparkling magnitude fluctuations (twinkling) + color twinkle
              const twinkle = 0.5 + 0.5 * Math.sin(t * 0.015 + i);
              const starHue = (t * 0.05 + i * 30) % 360;
              c.fillStyle = `hsla(${starHue}, 100%, 85%, ${twinkle})`;
              c.beginPath();
              c.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, (0.8 + (i % 3) * 1.5) * twinkle * effectScale, 0, Math.PI * 2);
              c.fill();
              c.restore();
          }

          // 4. Shooting Star streaks (Streaking from corner across field with multiple spark directions)
          const numShooters = 2;
          for (let k = 0; k < numShooters; k++) {
              const streamSeed = k * 145.6 + t * 0.003;
              const sProg = streamSeed % 1.5; // Travels outside frame
              if (sProg < 1.0) {
                  const sDist = (-radius + sProg * radius * 2.3) * effectScale;
                  const sAngle = -Math.PI / 6 + k * (Math.PI / 10);
                  const sX = Math.cos(sAngle) * sDist;
                  const sY = Math.sin(sAngle) * sDist;
                  
                  // Star head
                  c.fillStyle = '#ffffff';
                  c.beginPath();
                  c.arc(sX, sY, 2.5 * effectScale, 0, Math.PI * 2);
                  c.fill();

                  // Laser streak trail colored spectrum based on k
                  const tailSize = 45 * effectScale;
                  const tailX = sX - Math.cos(sAngle) * tailSize;
                  const tailY = sY - Math.sin(sAngle) * tailSize;
                  
                  const sGrad = c.createLinearGradient(sX, sY, tailX, tailY);
                  sGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                  sGrad.addColorStop(0.3, `hsla(${(cyanHue + k * 80) % 360}, 100%, 70%, 0.65)`);
                  sGrad.addColorStop(1.0, 'transparent');
                  c.strokeStyle = sGrad;
                  c.lineWidth = 1.6 * effectScale;
                  c.beginPath();
                  c.moveTo(sX, sY);
                  c.lineTo(tailX, tailY);
                  c.stroke();
              }
          }

          c.restore();
          break;
        }
        case 'mandala': {
          // Advanced Morphing Mandala - Changes shapes, patterns, layers and colors dynamically
          c.save();
          const scalePulse = 1 + 0.08 * Math.sin(t * 0.0015);
          const morphFactor = Math.sin(t * 0.0009); // Moves between Lotus (-1 to -0.35), Star/Sharp Geometry (0.35 to 1), and Ring Loop
          const hueOffset = (t * 0.04) % 360;

          // Dynamic dual-tone colors matching high-contrast neon hologram look
          const colorTeal = customColor || `hsl(${(185 + hueOffset) % 360}, 95%, 60%)`;
          const colorViolet = customColor || `hsl(${(285 + hueOffset) % 360}, 95%, 65%)`;

          // Outer Layer: Petals and Morphing Geometry
          const mandalaPetals = Math.max(4, Math.round(effectComplexity));
          c.lineWidth = 3 * effectScale;

          for (let i = 0; i < mandalaPetals; i++) {
              c.save();
              // Petals rotate slowly with dynamic pacing
              c.rotate(i * (Math.PI * 2 / mandalaPetals) + t * 0.0007);
              
              const petalHue = (hueOffset + i * (360 / mandalaPetals)) % 360;
              const curTeal = customColor || `hsl(${petalHue}, 95%, 60%)`;
              const curViolet = customColor || `hsl(${(petalHue + 120) % 360}, 95%, 65%)`;

              // Use a unique gradient for each petal branch
              const branchGrad = c.createLinearGradient(0, 0, radius * effectScale * scalePulse, 0);
              branchGrad.addColorStop(0, curTeal);
              branchGrad.addColorStop(0.5, curViolet);
              branchGrad.addColorStop(1, 'rgba(45, 212, 191, 0.2)');
              c.strokeStyle = branchGrad;

              const petalLength = radius * effectScale * 0.85 * scalePulse;
              c.beginPath();
              c.moveTo(0, 0);

              if (morphFactor > 0.35) {
                  // 1. Sharp Geometric Star / Diamond lattices (morphing corner vertices)
                  const midR = radius * effectScale * (0.4 + 0.1 * Math.sin(t * 0.002)) * scalePulse;
                  const angleSep = Math.PI / mandalaPetals;
                  c.lineTo(midR * Math.cos(angleSep), midR * Math.sin(angleSep));
                  c.lineTo(petalLength, 0);
                  c.lineTo(midR * Math.cos(-angleSep), midR * Math.sin(-angleSep));
              } else if (morphFactor < -0.35) {
                  // 2. Swirling Cosmic Vortex Loops with wavy oscillations
                  const swayOffset = 0.55 + 0.15 * Math.sin(t * 0.003 + i);
                  c.quadraticCurveTo(radius * effectScale * 0.3 * scalePulse, radius * effectScale * swayOffset * scalePulse, petalLength, 0);
                  c.quadraticCurveTo(radius * effectScale * 0.3 * scalePulse, -radius * effectScale * swayOffset * scalePulse, 0, 0);
              } else {
                  // 3. Classic Lotus flower petals with dynamic curve controls
                  const ctrlX = radius * effectScale * 0.45 * scalePulse;
                  const ctrlY = radius * effectScale * 0.33 * scalePulse * (1 + 0.3 * Math.cos(t * 0.002));
                  c.quadraticCurveTo(ctrlX, ctrlY, petalLength, 0);
                  c.quadraticCurveTo(ctrlX, -ctrlY, 0, 0);
              }
              c.stroke();

              // Tips & Particle Spores (POV neon points look excellent on fans - color shift per petal)
              c.fillStyle = curViolet;
              c.beginPath();
              c.arc(petalLength, 0, 4.5 * effectScale, 0, Math.PI * 2);
              c.fill();

              // Orbiting dust particles around the petals with dynamic radius sway
              const particleDist = petalLength * (1.1 + 0.08 * Math.sin(t * 0.002 + i));
              c.fillStyle = curTeal;
              c.beginPath();
              c.arc(particleDist, 0, 1.8 * effectScale, 0, Math.PI * 2);
              c.fill();

              c.restore();
          }

          // Inner Layer: Concentric Sacred Geometry (Rotating rings and Hex-Star Core)
          c.save();
          c.rotate(-t * 0.0005); // Spin counter-clockwise for complex multi-axis motor effect
          
          // Inner Ring morphing to hex-star boundaries
          c.strokeStyle = colorTeal;
          c.lineWidth = 1.5 * effectScale;
          c.beginPath();
          const innerRingR = radius * effectScale * 0.25 * scalePulse;
          if (morphFactor > 0) {
              // Morph ring to polygon
              const rSides = 6;
              for (let m = 0; m <= rSides; m++) {
                  const mAngle = (m * Math.PI * 2) / rSides;
                  const rx = Math.cos(mAngle) * innerRingR;
                  const ry = Math.sin(mAngle) * innerRingR;
                  if (m === 0) c.moveTo(rx, ry);
                  else c.lineTo(rx, ry);
              }
          } else {
              c.arc(0, 0, innerRingR, 0, Math.PI * 2);
          }
          c.stroke();

          // Inner Core Star
          const corePoints = 6;
          c.strokeStyle = colorViolet;
          c.beginPath();
          for (let i = 0; i <= corePoints * 2; i++) {
              const angle = (i * Math.PI) / corePoints;
              const r = (i % 2 === 0) ? (radius * effectScale * 0.15 * scalePulse) : (radius * effectScale * 0.07 * scalePulse);
              const x = Math.cos(angle) * r;
              const y = Math.sin(angle) * r;
              if (i === 0) c.moveTo(x, y);
              else c.lineTo(x, y);
          }
          c.closePath();
          c.stroke();
          c.restore();
          
          c.restore();
          break;
        }
        case 'acid': {
          // Hyper-detailed Bio-hazard Slime Bubble Reactor with amoeba shape-shifting cells and toxic multi-color phases
          c.save();
          c.globalCompositeOperation = 'screen';

          const acidRadius = radius * effectScale;
          const acidHue = (t * 0.04) % 360;

          // 1. Viscous radioactive background goo
          const rawGlow = c.createRadialGradient(0, 0, 0, 0, 0, acidRadius);
          rawGlow.addColorStop(0, `hsla(${acidHue}, 90%, 55%, 0.22)`); // shifted toxic core
          rawGlow.addColorStop(0.6, `hsla(${(acidHue + 60) % 360}, 90%, 45%, 0.1)`);
          rawGlow.addColorStop(1.0, 'transparent');
          c.fillStyle = rawGlow;
          c.beginPath();
          c.arc(0, 0, acidRadius, 0, Math.PI * 2);
          c.fill();

          // Outer toxic containment vessel Ring
          c.strokeStyle = customColor || `hsla(${(acidHue + 120) % 360}, 90%, 50%, 0.45)`;
          c.lineWidth = 1.5 * effectScale;
          c.stroke();

          // 2. Rising toxic fizz and bubbles shifting colors
          const bubbleLimit = Math.max(12, Math.round(effectComplexity * 1.3));
          for (let b = 0; b < bubbleLimit; b++) {
              const bSeed = b * 294.6 + t * 0.0019;
              const bProgress = bSeed % 1.0;
              
              // Sloshing sway path
              const initialSloshX = -acidRadius * 0.7 + (b % 5) * (acidRadius * 0.35);
              const bY = acidRadius * 0.82 - bProgress * (acidRadius * 1.62);
              const bSway = Math.sin(t * 0.003 + b) * 16 * bProgress * effectScale;
              const bX = initialSloshX + bSway;

              // Constrain bubbles within circular containment tank
              if (bX * bX + bY * bY < acidRadius * acidRadius) {
                  const bSize = (2.2 + (b % 4) * 3) * (1.1 - bProgress * 0.3) * effectScale;
                  const bHue = (acidHue + b * 25) % 360;
                  
                  // Glossy liquid sphere gradient
                  const sphereGlow = c.createRadialGradient(bX - bSize*0.3, bY - bSize*0.3, 0, bX, bY, bSize);
                  sphereGlow.addColorStop(0, '#ffffff'); // shiny reflex Highlight
                  sphereGlow.addColorStop(0.35, `hsl(${(bHue + 40) % 360}, 90%, 75%)`); // neon yellow-green
                  sphereGlow.addColorStop(0.85, `hsl(${bHue}, 90%, 40%)`); // dark green core
                  sphereGlow.addColorStop(1.0, `hsla(${(bHue + 120) % 360}, 90%, 25%, 0.2)`);
                  
                  c.fillStyle = sphereGlow;
                  c.beginPath();
                  c.arc(bX, bY, bSize, 0, Math.PI * 2);
                  c.fill();

                  // Delicate outer slime membrane border
                  c.strokeStyle = `hsla(${(bHue + 60) % 360}, 90%, 85%, 0.55)`;
                  c.lineWidth = 0.8 * effectScale;
                  c.beginPath();
                  c.arc(bX, bY, bSize, 0, Math.PI * 2);
                  c.stroke();
              }
          }

          // 3. Bio-cell nuclear division and morphing membranes (Metaballs & Amoeba structures)
          const cellCycles = 3;
          for (let m = 0; m < cellCycles; m++) {
              c.save();
              c.rotate(t * 0.0004 + m);
              
              const mHue = (acidHue + m * 80) % 360;
              c.fillStyle = `hsla(${mHue}, 80%, 45%, 0.08)`;
              c.strokeStyle = `hsla(${mHue}, 85%, 60%, 0.45)`;
              c.lineWidth = 1.8 * effectScale;
              
              c.beginPath();
              
              const mPoints = 20;
              const mCenterDist = (15 + m * 20) * effectScale;
              
              // Amoeba shape shifter wave dynamics
              const morphSway = Math.sin(t * 0.001) * 0.5 + 0.5; // slow divider state

              for (let j = 0; j <= mPoints; j++) {
                  const mAngle = (j * Math.PI * 2) / mPoints;
                  const squish = 1.0 + 0.18 * Math.sin(mAngle * 3 + t * 0.002) * morphSway;
                  const mWave = Math.sin(t * 0.0018 + j * 0.7 + m) * (9 + 5 * morphSway) * effectScale;
                  
                  const x = Math.cos(mAngle) * (mCenterDist * squish + mWave);
                  const y = Math.sin(mAngle) * (mCenterDist * squish + mWave);
                  if (j === 0) c.moveTo(x, y);
                  else c.lineTo(x, y);
              }
              c.closePath();
              c.fill();
              c.stroke();
              c.restore();
          }

          c.restore();
          break;
        }
        case 'plasma': {
          // Nuclear Tesla Fusion Plasma Induction Core with rotating dynamic electrodes and rainbow lightning discharge
          c.save();
          c.globalCompositeOperation = 'screen';

          const plasmaRadius = radius * effectScale;
          const configHue = (t * 0.035) % 360;

          // 1. Outer Electrodes (Peripheral nodes jumping currents inside with shifting hues)
          const numElectrodes = 6;
          c.save();
          c.rotate(t * 0.0004);
          for (let i = 0; i < numElectrodes; i++) {
              const elAngle = i * (Math.PI * 2 / numElectrodes);
              const elX = Math.cos(elAngle) * plasmaRadius * 0.95;
              const elY = Math.sin(elAngle) * plasmaRadius * 0.95;
              
              // Gold/Orange/Indigo metal tips
              const metallicGrad = c.createRadialGradient(elX, elY, 0, elX, elY, 8 * effectScale);
              const elHue = (configHue + i * (360 / numElectrodes)) % 360;
              metallicGrad.addColorStop(0, '#ffffff');
              metallicGrad.addColorStop(0.4, `hsl(${elHue}, 100%, 65%)`); 
              metallicGrad.addColorStop(1, `hsl(${(elHue + 120) % 360}, 90%, 25%)`);  
              c.fillStyle = metallicGrad;
              c.beginPath();
              c.arc(elX, elY, 9 * effectScale, 0, Math.PI * 2);
              c.fill();
          }
          c.restore();

          // 2. Hot central electromagnetic reactor core
          const cellPulse = 1.0 + 0.12 * Math.sin(t * 0.016);
          const fusionCoreSize = 25 * cellPulse * effectScale;
          const insideCoreGlow = c.createRadialGradient(0, 0, 0, 0, 0, fusionCoreSize);
          insideCoreGlow.addColorStop(0, '#ffffff'); // hyper white fusion
          insideCoreGlow.addColorStop(0.35, `hsl(${configHue}, 95%, 65%)`); // moving purple fusion
          insideCoreGlow.addColorStop(0.85, `hsl(${(configHue + 120) % 360}, 95%, 55%)`); 
          insideCoreGlow.addColorStop(1.0, 'transparent');
          c.fillStyle = insideCoreGlow;
          c.beginPath();
          c.arc(0, 0, fusionCoreSize, 0, Math.PI * 2);
          c.fill();

          // 3. Electric Lightning Discharge Strands jumping between core and electrodes
          c.lineWidth = 1.8 * effectScale;
          c.shadowBlur = 12;
          c.shadowColor = customColor || `hsl(${configHue}, 100%, 65%)`;
          
          const maxLightningArcs = Math.max(3, Math.round(effectComplexity * 0.45));
          for (let l = 0; l < maxLightningArcs; l++) {
              c.save();
              // Pick random dynamic targets
              const arcIndex = Math.floor(t * 0.018 + l) % numElectrodes;
              const targetAngle = arcIndex * (Math.PI * 2 / numElectrodes) + t * 0.0004;
              
              const startX = 0;
              const startY = 0;
              const endX = Math.cos(targetAngle) * plasmaRadius * 0.91;
              const endY = Math.sin(targetAngle) * plasmaRadius * 0.91;

              // Generate jagged fractals / lightning steps with rich color shifts
              const arcHue = (configHue + l * 90) % 360;
              c.strokeStyle = customColor || `hsl(${arcHue}, 100%, 75%)`;
              c.beginPath();
              c.moveTo(startX, startY);
              
              const steps = 10;
              let lx = startX;
              let ly = startY;
              for (let s = 1; s <= steps; s++) {
                  const sRatio = s / steps;
                  
                  // Linear Interpolated anchor point
                  const baseLX = startX + (endX - startX) * sRatio;
                  const baseLY = startY + (endY - startY) * sRatio;

                  // High speed lightning spatial disturbance
                  let speedRate = t * 0.06;
                  // Dynamic shape morphing lightning: wavy spiral versus sharp jagged
                  const morphMode = Math.sin(t * 0.001 + l) * 0.5 + 0.5;
                  const amp = 8 * (1.0 - sRatio) * effectScale;
                  
                  let jitterX = 0;
                  let jitterY = 0;
                  if (s < steps) {
                      if (morphMode > 0.6) {
                          // Beautiful wave spiral plasma
                          jitterX = Math.sin(speedRate * sRatio * 15) * amp;
                          jitterY = Math.cos(speedRate * sRatio * 15) * amp;
                      } else {
                          // Sharp lightning jagged jumps
                          jitterX = (Math.sin(speedRate * sRatio * 15 + l * 29) + Math.cos(speedRate * 3)) * amp;
                          jitterY = (Math.cos(speedRate * sRatio * 13 + l * 17) + Math.sin(speedRate * 4)) * amp;
                      }
                  }

                  lx = baseLX + jitterX;
                  ly = baseLY + jitterY;
                  c.lineTo(lx, ly);
              }
              c.stroke();
              c.restore();
          }

          c.shadowBlur = 0;
          c.restore();
          break;
        }
        case 'portal': {
          // High-fidelity Quantum Stargate Wormhole / Portal anomaly with custom morphing gate structures
          c.save();
          c.globalCompositeOperation = 'screen'; // additive neon blending

          const prtlHue = (t * 0.04) % 360;
          const gateMorph = Math.sin(t * 0.001) * 0.5 + 0.5; // Morphs circle gates into multi-sided polygons

          // 1. Kinetic Spiraling Vortex Arms (Spins dynamically)
          const numArms = 8;
          c.lineWidth = 2.5 * effectScale;
           for (let i = 0; i < numArms; i++) {
              c.save();
              const initialRotation = i * (Math.PI * 2 / numArms) + t * 0.0016;
              c.rotate(initialRotation);
              
              c.beginPath();
              const grad = c.createLinearGradient(0, 0, radius * effectScale, 0);
              const armHue = (prtlHue + i * (360 / numArms)) % 360;
              grad.addColorStop(0, `hsl(${armHue}, 95%, 60%)`);       // event horizon core
              grad.addColorStop(0.4, `hsl(${(armHue + 120) % 360}, 95%, 55%)`); // Cyber electric blue body
              grad.addColorStop(0.75, `hsl(${(armHue + 240) % 360}, 95%, 70%)`); // Teal particle rim
              grad.addColorStop(1, 'transparent'); // Dissipating outer field
              c.strokeStyle = grad;
              
              c.moveTo(0, 0);
              
              // Quadratic bezier curve to create spiraling structure
              const ctrl1X = radius * 0.45 * effectScale;
              const ctrl1Y = radius * 0.32 * effectScale * Math.sin(t * 0.002);
              const endX = radius * 0.95 * effectScale;
              const endY = radius * 0.22 * effectScale * Math.cos(t * 0.0015);
              c.quadraticCurveTo(ctrl1X, ctrl1Y, endX, endY);
              c.stroke();
              c.restore();
          }
          
          // 2. Thick Outer Cyber Ring with neon glow & dynamic shape morphing (Circle to Hexagon/Octagon gate)
          c.strokeStyle = customColor || `hsl(${prtlHue}, 95%, 60%)`;
          c.lineWidth = 3.5 * effectScale;
          
          const maxGateSides = 3 + Math.floor((Math.sin(t * 0.0005) * 0.5 + 0.5) * 6); // morphs stargates
          c.beginPath();
          for (let s = 0; s <= maxGateSides; s++) {
              const ringAngle = (s * Math.PI * 2) / maxGateSides;
              const rCircle = radius * 0.94;
              const rPoly = radius * 0.94 * (1.0 + 0.07 * Math.sin(ringAngle * 3));
              const currentR = rCircle * (1.0 - gateMorph) + rPoly * gateMorph;
              
              const gX = Math.cos(ringAngle) * currentR;
              const gY = Math.sin(ringAngle) * currentR;
              if (s === 0) c.moveTo(gX, gY);
              else c.lineTo(gX, gY);
          }
          c.stroke();
          
          // Faint dash orbiting telemetry outer details
          c.strokeStyle = customColor || `hsla(${(prtlHue + 180) % 360}, 95%, 70%, 0.45)`;
          c.lineWidth = 1 * effectScale;
          c.setLineDash([4, 16]);
          c.save();
          c.rotate(t * 0.0004);
          c.beginPath();
          c.arc(0, 0, radius * 0.98, 0, Math.PI * 2);
          c.stroke();
          c.restore();
          c.setLineDash([]);
          
          // 3. Sucking Thermal Particle Dust (Flowing into the vortex center)
          const particleCount = 20;
          for (let s = 0; s < particleCount; s++) {
              const seedAngle = s * (Math.PI * 2 / particleCount);
              const speedRatio = 0.001 + (s % 4) * 0.0012;
              const prog = (t * speedRatio + s * 0.15) % 1.0; 
              
              // Particles moving from edge (1.0) into center (0.0)
              const currentDist = radius * 0.92 * (1.0 - prog) * effectScale;
              
              // Spiraling wave formula
              const particleX = Math.cos(seedAngle + prog * 1.8 + t * 0.0005) * currentDist;
              const particleY = Math.sin(seedAngle + prog * 1.8 + t * 0.0005) * currentDist;
              
              const particleHue = (prtlHue + s * 18) % 360;
              c.fillStyle = customColor || `hsla(${particleHue}, 95%, 75%, ${0.85 - prog * 0.65})`;
              c.beginPath();
              c.arc(particleX, particleY, 2.5 * (1.15 - prog) * effectScale, 0, Math.PI * 2);
              c.fill();
          }
          
          // 4. Concentric Pulsating Event Horizon Wave rings (Convey depth expansion)
          const energyRings = 5;
          for (let r = 0; r < energyRings; r++) {
              const ringCycle = ((t * 0.0016 + r * 0.2) % 1.0);
              const pulseDist = ringCycle * radius * 0.92 * effectScale;
              const ringHue = (prtlHue + r * 60) % 360;
              c.strokeStyle = customColor || `hsla(${ringHue}, 95%, 65%, ${0.72 * (1.0 - ringCycle)})`;
              c.lineWidth = 2 * effectScale;
              c.beginPath();
              c.arc(0, 0, pulseDist, 0, Math.PI * 2);
              c.stroke();
          }
          
          c.restore();
          break;
        }
        case 'dna': {
          // Hyper-Realistic Spinning 3D Genetic Genome Sequencer Double Helix (Multicolor shape-morphing genomes)
          c.save();
          c.globalCompositeOperation = 'screen';

          const dnaSize = radius * effectScale;
          const amplitude = dnaSize * 0.42;
          const angle3D = t * 0.0022;
          const dnaHue = (t * 0.04) % 360;

          // 1. Draw Tech Analyzer target HUD brackets in the margins with shifting hue
          c.strokeStyle = customColor || `hsla(${dnaHue}, 90%, 55%, 0.25)`;
          c.lineWidth = 1 * effectScale;
          c.beginPath();
          c.arc(0, 0, dnaSize, 0, Math.PI * 2);
          c.stroke();
          
          c.setLineDash([5, 15]);
          c.beginPath();
          c.arc(0, 0, dnaSize * 0.95, -Math.PI/4, Math.PI/4);
          c.arc(0, 0, dnaSize * 0.95, Math.PI * 3/4, Math.PI * 5/4);
          c.stroke();
          c.setLineDash([]);

          // 2. Pre-calculate nodes for correct 3D depth sorting
          const nodes: Array<{
              x: number;
              y: number;
              z: number; // For depth sorting / scale
              color: string;
              glowColor: string;
              baseChar: string;
          }> = [];

          const stepY = Math.max(8, Math.round(18 / effectScale));
          for (let y = -dnaSize * 0.85; y <= dnaSize * 0.85; y += stepY) {
              const phase = y * 0.032 + angle3D;
              
              // Strand A (Changing spectrum: Magenta-Cyan-Gold)
              const xA = Math.sin(phase) * amplitude;
              const zA = Math.cos(phase); // -1.0 (back) to +1.0 (front)

              // Strand B
              const xB = Math.sin(phase + Math.PI) * amplitude;
              const zB = Math.cos(phase + Math.PI);

              const naHue = (dnaHue + y * 0.5) % 360;
              const nbHue = (dnaHue + y * 0.5 + 180) % 360;

              nodes.push({
                  x: xA,
                  y: y,
                  z: zA,
                  color: customColor || `hsl(${naHue}, 95%, 60%)`, 
                  glowColor: `hsla(${naHue}, 95%, 60%, 0.4)`,
                  baseChar: (y % 4 === 0) ? 'A' : 'T'
              });

              nodes.push({
                  x: xB,
                  y: y,
                  z: zB,
                  color: customColor || `hsl(${nbHue}, 95%, 60%)`,
                  glowColor: `hsla(${nbHue}, 95%, 60%, 0.4)`,
                  baseChar: (y % 4 === 0) ? 'G' : 'C'
              });
          }

          const midLength = nodes.length / 2;
          for (let i = 0; i < midLength; i++) {
              const na = nodes[i * 2];
              const nb = nodes[i * 2 + 1];

              const backNode = na.z < nb.z ? na : nb;
              const frontNode = na.z >= nb.z ? na : nb;

              // 1. Draw BACK node
              const backSize = (1.8 + (backNode.z + 1.0) * 1.8) * effectScale;
              const backAlpha = 0.35 + (backNode.z + 1.0) * 0.32;
              c.fillStyle = backNode.color;
              c.globalAlpha = backAlpha;
              c.beginPath();
              c.arc(backNode.x, backNode.y, backSize, 0, Math.PI * 2);
              c.fill();

              // 2. Draw CONNECTING base-pair rung (with spiral wave morphing)
              const rungGrad = c.createLinearGradient(backNode.x, backNode.y, frontNode.x, frontNode.y);
              rungGrad.addColorStop(0, backNode.color);
              rungGrad.addColorStop(0.5, 'rgba(255,255,255,0.85)'); // glowing hydrogen liaison bridge
              rungGrad.addColorStop(1, frontNode.color);
              
              c.strokeStyle = rungGrad;
              c.lineWidth = (1 + (frontNode.z + 1.0) * 1.5) * effectScale;
              c.globalAlpha = 0.45 + (frontNode.z + 1.0) * 0.25;

              c.beginPath();
              // Morph straight rungs into wavy sine bonds
              const rungMorph = Math.sin(t * 0.0019) * 0.5 + 0.5;
              if (rungMorph > 0.5) {
                  // Draw sinusoidal curved bridge
                  const midX = (backNode.x + frontNode.x) / 2;
                  const midY = (backNode.y + frontNode.y) / 2 + Math.sin(t * 0.003 + i) * 12 * effectScale;
                  c.quadraticCurveTo(midX, midY, frontNode.x, frontNode.y);
              } else {
                  c.moveTo(backNode.x, backNode.y);
                  c.lineTo(frontNode.x, frontNode.y);
              }
              c.stroke();

              // 3. Draw FRONT node
              const frontSize = (1.8 + (frontNode.z + 1.0) * 1.8) * effectScale;
              const frontAlpha = 0.4 + (frontNode.z + 1.0) * 0.3;
              c.fillStyle = frontNode.color;
              c.globalAlpha = frontAlpha;
              
              c.shadowBlur = 10 * (frontNode.z + 1.0);
              c.shadowColor = frontNode.color;
              c.beginPath();
              c.arc(frontNode.x, frontNode.y, frontSize, 0, Math.PI * 2);
              c.fill();
              c.shadowBlur = 0; // Reset

              // Draw little digital base-pair letters overlays
              if (frontNode.z > 0.6 && effectScale > 0.8) {
                  c.fillStyle = '#ffffff';
                  c.globalAlpha = 0.95;
                  c.font = 'bold 7px monospace';
                  c.textAlign = 'center';
                  c.textBaseline = 'middle';
                  c.fillText(frontNode.baseChar, frontNode.x, frontNode.y);
              }
          }

          c.globalAlpha = 1.0;
          c.restore();
          break;
        }
        case 'clock': {
          c.save();
          // Get highly accurate local clock time including sub-seconds for sweeping effects
          const date = new Date();
          const ms = date.getMilliseconds();
          const sec = date.getSeconds() + ms / 1000;
          const min = date.getMinutes() + sec / 60;
          const hr = (date.getHours() % 12) + min / 60;

          const clkHue = (t * 0.033) % 360;
          const clockMorph = Math.sin(t * 0.001) * 0.5 + 0.5; // Morphs circle face to gear or decagon

          // 1. Ambient Clock face glowing background shifting colors
          const clockBgGrad = c.createRadialGradient(0, 0, 0, 0, 0, radius);
          clockBgGrad.addColorStop(0, `hsla(${clkHue}, 95%, 55%, 0.06)`);
          clockBgGrad.addColorStop(0.7, `hsla(${(clkHue + 120) % 360}, 95%, 45%, 0.03)`);
          clockBgGrad.addColorStop(1.0, 'transparent');
          c.fillStyle = clockBgGrad;
          c.beginPath();
          c.arc(0, 0, radius, 0, Math.PI * 2);
          c.fill();

          // 2. Double Cyber Bezel / Face Outer Border (Morphs Star/Decagon/Circle)
          c.strokeStyle = customColor || `hsl(${clkHue}, 95%, 60%)`;
          c.lineWidth = 3 * effectScale;
          
          c.beginPath();
          const clockSides = 12; // 12-sided dodecagram layout
          for (let d = 0; d <= clockSides * 2; d++) {
              const dAngle = (d * Math.PI) / clockSides - Math.PI / 2;
              const rBase = radius - 5;
              const rDec = (d % 2 === 0) ? radius - 5 : radius - 11;
              const curR = rBase * (1.0 - clockMorph) + rDec * clockMorph;
              const dx = Math.cos(dAngle) * curR;
              const dy = Math.sin(dAngle) * curR;
              if (d === 0) c.moveTo(dx, dy);
              else c.lineTo(dx, dy);
          }
          c.stroke();

          // Thin secondary inner dashboard ring
          c.strokeStyle = customColor || `hsla(${(clkHue + 120) % 360}, 90%, 55%, 0.35)`;
          c.lineWidth = 1 * effectScale;
          c.beginPath();
          c.arc(0, 0, radius - 12, 0, Math.PI * 2);
          c.stroke();

          // Orbiting telemetry dashed ring
          c.strokeStyle = customColor || `hsla(${(clkHue + 240) % 360}, 90%, 55%, 0.45)`;
          c.lineWidth = 1 * effectScale;
          c.setLineDash([2, 8]);
          c.beginPath();
          c.arc(0, 0, radius - 18, 0, Math.PI * 2);
          c.stroke();
          c.setLineDash([]);

          // 3. Dial Ticks
          c.lineWidth = 2 * effectScale;
          for (let i = 0; i < 12; i++) {
              c.save();
              const angle = i * (Math.PI / 6);
              c.rotate(angle);
              
              const isMajor = i % 3 === 0;
              const tickHue = (clkHue + i * 30) % 360;
              c.strokeStyle = customColor || `hsl(${tickHue}, 95%, 65%)`;
              c.lineWidth = isMajor ? 3 * effectScale : 1.5 * effectScale;
              
              c.beginPath();
              const tickStart = radius - 10;
              const tickEnd = radius - 5;
              c.moveTo(0, -tickStart);
              c.lineTo(0, -tickEnd);
              c.stroke();
              c.restore();
          }

          // 4. Render Hour Numbers (1 to 12)
          c.fillStyle = customColor || `hsl(${(clkHue + 180) % 360}, 95%, 65%)`; 
          const fontSize = Math.max(10, Math.round(13 * effectScale));
          c.font = `bold ${fontSize}px "JetBrains Mono", "Courier New", monospace`;
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          
          for (let h = 1; h <= 12; h++) {
              const numAngle = h * (Math.PI / 6) - (Math.PI / 2);
              const textDist = (radius - 23) * effectScale;
              const numX = Math.cos(numAngle) * textDist;
              const numY = Math.sin(numAngle) * textDist;
              c.fillText(String(h), numX, numY);
          }

          // 5. Mini Digital Time HUD Display
          const padZero = (val: number) => String(Math.floor(val)).padStart(2, '0');
          c.fillStyle = customColor || `hsla(${clkHue}, 95%, 65%, 0.8)`;
          const techFontSize = Math.max(8, Math.round(9.5 * effectScale));
          c.font = `500 ${techFontSize}px "JetBrains Mono", monospace`;
          const displayTime = `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
          c.fillText(displayTime, 0, radius * 0.38);

          // 6. Draw hands with vibrant color rotations
          c.lineCap = 'round';

          // A. Hour Hand (Thick Violet/Neon)
          c.save();
          c.rotate(hr * (Math.PI / 6)); 
          c.strokeStyle = customColor || `hsl(${(clkHue + 280) % 360}, 95%, 60%)`;
          c.lineWidth = 5 * effectScale;
          c.beginPath();
          c.moveTo(0, radius * 0.1); 
          c.lineTo(0, -radius * 0.44 * effectScale);
          c.stroke();
          c.restore();

          // B. Minute Hand (Chic Ice blue)
          c.save();
          c.rotate(min * (Math.PI / 30)); 
          c.strokeStyle = customColor || `hsl(${(clkHue + 190) % 360}, 95%, 60%)`;
          c.lineWidth = 3.5 * effectScale;
          c.beginPath();
          c.moveTo(0, radius * 0.12);
          c.lineTo(0, -radius * 0.64 * effectScale);
          c.stroke();
          c.restore();

          // C. Second Hand (Sweeping hot pink)
          c.save();
          c.rotate(sec * (Math.PI / 30)); 
          c.strokeStyle = customColor || `hsl(${(clkHue + 340) % 360}, 95%, 65%)`;
          c.lineWidth = 1.5 * effectScale;
          c.beginPath();
          c.moveTo(0, radius * 0.18); 
          c.lineTo(0, -radius * 0.78 * effectScale);
          c.stroke();

          c.fillStyle = customColor || `hsl(${(clkHue + 340) % 360}, 95%, 65%)`;
          c.beginPath();
          c.arc(0, -radius * 0.78 * effectScale, 2.2 * effectScale, 0, Math.PI * 2);
          c.fill();
          c.restore();

          // D. Brushed center cap covering origin
          const capSize = 7.5 * effectScale;
          const axisGrad = c.createRadialGradient(-2.5 * effectScale, -2.5 * effectScale, 0, 0, 0, capSize);
          axisGrad.addColorStop(0, '#ffffff');
          axisGrad.addColorStop(0.3, `hsl(${clkHue}, 95%, 65%)`);
          axisGrad.addColorStop(1.0, `hsl(${(clkHue + 200) % 360}, 95%, 25%)`);
          c.fillStyle = axisGrad;
          
          c.beginPath();
          c.arc(0, 0, capSize, 0, Math.PI * 2);
          c.fill();
          
          c.strokeStyle = customColor || `hsl(${clkHue}, 95%, 50%)`;
          c.lineWidth = 1.2 * effectScale;
          c.stroke();

          c.restore();
          break;
        }
         case 'mushrooms': {
          // Hyper-detailed, 3D shaded fluorescent bioluminescent mushrooms with floating spore particles (Multi-colored shape-morphing wild fungi)
          c.save();
          
          const mshHue = (t * 0.033) % 360;

          // Glowing fluorescent terrain with network lines
          const turfGrad = c.createRadialGradient(0, radius * 0.7, 0, 0, radius * 0.7, radius * 0.85);
          turfGrad.addColorStop(0, `hsla(${mshHue}, 90%, 55%, 0.45)`);
          turfGrad.addColorStop(0.6, `hsla(${(mshHue + 180) % 360}, 90%, 55%, 0.18)`);
          turfGrad.addColorStop(1.0, 'transparent');
          c.fillStyle = turfGrad;
          c.beginPath();
          c.ellipse(0, radius * 0.65, radius * 0.82, radius * 0.25, 0, 0, Math.PI * 2);
          c.fill();

          // Bioluminescent mycelial roots spreading on soil
          c.strokeStyle = customColor || `hsla(${(mshHue + 120) % 360}, 95%, 65%, 0.35)`;
          c.lineWidth = 1 * effectScale;
          for (let i = -5; i <= 5; i++) {
              const rootX = i * 20 * effectScale;
              c.beginPath();
              c.moveTo(rootX, radius * 0.65);
              c.quadraticCurveTo(rootX * 1.5, radius * 0.72, rootX * 2, radius * 0.85);
              c.stroke();
          }

          const drawBiolumMushroom = (mx: number, my: number, bounceOff: number, mScale: number, capHueVal: number, gillsHueVal: number, spotsColor: string) => {
             // Living organic pulsation and side-sway
             const organicTime = t * 0.003 + bounceOff;
             const bounce = Math.sin(organicTime) * 8 * effectScale;
             const sway = Math.cos(organicTime * 0.6) * 0.07;
             
             c.save();
             c.translate(mx, my + bounce);
             c.scale(mScale * effectScale, mScale * effectScale);
             c.rotate(sway);

             // Stem (Translucent, glowing 3D-cylinder with inner fibers)
             const stemGrad = c.createLinearGradient(-8, 50, 8, 0);
             stemGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
             stemGrad.addColorStop(0.4, `hsla(${gillsHueVal}, 95%, 90%, 0.75)`);
             stemGrad.addColorStop(1, `hsla(${capHueVal}, 95%, 85%, 0.9)`);
             c.fillStyle = stemGrad;
             c.beginPath();
             c.moveTo(-7, 0);
             c.quadraticCurveTo(-11, 24, -14, 48);
             c.lineTo(14, 48);
             c.quadraticCurveTo(11, 24, 7, 0);
             c.closePath();
             c.fill();

             // Stem inner glowing fibers (gill connection)
             c.strokeStyle = customColor || `hsla(${gillsHueVal}, 95%, 60%, 0.5)`;
             c.lineWidth = 1;
             c.beginPath();
             c.moveTo(-3, 10); c.lineTo(-5, 45);
             c.moveTo(0, 5); c.lineTo(0, 45);
             c.moveTo(3, 10); c.lineTo(5, 45);
             c.stroke();

             // 2. Bioluminescent Gills underneath the cap
             c.fillStyle = customColor || `hsl(${gillsHueVal}, 95%, 55%)`;
             c.beginPath();
             c.ellipse(0, 0, 36, 11, 0, 0, Math.PI * 2);
             c.fill();
             
             // Ray lines on gills
             c.strokeStyle = 'rgba(0, 0, 0, 0.25)';
             c.lineWidth = 1;
             for (let a = 0; a < Math.PI * 2; a += Math.PI / 10) {
                 c.beginPath();
                 c.moveTo(0, 0);
                 c.lineTo(Math.cos(a) * 36, Math.sin(a) * 11);
                 c.stroke();
             }

             // 3. Volumetric Glowing Cap morphing dynamically from Pointy conical to Wide umbrellas
             const capHeight = -42 - 12 * Math.sin(t * 0.0016 + bounceOff);
             const capWidth = 38 + 5 * Math.cos(t * 0.0022 + bounceOff);

             const capColor = customColor || `hsl(${capHueVal}, 95%, 58%)`;
             const capGrad = c.createRadialGradient(0, capHeight * 0.5, 2, 0, -10, 45);
             capGrad.addColorStop(0, capColor);
             capGrad.addColorStop(0.7, capColor);
             capGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0.9)');
             c.fillStyle = capGrad;
             
             c.beginPath();
             c.moveTo(-capWidth, 0);
             // Dynamic pointiness / roundness morph
             const organicPointiness = Math.sin(t * 0.0013 + bounceOff) * 12;
             c.quadraticCurveTo(-capWidth - 3, capHeight, organicPointiness, capHeight);
             c.quadraticCurveTo(capWidth + 3, capHeight, capWidth, 0);
             // Organic wavy underside
             const baseWave = 6 + 5 * Math.sin(t * 0.0048 + bounceOff);
             c.quadraticCurveTo(0, baseWave, -capWidth, 0);
             c.closePath();
             c.fill();

             // 4. Glowing Fluorescent Spots on Cap
             const pulseSpots = 0.8 + 0.2 * Math.sin(t * 0.005 + bounceOff);
             c.fillStyle = spotsColor;
             c.save();
             c.globalAlpha = pulseSpots;
             
             // Spot layouts
             c.beginPath(); c.arc(-16, -18, 5, 0, Math.PI * 2); c.fill();
             c.beginPath(); c.arc(14, -26, 7, 0, Math.PI * 2); c.fill();
             c.beginPath(); c.arc(2, -12, 4.5, 0, Math.PI * 2); c.fill();
             c.beginPath(); c.arc(-24, -6, 2.5, 0, Math.PI * 2); c.fill();
             c.beginPath(); c.arc(24, -8, 3, 0, Math.PI * 2); c.fill();
             
             c.restore();
             c.restore();
          };

          // Render three glowing mushroom layers with beautifully calibrated contrasting hues
          drawBiolumMushroom(-radius * 0.38, radius * 0.18, 0, 0.82, mshHue, (mshHue + 60) % 360, '#ffffff');
          drawBiolumMushroom(radius * 0.36, radius * 0.22, Math.PI, 0.74, (mshHue + 120) % 360, (mshHue + 180) % 360, '#e0f2fe');
          drawBiolumMushroom(0, -radius * 0.05, Math.PI/2, 1.15, (mshHue + 240) % 360, (mshHue + 30) % 360, '#ffedf5');

          // 5. Rising spore particulates floating to space
          const numSpores = 18;
          for (let i = 0; i < numSpores; i++) {
              const pSeed = i * 43.2 + t * 0.0016;
              const prog = (pSeed) % 1.0;
              
              let startX = 0;
              if (i % 3 === 0) startX = -radius * 0.38;
              else if (i % 3 === 1) startX = radius * 0.36;
              
              const sporeY = radius * 0.65 - prog * radius * 1.35;
              const dSway = Math.sin(t * 0.0024 + i * 29) * 22;
              const sporeX = startX + dSway;
              
              const sprHue = (mshHue + i * 20) % 360;
              const sporeColor = customColor || `hsla(${sprHue}, 95%, 70%, `;
              const alpha = (0.8 - prog * 0.65) * (0.8 + 0.2 * Math.sin(t * 0.02 + i));
              
              c.fillStyle = customColor ? `rgba(${sporeColor}, ${alpha})` : `${sporeColor}${alpha})`;
              c.beginPath();
              c.arc(sporeX, sporeY, (1.2 + (i % 3) * 1.2) * effectScale * (1.1 - prog), 0, Math.PI * 2);
              c.fill();
          }

          c.restore();
          break;
        }
        case 'alien': {
          // Telepathic detailed Alien visitor with galaxy/nebula coordinates inside eyes (Dynamic morphing head and colors)
          c.save();
          
          const alnHue = (t * 0.02) % 360;
          const alnMorph = Math.sin(t * 0.0016) * 0.5 + 0.5; // slow morph factor for lobed skull

          // Background spinning cosmic starfield
          c.fillStyle = 'rgba(255, 255, 255, 0.45)';
          const spaceCount = Math.max(8, Math.round(effectComplexity * 1.8));
          for(let i=0; i<spaceCount; i++) {
              const angle = (i * 153.2 + t * 0.0006) % (Math.PI * 2);
              const sDist = (i * 35.4 + t * 0.04) % (radius * 1.2 * effectScale);
              c.beginPath();
              c.arc(Math.cos(angle)*sDist, Math.sin(angle)*sDist, (0.8 + (i % 3) * 1.2) * effectScale, 0, Math.PI * 2);
              c.fill();
          }

          const alienHeadOsc = Math.sin(t * 0.0022) * 10 * effectScale;
          c.translate(0, alienHeadOsc);

          // Telepathic Brainwave Rings extending from skull with spectrum cycling
          const telemetryRings = 4;
          for (let i = 0; i < telemetryRings; i++) {
              const rngProg = ((t * 0.0016 + i * 0.25) % 1.0);
              const rngR = radius * 0.35 + rngProg * radius * 0.58;
              c.strokeStyle = customColor || `hsla(${(alnHue + i * 36) % 360}, 95%, 60%, ${0.45 * (1.0 - rngProg)})`;
              c.lineWidth = 1.2 * effectScale;
              c.beginPath();
              c.ellipse(0, -18 * effectScale, rngR * 0.72 * effectScale, rngR * 0.5 * effectScale, 0, 0, Math.PI * 2);
              c.stroke();
          }

          // 1. Shaded 3D-effect Head structure (High-latitude spectral gradients)
          const headRadiusX = 47 * effectScale;
          const headRadiusY = 62 * effectScale;
          const headGrad = c.createRadialGradient(-8 * effectScale, -25 * effectScale, 5 * effectScale, 0, -10 * effectScale, headRadiusY);
          headGrad.addColorStop(0, `hsl(${(alnHue + 120) % 360}, 95%, 85%)`);       // Hot brain energy reflection
          headGrad.addColorStop(0.35, `hsl(${alnHue}, 90%, 75%)`);    // Main skin tone
          headGrad.addColorStop(0.85, `hsl(${(alnHue + 240) % 360}, 90%, 55%)`);    // Body rim
          headGrad.addColorStop(1.0, `hsl(${(alnHue + 280) % 360}, 90%, 25%)`);     // Shadow division boundary
          
          c.fillStyle = headGrad;
          c.lineWidth = 2 * effectScale;
          c.strokeStyle = customColor || `hsla(${alnHue}, 95%, 65%, 0.45)`;
          
          c.beginPath();
          // Volumetric skull shape morphing dynamically (Grows lobes and contracts chin)
          for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
              const cosA = Math.cos(a);
              const sinA = Math.sin(a);
              const topLobeFactor = Math.sin(t * 0.0019) * 12 * effectScale * Math.max(0, -sinA); // grows on forehead
              const currentMorphRadius = (1.0 - alnMorph) * 1.0 + alnMorph * (1.0 + 0.14 * Math.sin(a * 2 + Math.PI / 2));
              const ax = cosA * headRadiusX * currentMorphRadius;
              const ay = sinA * headRadiusY * currentMorphRadius - topLobeFactor;
              if (a === 0) c.moveTo(ax, ay);
              else c.lineTo(ax, ay);
          }
          c.closePath();
          c.fill();
          c.stroke();

          // 2. Forehead telepathic lobe glow marks
          const foreheadMarkGrad = c.createLinearGradient(0, -65 * effectScale, 0, -25 * effectScale);
          foreheadMarkGrad.addColorStop(0, customColor || `hsla(${(alnHue + 180) % 360}, 95%, 65%, 0.65)`);
          foreheadMarkGrad.addColorStop(1, 'transparent');
          c.fillStyle = foreheadMarkGrad;
          c.beginPath();
          c.moveTo(-16 * effectScale, -45 * effectScale);
          c.quadraticCurveTo(0, -60 * effectScale, 16 * effectScale, -45 * effectScale);
          c.quadraticCurveTo(0, -32 * effectScale, -16 * effectScale, -45 * effectScale);
          c.fill();

          // 3. Cyber/Organic Antennae (Deep curved wireframe loops)
          c.strokeStyle = customColor || `hsl(${alnHue}, 95%, 55%)`;
          c.lineWidth = 3.5 * effectScale;
          
          c.beginPath();
          c.moveTo(-16 * effectScale, -55 * effectScale);
          c.quadraticCurveTo(-42 * effectScale, -82 * effectScale, -28 * effectScale, -95 * effectScale);
          c.stroke();
          
          c.beginPath();
          c.moveTo(16 * effectScale, -55 * effectScale);
          c.quadraticCurveTo(42 * effectScale, -82 * effectScale, 28 * effectScale, -95 * effectScale);
          c.stroke();

          // Antenna Spheres with warm flares
          const flareMult = 1.0 + 0.15 * Math.sin(t * 0.012);
          const orbGradLeft = c.createRadialGradient(-28 * effectScale, -95 * effectScale, 0, -28 * effectScale, -95 * effectScale, 8 * effectScale);
          orbGradLeft.addColorStop(0, '#ffffff');
          orbGradLeft.addColorStop(0.3, customColor || `hsl(${(alnHue + 60) % 360}, 95%, 60%)`);
          orbGradLeft.addColorStop(1.0, 'transparent');
          
          const orbGradRight = c.createRadialGradient(28 * effectScale, -95 * effectScale, 0, 28 * effectScale, -95 * effectScale, 8 * effectScale);
          orbGradRight.addColorStop(0, '#ffffff');
          orbGradRight.addColorStop(0.3, customColor || `hsl(${(alnHue + 60) % 360}, 95%, 60%)`);
          orbGradRight.addColorStop(1.0, 'transparent');

          c.fillStyle = orbGradLeft;
          c.beginPath(); c.arc(-28 * effectScale, -95 * effectScale, 8 * flareMult * effectScale, 0, Math.PI*2); c.fill();
          c.fillStyle = orbGradRight;
          c.beginPath(); c.arc(28 * effectScale, -95 * effectScale, 8 * flareMult * effectScale, 0, Math.PI*2); c.fill();

          // 4. Stellar Galaxy Obsidian Almond-shaped Eyes with blink kinetics and swirling stellar gas
          const eyePulseBlink = Math.sin(t * 0.007) > 0.94 ? 0.08 : 1.0;
          
          const drawObsidianEye = (ex: number, ey: number, angle: number) => {
              c.save();
              c.translate(ex * effectScale, ey * effectScale);
              c.rotate(angle);
              
              c.beginPath();
              c.ellipse(0, 0, 11 * effectScale, 27 * eyePulseBlink * effectScale, 0, 0, Math.PI * 2);
              c.clip();

              const eyeBodyGrad = c.createRadialGradient(0, 5 * effectScale, 2 * effectScale, 0, 0, 27 * effectScale);
              eyeBodyGrad.addColorStop(0, `hsl(${(alnHue + 200) % 360}, 90%, 15%)`);
              eyeBodyGrad.addColorStop(0.7, '#020617');
              eyeBodyGrad.addColorStop(1.0, '#000000');
              c.fillStyle = eyeBodyGrad;
              c.beginPath();
              c.ellipse(0, 0, 11 * effectScale, 27 * eyePulseBlink * effectScale, 0, 0, Math.PI * 2);
              c.fill();

              // Interstellar gas inside eye shifts colors and rotates
              const dustGrad = c.createRadialGradient(-3, -10, 1, 0, 0, 15);
              dustGrad.addColorStop(0, `hsla(${(alnHue + 80) % 360}, 95%, 65%, 0.55)`);
              dustGrad.addColorStop(1, 'transparent');
              c.fillStyle = dustGrad;
              c.beginPath();
              c.ellipse(0, 0, 10 * effectScale, 26 * eyePulseBlink * effectScale, 0, 0, Math.PI * 2);
              c.fill();

              c.fillStyle = '#ffffff';
              c.beginPath();
              c.arc(-4 * effectScale, -11 * eyePulseBlink * effectScale, 2.8 * effectScale, 0, Math.PI * 2);
              c.fill();

              c.fillStyle = `hsla(${(alnHue + 180) % 360}, 95%, 75%, 0.6)`;
              c.beginPath();
              c.arc(2 * effectScale, 10 * eyePulseBlink * effectScale, 1.4 * effectScale, 0, Math.PI * 2);
              c.fill();

              c.restore();

              c.strokeStyle = customColor || `hsla(${(alnHue + 120) % 360}, 90%, 65%, 0.4)`;
              c.lineWidth = 1 * effectScale;
              c.beginPath();
              c.ellipse(ex * effectScale, ey * effectScale, 11.5 * effectScale, (27.5 * eyePulseBlink) * effectScale, angle, 0, Math.PI * 2);
              c.stroke();
          };

          drawObsidianEye(-21, 0, -0.32);
          drawObsidianEye(21, 0, 0.32);

          // 5. Interactive telepathic talking soundwave mouth
          const speechWave = Math.abs(Math.sin(t * 0.015)) * 6.5 * effectScale;
          c.strokeStyle = customColor || `hsl(${(alnHue + 120) % 360}, 95%, 25%)`;
          c.lineWidth = 2 * effectScale;
          c.beginPath();
          c.moveTo(-10 * effectScale, 30 * effectScale);
          
          if (speechWave > 1.5) {
              c.quadraticCurveTo(0, (30 - speechWave) * effectScale, 10 * effectScale, 30 * effectScale);
              c.quadraticCurveTo(0, (30 + speechWave) * effectScale, -10 * effectScale, 30 * effectScale);
              c.fillStyle = customColor || `hsla(${(alnHue + 120) % 360}, 90%, 35%, 0.25)`;
              c.fill();
          } else {
              c.quadraticCurveTo(0, 31.5 * effectScale, 10 * effectScale, 30 * effectScale);
          }
          c.stroke();

          c.restore();
          break;
        }
        case 'cube3d': {
          // Multidimensional 3-Axis Quantum Tesseract Hypercube (Rainbow morphing 4D system)
          c.save();
          c.globalCompositeOperation = 'screen';

          const baseSize = radius * 0.42 * effectScale;
          const cbdHue = (t * 0.04) % 360;
          
          // 8 Vertices representing [-1, 1] 3D coordinates
          const verts = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
          ];
          
          // 12 Outer Edges
          const edges = [
            [0,1],[1,2],[2,3],[3,0],
            [4,5],[5,6],[6,7],[7,4],
            [0,4],[1,5],[2,6],[3,7]
          ];

          // 6 Faces to draw colored glass panels
          const faces = [
            [0, 1, 2, 3], // Back
            [4, 5, 6, 7], // Front
            [0, 1, 5, 4], // Bottom
            [2, 3, 7, 6], // Top
            [0, 3, 7, 4], // Left
            [1, 2, 6, 5]  // Right
          ];
          
          // Independent offset rotational speeds per dimension
          const rx = t * 0.0012;
          const ry = t * 0.0016;
          const rz = t * 0.0006;
          
          const cosX = Math.cos(rx); const sinX = Math.sin(rx);
          const cosY = Math.cos(ry); const sinY = Math.sin(ry);
          const cosZ = Math.cos(rz); const sinZ = Math.sin(rz);
          
          // Helper to rotate & project 3D point (using perspective)
          const projectPoint = (v: number[], scaleMult: number) => {
              let x = v[0] * scaleMult, y = v[1] * scaleMult, z = v[2] * scaleMult;
              
              // Rotate X
              let y1 = y * cosX - z * sinX;
              let z1 = y * sinX + z * cosX;
              
              // Rotate Y
              let x1 = x * cosY + z1 * sinY;
              let z2 = -x * sinY + z1 * cosY;
              
              // Rotate Z
              let x2 = x1 * cosZ - y1 * sinZ;
              let y2 = x1 * sinZ + y1 * cosZ;
              
              const perspective = 300 / (300 + z2);
              return {
                  x: x2 * perspective,
                  y: y2 * perspective,
                  z: z2,
                  px: x2 * perspective,
                  py: y2 * perspective
              };
          };

          // Project Outer Cube nodes
          const outerProj = verts.map(v => projectPoint(v, baseSize));
          
          // Project Inner Core Cube nodes counter-rotating for extreme dynamic 4D morphing!
          const innerScale = 0.35 + 0.22 * Math.sin(t * 0.002);
          const innerProj = verts.map(v => {
              const cosM = Math.cos(t * 0.0012);
              const sinM = Math.sin(t * 0.0012);
              const rxVert = v[0] * cosM - v[1] * sinM;
              const ryVert = v[0] * sinM + v[1] * cosM;
              const rVert = [rxVert, ryVert, v[2]];
              return projectPoint(rVert, baseSize * innerScale);
          });

          // Draw orbital telemetry compass in background with dynamic colors
          c.strokeStyle = customColor || `hsla(${cbdHue}, 90%, 55%, 0.18)`;
          c.lineWidth = 1 * effectScale;
          c.beginPath();
          c.arc(0, 0, radius * 0.95 * effectScale, 0, Math.PI * 2);
          c.stroke();

          // 1. Draw TRANSLUCENT FACES (multi-colored glass panels)
          c.lineWidth = 1 * effectScale;
          faces.forEach((f, idx) => {
              c.fillStyle = customColor || `hsla(${(cbdHue + idx * 40) % 360}, 95%, 60%, ${0.07 - (idx * 0.005)})`;
              c.beginPath();
              c.moveTo(outerProj[f[0]].px, outerProj[f[0]].py);
              c.lineTo(outerProj[f[1]].px, outerProj[f[1]].py);
              c.lineTo(outerProj[f[2]].px, outerProj[f[2]].py);
              c.lineTo(outerProj[f[3]].px, outerProj[f[3]].py);
              c.closePath();
              c.fill();
          });

          // 2. Draw Tesseract INNER CORE CUBE edges (rotating color core)
          c.strokeStyle = customColor || `hsl(${(cbdHue + 180) % 360}, 95%, 65%)`;
          c.lineWidth = 1.5 * effectScale;
          c.beginPath();
          edges.forEach(e => {
              c.moveTo(innerProj[e[0]].px, innerProj[e[0]].py);
              c.lineTo(innerProj[e[1]].px, innerProj[e[1]].py);
          });
          c.stroke();

          // 3. Draw Outer Cube structural frame EDGES (shifting outer lasers)
          c.strokeStyle = customColor || `hsl(${cbdHue}, 95%, 60%)`;
          c.lineWidth = 2.5 * effectScale;
          c.shadowBlur = 10;
          c.shadowColor = customColor || `hsl(${cbdHue}, 95%, 60%)`;
          c.beginPath();
          edges.forEach(e => {
              c.moveTo(outerProj[e[0]].px, outerProj[e[0]].py);
              c.lineTo(outerProj[e[1]].px, outerProj[e[1]].py);
          });
          c.stroke();
          c.shadowBlur = 0; // Reset

          // 4. Draw connecting struts between outer vertices and inner core vertices
          c.strokeStyle = customColor || `hsla(${(cbdHue + 90) % 360}, 90%, 70%, 0.45)`;
          c.lineWidth = 1 * effectScale;
          c.setLineDash([4, 4]);
          c.beginPath();
          for (let i = 0; i < 8; i++) {
              c.moveTo(outerProj[i].px, outerProj[i].py);
              c.lineTo(innerProj[i].px, innerProj[i].py);
          }
          c.stroke();
          c.setLineDash([]);

          // 5. Draw glowing coordinate NODES (vertex particles)
          outerProj.forEach((p, index) => {
              c.fillStyle = '#ffffff';
              c.beginPath();
              c.arc(p.px, p.py, 3.8 * effectScale, 0, Math.PI * 2);
              c.fill();

              // Node halo ring shifts colors
              c.strokeStyle = customColor || `hsla(${(cbdHue + index * 45) % 360}, 95%, 65%, 0.75)`;
              c.lineWidth = 0.8 * effectScale;
              c.beginPath();
              c.arc(p.px, p.py, 7 * effectScale, 0, Math.PI * 2);
              c.stroke();
          });

          innerProj.forEach((p, index) => {
              c.fillStyle = customColor || `hsl(${(cbdHue + 180 + index * 45) % 360}, 95%, 85%)`;
              c.beginPath();
              c.arc(p.px, p.py, 2 * effectScale, 0, Math.PI * 2);
              c.fill();
          });

          c.restore();
          break;
        }
        case 'pov_text':
          c.save();
          
          const textToDraw = povText ? povText.toUpperCase().trim() : "POV SYSTEM";
          const glowColor = customColor || '#ffffff';
          c.shadowBlur = 20;
          c.shadowColor = glowColor;

          // Draw an elegant, ultra-cool cybernetic HUD glass panel / frame
          const bannerW = radius * 1.5;
          const bannerH = radius * 0.45;
          
          // Glass background panel with subtle glow
          c.fillStyle = 'rgba(255, 255, 255, 0.05)';
          c.strokeStyle = glowColor;
          c.lineWidth = 2;
          c.beginPath();
          // Backward compatible rounded rect
          const bannerX = -bannerW / 2;
          const bannerY = -bannerH / 2;
          const bannerWidth = bannerW;
          const bannerHeight = bannerH;
          const bannerRadius = 12;
          c.moveTo(bannerX + bannerRadius, bannerY);
          c.lineTo(bannerX + bannerWidth - bannerRadius, bannerY);
          c.arcTo(bannerX + bannerWidth, bannerY, bannerX + bannerWidth, bannerY + bannerHeight, bannerRadius);
          c.arcTo(bannerX + bannerWidth, bannerY + bannerHeight, bannerX, bannerY + bannerHeight, bannerRadius);
          c.arcTo(bannerX, bannerY + bannerHeight, bannerX, bannerY, bannerRadius);
          c.arcTo(bannerX, bannerY, bannerX + bannerWidth, bannerY, bannerRadius);
          c.closePath();
          c.fill();
          c.stroke();
          
          // Tech bracket accents [ ]
          c.strokeStyle = '#fff';
          c.lineWidth = 2.5;
          // Left bracket
          c.beginPath();
          c.moveTo(bannerX + 20, bannerY - 5);
          c.lineTo(bannerX - 5, bannerY - 5);
          c.lineTo(bannerX - 5, bannerY + bannerHeight + 5);
          c.lineTo(bannerX + 20, bannerY + bannerHeight + 5);
          c.stroke();
          
          // Right bracket
          c.beginPath();
          c.moveTo(bannerX + bannerWidth - 20, bannerY - 5);
          c.lineTo(bannerX + bannerWidth + 5, bannerY - 5);
          c.lineTo(bannerX + bannerWidth + 5, bannerY + bannerHeight + 5);
          c.lineTo(bannerX + bannerWidth - 20, bannerY + bannerHeight + 5);
          c.stroke();
          
          // Tech crosshairs / indicator dots
          c.fillStyle = '#fff';
          c.beginPath();
          c.arc(bannerX - 15, 0, 3, 0, Math.PI * 2);
          c.arc(bannerX + bannerWidth + 15, 0, 3, 0, Math.PI * 2);
          c.fill();
          
          // Dynamic text size scaling to keep everything within the banner boundaries
          c.textBaseline = 'middle';
          c.textAlign = 'center';
          let fontSize = radius * 0.16;
          c.font = `900 ${fontSize}px sans-serif`;
          
          const maxTextW = bannerW - 30;
          let measuredW = c.measureText(textToDraw).width;
          if (measuredW > maxTextW) {
             fontSize = fontSize * (maxTextW / measuredW);
             c.font = `900 ${fontSize}px sans-serif`;
          }
          
          c.save();
          if (povTextAnimation === 'fade') {
             // Dynamic smooth alpha fade in/out
             c.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(t * 0.0035));
          } else if (povTextAnimation === 'slide') {
             // Elegant back-and-forth slide animation
             const slideX = Math.sin(t * 0.002) * 15;
             c.translate(slideX, 0);
          } else if (povTextAnimation === 'pulse') {
             // Pumping scale pulse
             const scalePulse = 0.9 + 0.16 * Math.abs(Math.sin(t * 0.003));
             c.scale(scalePulse, scalePulse);
          }

          // Outer text reflection/glow layer
          c.fillStyle = '#fff';
          c.shadowBlur = 25;
          c.shadowColor = glowColor;
          c.fillText(textToDraw, 0, 0);
          c.restore();
          
          c.restore();
          break;
        case 'logo':
          if (logoImgRef.current) {
            c.save();
            // Force source-over so the logo displays its true, vibrant colors or customized tint
            c.globalCompositeOperation = 'source-over';
            
            // Set high quality interpolation parameters to keep small images sharp and clear
            c.imageSmoothingEnabled = true;
            c.imageSmoothingQuality = 'high';

            // Rotate logo according to slider state
            if (logoRotation) {
              c.rotate(logoRotation * Math.PI / 180);
            }

            const img = logoImgRef.current;
            if (!img) {
              c.restore();
              break;
            }
            // Scale up the logo significantly as per "יותר גדול הלוגו"
            const imgSize = radius * 1.85; 
            const aspectRatio = img.width > 0 && img.height > 0 ? img.width / img.height : 1;
            let drawW = imgSize;
            let drawH = imgSize / aspectRatio;
            if (drawH > imgSize) {
              drawH = imgSize;
              drawW = imgSize * aspectRatio;
            }
            if (isNaN(drawW) || isNaN(drawH)) {
              drawW = imgSize;
              drawH = imgSize;
            }
            c.shadowBlur = 30;
            c.shadowColor = logoTintColor || 'rgba(255, 255, 255, 0.5)'; // Neutral white aura by default

            if (logoTintColor && tintedCanvasRef.current) {
              try {
                c.drawImage(tintedCanvasRef.current, -drawW / 2, -drawH / 2, drawW, drawH);
              } catch (e) {
                // Fallback to original image if tinted canvas is tainted
                try {
                  c.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
                } catch (err) {
                  // If fallback also fails (e.g. CORS), we must not throw
                }
              }
            } else {
              try {
                c.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
              } catch (e) {
                console.error("Failed to draw image (likely CORS issue):", e);
              }
            }
            c.restore();
          } else {
            c.save();
            if (logoRotation) {
              c.rotate(logoRotation * Math.PI / 180);
            }
            c.rotate(-t * 0.001);
            c.strokeStyle = logoTintColor || '#ffffff';
            c.lineWidth = 10;
            c.shadowBlur = 25;
            c.shadowColor = logoTintColor || '#ffffff';
            
            c.beginPath();
            c.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
            c.stroke();
            
            for (let i = 0; i < 6; i++) {
              c.save();
              c.rotate(i * Math.PI / 3 + t * 0.002);
              c.beginPath();
              c.moveTo(radius * 0.5, 0);
              c.quadraticCurveTo(radius * 0.8, -radius * 0.2, radius * 0.85, 0);
              c.stroke();
              
              c.fillStyle = '#fff';
              c.beginPath(); c.arc(radius * 0.9, 0, 6, 0, Math.PI*2); c.fill();
              c.restore();
            }
            
            c.fillStyle = '#facc15';
            c.shadowColor = '#facc15';
            c.beginPath(); c.arc(0, 0, radius * 0.15 + Math.sin(t*0.005)*5, 0, Math.PI*2); c.fill();
            
            c.restore();
          }
          break;
        case 'kaleidoscope': {
          c.save();
          c.globalCompositeOperation = 'screen';
          
          let segments = Math.max(6, Math.round(effectComplexity * 1.5));
          if (kaleidoShape === 'snowflake') {
            segments = 12; // Hexagonal crystalline symmetry for snowflakes
          } else if (kaleidoShape === 'nesting') {
            segments = 8;
          }
          const sliceAngle = (Math.PI * 2) / segments;
          
          // --- SHAPE MORPH TIME & FACTORS ---
          const speedMod = kaleidoMorphSpeed !== undefined ? kaleidoMorphSpeed : 1.0;
          
          // Speed up base rate so shape-shifting is beautifully dynamic and obvious in real-time
          const morphTime = t * 0.0012 * speedMod; 
          const chaos0 = Math.sin(t * 0.0005 * speedMod) * 0.28;
          const chaos1 = Math.cos(t * 0.0007 * speedMod) * 0.28;
          const chaos2 = Math.sin(t * 0.0009 * speedMod) * 0.28;

          // Three-phase interpolation weights for organic blending
          const w0 = Math.max(0.01, Math.sin(morphTime) * 0.5 + 0.5 + chaos0);
          const w1 = Math.max(0.01, Math.sin(morphTime + (2 * Math.PI / 3)) * 0.25 + 0.25 + chaos1);
          const w2 = Math.max(0.01, Math.sin(morphTime + (4 * Math.PI / 3)) * 0.25 + 0.25 + chaos2);
          const sumW = w0 + w1 + w2;

          let weight0 = 0.33;
          let weight1 = 0.33;
          let weight2 = 0.33;

          // Apply pre-designed base shape presets or dynamic morphing
          if (kaleidoShape === 'morphing') {
            weight0 = w0 / sumW;
            weight1 = w1 / sumW;
            weight2 = w2 / sumW;
          } else if (kaleidoShape === 'star') {
            weight0 = 0.95;
            weight1 = 0.05;
            weight2 = 0.0;
          } else if (kaleidoShape === 'lotus') {
            weight0 = 0.0;
            weight1 = 0.95;
            weight2 = 0.05;
          } else if (kaleidoShape === 'gear') {
            weight0 = 0.05;
            weight1 = 0.0;
            weight2 = 0.95;
          } else if (kaleidoShape === 'snowflake') {
            weight0 = 0.65;
            weight1 = 0.0;
            weight2 = 0.35;
          } else if (kaleidoShape === 'nesting') {
            weight0 = 0.0;
            weight1 = 0.5;
            weight2 = 0.5;
          }

          // Chaotic visual modulation factors
          const rndFactorA = Math.sin(t * 0.002 * speedMod) * Math.cos(t * 0.001 * speedMod) * 0.4 + 0.5;
          const rndFactorB = Math.cos(t * 0.0025 * speedMod) * Math.sin(t * 0.0015 * speedMod) * 0.4 + 0.4;
          const rndFactorC = Math.sin(t * 0.0018 * speedMod + 1.5) * 0.5 + 0.5;

          // Color wave spectrum speed
          const colorSpeed = t * 0.0008 * (speedMod > 0 ? speedMod : 0.2); 
          const hueBase = (colorSpeed * 360) % 360;
          const midHue = (hueBase + 120 + 25 * Math.sin(t * 0.003 * speedMod)) % 360;
          const outHue = (hueBase + 240 + 35 * Math.cos(t * 0.004 * speedMod)) % 360;
          
          const pulse1 = 1.0 + 0.03 * Math.sin(t * 0.005 * speedMod);
          const pulse2 = 1.0 + 0.02 * Math.cos(t * 0.004 * speedMod);

          // Outer projection scope calibration rings
          c.strokeStyle = `hsla(${hueBase}, 100%, 75%, 0.08)`;
          c.lineWidth = 1 * effectScale;
          c.beginPath();
          c.arc(0, 0, radius * effectScale, 0, Math.PI * 2);
          c.stroke();

          c.save();
          c.rotate(-t * 0.00004); 
          c.strokeStyle = `hsla(${outHue}, 100%, 60%, 0.1)`;
          c.setLineDash([3, 18]);
          c.beginPath();
          c.arc(0, 0, radius * 0.96 * effectScale, 0, Math.PI * 2);
          c.stroke();
          c.restore();

          // Draw segments
          for (let i = 0; i < segments; i++) {
            c.save();
            
            const rotateAngle = i * sliceAngle + (t * 0.000055); 
            const microWobble = Math.sin(t * 0.0002 + i * 0.3) * 0.006; 
            c.rotate(rotateAngle + microWobble);

            const segHueBase = (hueBase + (i * (360 / segments))) % 360;
            const segMidHue = (segHueBase + 120 + 30 * Math.sin(t * 0.003 + i)) % 360;
            const segOutHue = (segHueBase + 240 + 40 * Math.cos(t * 0.004 - i)) % 360;

            const strokeColor = customColor || `hsl(${segHueBase}, 100%, 65%)`;
            const accentColor1 = customColor || `hsl(${segMidHue}, 100%, 70%)`;
            const accentColor2 = customColor || `hsl(${segOutHue}, 100%, 60%)`;

            const rInner = radius * 0.07 * effectScale;

            // Compute dynamic radii for the three-sector skeleton
            const sR1_0 = radius * (0.16 + rndFactorA * 0.1) * effectScale; 
            const sR1_1 = radius * (0.28 + rndFactorB * 0.08) * effectScale; 
            const sR1_2 = radius * (0.12 + rndFactorC * 0.08) * effectScale; 
            const sR1 = (sR1_0 * weight0 + sR1_1 * weight1 + sR1_2 * weight2) * pulse1;

            const sR2_0 = radius * (0.30 + rndFactorC * 0.1) * effectScale; 
            const sR2_1 = radius * (0.40 + rndFactorA * 0.08) * effectScale; 
            const sR2_2 = radius * (0.22 + rndFactorB * 0.08) * effectScale; 
            const sR2 = (sR2_0 * weight0 + sR2_1 * weight1 + sR2_2 * weight2) * pulse2;

            const mR1_0 = radius * (0.36 + rndFactorB * 0.08) * effectScale;
            const mR1_1 = radius * (0.42 + rndFactorC * 0.08) * effectScale;
            const mR1_2 = radius * (0.46 + rndFactorA * 0.08) * effectScale;
            const mR1 = (mR1_0 * weight0 + mR1_1 * weight1 + mR1_2 * weight2) * pulse2;

            const mR2_0 = radius * (0.50 + rndFactorA * 0.08) * effectScale;
            const mR2_1 = radius * (0.58 + rndFactorB * 0.08) * effectScale;
            const mR2_2 = radius * (0.38 + rndFactorC * 0.08) * effectScale;
            const mR2 = (mR2_0 * weight0 + mR2_1 * weight1 + mR2_2 * weight2) * pulse1;

            const mR3_0 = radius * (0.64 + rndFactorC * 0.08) * effectScale;
            const mR3_1 = radius * (0.70 + rndFactorA * 0.08) * effectScale;
            const mR3_2 = radius * (0.56 + rndFactorB * 0.08) * effectScale;
            const mR3 = (mR3_0 * weight0 + mR3_1 * weight1 + mR3_2 * weight2) * pulse2;

            let oR1_0 = radius * (0.66 + rndFactorB * 0.08) * effectScale;
            let oR1_1 = radius * (0.74 + rndFactorC * 0.08) * effectScale;
            let oR1_2 = radius * (0.68 + rndFactorA * 0.08) * effectScale;
            let oR1 = (oR1_0 * weight0 + oR1_1 * weight1 + oR1_2 * weight2) * pulse1;

            let oR2_0 = radius * (0.78 + rndFactorA * 0.08) * effectScale;
            let oR2_1 = radius * (0.86 + rndFactorB * 0.08) * effectScale;
            let oR2_2 = radius * (0.76 + rndFactorC * 0.08) * effectScale;
            let oR2 = (oR2_0 * weight0 + oR2_1 * weight1 + oR2_2 * weight2) * pulse2;

            let oR3_0 = radius * (0.90 + rndFactorC * 0.08) * effectScale;
            let oR3_1 = radius * (0.92 + rndFactorA * 0.06) * effectScale;
            let oR3_2 = radius * (0.88 + rndFactorB * 0.06) * effectScale;
            let oR3 = (oR3_0 * weight0 + oR3_1 * weight1 + oR3_2 * weight2) * pulse1;

            if (kaleidoShape === 'snowflake') {
              oR1 = radius * 0.52 * effectScale;
              oR2 = radius * 0.82 * effectScale;
              oR3 = radius * 0.94 * effectScale;
            } else if (kaleidoShape === 'nesting') {
              oR1 = radius * 0.58 * effectScale;
              oR2 = radius * 0.76 * effectScale;
              oR3 = radius * 0.88 * effectScale;
            }

            const halfAngle = sliceAngle / 2;

            // Define symmetrical reference points
            const destX1 = Math.cos(halfAngle) * sR1;
            const destY1 = Math.sin(halfAngle) * sR1;
            const destX1_r = Math.cos(-halfAngle) * sR1;
            const destY1_r = Math.sin(-halfAngle) * sR1;

            const destX2 = Math.cos(halfAngle) * mR2;
            const destY2 = Math.sin(halfAngle) * mR2;
            const destX2_r = Math.cos(-halfAngle) * mR2;
            const destY2_r = Math.sin(-halfAngle) * mR2;

            const destX3 = Math.cos(halfAngle) * oR2;
            const destY3 = Math.sin(halfAngle) * oR2;
            const destX3_r = Math.cos(-halfAngle) * oR2;
            const destY3_r = Math.sin(-halfAngle) * oR2;

            // DRAW STYLE PATTERNS Based on kaleidoLines
            if (kaleidoLines === 'beams') {
              // --- STYLE: LASER BEAMS ---
              c.lineWidth = 4 * effectScale;
              c.strokeStyle = strokeColor;
              c.shadowBlur = 12 * effectScale;
              c.shadowColor = strokeColor;

              c.beginPath();
              c.moveTo(0, 0);
              c.lineTo(oR3, 0);
              c.stroke();

              // Diagonal branching lasers
              c.lineWidth = 1.8 * effectScale;
              c.strokeStyle = accentColor1;
              c.beginPath();
              c.moveTo(mR1, 0);
              c.lineTo(destX2, destY2);
              c.moveTo(mR1, 0);
              c.lineTo(destX2_r, destY2_r);
              c.stroke();

              c.strokeStyle = accentColor2;
              c.lineWidth = 1.2 * effectScale;
              c.beginPath();
              c.moveTo(oR1, 0);
              c.lineTo(destX3, destY3);
              c.moveTo(oR1, 0);
              c.lineTo(destX3_r, destY3_r);
              c.stroke();

            } else if (kaleidoLines === 'webbing') {
              // --- STYLE: GEOMETRIC TECH WEBBING ---
              c.shadowBlur = 6 * effectScale;
              c.shadowColor = accentColor1;

              // Grid Arc Circles
              c.strokeStyle = `hsla(${segHueBase}, 100%, 70%, 0.18)`;
              c.lineWidth = 0.8 * effectScale;
              for (let arcIndex = 1; arcIndex <= 6; arcIndex++) {
                const webArcRad = rInner + (radius - rInner) * (0.16 * arcIndex);
                c.beginPath();
                c.arc(0, 0, webArcRad, -halfAngle, halfAngle);
                c.stroke();
              }

              // Connected Diagonal Shifting lattices
              c.strokeStyle = `hsla(${segMidHue}, 100%, 75%, 0.45)`;
              c.lineWidth = 1.1 * effectScale;
              c.beginPath();
              c.moveTo(rInner, 0);
              c.lineTo(destX1, destY1);
              c.lineTo(sR2, 0);
              c.lineTo(destX1_r, destY1_r);
              c.closePath();
              c.stroke();

              c.strokeStyle = `hsla(${segOutHue}, 100%, 65%, 0.45)`;
              c.beginPath();
              c.moveTo(mR1, 0);
              c.lineTo(destX2, destY2);
              c.lineTo(mR3, 0);
              c.lineTo(destX2_r, destY2_r);
              c.closePath();
              c.stroke();

              // Interspersed spider-grid cross-point lines
              c.strokeStyle = strokeColor;
              c.beginPath();
              c.moveTo(destX1, destY1);
              c.lineTo(destX2, destY2);
              c.moveTo(destX1_r, destY1_r);
              c.lineTo(destX2_r, destY2_r);
              c.moveTo(sR2, 0);
              c.lineTo(mR1, 0);
              c.stroke();

            } else if (kaleidoLines === 'dots') {
              // --- STYLE: SHIMMERING PARTICLES ---
              const numDots = 8;
              for (let d = 0; d < numDots; d++) {
                const dProg = d / (numDots - 1);
                const dDist = rInner + dProg * (oR3 - rInner);
                const dAlpha = (0.2 + 0.8 * Math.sin(dProg * Math.PI + t * 0.005)) * pulse1;
                
                // Central beam dots
                c.fillStyle = `hsla(${segHueBase}, 100%, 82%, ${dAlpha})`;
                c.shadowBlur = 8 * effectScale;
                c.shadowColor = `hsl(${segHueBase}, 100%, 65%)`;
                c.beginPath();
                c.arc(dDist, 0, (2.6 + 1.8 * Math.sin(t * 0.006 + d)) * effectScale, 0, Math.PI * 2);
                c.fill();

                // Symmetrical orbiting particle tails
                if (d > 1 && d < numDots - 1) {
                  const sideAngle = halfAngle * dProg;
                  c.fillStyle = `hsla(${segMidHue}, 100%, 75%, ${dAlpha * 0.85})`;
                  c.beginPath();
                  c.arc(Math.cos(sideAngle) * dDist, Math.sin(sideAngle) * dDist, 2.0 * effectScale, 0, Math.PI * 2);
                  c.arc(Math.cos(-sideAngle) * dDist, Math.sin(-sideAngle) * dDist, 2.0 * effectScale, 0, Math.PI * 2);
                  c.fill();
                }
              }

              // Symmetrical orbital helper dash-arcs
              c.strokeStyle = `hsla(${segOutHue}, 90%, 60%, 0.18)`;
              c.lineWidth = 1 * effectScale;
              c.setLineDash([3, 10]);
              c.beginPath();
              c.arc(0, 0, radius * 0.45 * effectScale, -halfAngle, halfAngle);
              c.arc(0, 0, radius * 0.78 * effectScale, -halfAngle, halfAngle);
              c.stroke();
              c.setLineDash([]);

            } else {
              // --- STYLE: TRIPLE LAYER HYBRID (DEFAULT) ---
              
              // 1. Sector 1 Drawing (Inner Core)
              c.save();
              c.shadowBlur = (10 + 5 * weight0) * effectScale;
              c.shadowColor = strokeColor;
              
              const fillGrad1 = c.createLinearGradient(rInner, 0, sR2, 0);
              fillGrad1.addColorStop(0, `hsla(${(segHueBase + 10) % 360}, 100%, 75%, 0.18)`);
              fillGrad1.addColorStop(1, 'transparent');
              c.fillStyle = fillGrad1;
              c.strokeStyle = strokeColor;
              c.lineWidth = 1.8 * effectScale;
              
              c.beginPath();
              c.moveTo(rInner, 0);
              
              const cpR1 = sR1 * (1.0 * weight0 + 1.35 * weight1 + 0.8 * weight2);
              const cpAngle1 = halfAngle * (1.0 * weight0 + 1.25 * weight1 + 0.5 * weight2);
              const cpX1 = Math.cos(cpAngle1) * cpR1;
              const cpY1 = Math.sin(cpAngle1) * cpR1;
              
              c.quadraticCurveTo(cpX1, cpY1, destX1, destY1);

              const cpR2 = sR2 * (1.0 * weight0 + 1.25 * weight1 + 0.85 * weight2);
              const cpAngle2 = halfAngle * (0.5 * weight0 + 0.8 * weight1 + 0.25 * weight2);
              const cpX2 = Math.cos(cpAngle2) * cpR2;
              const cpY2 = Math.sin(cpAngle2) * cpR2;

              c.quadraticCurveTo(cpX2, cpY2, sR2, 0);

              const cpX2_r = Math.cos(-cpAngle2) * cpR2;
              const cpY2_r = Math.sin(-cpAngle2) * cpR2;
              
              c.quadraticCurveTo(cpX2_r, cpY2_r, destX1_r, destY1_r);

              const cpX1_r = Math.cos(-cpAngle1) * cpR1;
              const cpY1_r = Math.sin(-cpAngle1) * cpR1;
              c.quadraticCurveTo(cpX1_r, cpY1_r, rInner, 0);
              
              c.closePath();
              c.fill();
              c.stroke();
              c.restore();

              // 2. Sector 2 Drawing (Middle interlocking mesh)
              c.save();
              c.shadowBlur = (8 + 4 * weight1) * effectScale;
              c.shadowColor = accentColor1;

              const fillGrad2 = c.createLinearGradient(mR1, 0, mR3, 0);
              fillGrad2.addColorStop(0, 'transparent');
              fillGrad2.addColorStop(0.5, `hsla(${(segMidHue + 15) % 360}, 100%, 70%, 0.16)`);
              fillGrad2.addColorStop(1, 'transparent');
              c.fillStyle = fillGrad2;
              c.strokeStyle = accentColor1;
              c.lineWidth = (1.2 + 0.8 * weight2) * effectScale;

              c.beginPath();
              c.moveTo(mR1, 0);

              const cpR3 = mR2 * (1.0 * weight0 + 1.3 * weight1 + 0.75 * weight2);
              const cpAngle3 = halfAngle * (1.0 * weight0 + 1.2 * weight1 + 0.5 * weight2);
              const cpX3 = Math.cos(cpAngle3) * cpR3;
              const cpY3 = Math.sin(cpAngle3) * cpR3;

              c.quadraticCurveTo(cpX3, cpY3, destX2, destY2);

              const cpR4 = mR3 * (1.0 * weight0 + 1.2 * weight1 + 0.8 * weight2);
              const cpAngle4 = halfAngle * (0.5 * weight0 + 0.7 * weight1 + 0.3 * weight2);
              const cpX4 = Math.cos(cpAngle4) * cpR4;
              const cpY4 = Math.sin(cpAngle4) * cpR4;

              c.quadraticCurveTo(cpX4, cpY4, mR3, 0);

              const cpX4_r = Math.cos(-cpAngle4) * cpR4;
              const cpY4_r = Math.sin(-cpAngle4) * cpR4;

              c.quadraticCurveTo(cpX4_r, cpY4_r, destX2_r, destY2_r);

              const cpX3_r = Math.cos(-cpAngle3) * cpR3;
              const cpY3_r = Math.sin(-cpAngle3) * cpR3;
              c.quadraticCurveTo(cpX3_r, cpY3_r, mR1, 0);

              c.closePath();
              c.fill();
              c.stroke();
              c.restore();

              // Intermediate tech design lines
              c.strokeStyle = `hsla(${(segMidHue + 30) % 360}, 80%, 80%, 0.35)`;
              c.lineWidth = 0.8 * effectScale;
              c.beginPath();
              const webPulse = Math.sin(t * 0.0006 + i * 0.5) * 5 * effectScale;
              c.moveTo(mR1 + (mR3 - mR1) * 0.45 + webPulse, 0);
              c.lineTo(destX2, destY2);
              c.moveTo(mR1 + (mR3 - mR1) * 0.45 + webPulse, 0);
              c.lineTo(destX2_r, destY2_r);
              c.stroke();

              // 3. Sector 3 Drawing (Outer branches and crystals)
              c.save();
              c.shadowBlur = (12 + 6 * weight2) * effectScale;
              c.shadowColor = accentColor2;

              const fillGrad3 = c.createLinearGradient(oR1, 0, oR3, 0);
              fillGrad3.addColorStop(0, `hsla(${(segOutHue + 20) % 360}, 100%, 65%, 0.12)`);
              fillGrad3.addColorStop(1, 'transparent');
              c.fillStyle = fillGrad3;
              c.strokeStyle = accentColor2;
              c.lineWidth = 1.2 * effectScale;

              c.beginPath();
              c.moveTo(oR1, 0);

              const cpR5 = oR2 * (1.0 * weight0 + 1.35 * weight1 + 0.8 * weight2);
              const cpAngle5 = halfAngle * (1.0 * weight0 + 1.15 * weight1 + 0.6 * weight2);
              const cpX5 = Math.cos(cpAngle5) * cpR5;
              const cpY5 = Math.sin(cpAngle5) * cpR5;

              c.quadraticCurveTo(cpX5, cpY5, destX3, destY3);

              const cpR6 = oR3 * (1.0 * weight0 + 1.18 * weight1 + 0.85 * weight2);
              const cpAngle6 = halfAngle * (0.5 * weight0 + 0.75 * weight1 + 0.25 * weight2);
              const cpX6 = Math.cos(cpAngle6) * cpR6;
              const cpY6 = Math.sin(cpAngle6) * cpR6;

              c.quadraticCurveTo(cpX6, cpY6, oR3, 0);

              const cpX6_r = Math.cos(-cpAngle6) * cpR6;
              const cpY6_r = Math.sin(-cpAngle6) * cpR6;

              c.quadraticCurveTo(cpX6_r, cpY6_r, destX3_r, destY3_r);

              const cpX5_r = Math.cos(-cpAngle5) * cpR5;
              const cpY5_r = Math.sin(-cpAngle5) * cpR5;
              c.quadraticCurveTo(cpX5_r, cpY5_r, oR1, 0);

              c.closePath();
              c.fill();
              c.stroke();
              c.restore();

              // Twig branch offshoots
              c.strokeStyle = accentColor2;
              c.lineWidth = 0.9 * effectScale;
              const expansionRate = 0.52 + weight0 * 0.18 + weight2 * 0.1;
              const left_borderX = destX3 * expansionRate;
              const left_borderY = destY3 * expansionRate;
              const twigLength = (6 + 14 * weight0 + 4 * weight1) * effectScale;
              const angleTwig = 0.18 + 0.15 * Math.sin(t * 0.0005);

              c.beginPath();
              c.moveTo(left_borderX, left_borderY);
              c.lineTo(left_borderX + Math.cos(halfAngle + angleTwig) * twigLength, left_borderY + Math.sin(halfAngle + angleTwig) * twigLength);
              c.moveTo(left_borderX, -left_borderY);
              c.lineTo(left_borderX + Math.cos(-halfAngle - angleTwig) * twigLength, -left_borderY + Math.sin(-halfAngle - angleTwig) * twigLength);
              c.stroke();

              // Dynamic concentric helper arcs
              const arcR1 = radius * (0.24 + 0.06 * Math.sin(t * 0.003)) * effectScale;
              const arcR2 = radius * (0.52 + 0.04 * Math.cos(t * 0.004)) * effectScale;

              c.strokeStyle = strokeColor;
              c.lineWidth = 1 * effectScale;
              c.beginPath();
              c.arc(0, 0, arcR1, -halfAngle, halfAngle);
              c.stroke();

              c.beginPath();
              c.arc(0, 0, arcR2, -halfAngle, halfAngle);
              c.stroke();

              // Glowing gemstone particle trails
              const pointsCount = 3;
              for (let b = 0; b < pointsCount; b++) {
                const bProg = (t * 0.00025 + b * 0.33) % 1.0;
                const bDist = rInner + bProg * (oR1 - rInner);
                const bAlpha = Math.sin(bProg * Math.PI) * 0.92;
                
                c.save();
                c.fillStyle = `hsla(${(segHueBase + b * 40) % 360}, 100%, 85%, ${bAlpha})`;
                c.beginPath();
                
                const particleRadius = (1.5 + 1.6 * Math.sin(t * 0.003 + b) * weight0 + 1.8 * weight1) * effectScale;
                const lateralWarp = Math.sin(t * 0.001 + bProg * 8) * 3 * weight1 * effectScale;
                c.arc(bDist, lateralWarp, particleRadius, 0, Math.PI * 2);
                c.fill();
                c.restore();
              }
            }

            // EXTRA SNOWFLAKE CRYSTALLIZATION AT CORES
            if (kaleidoShape === 'snowflake') {
              c.strokeStyle = accentColor2;
              c.lineWidth = 1.3 * effectScale;
              const twigLength = 16 * effectScale;
              const angleTwig = 0.25 + 0.1 * Math.sin(t * 0.001);
              c.beginPath();
              // Crystalline arms
              c.moveTo(oR3 * 0.75, 0);
              c.lineTo(oR3 * 0.75 + Math.cos(angleTwig) * twigLength, Math.sin(angleTwig) * twigLength);
              c.moveTo(oR3 * 0.75, 0);
              c.lineTo(oR3 * 0.75 + Math.cos(-angleTwig) * twigLength, -Math.sin(angleTwig) * twigLength);
              c.moveTo(oR3 * 0.92, 0);
              c.lineTo(oR3 * 0.92 + Math.cos(angleTwig) * twigLength * 0.6, Math.sin(angleTwig) * twigLength * 0.6);
              c.moveTo(oR3 * 0.92, 0);
              c.lineTo(oR3 * 0.92 + Math.cos(-angleTwig) * twigLength * 0.6, -Math.sin(angleTwig) * twigLength * 0.6);
              c.stroke();
            }

            c.restore();
          }
          c.shadowBlur = 0;
          c.restore();
          break;
        }
        case 'video_synth':
          c.save();
          {
            const synHue = (t * 0.04) % 360;
            const syncColor = customColor || `hsl(${synHue}, 95%, 60%)`;
            
            // Draw uploaded video frames first if available!
            const video = videoRef.current;
            const hasVideo = !!(video && !video.paused && !video.ended && video.videoWidth > 0);
            if (hasVideo) {
              c.save();
              c.beginPath();
              
              // Dynamic lens morph for high fidelity video clip mask
              const lensWarp = 12 + 6 * Math.sin(t * 0.0015);
              c.arc(0, 0, (radius - lensWarp) * effectScale, 0, Math.PI * 2);
              c.clip();
              
              // Draw centered video preserving aspect ratio
              const vW = video.videoWidth;
              const vH = video.videoHeight;
              const minDim = Math.min(vW, vH);
              const size = (radius - lensWarp) * 2 * effectScale;
              
              try {
                c.drawImage(
                  video,
                  (vW - minDim) / 2,
                  (vH - minDim) / 2,
                  minDim,
                  minDim,
                  -size / 2,
                  -size / 2,
                  size,
                  size
                );
              } catch (e) {
                console.error("Video draw failed:", e);
              }
              c.restore();
            } else {
              // Only draw animated CRT grids, scanlines and oscilloscope green wave if NO active video is playing
              c.strokeStyle = syncColor;
              c.shadowBlur = 20;
              c.shadowColor = syncColor;
              
              // Draw dynamic circular / squircle morphing CRT vector screen outline
              c.lineWidth = 4;
              c.beginPath();
              const screenWarp = 10 + 6 * Math.sin(t * 0.0012);
              c.arc(0, 0, radius - screenWarp, 0, Math.PI * 2);
              c.stroke();
              
              // Draw dynamic neon waveform grid patterns (shifting index)
              c.lineWidth = 1;
              c.strokeStyle = customColor || `hsla(${(synHue + 180) % 360}, 90%, 65%, 0.15)`;
              c.beginPath();
              for (let x = -radius; x <= radius; x += 20) {
                c.moveTo(x, -radius);
                c.lineTo(x, radius);
              }
              for (let y = -radius; y <= radius; y += 20) {
                c.moveTo(-radius, y);
                c.lineTo(radius, y);
              }
              c.stroke();
              
              // Animated horizontal feedback scanlines with spectral cycle
              c.strokeStyle = syncColor;
              c.lineWidth = 2.5;
              c.beginPath();
              for (let i = 0; i < 4; i++) {
                const yLine = -radius + ((t * 0.12 + i * (radius / 2)) % (radius * 2));
                if (Math.abs(yLine) < radius - 10) {
                  const xBounds = Math.sqrt(radius * radius - yLine * yLine) - 15;
                  c.moveTo(-xBounds, yLine);
                  c.lineTo(xBounds, yLine);
                }
              }
              c.stroke();
              
              // Oscilloscope wavy audio feedback lines (sin/cos synth combination cycling through spectrum)
              c.lineWidth = 3;
              c.strokeStyle = customColor || `hsl(${(synHue + 100) % 360}, 95%, 60%)`;
              c.beginPath();
              for (let x = -radius + 20; x <= radius - 20; x += 4) {
                const angleVal = (x * 0.035) + (t * 0.008);
                const amplitude = 25 * Math.sin(t * 0.001) + 15;
                const yWave = Math.sin(angleVal) * amplitude + Math.cos(x * 0.01 - t * 0.004) * 10;
                if (x * x + yWave * yWave < (radius - 20) * (radius - 20)) {
                  if (x === -radius + 20) c.moveTo(x, yWave);
                  else c.lineTo(x, yWave);
                }
              }
              c.stroke();
  
              // Core vector radar sweeper with shifting tails
              c.strokeStyle = customColor || `hsla(${(synHue + 240) % 360}, 95%, 75%, 0.6)`;
              c.lineWidth = 2;
              const sweepAngle = (t * 0.002) % (Math.PI * 2);
              c.beginPath();
              c.moveTo(0,0);
              c.lineTo(Math.cos(sweepAngle) * (radius - 10), Math.sin(sweepAngle) * (radius - 10));
              c.stroke();
            }
          }
          c.shadowBlur = 0;
          c.restore();
          break;
        case 'animation_flow':
          c.save();
          {
            // Quantum Vector Telemetry flow streaming from fission core to peripheral boundary borders
            const flwHue = (t * 0.033) % 360;
            const flowColor = customColor || `hsl(${flwHue}, 95%, 60%)`;
            
            c.globalCompositeOperation = 'screen';
            c.strokeStyle = flowColor;
            c.shadowBlur = 12 * effectScale;
            c.shadowColor = flowColor;
            
            // 1. Concentric calibration ring dials with alternating rotations and spectrum shift
            const dialLimit = 4;
            for (let k = 1; k <= dialLimit; k++) {
              c.save();
              c.lineWidth = (1 + k * 0.5) * effectScale;
              
              // Alternating rotating dials
              const dialRotation = t * 0.0006 * (k % 2 === 0 ? 1 : -1);
              c.rotate(dialRotation);

              c.strokeStyle = customColor || `hsla(${(flwHue + k * 45) % 360}, 95%, 65%, 0.75)`;

              // Dashed segmented calibrations
              c.setLineDash([15 * k * effectScale, 22 * effectScale]);
              c.beginPath();
              c.arc(0, 0, radius * 0.22 * k * effectScale, 0, Math.PI * 2);
              c.stroke();
              
              c.restore();
            }

            // 2. Flowing high-velocity telemetry arrow vectors with energy trail lines of diverse geometries
            const streams = Math.max(10, Math.round(effectComplexity * 1.5));
            for (let i = 0; i < streams; i++) {
              c.save();
              const baseAngle = (i * Math.PI * 2) / streams + t * 0.0003;
              c.rotate(baseAngle);
              
              // Smooth looping radial progress from inside to outer boundary
              const maxRange = radius * 0.95 * effectScale;
              const velocity = 0.0028 + (i % 3) * 0.0008;
              const progressRatio = ((t * velocity + i * (1.0 / streams)) % 1.0);
              const curDist = progressRatio * maxRange;

              // Size increases as it gets closer to the viewport boundary
              const nodeSize = (1.5 + progressRatio * 3.5) * effectScale;
              const alphaValue = 1.0 - progressRatio;

              // Arrow nodes of diverse geometries (circles, triangles, diamonds)
              const shapeHueIndex = (flwHue + i * 36) % 360;
              c.fillStyle = customColor || `hsla(${shapeHueIndex}, 95%, 80%, ${alphaValue})`;
              c.strokeStyle = customColor || `hsla(${shapeHueIndex}, 95%, 65%, ${alphaValue * 0.8})`;
              c.lineWidth = 1 * effectScale;

              c.beginPath();
              if (i % 3 === 0) {
                // Triangle node orientation pointing outwards
                c.moveTo(curDist + nodeSize * 1.5, 0);
                c.lineTo(curDist - nodeSize, -nodeSize);
                c.lineTo(curDist - nodeSize, nodeSize);
                c.closePath();
                c.fill();
                c.stroke();
              } else if (i % 3 === 1) {
                // Diamond / Tilting Square node
                c.moveTo(curDist, -nodeSize);
                c.lineTo(curDist + nodeSize, 0);
                c.lineTo(curDist, nodeSize);
                c.lineTo(curDist - nodeSize, 0);
                c.closePath();
                c.fill();
                c.stroke();
              } else {
                // Standard glowing circle
                c.arc(curDist, 0, nodeSize, 0, Math.PI * 2);
                c.fill();
              }

              // Telemetry chevron coordinate arrow points (->)
              if (progressRatio > 0.35 && effectScale > 0.75) {
                  const chevSize = 4 * effectScale * progressRatio;
                  c.strokeStyle = customColor || `hsla(${(flwHue + i * 30 + 120) % 360}, 95%, 85%, ${alphaValue * 0.75})`;
                  c.lineWidth = 1 * effectScale;
                  c.beginPath();
                  c.moveTo(curDist - chevSize, -chevSize * 0.65);
                  c.lineTo(curDist, 0);
                  c.lineTo(curDist - chevSize, chevSize * 0.65);
                  c.stroke();
              }

              // Glowing laser energy trail lines with spectral shift
              const trailLength = (22 + progressRatio * 35) * effectScale;
              const trailGrad = c.createLinearGradient(curDist, 0, curDist - trailLength, 0);
              trailGrad.addColorStop(0, `rgba(255, 255, 255, ${alphaValue * 0.95})`);
              trailGrad.addColorStop(0.3, `hsla(${(t * 0.05 + i * 36) % 360}, 100%, 70%, ${alphaValue * 0.85})`);
              trailGrad.addColorStop(1.0, 'transparent');
              
              c.strokeStyle = trailGrad;
              c.lineWidth = (1 + progressRatio * 2) * effectScale;
              c.beginPath();
              c.moveTo(curDist, 0);
              c.lineTo(curDist - trailLength, 0);
              c.stroke();

              // 3. Boundary spark collisions with fluid particle colors when the arrow reaches the edge
              if (progressRatio > 0.88) {
                  const sparkProg = (progressRatio - 0.88) / 0.12;
                  c.fillStyle = customColor || `hsla(${(flwHue + i * 40) % 360}, 95%, 65%, 1)`;
                  c.globalAlpha = (1.0 - sparkProg) * alphaValue;
                  
                  // Burst 3 small particles
                  for (let p = 0; p < 3; p++) {
                      const spAngle = -Math.PI / 6 + p * (Math.PI / 6);
                      const spDist = maxRange + sparkProg * 14 * effectScale;
                      const spX = Math.cos(spAngle) * spDist;
                      const spY = Math.sin(spAngle) * spDist;
                      
                      c.beginPath();
                      c.arc(spX, spY, 1.5 * effectScale, 0, Math.PI * 2);
                      c.fill();
                  }
              }

              c.restore();
            }
          }
          c.shadowBlur = 0;
          c.restore();
          break;
      }
      c.restore();
    };

    const animate = () => {
      time += 16 * effectSpeedRate; // Dynamic internal logic simulation speed rate

      const speedNormalized = speed / 255;
      const bladeSpeed = speedNormalized * 1.5; // Radians per frame
      rotation += bladeSpeed;

      // Persistence of vision blur
      const fadeAlpha = speed === 0 ? 1 : Math.max(0.012, 0.12 - speedNormalized * 0.1);
      
      // Clear with absolute scale-free transform to guarantee 100% pixel coverage on High-DPI/Retina screens
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Simulated brightness
      ctx.globalAlpha = speed > 5 ? 0.4 + (brightness / 255) * 0.6 : 0.05;

      // Define the clipping path for blades
      ctx.save();
      ctx.beginPath();
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      const bladeWidth = speedNormalized > 0.85 ? radius * 2.5 : 8 + (speedNormalized * 40);
      ctx.rect(-radius, -bladeWidth/2, radius * 2, bladeWidth);
      ctx.rect(-bladeWidth/2, -radius, bladeWidth, radius * 2);
      ctx.restore();
      ctx.clip(); // Apply the clip globally relative to the main stable coordinate system

      // Draw the effect with "lighter" blending for LED realism
      ctx.globalCompositeOperation = 'lighter';
      drawEffect(ctx, time, rotation);
      ctx.globalCompositeOperation = 'source-over';
      
      ctx.restore();

      // Holographic fan LED concentric gaps
      if (speed > 10) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = `rgba(0, 0, 0, ${0.4 + speedNormalized * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let r = 28; r < radius; r += 4) {
          ctx.moveTo(cx + r, cy);
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      
      // Draw the central motor hub with metallic finish
      ctx.globalAlpha = 1;

      // Outer bezel of the hub
      const hubGrad = ctx.createLinearGradient(cx - 25, cy - 25, cx + 25, cy + 25);
      hubGrad.addColorStop(0, '#333');
      hubGrad.addColorStop(0.5, '#111');
      hubGrad.addColorStop(1, '#222');
      
      ctx.fillStyle = hubGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fill();
      
      // Center dark cap
      ctx.fillStyle = '#0a0a0c';
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner screw
      const screwGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
      screwGrad.addColorStop(0, '#555');
      screwGrad.addColorStop(1, '#000');
      ctx.fillStyle = screwGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();

      // Rotation blur layer
      if (speedNormalized > 0.5) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.02 * speedNormalized})`;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [effect, speed, brightness, customColor, povText, logoUrl, logoRotation, logoTintColor, povTextAnimation, effectSpeedRate, effectScale, effectComplexity, ledCount, kaleidoShape, kaleidoLines, kaleidoMorphSpeed]);

  return (
    <div className="w-full h-full relative p-2">
       {/* Dark backdrop ring for the device */}
       <div className="absolute inset-2 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.9)] bg-black/40 border border-white/5"></div>
       <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full rounded-full"
          style={{ mixBlendMode: 'screen' }}
       />
    </div>
  );
};
