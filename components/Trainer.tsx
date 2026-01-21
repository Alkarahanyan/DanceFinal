
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  const selectedStyle = dances.find(d => d.id === selectedStyleId);
  const selectedSong = songs.find(s => s.id === selectedSongId);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const startTraining = async () => {
    if (!selectedStyle || !selectedStyle.moves.length) {
      alert("Выберите стиль с хотя бы одним движением.");
      return;
    }

    // Prepare audio
    if (selectedSong) {
      const url = URL.createObjectURL(selectedSong.blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
    }

    setIsActive(true);
    setCountdown(3);

    // Initial countdown
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
    if (timerRef.current) clearInterval(timerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const startCyclingMoves = () => {
    const pickAndAnnounce = async () => {
      if (!selectedStyle) return;
      const move = selectedStyle.moves[Math.floor(Math.random() * selectedStyle.moves.length)];
      setCurrentMove(move);
      await assistant.speak(move.name);
    };

    pickAndAnnounce();
    timerRef.current = setInterval(pickAndAnnounce, 10000);
  };

  const translateLevel = (level: string) => {
    switch(level) {
      case 'Beginner': return 'Начинающий';
      case 'Intermediate': return 'Средний';
      case 'Advanced': return 'Профи';
      default: return level;
    }
  };

  if (isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12 animate-in zoom-in duration-500">
        {countdown !== null ? (
          <div className="text-9xl font-black text-rose-500 animate-pulse">{countdown}</div>
        ) : (
          <>
            <div className="space-y-4">
              <p className="text-slate-500 font-bold uppercase tracking-widest">Идет тренировка</p>
              <h2 className="text-6xl font-black">{selectedStyle?.name}</h2>
              {selectedSong && <p className="text-slate-400">Играет: {selectedSong.title}</p>}
            </div>

            <div className="relative w-full max-w-xl aspect-video bg-slate-900 rounded-3xl border-4 border-rose-500 flex flex-col items-center justify-center p-8 shadow-2xl shadow-rose-900/40">
              {currentMove ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-5xl font-black mb-4">{currentMove.name}</h3>
                  <span className="px-3 py-1 bg-rose-600 rounded-full text-xs font-bold uppercase">{translateLevel(currentMove.level)}</span>
                </div>
              ) : (
                <div className="text-slate-600 font-medium italic">Ждем первую команду...</div>
              )}
            </div>

            <button 
              onClick={stopTraining}
              className="px-10 py-4 bg-slate-800 hover:bg-slate-700 rounded-full font-bold transition flex items-center gap-2"
            >
              <div className="w-4 h-4 bg-rose-500 rounded-sm"></div>
              Завершить
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Настройка тренировки</h2>
        <p className="text-slate-400 mt-2">Выберите стиль и музыку перед началом.</p>
      </div>

      <div className="space-y-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400">Стиль танца</label>
          <select 
            className="w-full bg-slate-800 border-slate-700 rounded-xl p-3"
            value={selectedStyleId}
            onChange={(e) => setSelectedStyleId(e.target.value)}
          >
            {dances.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.moves.length} эл.)</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-400">Музыкальное сопровождение</label>
          <select 
            className="w-full bg-slate-800 border-slate-700 rounded-xl p-3"
            value={selectedSongId}
            onChange={(e) => setSelectedSongId(e.target.value)}
          >
            <option value="">Без музыки (только голос)</option>
            {songs.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          {songs.length === 0 && (
            <p className="text-[10px] text-amber-500">Совет: добавьте музыку во вкладке "Медиа" для лучшего опыта.</p>
          )}
        </div>

        <button 
          onClick={startTraining}
          disabled={!selectedStyleId || (dances.find(d => d.id === selectedStyleId)?.moves.length === 0)}
          className={`w-full py-4 rounded-xl font-bold text-lg transition ${
            !selectedStyleId || (dances.find(d => d.id === selectedStyleId)?.moves.length === 0)
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30'
          }`}
        >
          Начать сессию
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800 text-sm text-slate-400">
          <span className="block font-bold text-white mb-1">Случайные команды</span>
          Gemini ИИ выбирает случайный элемент из стиля и озвучивает его каждые 10 секунд.
        </div>
        <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800 text-sm text-slate-400">
          <span className="block font-bold text-white mb-1">Интерактивный звук</span>
          Убедитесь, что громкость включена, чтобы слышать и музыку, и команды тренера.
        </div>
      </div>
    </div>
  );
};

export default Trainer;
