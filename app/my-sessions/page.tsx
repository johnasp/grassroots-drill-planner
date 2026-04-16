"use client";

import { useEffect, useState } from "react";
import { Session } from "@/lib/types";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  Calendar, 
  Users, 
  FileDown, 
  Play, 
  ChevronRight, 
  Search,
  LayoutGrid,
  ClipboardList,
  Info
} from "lucide-react";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { SessionPDF } from "@/components/SessionPDF";
import { DrillVideoPlayer } from "@/components/DrillVideoPlayer";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MySessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [search, setSearch] = useState("");
  const [viewingSession, setViewingSession] = useState<Session | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = JSON.parse(localStorage.getItem("football-sessions") || "[]");
    // Sort by date newest first
    setSessions(saved.sort((a: Session, b: Session) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const handleDelete = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem("football-sessions", JSON.stringify(updated));
    toast.error("Session deleted", {
      description: "The session plan has been removed."
    });
  };

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary" /> My Session Plans
          </h2>
          <p className="text-muted-foreground mt-1">Manage and export your saved coaching sessions.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search saved plans..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card className="p-20 text-center border-dashed border-2 bg-muted/20 rounded-3xl">
          <div className="bg-background w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <LayoutGrid className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold mb-2">No sessions saved yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8">
            Start by creating a session using the Auto Builder or Manual Builder tools.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="default" size="lg">
              <Link href="/">Auto Builder</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/manual">Manual Builder</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredSessions.map((session) => (
            <Card 
              key={session.id} 
              className="group transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 cursor-pointer overflow-hidden border-2 rounded-2xl"
              onClick={() => setViewingSession(session)}
            >
              <CardContent className="p-6 flex flex-col gap-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-extrabold group-hover:text-primary transition-colors">
                      {session.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-primary" />
                        {new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-4 h-4 text-primary" />
                        {session.playerCount} Players
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">
                          {session.drills.length}
                        </div>
                        Drills
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                      {isMounted && (
                      <PDFDownloadLink 
                        document={<SessionPDF session={session} />} 
                        fileName={`${session.title}.pdf`}
                      >
                        {({ loading }) => (
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-10 w-10 shrink-0" 
                            disabled={loading}
                            onClick={(e) => e.stopPropagation()}
                            title="Export PDF"
                          >
                            <FileDown className="w-4 h-4" />
                          </Button>
                        )}
                      </PDFDownloadLink>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-destructive hover:bg-destructive/10 shrink-0" 
                          onClick={(e) => e.stopPropagation()}
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Session Plan?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the session
                            plan from your local storage.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(session.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Drills in this session:</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {session.drills.map((drill, i) => (
                      <div key={i} className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                        <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black border border-primary/20">{i + 1}</span>
                        {drill.title}
                      </div>
                    ))}
                    {session.drills.length === 0 && <p className="text-xs text-muted-foreground italic">No drills added to this session yet.</p>}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex gap-1.5">
                      {Array.from(new Set(session.drills.flatMap(d => d.drill_tags))).slice(0, 5).map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0 h-5 border-primary/20 bg-primary/5 text-primary">
                          {tag}
                        </Badge>
                      ))}
                  </div>
                  <span className="text-sm font-bold text-primary flex items-center gap-1">
                    View Plan <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Session Detail Modal */}
      <Dialog open={!!viewingSession} onOpenChange={(open) => !open && setViewingSession(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {viewingSession && (
            <div className="flex flex-col">
              <div className="p-8 bg-card border-b sticky top-0 z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <DialogTitle className="text-3xl font-black">{viewingSession.title}</DialogTitle>
                    <div className="flex gap-4 text-sm text-muted-foreground font-medium">
                       <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(viewingSession.date).toLocaleDateString()}</span>
                       <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {viewingSession.playerCount} Players</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    {isMounted && (
                      <PDFDownloadLink 
                        document={<SessionPDF session={viewingSession} />} 
                        fileName={`${viewingSession.title}.pdf`}
                      >
                        {({ loading }) => (
                          <Button className="h-11 flex-1 md:flex-none shadow-lg shadow-primary/20" disabled={loading}>
                            <FileDown className="w-4 h-4 mr-2" />
                            {loading ? "Preparing PDF..." : "Export to PDF"}
                          </Button>
                        )}
                      </PDFDownloadLink>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-12 bg-muted/20">
                {viewingSession.drills.map((drill, index) => (
                  <div key={index} className="bg-card rounded-2xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="p-6 border-b bg-muted/10 flex items-center gap-4">
                      <span className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-black text-lg">
                        {index + 1}
                      </span>
                      <h4 className="text-xl font-bold">{drill.title}</h4>
                    </div>
                    <div className="flex flex-col">
                      <div className="aspect-video bg-black relative group">
                         {drill.thumbnail_path ? (
                            <img src={drill.thumbnail_path} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="w-12 h-12 text-muted-foreground/20" />
                            </div>
                          )}
                          <DrillVideoPlayer 
                            src={`/videos/${drill.video_file_path.split('/').pop()}`}
                            autoPlay={false}
                            className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity"
                          />

                      </div>
                      <div className="p-8 space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/50 p-3 rounded-xl">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Players</span>
                              <span className="font-bold">{drill.number_of_players}</span>
                            </div>
                            <div className="bg-muted/50 p-3 rounded-xl">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Pitch Size</span>
                              <span className="font-bold">{drill.pitch_size}</span>
                            </div>
                         </div>
                         <div className="space-y-6">
                            <div>
                              <h5 className="font-bold text-sm text-primary mb-2 flex items-center gap-2 border-b pb-1">
                                <Info className="w-4 h-4" /> Setup & Instructions
                              </h5>
                              <div className="space-y-2">
                                {drill.instructions_setup.split('\n').map(l => l.trim()).filter(l => l.length > 0).map((line, i) => (
                                  <div key={i} className="flex gap-2 items-start text-sm leading-relaxed text-muted-foreground">
                                    <span className="text-primary/40 font-bold">{i + 1}</span>
                                    <span className="flex-1">{line.replace(/^[•\-\*]\s*/, '').trim()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="font-bold text-sm text-primary mb-2 flex items-center gap-2 border-b pb-1">
                                <Play className="w-4 h-4" /> Coaching Notes
                              </h5>
                              <div className="space-y-2">
                                {drill.coaching_notes.split(/[\n•]/).map(l => l.trim()).filter(l => l.length > 0).map((note, i) => (
                                  <div key={i} className="flex gap-2 items-start text-sm leading-relaxed text-muted-foreground">
                                    <span className="text-primary font-bold">•</span>
                                    <span className="flex-1">{note}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {(drill.progression_one || drill.progression_two) && (
                              <div>
                                <h5 className="font-bold text-sm text-primary mb-2 flex items-center gap-2 border-b pb-1">
                                  <ChevronRight className="w-4 h-4" /> Progressions
                                </h5>
                                <div className="space-y-3">
                                  {drill.progression_one && drill.progression_one !== "​" && (
                                    <div className="flex gap-2 items-start text-sm italic leading-relaxed text-muted-foreground">
                                      <span className="font-bold text-primary/60 not-italic">1.</span>
                                      <p className="flex-1">{drill.progression_one}</p>
                                    </div>
                                  )}
                                  {drill.progression_two && drill.progression_two !== "​" && (
                                    <div className="flex gap-2 items-start text-sm italic leading-relaxed text-muted-foreground">
                                      <span className="font-bold text-primary/60 not-italic">2.</span>
                                      <p className="flex-1">{drill.progression_two}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex gap-1 flex-wrap pt-2">
                               {drill.drill_tags.map(tag => (
                                 <Badge key={tag} variant="secondary" className="text-[9px] px-2 py-0">{tag}</Badge>
                               ))}
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
