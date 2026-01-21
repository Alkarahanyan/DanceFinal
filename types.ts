
export interface DanceMove {
  id: string;
  name: string;
  description?: string;
  videoUrl?: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface DanceStyle {
  id: string;
  name: string;
  description: string;
  moves: DanceMove[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  danceStyle: string;
  blob: Blob;
  duration: number;
}

export type AppView = 'dashboard' | 'library' | 'music' | 'training';
