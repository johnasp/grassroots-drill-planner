"use client";

import { useEffect, useState } from "react";
import { Drill, Session } from "@/lib/types";
import { getDrills } from "@/lib/drills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Search, 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  FileDown,
  Image as ImageIcon,
  Info,
  Play,
  ChevronRight,
  Heart
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { SessionPDF } from "@/components/SessionPDF";
import { useFavorites } from "@/hooks/useFavorites";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

type SelectedDrill = Drill & { temp_id: string };

function SortableDrill({ 
  drill, 
  index, 
  onRemove,
  onView
}: { 
  drill: SelectedDrill; 
  index: number; 
  onRemove: (id: string) => void;
  onView: (drill: Drill) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: drill.temp_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex gap-4 items-start bg-card p-4 rounded-lg border group ${isDragging ? 'opacity-50 border-primary shadow-lg ring-2 ring-primary/20' : ''}`}>
      <div {...attributes} {...listeners} className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary p-1">
        <GripVertical className="w-5 h-5" />
      </div>
      
      <div 
        className="w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0 border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all relative group/thumb"
        onClick={() => onView(drill)}
      >
        {drill.thumbnail_path ? (
          <img 
            src={drill.thumbnail_path} 
            alt="" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
          <Play className="w-6 h-6 text-white fill-white" />
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-bold cursor-pointer hover:text-primary transition-colors line-clamp-1" onClick={() => onView(drill)}>
            {index + 1}. {drill.title}
          </h4>
          <Button variant="ghost" size="icon" onClick={() => onRemove(drill.temp_id)} className="text-destructive hover:bg-destructive/10 h-8 w-8">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {drill.drill_tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ManualBuilder() {
  const [allDrills, setAllDrills] = useState<Drill[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [displayLimit, setDisplayLimit] = useState(40);
  const [selectedDrills, setSelectedDrills] = useState<SelectedDrill[]>([]);
  const [sessionTitle, setSessionTitle] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [viewingDrill, setViewingDrill] = useState<Drill | null>(null);
  const { toggleFavorite, isFavorite } = useFavorites();

  const categories = [
    "All",
    "Warm Up",
    "Passing",
    "Possession Based",
    "Attacking",
    "Defending",
    "Finishing",
    "1v1/2v2/3v3",
    "Small Sided Game",
    "Rondo"
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setIsMounted(true);
    getDrills().then(setAllDrills);
    const dateStr = new Date().toLocaleDateString();
    setSessionTitle(`Manual Session - ${dateStr}`);
  }, []);

  const filteredDrills = allDrills.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.drill_tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || 
      d.drill_tags.some(t => t.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  const visibleDrills = filteredDrills.slice(0, search ? 100 : displayLimit);

  const handleAddDrill = (drill: Drill) => {
    const uniqueId = `${drill.drill_id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setSelectedDrills([...selectedDrills, { ...drill, temp_id: uniqueId }]);
  };

  const handleRemoveDrill = (id: string) => {
    setSelectedDrills(selectedDrills.filter(d => d.temp_id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelectedDrills((items) => {
        const oldIndex = items.findIndex((i) => i.temp_id === active.id);
        const newIndex = items.findIndex((i) => i.temp_id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    const savedSessions = JSON.parse(localStorage.getItem("football-sessions") || "[]");
    const newSession: Session = {
      id: Date.now().toString(),
      title: sessionTitle || "Untitled Manual Session",
      date: new Date().toISOString(),
      drills: selectedDrills,
      playerCount: 12
    };
    localStorage.setItem("football-sessions", JSON.stringify([...savedSessions, newSession]));
    toast.success("Session saved!", {
      description: "Successfully added to your session library."
    });
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)]">
      {/* Sidebar: Drill Library */}
      <div className="w-full h-[65%] flex flex-col gap-4 bg-card border rounded-2xl p-4 overflow-hidden shadow-sm">
        <h3 className="font-bold flex items-center gap-2 px-1">
          <Search className="w-4 h-4 text-primary" /> Drill Library
        </h3>

        {/* Categories: Horizontal Scrollable Badges */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-1 px-1">
          {categories.map(category => (
            <Badge 
              key={category} 
              variant={selectedCategory === category ? "default" : "secondary"}
              className="cursor-pointer whitespace-nowrap transition-all hover:scale-105"
              onClick={() => {
                setSelectedCategory(category);
                setDisplayLimit(40);
              }}
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="flex gap-3">
          <Input 
            placeholder="Search drills..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-muted/50 border-none h-10 flex-1"
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pr-2 custom-scrollbar content-start">
          {visibleDrills.map(drill => (
            <div 
              key={drill.drill_id} 
              className="p-2 border rounded-xl hover:bg-accent transition-colors group relative flex gap-3 items-center bg-card/50"
            >
              <div 
                className="w-16 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0 border relative cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                onClick={() => setViewingDrill(drill)}
              >
                {drill.thumbnail_path ? (
                  <img 
                    src={drill.thumbnail_path} 
                    alt="" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setViewingDrill(drill)}>
                <h4 className="text-[10px] font-bold pr-1 truncate" title={drill.title}>{drill.title}</h4>
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  {drill.drill_tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="outline" className="text-[8px] py-0 px-1 leading-tight h-3 border-primary/20 whitespace-nowrap">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={isFavorite(drill.drill_id) ? "h-7 w-7 text-red-500 fill-red-500 hover:text-red-600 hover:bg-red-50" : "h-7 w-7 text-muted-foreground hover:text-red-500 hover:bg-red-50"}
                  onClick={() => toggleFavorite(drill.drill_id, drill.title)}
                >
                  <Heart className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-primary hover:bg-primary/10 flex-shrink-0"
                  onClick={() => handleAddDrill(drill)}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {filteredDrills.length > visibleDrills.length && !search && (
            <div className="col-span-full py-4">
              <Button 
                variant="ghost" 
                className="w-full text-xs text-muted-foreground font-bold"
                onClick={() => setDisplayLimit(prev => prev + 40)}
              >
                Load More ({filteredDrills.length - visibleDrills.length} remaining)
              </Button>
            </div>
          )}

          {visibleDrills.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
              No drills found matching those criteria.
            </div>
          )}
        </div>
      </div>

      {/* Main Area: Timeline */}
      <div className="flex-1 flex flex-col gap-3 bg-card border rounded-2xl p-4 overflow-hidden shadow-sm relative">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b pb-3">
          <div className="flex-1 w-full space-y-0.5">
             <Label className="text-[9px] uppercase font-bold text-muted-foreground ml-1 tracking-wider">Session Name</Label>
             <Input 
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Name your session..."
                className="text-xl font-black bg-transparent border-none focus-visible:ring-0 p-0 h-auto w-full placeholder:opacity-20"
              />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="default" className="h-11 shadow-md shadow-primary/10 flex-1 md:flex-none" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2"/>Save
            </Button>
            
            {isMounted && (
              <PDFDownloadLink 
                document={<SessionPDF session={{
                  id: "tmp",
                  title: sessionTitle,
                  date: new Date().toISOString(),
                  drills: selectedDrills,
                  playerCount: 12
                }} />} 
                fileName={`${sessionTitle || 'session'}.pdf`}
              >
                {({ loading }) => (
                  <Button variant="outline" className="h-11 flex-1 md:flex-none" disabled={loading || selectedDrills.length === 0}>
                    <FileDown className="w-4 h-4 mr-2"/>
                    {loading ? "..." : "Export"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 py-2 custom-scrollbar">
          {selectedDrills.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/20">
              <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                <Plus className="w-8 h-8 text-primary/40" />
              </div>
              <p className="font-medium">Your timeline is empty</p>
              <p className="text-xs opacity-60">Add drills from the library to start building</p>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext 
                items={selectedDrills.map(d => d.temp_id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {selectedDrills.map((drill, index) => (
                    <SortableDrill 
                      key={drill.temp_id} 
                      drill={drill} 
                      index={index} 
                      onRemove={handleRemoveDrill}
                      onView={setViewingDrill}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Drill Detail Modal */}
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
                  
                  <Button 
                    className="shrink-0 shadow-lg shadow-primary/20 h-12 px-6 text-base font-bold" 
                    onClick={() => {
                      handleAddDrill(viewingDrill);
                      setViewingDrill(null);
                    }}
                  >
                    <Plus className="w-5 h-5 mr-2" /> Add to Session
                  </Button>
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
