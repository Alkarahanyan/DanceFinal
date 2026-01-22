
// Возвращаемся к SpeechSynthesis API браузера, чтобы убрать зависимость от Gemini.

export class BrowserVoiceAssistant {
  private synthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
      // Голоса загружаются асинхронно. Это нужно обработать.
      this.loadVoices();
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = this.loadVoices;
      }
    } else {
      console.error("Browser Speech Synthesis API не поддерживается.");
    }
  }

  private loadVoices = () => {
    if (!this.synthesis) return;
    this.voices = this.synthesis.getVoices();
  };

  speak(text: string, voiceKey: string = 'spanish-female'): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        console.error("Speech Synthesis недоступен.");
        return resolve(); // Разрешаем промис, чтобы не ломать цикл тренировки.
      }

      // Немедленно отменяем любую текущую или поставленную в очередь речь.
      if (this.synthesis.speaking) {
        this.synthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Используем кешированный список голосов, который может заполняться асинхронно.
      const voices = this.voices.length > 0 ? this.voices : this.synthesis.getVoices();

      // --- Логика выбора голоса на основе voiceKey ---
      const [lang, gender] = voiceKey.split('-'); // например, ['spanish', 'female']
      const langCode = lang === 'spanish' ? 'es' : 'ru';

      const isFemale = (v: SpeechSynthesisVoice) => /female|женский|mujer|paulina|mónica|milena|kore|zephyr|alena|google/i.test(v.name);
      const isMale = (v: SpeechSynthesisVoice) => /male|мужской|hombre|puck|charon|yuri/i.test(v.name) && !isFemale(v);
      
      const voiceChecks = [
        // 1. Идеальное совпадение (язык и пол)
        (v: SpeechSynthesisVoice) => v.lang.toLowerCase().startsWith(langCode) && (gender === 'female' ? isFemale(v) : isMale(v)),
        // 2. Запасной вариант: любой голос на нужном языке
        (v: SpeechSynthesisVoice) => v.lang.toLowerCase().startsWith(langCode),
        // 3. Запасной вариант: женский русский голос (распространенный по умолчанию)
        (v: SpeechSynthesisVoice) => v.lang.toLowerCase().startsWith('ru') && isFemale(v),
         // 4. Запасной вариант: любой русский голос
        (v: SpeechSynthesisVoice) => v.lang.toLowerCase().startsWith('ru'),
      ];

      let selectedVoice: SpeechSynthesisVoice | undefined;
      for (const check of voiceChecks) {
        selectedVoice = voices.find(check);
        if (selectedVoice) break;
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        // Крайний случай, если подходящий голос не найден
        utterance.lang = langCode === 'es' ? 'es-ES' : 'ru-RU';
      }
      
      utterance.rate = 0.9; // Немного медленнее для четкости
      utterance.pitch = 1.0;
      
      // Тайм-аут безопасности на случай, если onend/onerror не сработают.
      const safetyTimeout = setTimeout(() => {
        console.warn('Сработал тайм-аут безопасности синтеза речи.');
        resolve();
      }, 10000);

      utterance.onend = () => {
        clearTimeout(safetyTimeout);
        resolve();
      };

      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error("Ошибка SpeechSynthesis:", event.error);
        }
        clearTimeout(safetyTimeout);
        resolve(); // Всегда разрешаем, чтобы не прерывать цикл тренировки.
      };

      // Небольшая задержка после вызова cancel() может помочь избежать гонки состояний в некоторых браузерах.
      setTimeout(() => {
        if (this.synthesis) {
            this.synthesis.speak(utterance);
        }
      }, 50);
    });
  }

  stop(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
    }
  }
}

// Переименовываем экспортируемый экземпляр для совместимости с импортирующими компонентами.
export const assistant = new BrowserVoiceAssistant();
