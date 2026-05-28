import React, { useState, useEffect, useRef } from "react";
import galaxy0 from "../assets/images/galaxy_background_1779780757373.png";
import galaxy1 from "../assets/images/hd_vivid_galaxy_1779780978111.png";
import butterfly from "../assets/images/hologram_butterfly_1779775623164.png";
import planet from "../assets/images/hologram_planet_1779776225377.png";
import galaxy2 from "../assets/images/rainbow_galaxy_1779781352503.png";
import galaxy3 from "../assets/images/warm_galaxy_1779781369262.png";
import video1 from "../assets/12656_Big_Bang_1080.webm";
import video2 from "../assets/129936-745943770.mp4";

interface Props {
  bgImageId?: string;
}

export const GalaxyBackground: React.FC<Props> = ({ bgImageId = "galaxy1" }) => {
  const isVideo = bgImageId.startsWith("video");
  const [videoPlayFailed, setVideoPlayFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const getImgSrc = () => {
    if (bgImageId === "galaxy0") return galaxy0;
    if (bgImageId === "galaxy2") return galaxy2;
    if (bgImageId === "galaxy3") return galaxy3;
    if (bgImageId === "butterfly") return butterfly;
    if (bgImageId === "planet") return planet;
    return galaxy1;
  };

  const getVideoSrc = () => {
    if (bgImageId === "video1") return video1;
    if (bgImageId === "video2") return video2;
    return video1;
  };

  useEffect(() => {
    setVideoPlayFailed(false);
    if (isVideo && videoRef.current) {
      // Must be muted for autoplay to have a chance
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // success
          })
          .catch((err) => {
            console.warn("Autoplay blocked/failed, switching to fallback:", err);
            setVideoPlayFailed(true);
          });
      }
    }
  }, [bgImageId, isVideo]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#020108] flex items-center justify-center">
      <style>{`
        @keyframes micro-jitter {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-0.5px, 0.5px); }
          50% { transform: translate(0.5px, -0.5px); }
          75% { transform: translate(-0.25px, -0.25px); }
        }
        .animate-jitter {
          animation: micro-jitter 0.15s infinite normal;
        }
      `}</style>
      {/* High-fidelity background container with hardware acceleration */}
      <div className={`absolute inset-0 w-full h-full transform scale-105 filter blur-[0.2px] contrast-[1.05] brightness-[0.9] saturate-[1.12] ${videoPlayFailed ? 'animate-jitter' : ''}`} style={{ transform: "translateZ(0)" }}>
        {isVideo && !videoPlayFailed ? (
          <video
            ref={videoRef}
            src={getVideoSrc()}
            autoPlay
            loop
            muted
            playsInline
            crossOrigin="anonymous"
            className="absolute w-full h-full object-cover opacity-80 transition-opacity duration-1000"
            style={{ 
              imageRendering: "high-quality" as any,
              transform: "translate3d(0, 0, 0)"
            }}
          />
        ) : (
          <img
            src={getImgSrc()}
            alt="Galaxy Background"
            className="absolute w-full h-full object-cover opacity-80 transition-opacity duration-1000"
            referrerPolicy="no-referrer"
            style={{ 
              imageRendering: "high-quality" as any,
              transform: "translate3d(0, 0, 0)"
            }}
          />
        )}
      </div>

      {/* Holographic matrix micro-mesh & pixel-smoothing scanline grid */}
      <div 
        className={`absolute inset-0 z-10 pointer-events-none opacity-[0.11] ${videoPlayFailed ? 'mix-blend-overlay' : ''}`}
        style={{
          backgroundImage: `
            linear-gradient(rgba(18, 16, 24, 0) 50%, rgba(0, 0, 0, 0.4) 50%),
            linear-gradient(90deg, rgba(56, 189, 248, 0.1), rgba(168, 85, 247, 0.06), rgba(56, 189, 248, 0.1))
          `,
          backgroundSize: "100% 2px, 3px 100%",
          transform: "translate3d(0, 0, 0)"
        }}
      ></div>

      {/* Subtle pulsing glow in the center */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.18)_0%,transparent_50%)] transition-opacity duration-1000"
        style={{ animation: 'pulse 4s ease-in-out infinite' }}
      ></div>

      {/* Gradients to dim edges and blend into the dark UI */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/20 to-black/98 z-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000000_150%)] opacity-85 z-10"></div>
    </div>
  );
};

