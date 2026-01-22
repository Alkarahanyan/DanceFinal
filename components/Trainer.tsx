
import React, { useState, useEffect, useRef } from 'react';
import { DanceStyle, Song, DanceMove } from '../types.ts';
import { assistant } from '../services/geminiService.ts';
import { COLORS } from '../constants.tsx';

interface TrainerProps {
  dances: DanceStyle[];
  songs: Song[];
}

const Trainer: React.FC<TrainerProps> = ({ dances, songs }) => {
  const [isActive, setIsActive] = useState(false);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(dances[0]?.id || '');
  const [selectedSongId, setSelectedSongId] = useState<string>(songs[0]?.id || '');
  const [currentMove, setCurrentMove] = useState<DanceMove | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [moveInterval, setMoveInterval] = useState(10); // in seconds

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);
  const isActiveRef = useRef(isActive); // ref to track active state in async cycle

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const selectedStyle = dances.find(d => d.id === selectedStyleId);
  const selectedSong = songs.find(s => s.id === selectedSongId);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
      assistant.stop(); // Ensure assistant stops on component unmount
    };
  }, []);

  const startTraining = async () => {
    if (!selectedStyle || !selectedStyle.moves.length) {
      alert("Выберите стиль с хотя бы одним элементом.");
      return;
    }

    if (selectedSong) {
      const url = URL.createObjectURL(selectedSong.blob);
      const audio = new Audio(url);
      audio.loop = true;
      audioRef.current = audio;
      audio.play();
    }

    setIsActive(true);
    setCountdown(3);

    let count = 3;
    const cd = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(cd);
        setCountdown(null);
        startCyclingMoves();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const stopTraining = () => {
    setIsActive(false);
    setCurrentMove(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    assistant.stop();
  };

  const startCyclingMoves = () => {
    const cycle = async () => {
      const startTime = performance.now();
      
      await pickAndAnnounce();
      
      // After announcement (or its cancellation), check if we're still active.
      if (!isActiveRef.current) {
        return; // Stop the cycle.
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Calculate delay for the next cycle, ensuring it's not negative.
      // This makes the interval between the START of each announcement consistent.
      const delay = Math.max(0, (moveInterval * 1000) - executionTime);
      
      timerRef.current = setTimeout(cycle, delay);
    };
    
    cycle(); // Start the first cycle.
  };

  const pickAndAnnounce = async () => {
    // Safeguard: Check active state before speaking.
    if (!isActiveRef.current || !selectedStyle) return;
    const move = selectedStyle.moves[Math.floor(Math.random() * selectedStyle.moves.length)];
    // Set the UI and speak the command for the *same* move, preventing desync.
    setCurrentMove(move);
    await assistant.speak(move.name);
  };

  const translateLevel = (level: string) => ({ Beginner: 'Начинающий', Intermediate: 'Средний', Advanced: 'Профи' }[level] || level);

  if (isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-in zoom-in duration-500">
        {countdown !== null ? (
          <div className="text-[12rem] font-black text-rose-500 animate-pulse drop-shadow-2xl">{countdown}</div>
        ) : (
          <>
            <div className="space-y-4"><p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-sm">Идет тренировка</p><h2 className="text-7xl font-black tracking-tighter">{selectedStyle?.name}</h2>{selectedSong && (<div className="flex items-center justify-center gap-2 text-rose-400"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg><p className="font-bold">{selectedSong.title}</p></div>)}</div>
            <div className="relative w-full max-w-2xl aspect-[16/9] bg-slate-900 rounded-[3rem] border-8 border-slate-800 flex flex-col items-center justify-center p-12 shadow-[0_0_80px_rgba(225,29,72,0.15)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-blue-500/5"></div>
              {currentMove ? (<div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 text-center"><h3 className="text-7xl font-black mb-6 tracking-tight">{currentMove.name}</h3><span className="px-6 py-2 bg-rose-600 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-rose-900/40">{translateLevel(currentMove.level)}</span></div>) : (<div className="text-slate-700 font-black italic text-2xl uppercase tracking-widest animate-pulse">Приготовьтесь...</div>)}
            </div>
            <button onClick={stopTraining} className="px-12 py-5 bg-slate-800 hover:bg-slate-700 rounded-3xl font-black text-xl transition-all flex items-center gap-4 hover:scale-105 active:scale-95 shadow-2xl"><div className="w-5 h-5 bg-rose-500 rounded-lg"></div>ЗАВЕРШИТЬ СЕССИЮ</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="text-center space-y-3"><h2 className="text-5xl font-black tracking-tighter">Готовы к танцу?</h2><p className="text-slate-500 text-lg">Настройте свою сессию и начните тренировку прямо сейчас.</p></div>
      <div className="bg-slate-900/80 backdrop-blur-xl p-10 rounded-[3rem] border border-slate-800 shadow-2xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3"><label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Стиль танца</label><div className="relative"><select className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-lg font-bold outline-none focus:ring-2 ring-rose-500 appearance-none transition-all cursor-pointer" value={selectedStyleId} onChange={(e) => setSelectedStyleId(e.target.value)}>{dances.map(d => (<option key={d.id} value={d.id}>{d.name} ({d.moves.length} эл.)</option>))}</select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div></div></div>
          <div className="space-y-3"><label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Музыка</label><div className="relative"><select className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-lg font-bold outline-none focus:ring-2 ring-rose-500 appearance-none transition-all cursor-pointer" value={selectedSongId} onChange={(e) => setSelectedSongId(e.target.value)}><option value="">Только голос тренера</option>{songs.map(s => (<option key={s.id} value={s.id}>{s.title}</option>))}</select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg></div></div></div>
        </div>
        
        <div className="space-y-3 pt-4 border-t border-slate-800/50">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest block text-center">Частота смены элементов</label>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-slate-500">5с</span>
            <input type="range" min="5" max="20" step="1" value={moveInterval} onChange={(e) => setMoveInterval(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"/>
            <span className="text-sm font-mono text-slate-500">20с</span>
          </div>
          <div className="text-center text-2xl font-black text-rose-400">{moveInterval} секунд</div>
        </div>

        <button onClick={startTraining} disabled={!selectedStyleId || (dances.find(d => d.id === selectedStyleId)?.moves.length === 0)} className={`w-full py-6 rounded-3xl font-black text-2xl transition-all flex items-center justify-center gap-4 ${!selectedStyleId || (dances.find(d => d.id === selectedStyleId)?.moves.length === 0) ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-2xl shadow-rose-900/40 hover:scale-[1.02] active:scale-[0.98]'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
          НАЧАТЬ ТРЕНИРОВКУ
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4"><div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></div><h4 className="font-black text-xl">Голосовые команды</h4><p className="text-slate-500 text-sm leading-relaxed">ИИ тренер будет озвучивать случайные элементы из вашего списка, помогая развить импровизацию и скорость реакции.</p></div>
        <div className="p-8 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4"><div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><h4 className="font-black text-xl">Тайминг сессии</h4><p className="text-slate-500 text-sm leading-relaxed">Каждый новый элемент появляется с выбранной вами частотой. Это оптимальный интервал для отработки связок под музыку.</p></div>
      </div>
    </div>
  );
};

export default Trainer;
