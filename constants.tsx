
import React from 'react';
import { DanceStyle } from './types.ts';

export const INITIAL_DANCES: DanceStyle[] = [
  {
    id: 'salsa-1',
    name: 'Сальса',
    description: 'Энергичный и жизнерадостный социальный танец, зародившийся на Карибах.',
    moves: [
      // Fix: Renamed videoUrl to videoData to match the DanceMove type.
      { id: 's1', name: 'Базовый шаг', level: 'Beginner', videoData: 'https://picsum.photos/400/225' },
      // Fix: Renamed videoUrl to videoData to match the DanceMove type.
      { id: 's2', name: 'Правый поворот', level: 'Beginner', videoData: 'https://picsum.photos/400/225' },
      // Fix: Renamed videoUrl to videoData to match the DanceMove type.
      { id: 's3', name: 'Cross Body Lead', level: 'Intermediate', videoData: 'https://picsum.photos/400/225' },
      // Fix: Renamed videoUrl to videoData to match the DanceMove type.
      { id: 's4', name: 'Dile Que No', level: 'Intermediate', videoData: 'https://picsum.photos/400/225' },
    ]
  },
  {
    id: 'bachata-1',
    name: 'Бачата',
    description: 'Чувственный и ритмичный танец из Доминиканской Республики.',
    moves: [
      // Fix: Renamed videoUrl to videoData to match the DanceMove type.
      { id: 'b1', name: 'Базовый шаг (в сторону)', level: 'Beginner', videoData: 'https://picsum.photos/400/225' },
      // Fix: Renamed videoUrl to videoData to match the DanceMove type.
      { id: 'b2', name: 'Квадрат (Box Step)', level: 'Beginner', videoData: 'https://picsum.photos/400/225' },
      // Fix: Renamed videoUrl to videoData to match the DanceMove type.
      { id: 'b3', name: 'Sweetheart', level: 'Intermediate', videoData: 'https://picsum.photos/400/225' },
    ]
  }
];

export const COLORS = {
  accent: 'text-rose-500',
  accentBg: 'bg-rose-500',
  accentHover: 'hover:bg-rose-600',
  card: 'bg-slate-800/50',
};