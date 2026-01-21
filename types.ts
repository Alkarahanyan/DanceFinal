
export interface DanceMove {
  id: string;
  name: string;
  description?: string;
  videoData?: string;
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
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  blob: Blob;
  duration: number;
}

export type AppView = 'library' | 'music' | 'training';