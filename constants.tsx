
import React from 'react';
import { DanceStyle } from './types.ts';

export const INITIAL_DANCES: DanceStyle[] = [
  {
    id: 'salsa-1',
    name: 'Сальса',
    description: 'Энергичный и жизнерадостный социальный танец, зародившийся на Карибах.',
    moves: [
      { id: 's1', name: 'Базовый шаг', level: 'Beginner', videoUrl: 'https://picsum.photos/400/225' },
      { id: 's2', name: 'Правый поворот', level: 'Beginner', videoUrl: 'https://picsum.photos/400/225' },
      { id: 's3', name: 'Cross Body Lead', level: 'Intermediate', videoUrl: 'https://picsum.photos/400/225' },
      { id: 's4', name: 'Dile Que No', level: 'Intermediate', videoUrl: 'https://picsum.photos/400/225' },
    ]
  },
  {
    id: 'bachata-1',
    name: 'Бачата',
    description: 'Чувственный и ритмичный танец из Доминиканской Республики.',
    moves: [
      { id: 'b1', name: 'Базовый шаг (в сторону)', level: 'Beginner', videoUrl: 'https://picsum.photos/400/225' },
      { id: 'b2', name: 'Квадрат (Box Step)', level: 'Beginner', videoUrl: 'https://picsum.photos/400/225' },
      { id: 'b3', name: 'Sweetheart', level: 'Intermediate', videoUrl: 'https://picsum.photos/400/225' },
    ]
  }
];

export const COLORS = {
  accent: 'text-rose-500',
  accentBg: 'bg-rose-500',
  accentHover: 'hover:bg-rose-600',
  card: 'bg-slate-800/50',
};
