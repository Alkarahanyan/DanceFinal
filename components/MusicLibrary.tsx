
import React, { useState, useMemo } from 'react';
import { Song, DanceStyle } from '../types.ts';
import { saveSong, deleteSong } from '../db.ts';
import { COLORS } from '../constants.tsx';

interface MusicLibraryProps {
  songs: Song[];
  dances: DanceStyle[];
  onRefresh: () => void;
}

const MusicLibrary: React.FC<MusicLibraryProps> = ({ songs, dances, onRefresh }) => {
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [filterStyle, setFilterStyle] = useState('All');
  const [filterLevel, setFilterLevel] = useState('All');
  const [sortBy, setSortBy] = useState<'title' | 'level'>('title');

  const uniqueStyles = useMemo(() => ['All', ...new Set(songs.map(s => s.danceStyle))], [songs]);

  const filteredSongs = useMemo(() => {
    let result = [...songs];
    if (filterStyle !== 'All') result = result.filter(s => s.danceStyle === filterStyle);
    if (filterLevel !== 'All') result = result.filter(s => s.level === filterLevel);
    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      const levels = { Beginner: 1, Intermediate: 2, Advanced: 3 };
      return (levels[a.level] || 0) - (levels[b.level] || 0);
    });
    return result;
  }, [songs, filterStyle, filterLevel, sortBy]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };
  
  const handleSaveSong = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pendingFile) return;

    const formData = new FormData(e.currentTarget);
    setUploading(true);
    setPendingFile(null);

    const getAudioDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const audio = document.createElement('audio');
            const objectUrl = URL.createObjectURL(file);
            audio.src = objectUrl;
            audio.addEventListener('loadedmetadata', () => {
                URL.revokeObjectURL(objectUrl);
                resolve(audio.duration);
            });
            audio.addEventListener('error', () => {
                URL.revokeObjectURL(objectUrl);
                resolve(0); // Resolve with 0 if there's an error
            });
        });
    };

    try {
      const duration = await getAudioDuration(pendingFile);
      const song: Song = {
        id: `song-${Date.now()}`,
        title: pendingFile.name.replace(/\.[^/.]+$/, ""),
        artist: 'Неизвестен',
        danceStyle: formData.get('style') as string,
        level: formData.get('level') as any,
        blob: pendingFile,
        duration: duration,
      };
      await saveSong(song);
      onRefresh();
    } catch (err) {
      alert("Не удалось сохранить трек. Попробуйте еще раз.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Удалить этот трек?")) {
      await deleteSong(id);
      onRefresh();
    }
  };

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 1) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const translateLevel = (level: string) => ({ Beginner: 'Начинающий', Intermediate: 'Средний', Advanced: 'Профи' }[level] || level);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Музыка</h2>
          <p className="text-slate-500 mt-1">Ваши музыкальные треки для тренировок</p>
        </div>
        <label className={`cursor-pointer px-6 py-3 rounded-2xl ${COLORS.accentBg} text-white font-bold text-sm hover:scale-105 transition shadow-lg shadow-rose-900/30`}>
          {uploading ? 'Сохранение...' : '+ Добавить трек'}
          <input type="file" accept="audio/*" className="hidden" onChange={handleFileSelect} disabled={uploading} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-4 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Стиль:</span><select value={filterStyle} onChange={(e) => setFilterStyle(e.target.value)} className="bg-slate-800 border-slate-700 rounded-xl px-3 py-2 text-sm outline-none">{uniqueStyles.map(s => <option key={s} value={s}>{s === 'All' ? 'Все' : s}</option>)}</select></div>
        <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Сложность:</span><select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="bg-slate-800 border-slate-700 rounded-xl px-3 py-2 text-sm outline-none"><option value="All">Все</option><option value="Beginner">Начинающий</option><option value="Intermediate">Средний</option><option value="Advanced">Профи</option></select></div>
        <div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Сортировка:</span><select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-slate-800 border-slate-700 rounded-xl px-3 py-2 text-sm outline-none"><option value="title">По названию</option><option value="level">По сложности</option></select></div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {filteredSongs.length > 0 ? (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-widest"><tr><th className="px-8 py-5">Название</th><th className="px-8 py-5">Стиль</th><th className="px-8 py-5">Сложность</th><th className="px-8 py-5">Длительность</th><th className="px-8 py-5 text-right">Действия</th></tr></thead>
            <tbody className="divide-y divide-slate-800">{filteredSongs.map(song => (<tr key={song.id} className="group hover:bg-slate-800/30 transition-colors"><td className="px-8 py-5 font-bold text-slate-100">{song.title}</td><td className="px-8 py-5"><span className="px-2 py-1 bg-slate-800 rounded-lg text-xs text-slate-400 border border-slate-700">{song.danceStyle}</span></td><td className="px-8 py-5"><span className={`text-xs font-medium ${song.level === 'Beginner' ? 'text-emerald-400' : song.level === 'Intermediate' ? 'text-amber-400' : 'text-rose-400'}`}>{translateLevel(song.level)}</span></td><td className="px-8 py-5 text-slate-400 font-mono">{formatDuration(song.duration)}</td><td className="px-8 py-5 text-right"><button onClick={() => handleDelete(song.id)} className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button></td></tr>))}</tbody>
          </table>
        ) : (<div className="py-32 text-center text-slate-500"><div className="text-6xl mb-6">🎵</div><p className="text-lg font-bold text-slate-400">Нет подходящих треков</p><p className="text-sm">Загрузите музыку или измените фильтры.</p></div>)}
      </div>

      <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 border-dashed"><div className="flex items-start gap-4"><div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div><h4 className="font-bold text-white mb-2">Приватность данных</h4><p className="text-sm text-slate-500 leading-relaxed">Музыка хранится в <strong>IndexedDB</strong> вашего браузера. Файлы никогда не отправляются на сервер. Очистка кеша браузера или удаление данных сайта приведет к удалению библиотеки.</p></div></div></div>

      {pendingFile && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center"><h3 className="text-2xl font-black">Параметры трека</h3><button onClick={() => setPendingFile(null)} className="text-slate-500 hover:text-white">✕</button></div>
            <form onSubmit={handleSaveSong} className="p-8 space-y-5">
              <p className="bg-slate-800/50 p-3 rounded-lg text-sm text-center border border-slate-700">Файл: <strong>{pendingFile.name}</strong></p>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Стиль танца</label>
                <select name="style" defaultValue={dances[0]?.name || 'Общий'} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 outline-none focus:ring-1 ring-rose-500">
                  {dances.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  <option value="Общий">Общий</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Уровень сложности</label>
                <select name="level" defaultValue="Beginner" className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 outline-none">
                  <option value="Beginner">Начинающий</option><option value="Intermediate">Средний</option><option value="Advanced">Профи</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-4 bg-rose-600 rounded-2xl font-bold text-lg hover:bg-rose-500 transition shadow-lg shadow-rose-900/20">Сохранить трек</button>
                <button type="button" onClick={() => setPendingFile(null)} className="px-8 py-4 bg-slate-800 rounded-2xl font-bold transition">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MusicLibrary;