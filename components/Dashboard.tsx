
import React from 'react';
import { AppView } from '../types.ts';
import { COLORS } from '../constants.tsx';

interface DashboardProps {
  setView: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <section className="text-center py-12">
        <h2 className="text-4xl md:text-6xl font-black mb-4">Мастерство в каждом <span className={COLORS.accent}>движении</span>.</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Ваш персональный интерактивный тренажер для латиноамериканских танцев. Управляйте библиотекой, сохраняйте музыку и тренируйтесь с ИИ-помощником.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => setView('training')}
            className={`px-8 py-3 rounded-full ${COLORS.accentBg} text-white font-bold text-lg hover:scale-105 transition active:scale-95 shadow-xl shadow-rose-900/30`}
          >
            Начать тренировку
          </button>
          <button 
            onClick={() => setView('library')}
            className="px-8 py-3 rounded-full bg-slate-800 text-white font-bold text-lg hover:bg-slate-700 transition"
          >
            Изучить шаги
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${COLORS.card} p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition`}>
          <div className="text-3xl mb-4">📖</div>
          <h3 className="text-xl font-bold mb-2">Библиотека движений</h3>
          <p className="text-slate-400 text-sm mb-4">Создайте свой репертуар, распределенный по стилям и уровням сложности.</p>
          <button onClick={() => setView('library')} className={`${COLORS.accent} font-semibold text-sm hover:underline`}>Управление &rarr;</button>
        </div>
        <div className={`${COLORS.card} p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition`}>
          <div className="text-3xl mb-4">🎧</div>
          <h3 className="text-xl font-bold mb-2">Медиатека</h3>
          <p className="text-slate-400 text-sm mb-4">Храните музыку прямо в браузере. Файлы не покидают ваше устройство.</p>
          <button onClick={() => setView('music')} className={`${COLORS.accent} font-semibold text-sm hover:underline`}>Добавить музыку &rarr;</button>
        </div>
        <div className={`${COLORS.card} p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition`}>
          <div className="text-3xl mb-4">🤖</div>
          <h3 className="text-xl font-bold mb-2">Голосовой тренер ИИ</h3>
          <p className="text-slate-400 text-sm mb-4">Gemini называет случайные элементы, чтобы вы могли сфокусироваться на танце.</p>
          <button onClick={() => setView('training')} className={`${COLORS.accent} font-semibold text-sm hover:underline`}>Попробовать &rarr;</button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
