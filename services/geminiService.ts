
export class BrowserVoiceAssistant {
  private synthesis: SpeechSynthesis;

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
    } else {
      console.error("Browser Speech Synthesis API not supported.");
      // Предоставляем "заглушку", чтобы избежать ошибок во время выполнения
      this.synthesis = {
        speak: () => {},
        cancel: () => {},
      } as unknown as SpeechSynthesis;
    }
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis || typeof this.synthesis.speak !== 'function') {
        console.error("Speech Synthesis not available.");
        return resolve(); // Разрешаем промис, чтобы не останавливать цикл тренировки
      }

      // Immediately cancel any ongoing or queued speech.
      if (this.synthesis.speaking) {
        this.synthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voices = this.synthesis.getVoices();
      const russianVoice = voices.find(voice => voice.lang === 'ru-RU');
      
      if (russianVoice) {
        utterance.voice = russianVoice;
      }
      
      utterance.lang = 'ru-RU';
      utterance.rate = 0.9; // Немного медленнее для четкости
      utterance.pitch = 1.0;
      
      // Safety timeout in case onend/onerror don't fire. Increased to 10s.
      const safetyTimeout = setTimeout(() => {
        console.warn('Сработал тайм-аут безопасности синтеза речи.');
        resolve();
      }, 10000);

      utterance.onend = () => {
        clearTimeout(safetyTimeout);
        resolve();
      };

      utterance.onerror = (event) => {
        // 'interrupted' and 'cancelled' are expected when we call cancel() or speak() again.
        // We don't need to log these as errors.
        // Fix: Corrected typo from 'cancelled' to 'canceled' to match SpeechSynthesisErrorCode enum.
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error("Ошибка SpeechSynthesis:", event.error);
        }
        clearTimeout(safetyTimeout);
        resolve(); // Always resolve to not break the training loop.
      };

      // A brief delay after calling cancel() can help prevent race conditions in some browsers.
      setTimeout(() => {
        this.synthesis.speak(utterance);
      }, 50);
    });
  }

  stop(): void {
    if (this.synthesis && typeof this.synthesis.cancel === 'function') {
      // Check if there is something speaking before canceling.
      if (this.synthesis.speaking) {
        this.synthesis.cancel();
      }
    }
  }
}

export const assistant = new BrowserVoiceAssistant();