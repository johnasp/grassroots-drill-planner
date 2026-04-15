"use client";

import { useEffect, useState } from "react";
import { Drill } from "@/lib/types";
import { getDrills } from "@/lib/drills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Heart,
  Play,
  Info,
  ChevronRight,
  Image as ImageIcon
} from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FavoritesPage() {
  const [allDrills, setAllDrills] = useState<Drill[]>([]);
  const [search, setSearch] = useState("");
  const [viewingDrill, setViewingDrill] = useState<Drill | null>(null);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    getDrills().then(setAllDrills);
  }, []);

  const favoriteDrills = allDrills.filter(d => favorites.includes(String(d.drill_id)));

  const filteredDrills = favoriteDrills.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.drill_tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" /> Favorite Drills
          </h2>
          <p className="text-muted-foreground mt-1">Your personal collection of go-to drills.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search favorites..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
      </div>

      {favoriteDrills.length === 0 ? (
        <div className="p-20 text-center border-dashed border-2 bg-muted/20 rounded-3xl">
          <div className="bg-background w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Heart className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Click the heart icon on any drill in the library to add it to your favorites.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrills.map((drill) => (
            <div 
              key={drill.drill_id} 
              className="bg-card border-2 rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all group cursor-pointer"
              onClick={() => setViewingDrill(drill)}
            >
              <div className="aspect-video bg-muted relative">
                {drill.thumbnail_path ? (
                  <img src={drill.thumbnail_path} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-12 h-12 text-white fill-white" />
                </div>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 text-red-500 fill-red-500 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(drill.drill_id, drill.title);
                  }}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3">
                <h4 className="font-bold line-clamp-1">{drill.title}</h4>
                <div className="flex flex-wrap gap-1">
                  {drill.drill_tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0">{tag}</Badge>
                  ))}
                  {drill.drill_tags.length > 3 && (
                    <Badge variant="secondary" className="text-[10px] px-2 py-0">+{drill.drill_tags.length - 3}</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
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
