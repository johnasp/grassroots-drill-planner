"use client";

import { useRef, useState, useEffect } from "react";
import { Gauge, Check } from "lucide-react";
import { Button } from "./ui/button";

interface DrillVideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
}

export function DrillVideoPlayer({ src, poster, autoPlay = true, className = "" }: DrillVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleSpeedChange = (newSpeed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
      setSpeed(newSpeed);
      setShowSpeedMenu(false);
    }
  };

  // Ensure speed persists when src changes (if component stays mounted)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [src, speed]);

  return (
    <div className={`relative group w-full h-full bg-black ${className}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        autoPlay={autoPlay}
        className="w-full h-full"
        onPlay={() => {
          if (videoRef.current) videoRef.current.playbackRate = speed;
        }}
      />
      
      {/* Speed Control Overlay */}
      <div className="absolute top-4 right-4 z-20">
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            className="h-9 gap-1.5 font-black bg-black/40 text-white border-none hover:bg-black/60 backdrop-blur-md px-3 shadow-xl"
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          >
            <Gauge className="w-4 h-4" />
            <span className="min-w-[1.5rem]">{speed}x</span>
          </Button>

          {showSpeedMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSpeedMenu(false)}
              />
              <div className="absolute top-full mt-2 right-0 z-20 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-1.5 shadow-2xl min-w-[80px] animate-in fade-in zoom-in-95 duration-100">
                {speeds.map((s) => (
                  <button
                    key={s}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                      speed === s 
                        ? "bg-primary text-primary-foreground" 
                        : "text-white hover:bg-white/10"
                    }`}
                    onClick={() => handleSpeedChange(s)}
                  >
                    {s}x
                    {speed === s && <Check className="w-3 h-3 ml-2" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
