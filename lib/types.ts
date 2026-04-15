export interface Drill {
  drill_id: number;
  title: string;
  drill_url: string;
  number_of_players: string;
  pitch_size: string;
  instructions_setup: string;
  coaching_notes: string;
  progression_one: string;
  progression_two: string;
  video_file_path: string;
  thumbnail_path?: string;
  drill_tags: string[];
}

export interface Session {
  id: string;
  title: string;
  date: string;
  drills: Drill[];
  ageGroup?: string;
  playerCount: number;
}
