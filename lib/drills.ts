import { Drill } from "./types";

export async function getDrills(): Promise<Drill[]> {
  try {
    const response = await fetch('/data/drills-data.json');
    if (!response.ok) {
      throw new Error('Failed to fetch drills data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading drills:', error);
    return [];
  }
}

export function generateSession(
  allDrills: Drill[],
  playerCount: number,
  numDrills: number,
  selectedTags: string[]
): Drill[] {
  // Simple filtering logic
  let filtered = allDrills;

  // 1. Filter by tags if any selected
  if (selectedTags.length > 0) {
    filtered = filtered.filter((drill) =>
      drill.drill_tags.some((tag) => selectedTags.includes(tag))
    );
  }

  // 2. Optional: Filter by player count roughly
  // The JSON number_of_players is often a string like "6" or "10-12"
  // We'll keep it simple for now and just randomize from the filtered set
  
  // Shuffle
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  
  // Return requested amount
  return shuffled.slice(0, numDrills);
}

export function getUniqueTags(drills: Drill[]): string[] {
  const tags = new Set<string>();
  drills.forEach(drill => drill.drill_tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}
