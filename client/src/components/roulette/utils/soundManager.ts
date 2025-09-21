// utils/soundManager.ts - Sound effects management

export class SoundManager {
    private sounds: { [key: string]: HTMLAudioElement } = {};
    private enabled: boolean = true;
  
    constructor() {
      // Initialize with data URIs or URLs to sound files
      this.initializeSounds();
    }
  
    private initializeSounds() {
      // These are placeholder sound effects using Web Audio API
      // In production, you'd load actual sound files
      const audioContext = typeof window !== 'undefined' && window.AudioContext 
        ? new window.AudioContext() 
        : null;
  
      if (!audioContext) return;
  
      // Simple beep sounds for demo
      this.createBeep('chipPlace', 800, 0.1);
      this.createBeep('chipRemove', 600, 0.1);
      this.createBeep('spin', 400, 0.3);
      this.createBeep('win', 1000, 0.5);
      this.createBeep('lose', 300, 0.3);
    }
  
    private createBeep(name: string, frequency: number, duration: number) {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
  
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
  
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
      // Store as a function that creates the sound when called
      (this.sounds as any)[name] = () => {
        if (!this.enabled) return;
        
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + duration);
      };
    }
  
    play(soundName: string) {
      if (!this.enabled || !this.sounds[soundName]) return;
      
      try {
        // Call the sound function
        if (typeof this.sounds[soundName] === 'function') {
          (this.sounds[soundName] as any)();
        }
      } catch (error) {
        console.warn('Sound playback failed:', error);
      }
    }
  
    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }
  
    isEnabled() {
      return this.enabled;
    }
  }
  
  // Singleton instance
  export const soundManager = new SoundManager();