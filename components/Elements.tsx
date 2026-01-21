
import React, { useState, useMemo, useRef } from 'react';
import { DanceStyle, DanceMove } from '../types.ts';
import { COLORS } from '../constants.tsx';

// Helper to convert file to Base64 data URI
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

interface ElementsProps {
  dances: DanceStyle[];
  onUpdateDances: (newDances: DanceStyle[]) => void;
}

const Elements: React.FC<ElementsProps> = ({ dances, onUpdateDances }) => {
  const [selectedStyleId, setSelectedStyleId] = useState<string>(dances[0]?.id || '');
  const [isAddingStyle, setIsAddingStyle] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'level'>('name');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingMove, setEditingMove] = useState<{move: DanceMove, styleId: string} | null>(null);
  const [isAddingMove, setIsAddingMove] = useState<string | null>(null);

  const selectedStyle = dances.find(d => d.id === selectedStyleId);
  const videoFileRef = useRef<HTMLInputElement>(null);

  const filteredMoves = useMemo(() => {
    if (!selectedStyle) return [];
    let moves = [...selectedStyle.moves];
    if (filterLevel !== 'All') moves = moves.filter(m => m.level === filterLevel);
    if (searchQuery) moves = moves.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
    moves.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      const levels = { Beginner: 1, Intermediate: 2, Advanced: 3 };
      return (levels[a.level] || 0) - (levels[b.level] || 0);
    });
    return moves;
  }, [selectedStyle, filterLevel, sortBy, searchQuery]);

  const handleAddStyle = () => {
    if (!newStyleName.trim()) return;
    const newStyle: DanceStyle = { id: `style-${Date.now()}`, name: newStyleName, description: 'Пользовательский стиль', moves: [] };
    onUpdateDances([...dances, newStyle]);
    setNewStyleName('');
    setIsAddingStyle(false);
    setSelectedStyleId(newStyle.id);
  };

  const handleSaveMove = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const styleId = editingMove?.styleId || isAddingMove;
    if (!styleId) return;

    let videoDataContent = editingMove?.move.videoData || '';
    const videoFile = (e.currentTarget.elements.namedItem('videoFile') as HTMLInputElement).files?.[0];
    if (videoFile) {
        videoDataContent = await fileToBase64(videoFile);
    }

    const moveData: DanceMove = {
      id: editingMove?.move.id || `move-${Date.now()}`,
      name: formData.get('name') as string,
      level: formData.get('level') as any,
      description: formData.get('description') as string,
      videoData: videoDataContent,
    };

    const updatedDances = dances.map(d => {
      if (d.id !== styleId) return d;
      const moves = editingMove ? d.moves.map(m => m.id === moveData.id ? moveData : m) : [...d.moves, moveData];
      return { ...d, moves };
    });

    onUpdateDances(updatedDances);
    setEditingMove(null);
    setIsAddingMove(null);
  };

  const deleteMove = (moveId: string, styleId: string) => {
    if (confirm("Удалить этот элемент?")) {
      const updated = dances.map(d => d.id !== styleId ? d : { ...d, moves: d.moves.filter(m => m.id !== moveId) });
      onUpdateDances(updated);
    }
  };

  const translateLevel = (level: string) => ({ Beginner: 'Начинающий', Intermediate: 'Средний', Advanced: 'Профи' }[level] || level);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Элементы</h2>
          <p className="text-slate-500 mt-1">Управляйте своим танцевальным репертуаром</p>
        </div>
        <button onClick={() => setIsAddingStyle(true)} className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700">
          + Новый стиль
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {dances.map(dance => (
          <div key={dance.id} className="group relative flex-shrink-0">
            <button onClick={() => setSelectedStyleId(dance.id)} className={`px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 border flex items-center gap-3 ${ selectedStyleId === dance.id ? 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-900/30' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
              <span className="font-bold">{dance.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${selectedStyleId === dance.id ? 'bg-rose-400' : 'bg-slate-800'}`}>{dance.moves.length}</span>
            </button>
          </div>
        ))}
      </div>

      {isAddingStyle && (
        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex gap-3 animate-in slide-in-from-top-4">
          <input autoFocus type="text" placeholder="Название стиля (например, Кизомба)" className="flex-1 bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 ring-rose-500 outline-none" value={newStyleName} onChange={(e) => setNewStyleName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddStyle()} />
          <button onClick={handleAddStyle} className="px-6 py-3 bg-rose-600 rounded-xl font-bold text-sm">Создать</button>
          <button onClick={() => setIsAddingStyle(false)} className="px-6 py-3 bg-slate-700 rounded-xl font-bold text-sm">Отмена</button>
        </div>
      )}

      {selectedStyle && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
            <div className="flex-1 min-w-[200px] relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Поиск по названию..." className="w-full bg-slate-800/50 border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 ring-rose-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Уровень:</span>
              <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="bg-slate-800 border-slate-700 rounded-xl px-3 py-2 text-sm outline-none">
                <option value="All">Все</option><option value="Beginner">Начинающий</option><option value="Intermediate">Средний</option><option value="Advanced">Профи</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Сортировка:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-slate-800 border-slate-700 rounded-xl px-3 py-2 text-sm outline-none">
                <option value="name">По имени</option><option value="level">По сложности</option>
              </select>
            </div>
            <button onClick={() => setIsAddingMove(selectedStyleId)} className="ml-auto px-4 py-2 bg-rose-600 rounded-xl text-sm font-bold shadow-lg shadow-rose-900/20">+ Добавить шаг</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMoves.map(move => (
              <div key={move.id} className="group bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-rose-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/10">
                <div className="relative aspect-video overflow-hidden bg-slate-800">
                  {move.videoData ? (
                    <video src={move.videoData} muted loop playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500" />
                  ) : (<div className="w-full h-full flex items-center justify-center text-slate-600 italic text-xs">Нет видео</div>)}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase border border-white/10">{translateLevel(move.level)}</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => setEditingMove({ move, styleId: selectedStyleId })} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button onClick={() => deleteMove(move.id, selectedStyleId)} className="p-3 bg-rose-500/20 hover:bg-rose-500/40 backdrop-blur-md rounded-full text-rose-500 transition"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-xl group-hover:text-rose-400 transition-colors">{move.name}</h4>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">{move.description || 'Описание отсутствует.'}</p>
                </div>
              </div>
            ))}
            {filteredMoves.length === 0 && (
              <div className="col-span-full py-32 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl"><div className="text-4xl mb-4">✨</div><p className="font-medium text-lg">Ничего не найдено</p><p className="text-sm">Попробуйте изменить параметры поиска или добавьте новый шаг</p></div>
            )}
          </div>
        </div>
      )}

      {(editingMove || isAddingMove) && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-2xl font-black">{editingMove ? 'Изменить' : 'Добавить'} элемент</h3>
              <button onClick={() => { setEditingMove(null); setIsAddingMove(null); }} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveMove} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Название</label>
                <input required name="name" defaultValue={editingMove?.move.name} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 outline-none focus:ring-1 ring-rose-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Уровень сложности</label>
                <select name="level" defaultValue={editingMove?.move.level || 'Beginner'} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 outline-none">
                  <option value="Beginner">Начинающий</option><option value="Intermediate">Средний</option><option value="Advanced">Профи</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Видео элемента</label>
                <input name="videoFile" type="file" accept="video/*" ref={videoFileRef} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-500/10 file:text-rose-400 hover:file:bg-rose-500/20" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Описание</label>
                <textarea name="description" rows={3} defaultValue={editingMove?.move.description} className="w-full bg-slate-800 border-slate-700 rounded-xl p-3 outline-none focus:ring-1 ring-rose-500" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-4 bg-rose-600 rounded-2xl font-bold text-lg hover:bg-rose-500 transition shadow-lg shadow-rose-900/20">Сохранить</button>
                <button type="button" onClick={() => { setEditingMove(null); setIsAddingMove(null); }} className="px-8 py-4 bg-slate-800 rounded-2xl font-bold transition">Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Elements;