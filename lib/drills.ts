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

export interface PlayerCountRange {
  min: number;
  max: number;
}

/**
 * Parses only unambiguous player-count values, such as "8", "8 players",
 * "6-8", or "6 to 8". Unknown formats deliberately return null so we don't
 * claim a drill is suitable when its player requirement cannot be verified.
 */
export function parsePlayerCountRange(value: string | number | null | undefined): PlayerCountRange | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return { min: value, max: value };
  }

  if (typeof value !== "string") return null;

  const normalised = value
    .trim()
    .replace(/[–—]/g, "-")
    .replace(/\s+to\s+/i, "-")
    .replace(/\s+/g, " ");

  const rangeMatch = normalised.match(/^(\d+)\s*-\s*(\d+)(?:\s+players?)?$/i);
  if (rangeMatch) {
    const first = Number(rangeMatch[1]);
    const second = Number(rangeMatch[2]);
    if (first < 1 || second < first) return null;
    return { min: first, max: second };
  }

  const exactMatch = normalised.match(/^(\d+)(?:\s+players?)?$/i);
  if (exactMatch) {
    const count = Number(exactMatch[1]);
    if (count < 1) return null;
    return { min: count, max: count };
  }

  return null;
}

export function isDrillSuitableForPlayers(
  drill: Pick<Drill, "number_of_players">,
  playerCount: number
): boolean {
  if (!Number.isInteger(playerCount) || playerCount < 1) return false;
  const range = parsePlayerCountRange(drill.number_of_players);
  return range !== null && playerCount >= range.min && playerCount <= range.max;
}

export function generateSession(
  allDrills: Drill[],
  playerCount: number,
  numDrills: number,
  selectedTags: string[]
): Drill[] {
  if (!Number.isInteger(playerCount) || playerCount < 1 || !Number.isInteger(numDrills) || numDrills < 1) {
    return [];
  }

  // Player count is a hard constraint: do not fill the session with drills
  // whose recorded player requirements exclude the requested group size.
  let filtered = allDrills.filter((drill) => isDrillSuitableForPlayers(drill, playerCount));

  if (selectedTags.length > 0) {
    filtered = filtered.filter((drill) =>
      drill.drill_tags.some((tag) => selectedTags.includes(tag))
    );
  }

  // Fisher-Yates shuffle avoids the bias of sorting by random comparator.
  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // If there aren't enough compatible drills, return only those available.
  return shuffled.slice(0, numDrills);
}

export function getUniqueTags(drills: Drill[]): string[] {
  const tags = new Set<string>();
  drills.forEach(drill => drill.drill_tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}
