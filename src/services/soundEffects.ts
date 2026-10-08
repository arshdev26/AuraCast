import { WeatherConditionCategory } from '../types/weather';

class WeatherAudioManager {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private intervalId: any = null;

  public get active(): boolean {
    return this.isPlaying;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(condition: WeatherConditionCategory): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start(condition);
      return true;
    }
  }

  public updateCondition(condition: WeatherConditionCategory) {
    if (this.isPlaying) {
      this.stop();
      this.start(condition);
    }
  }

  public start(condition: WeatherConditionCategory) {
    try {
      this.initContext();
      if (!this.ctx) return;

      this.stop();

      // Create white noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      if (condition === 'rainy' || condition === 'thunderstorm') {
        // Rain sound: Pink-ish filtered noise with droplet peaks
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

        // Periodic light droplet accents
        this.intervalId = setInterval(() => {
          if (!this.ctx || !this.isPlaying) return;
          try {
            const osc = this.ctx.createOscillator();
            const dropGain = this.ctx.createGain();
            osc.type = 'sine';
            const baseFreq = 800 + Math.random() * 800;
            osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, this.ctx.currentTime + 0.08);

            dropGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
            dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

            osc.connect(dropGain);
            dropGain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
          } catch {
            // ignore
          }
        }, 320);

      } else if (condition === 'sunny') {
        // Sunny: Gentle harmonic warm breeze with subtle low resonance
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(420, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.2, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

        // Soft subtle warm shimmer
        this.intervalId = setInterval(() => {
          if (!this.ctx || !this.isPlaying) return;
          try {
            const osc = this.ctx.createOscillator();
            const toneGain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200 + Math.random() * 600, this.ctx.currentTime);
            toneGain.gain.setValueAtTime(0.005, this.ctx.currentTime);
            toneGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
            osc.connect(toneGain);
            toneGain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.4);
          } catch {
            // ignore
          }
        }, 1800);

      } else {
        // Cloudy / Default: Soft ambient atmospheric air rustle
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      }

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();

      this.noiseNode = noise;
      this.filterNode = filter;
      this.gainNode = gain;
      this.isPlaying = true;
    } catch (e) {
      console.warn('Audio start failed:', e);
      this.isPlaying = false;
    }
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // ignore
      }
      this.gainNode = null;
    }
    if (this.filterNode) {
      try {
        this.filterNode.disconnect();
      } catch {
        // ignore
      }
      this.filterNode = null;
    }
    this.isPlaying = false;
  }
}

export const weatherAudio = new WeatherAudioManager();
