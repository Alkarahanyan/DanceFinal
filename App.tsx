
import React, { useState, useEffect } from 'react';
import { AppView, DanceStyle, Song } from './types.ts';
import { INITIAL_DANCES, COLORS } from './constants.tsx';
import Elements from './components/Elements.tsx';
import MusicLibrary from './components/MusicLibrary.tsx';
import Trainer from './components/Trainer.tsx';
import { getAllSongs } from './db.ts';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('library');
  const [dances, setDances] = useState<DanceStyle[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    const savedDances = localStorage.getItem('dance_styles');
    if (savedDances) {
      setDances(JSON.parse(savedDances));
    } else {
      setDances(INITIAL_DANCES);
      localStorage.setItem('dance_styles', JSON.stringify(INITIAL_DANCES));
    }

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
    <div className="min-h-screen flex bg-slate-950 text-slate-200">
      {/* Left Sidebar Navigation */}
      <aside className="w-20 md:w-24 flex flex-col items-center py-8 bg-slate-900 border-r border-slate-800 z-50">
        <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center mb-12 shadow-lg shadow-rose-900/40">
          <span className="text-white font-black text-2xl">L</span>
        </div>
        
        <nav className="flex flex-col gap-8">
          <button 
            onClick={() => setView('library')} 
            title="Элементы"
            className={`p-3 rounded-2xl transition-all duration-300 ${view === 'library' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          
          <button 
            onClick={() => setView('music')} 
            title="Музыка"
            className={`p-3 rounded-2xl transition-all duration-300 ${view === 'music' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </button>
          
          <button 
            onClick={() => setView('training')} 
            title="Тренировка"
            className={`p-3 rounded-2xl transition-all duration-300 ${view === 'training' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen custom-scrollbar">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {view === 'library' && <Elements dances={dances} onUpdateDances={updateDances} />}
          {view === 'music' && <MusicLibrary songs={songs} dances={dances} onRefresh={refreshSongs} />}
          {view === 'training' && <Trainer dances={dances} songs={songs} />}
        </div>
      </main>
    </div>
  );
};

export default App;