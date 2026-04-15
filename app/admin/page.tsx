"use client";

import { useEffect, useState, useRef } from "react";
import { getDrills } from "@/lib/drills";
import { Drill } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2, Download, Image as ImageIcon } from "lucide-react";
import JSZip from "jszip";

export default function AdminPage() {
  const [allDrills, setAllDrills] = useState<Drill[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "completed">("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    getDrills().then(setAllDrills);
  }, []);

  const captureFrame = (video: HTMLVideoElement): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve("");
      
      const context = canvas.getContext("2d");
      if (!context) return resolve("");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    });
  };

  const processThumbnails = async () => {
    if (!videoRef.current || allDrills.length === 0) return;
    
    setStatus("processing");
    setProgress(0);
    setLogs([]);
    const zip = new JSZip();
    const updatedDrills = [...allDrills];

    for (let i = 0; i < allDrills.length; i++) {
      const drill = allDrills[i];
      const videoUrl = `/videos/${drill.video_file_path.split("/").pop()}`;
      
      setLogs(prev => [`Processing: ${drill.title}...`, ...prev.slice(0, 5)]);
      
      try {
        const video = videoRef.current;
        video.src = videoUrl;
        
        await new Promise((resolve, reject) => {
          video.onloadeddata = resolve;
          video.onerror = reject;
          // Set a timeout to prevent hanging on broken videos
          setTimeout(reject, 5000);
        });

        // Seek to 1 second to get a good frame (not just black)
        video.currentTime = 1;
        await new Promise((resolve) => (video.onseeked = resolve));

        const dataUrl = await captureFrame(video);
        if (dataUrl) {
          const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
          const filename = `${drill.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.jpg`;
          zip.file(`thumbnails/${filename}`, base64Data, { base64: true });
          updatedDrills[i] = { ...drill, thumbnail_path: `/thumbnails/${filename}` };
        }
      } catch (err) {
        setLogs(prev => [`Error processing ${drill.title}: ${err}`, ...prev]);
      }
      
      setProgress(Math.round(((i + 1) / allDrills.length) * 100));
    }

    // Generate ZIP
    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "drill-thumbnails.zip";
    link.click();

    // Also download the updated JSON
    const jsonBlob = new Blob([JSON.stringify(updatedDrills, null, 2)], { type: "application/json" });
    const jsonUrl = window.URL.createObjectURL(jsonBlob);
    const jsonLink = document.createElement("a");
    jsonLink.href = jsonUrl;
    jsonLink.download = "drills-data-updated.json";
    jsonLink.click();

    setStatus("completed");
    setLogs(prev => ["Success! Thumbnails zipped and JSON updated.", ...prev]);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ImageIcon className="w-6 h-6" /> Admin: Thumbnail Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-secondary/30 rounded-lg border">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" /> How it works
            </h4>
            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
              <li>It will iterate through all {allDrills.length} drills.</li>
              <li>Loads each video in a hidden player and grabs a frame.</li>
              <li>Generates a ZIP of images and an updated JSON file.</li>
              <li>Extract the ZIP to <code>/public/thumbnails/</code> and replace your JSON.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button 
            onClick={processThumbnails} 
            disabled={status === "processing" || allDrills.length === 0}
            className="w-full"
          >
            {status === "processing" ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Regenerate All Thumbnails</>
            )}
          </Button>

          <div className="bg-black text-xs p-4 rounded-lg h-40 overflow-y-auto font-mono text-green-400">
            {logs.length === 0 && <span className="text-gray-500">// Waiting for input...</span>}
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>

          {status === "completed" && (
            <div className="flex items-center gap-2 text-green-500 font-medium justify-center">
              <CheckCircle2 className="w-5 h-5" /> All tasks finished!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden processing elements */}
      <video ref={videoRef} className="hidden" muted playsInline crossOrigin="anonymous" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
