import { WeatherAlert } from '../types/weather';

class WeatherNotificationService {
  private lastAlertIdSent: string | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (e) {
      console.warn('Notification permission request error:', e);
      return 'denied';
    }
  }

  public playAlertChime() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Attention-getting chime (dual harmonic: 587Hz D5 -> 880Hz A5)
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.setValueAtTime(880.0, now + 0.15);

      osc2.frequency.setValueAtTime(880.0, now);
      osc2.frequency.setValueAtTime(1174.66, now + 0.15);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  public sendPushAlert(alert: WeatherAlert, force = false): boolean {
    // Avoid spamming identical alert
    if (!force && this.lastAlertIdSent === alert.id) {
      return false;
    }

    this.playAlertChime();

    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const title = `⚠️ AuraCast: ${alert.title}`;
      const options: NotificationOptions = {
        body: `${alert.headline}\n${alert.instruction}`,
        tag: alert.id,
        requireInteraction: alert.severity === 'emergency' || alert.severity === 'warning',
      };

      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      this.lastAlertIdSent = alert.id;
      return true;
    } catch (err) {
      console.warn('Failed to send browser push notification:', err);
      return false;
    }
  }
}

export const weatherNotification = new WeatherNotificationService();
