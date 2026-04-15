"use client";

import { useEffect, useState } from "react";
import { Drill, Session } from "@/lib/types";
import { getDrills, generateSession, getUniqueTags } from "@/lib/drills";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  RotateCcw, 
  FileDown, 
  Save, 
  Maximize2, 
  Minimize2,
  Play,
  Info,
  ChevronRight,
  Sparkles,
  Image as ImageIcon,
  Heart
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { SessionPDF } from "@/components/SessionPDF";
import { useFavorites } from "@/hooks/useFavorites";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AutoBuilder() {
  const [allDrills, setAllDrills] = useState<Drill[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [playerCount, setPlayerCount] = useState(12);
  const [numDrills, setNumDrills] = useState(3);
  const [session, setSession] = useState<Drill[]>([]);
  const [sessionTitle, setSessionTitle] = useState("");
  const [focusMode, setFocusMode] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [viewingDrill, setViewingDrill] = useState<Drill | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    setIsMounted(true);
    getDrills().then((data) => {
      setAllDrills(data);
      setTags(getUniqueTags(data));
    });
  }, []);

  const handleGenerate = () => {
    const drills = generateSession(allDrills, playerCount, numDrills, selectedTags);
    setSession(drills);
    setSessionTitle(`Session - ${new Date().toLocaleDateString()} - ${playerCount} Players`);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag].slice(-2)
    );
  };

  const handleSave = () => {
    const savedSessions = JSON.parse(localStorage.getItem("football-sessions") || "[]");
    const newSession: Session = {
      id: Date.now().toString(),
      title: sessionTitle || "Untitled Session",
      date: new Date().toISOString(),
      drills: session,
      playerCount
    };
    localStorage.setItem("football-sessions", JSON.stringify([...savedSessions, newSession]));
    toast.success("Session saved!", {
      description: "You can find this plan in My Sessions."
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <section className="bg-card p-8 rounded-2xl border shadow-sm space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Sparkles className="w-32 h-32" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Auto Session Builder</h2>
          <p className="text-muted-foreground">Select your criteria and let us build the perfect session for you.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Number of Players</Label>
            <div className="flex items-center gap-4">
               <Input 
                type="number" 
                value={playerCount} 
                onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                min={1} max={30}
                className="text-lg h-12"
              />
              <span className="text-muted-foreground whitespace-nowrap">Players on pitch</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-base font-semibold">Session Length (Drills)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <Button 
                  key={n} 
                  variant={numDrills === n ? "default" : "outline"}
                  onClick={() => setNumDrills(n)}
                  className="flex-1 h-12 text-lg"
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-semibold">Target Themes (Select up to 2)</Label>
          <div className="flex flex-wrap gap-2 p-4 border rounded-xl bg-muted/30">
            {tags.map(tag => (
              <Badge 
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "secondary"}
                className="cursor-pointer hover:scale-105 transition-transform px-3 py-1 text-sm"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Button onClick={handleGenerate} size="lg" className="w-full h-14 text-xl shadow-lg shadow-primary/20">
          Generate Session Plan
        </Button>
      </section>

      {session.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between border-b pb-6">
            <div className="flex-1 space-y-1 w-full">
              <Label className="text-xs uppercase font-bold text-muted-foreground ml-1">Session Title</Label>
              <Input 
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Name your session..."
                className="text-3xl font-extrabold bg-transparent border-none focus-visible:ring-0 p-0 h-auto w-full placeholder:opacity-20"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="default" className="flex-1 md:flex-none h-11" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2"/>Save Plan
              </Button>
              
              {isMounted && (
                <PDFDownloadLink 
                  document={<SessionPDF session={{
                    id: "tmp",
                    title: sessionTitle,
                    date: new Date().toISOString(),
                    drills: session,
                    playerCount
                  }} />} 
                  fileName={`${sessionTitle || 'session'}.pdf`}
                >
                  {({ loading }) => (
                    <Button variant="outline" className="flex-1 md:flex-none h-11" disabled={loading}>
                      <FileDown className="w-4 h-4 mr-2"/>
                      {loading ? "..." : "Export"}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}

              <Button variant="ghost" className="h-11" onClick={() => setSession([])}>
                <RotateCcw className="w-4 h-4 mr-2"/>Reset
              </Button>
            </div>
          </div>

          <div className="space-y-8">
            {session.map((drill, index) => (
              <Card key={drill.drill_id} className={`overflow-hidden border-2 ${focusMode !== null && focusMode !== index ? "hidden" : "block"}`}>
                <CardHeader className="flex flex-row items-center justify-between bg-muted/30 border-b p-4">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">{index + 1}</span>
                    {drill.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleFavorite(drill.drill_id, drill.title)}
                      className={isFavorite(drill.drill_id) ? "text-red-500 fill-red-500 hover:text-red-600 hover:bg-red-50" : "text-muted-foreground hover:text-red-500 hover:bg-red-50"}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setFocusMode(focusMode === index ? null : index)}>
                      {focusMode === index ? <Minimize2 className="w-4 h-4"/> : <Maximize2 className="w-4 h-4"/>}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-5 gap-0">
                    <div 
                      className="md:col-span-2 aspect-video md:aspect-auto bg-black relative group cursor-pointer"
                      onClick={() => setViewingDrill(drill)}
                    >
                      {drill.thumbnail_path ? (
                        <img 
                          src={drill.thumbnail_path} 
                          alt="" 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                        {drill.drill_tags.slice(0, 2).map(tag => (
                          <Badge key={tag} className="bg-black/60 backdrop-blur-md border-none text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-3 p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Players</span>
                          <p className="font-semibold">{drill.number_of_players}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Pitch</span>
                          <p className="font-semibold">{drill.pitch_size}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-bold text-sm flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary" /> Setup & Instructions
                          </h4>
                          <div className="text-muted-foreground leading-relaxed space-y-2 mt-2">
                            {drill.instructions_setup.split('\n').map(l => l.trim()).filter(l => l.length > 0).map((line, i) => (
                              <div key={i} className="flex gap-3 items-start text-sm">
                                <span className="text-primary/40 font-bold mt-0.5">{i + 1}</span>
                                <span className="flex-1">{line.replace(/^[•\-\*]\s*/, '').trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button variant="link" className="p-0 h-auto text-primary text-sm font-bold" onClick={() => setViewingDrill(drill)}>
                          View Full Details <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reusable Drill Detail Modal */}
      <Dialog open={!!viewingDrill} onOpenChange={(open) => !open && setViewingDrill(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {viewingDrill && (
            <>
              <div className="aspect-video bg-black relative">
                <video 
                  src={`/videos/${viewingDrill.video_file_path.split('/').pop()}`}
                  controls
                  className="w-full h-full"
                  autoPlay
                />
              </div>
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <DialogTitle className="text-3xl font-extrabold flex-1">{viewingDrill.title}</DialogTitle>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleFavorite(viewingDrill.drill_id, viewingDrill.title)}
                          className={isFavorite(viewingDrill.drill_id) ? "text-red-500 fill-red-500 hover:text-red-600 hover:bg-red-50" : "text-muted-foreground hover:text-red-500 hover:bg-red-50"}
                        >
                          <Heart className="w-6 h-6" />
                        </Button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {viewingDrill.drill_tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="px-3 py-1">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-8 pt-4 border-t">
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-bold uppercase text-muted-foreground">Players</h5>
                        <p className="text-lg font-bold">{viewingDrill.number_of_players}</p>
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-bold uppercase text-muted-foreground">Pitch Size</h5>
                        <p className="text-lg font-bold">{viewingDrill.pitch_size}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <h4 className="font-bold text-xl flex items-center gap-2 border-b pb-2">
                      <Info className="w-5 h-5 text-primary" /> Instructions & Setup
                    </h4>
                    <div className="text-muted-foreground leading-relaxed space-y-3 mt-2">
                       {viewingDrill.instructions_setup.split('\n').map(l => l.trim()).filter(l => l.length > 0).map((line, i) => (
                        <div key={i} className="flex gap-3 items-start text-sm">
                          <span className="text-primary/40 font-bold mt-0.5">{i + 1}</span>
                          <span className="flex-1">{line.replace(/^[•\-\*]\s*/, '').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-xl flex items-center gap-2 border-b pb-2">
                      <Play className="w-5 h-5 text-primary" /> Coaching Notes
                    </h4>
                    <div className="text-muted-foreground leading-relaxed space-y-3 mt-2">
                       {viewingDrill.coaching_notes.split(/[\n•]/).map(l => l.trim()).filter(l => l.length > 0).map((note, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="text-primary font-black mt-0.5">•</span>
                          <span className="flex-1">{note}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(viewingDrill.progression_one || viewingDrill.progression_two) && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-xl flex items-center gap-2 border-b pb-2">
                        <ChevronRight className="w-5 h-5 text-primary" /> Progressions
                      </h4>
                      <div className="space-y-3 mt-2">
                        {viewingDrill.progression_one && viewingDrill.progression_one !== "​" && (
                          <div className="flex gap-3 items-start text-sm italic leading-relaxed text-muted-foreground">
                            <span className="text-primary/60 font-bold not-italic">1.</span>
                            <p className="flex-1">{viewingDrill.progression_one}</p>
                          </div>
                        )}
                        {viewingDrill.progression_two && viewingDrill.progression_two !== "​" && (
                          <div className="flex gap-3 items-start text-sm italic leading-relaxed text-muted-foreground">
                            <span className="text-primary/60 font-bold not-italic">2.</span>
                            <p className="flex-1">{viewingDrill.progression_two}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
