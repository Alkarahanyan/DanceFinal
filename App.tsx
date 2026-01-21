
import React, { useState, useEffect } from 'react';
import { AppView, DanceStyle, Song } from './types.ts';
import { INITIAL_DANCES, COLORS } from './constants.tsx';
import Dashboard from './components/Dashboard.tsx';
import Library from './components/Library.tsx';
import MusicLibrary from './components/MusicLibrary.tsx';
import Trainer from './components/Trainer.tsx';
import { getAllSongs } from './db.ts';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [dances, setDances] = useState<DanceStyle[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    // Load dances from localStorage or initial constants
    const savedDances = localStorage.getItem('dance_styles');
    if (savedDances) {
      setDances(JSON.parse(savedDances));
    } else {
      setDances(INITIAL_DANCES);
      localStorage.setItem('dance_styles', JSON.stringify(INITIAL_DANCES));
    }

    // Load music from IndexedDB
    const loadMusic = async () => {
      try {
        const loadedSongs = await getAllSongs();
        setSongs(loadedSongs);
      } catch (err) {
        console.error("Failed to load music from IDB:", err);
      }
    };
    loadMusic();
  }, []);

  const refreshSongs = async () => {
    const loadedSongs = await getAllSongs();
    setSongs(loadedSongs);
  };

  const updateDances = (newDances: DanceStyle[]) => {
    setDances(newDances);
    localStorage.setItem('dance_styles', JSON.stringify(newDances));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">L</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Latin<span className={COLORS.accent}>Dance</span> Trainer</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setView('dashboard')} className={`text-sm font-medium transition ${view === 'dashboard' ? COLORS.accent : 'text-slate-400 hover:text-white'}`}>Главная</button>
            <button onClick={() => setView('library')} className={`text-sm font-medium transition ${view === 'library' ? COLORS.accent : 'text-slate-400 hover:text-white'}`}>Библиотека</button>
            <button onClick={() => setView('music')} className={`text-sm font-medium transition ${view === 'music' ? COLORS.accent : 'text-slate-400 hover:text-white'}`}>Музыка</button>
            <button onClick={() => setView('training')} className={`px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition shadow-lg shadow-rose-900/20`}>Тренировка</button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {view === 'dashboard' && <Dashboard setView={setView} />}
          {view === 'library' && <Library dances={dances} onUpdateDances={updateDances} />}
          {view === 'music' && <MusicLibrary songs={songs} onRefresh={refreshSongs} />}
          {view === 'training' && <Trainer dances={dances} songs={songs} />}
        </div>
      </main>

      {/* Mobile Navigation */}
      <footer className="md:hidden sticky bottom-0 bg-slate-900 border-t border-slate-800 grid grid-cols-4 px-2 py-3">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? COLORS.accent : 'text-slate-500'}`}>
          <div className="w-5 h-5">🏠</div>
          <span className="text-[10px]">Главная</span>
        </button>
        <button onClick={() => setView('library')} className={`flex flex-col items-center gap-1 ${view === 'library' ? COLORS.accent : 'text-slate-500'}`}>
          <div className="w-5 h-5">💃</div>
          <span className="text-[10px]">Движения</span>
        </button>
        <button onClick={() => setView('music')} className={`flex flex-col items-center gap-1 ${view === 'music' ? COLORS.accent : 'text-slate-500'}`}>
          <div className="w-5 h-5">🎵</div>
          <span className="text-[10px]">Медиа</span>
        </button>
        <button onClick={() => setView('training')} className={`flex flex-col items-center gap-1 ${view === 'training' ? COLORS.accent : 'text-slate-500'}`}>
          <div className="w-5 h-5">🔥</div>
          <span className="text-[10px]">Старт</span>
        </button>
      </footer>
    </div>
  );
};

export default App;
