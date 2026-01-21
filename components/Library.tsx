
import React, { useState } from 'react';
import { DanceStyle, DanceMove } from '../types.ts';
import { COLORS } from '../constants.tsx';

interface LibraryProps {
  dances: DanceStyle[];
  onUpdateDances: (newDances: DanceStyle[]) => void;
}

const Library: React.FC<LibraryProps> = ({ dances, onUpdateDances }) => {
  const [selectedStyleId, setSelectedStyleId] = useState<string>(dances[0]?.id || '');
  const [isAddingStyle, setIsAddingStyle] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');

  const selectedStyle = dances.find(d => d.id === selectedStyleId);

  const handleAddStyle = () => {
    if (!newStyleName.trim()) return;
    const newStyle: DanceStyle = {
      id: `style-${Date.now()}`,
      name: newStyleName,
      description: 'Пользовательский стиль',
      moves: []
    };
    onUpdateDances([...dances, newStyle]);
    setNewStyleName('');
    setIsAddingStyle(false);
    setSelectedStyleId(newStyle.id);
  };

  const handleAddMove = () => {
    if (!selectedStyle) return;
    const moveName = prompt("Введите название движения:");
    if (!moveName) return;
    
    const newMove: DanceMove = {
      id: `move-${Date.now()}`,
      name: moveName,
      level: 'Beginner',
      videoUrl: 'https://picsum.photos/400/225'
    };

    const updatedDances = dances.map(d => 
      d.id === selectedStyleId ? { ...d, moves: [...d.moves, newMove] } : d
    );
    onUpdateDances(updatedDances);
  };

  const translateLevel = (level: string) => {
    switch(level) {
      case 'Beginner': return 'Начинающий';
      case 'Intermediate': return 'Средний';
      case 'Advanced': return 'Профи';
      default: return level;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Библиотека движений</h2>
        <button 
          onClick={() => setIsAddingStyle(true)}
          className={`px-4 py-2 rounded-lg ${COLORS.accentBg} text-white font-semibold text-sm`}
        >
          Добавить стиль
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {dances.map(dance => (
          <button
            key={dance.id}
            onClick={() => setSelectedStyleId(dance.id)}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition border ${
              selectedStyleId === dance.id 
                ? 'bg-rose-500 border-rose-500 text-white' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
            }`}
          >
            {dance.name}
          </button>
        ))}
      </div>

      {isAddingStyle && (
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex gap-2">
          <input 
            type="text" 
            placeholder="Название (например, Кизомба)" 
            className="flex-1 bg-slate-800 border-slate-700 rounded-lg px-3 py-2 text-sm"
            value={newStyleName}
            onChange={(e) => setNewStyleName(e.target.value)}
          />
          <button onClick={handleAddStyle} className="px-4 py-2 bg-rose-600 rounded-lg text-sm">Ок</button>
          <button onClick={() => setIsAddingStyle(false)} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">Отмена</button>
        </div>
      )}

      {selectedStyle && (
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">Стиль</p>
              <h3 className="text-3xl font-black">{selectedStyle.name}</h3>
            </div>
            <button onClick={handleAddMove} className="text-sm text-slate-400 hover:text-white underline">Добавить шаг</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedStyle.moves.map(move => (
              <div key={move.id} className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-rose-500/50 transition">
                <div className="relative aspect-video overflow-hidden">
                  <img src={move.videoUrl} alt={move.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur rounded text-[10px] font-bold uppercase">
                    {translateLevel(move.level)}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg">{move.name}</h4>
                  <p className="text-slate-500 text-sm mt-1">{move.description || 'Описание отсутствует.'}</p>
                </div>
              </div>
            ))}
            {selectedStyle.moves.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
                В этом стиле еще нет добавленных движений.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
