
import React, { useState } from 'react';
import { Song } from '../types.ts';
import { saveSong, deleteSong } from '../db.ts';
import { COLORS } from '../constants.tsx';

interface MusicLibraryProps {
  songs: Song[];
  onRefresh: () => void;
}

const MusicLibrary: React.FC<MusicLibraryProps> = ({ songs, onRefresh }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const song: Song = {
        id: `song-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Неизвестен',
        danceStyle: 'Общий',
        blob: file,
        duration: 0
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ваши треки</h2>
        <label className={`cursor-pointer px-4 py-2 rounded-lg ${COLORS.accentBg} text-white font-semibold text-sm hover:scale-105 transition`}>
          {uploading ? 'Загрузка...' : 'Добавить музыку'}
          <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {songs.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Название</th>
                <th className="px-6 py-4">Стиль</th>
                <th className="px-6 py-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {songs.map(song => (
                <tr key={song.id} className="hover:bg-slate-800/30 transition">
                  <td className="px-6 py-4 font-semibold">{song.title}</td>
                  <td className="px-6 py-4 text-slate-400">{song.danceStyle}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(song.id)}
                      className="text-slate-500 hover:text-rose-500 transition"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-20 text-center text-slate-500">
            <div className="text-4xl mb-4">🎵</div>
            <p>Ваша медиатека пуста. Загрузите свои любимые треки для сальсы или бачаты.</p>
          </div>
        )}
      </div>
      
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
        <h4 className="font-bold mb-2">Приватность и хранение</h4>
        <p className="text-sm text-slate-400">
          Ваша музыка хранится локально в <strong>IndexedDB</strong> браузера. Она никогда не покидает ваше устройство. 
          Внимание: очистка данных браузера может удалить вашу медиатеку.
        </p>
      </div>
    </div>
  );
};

export default MusicLibrary;
