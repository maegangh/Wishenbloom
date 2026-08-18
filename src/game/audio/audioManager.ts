// Web Audio API pure procedural synthesizer for Mergevale
class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private musicInterval: number | null = null;
  private isMusicPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (muted && this.musicInterval) {
      this.stopMusic();
    } else if (!muted && !this.isMusicPlaying) {
      this.startMusic();
    }
  }

  // Play a procedural tone
  public playTone(freq: number, type: OscillatorType, duration: number, startVol = 0.2, endVol = 0.001, pitchDecay = false) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(freq, now);

      if (pitchDecay) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.4), now + duration);
      }

      gain.gain.setValueAtTime(startVol, now);
      gain.gain.exponentialRampToValueAtTime(endVol, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  public playError() {
    this.playTone(200, 'sawtooth', 0.18, 0.15, 0.01, true);
  }

  // Merge sound - pitch increases with item tier!
  public playMerge(tier = 1) {
    if (this.isMuted) return;
    this.initCtx();
    const baseFreq = 380 + Math.min(tier * 70, 700);
    
    // Play a delightful two-tone chime
    this.playTone(baseFreq, 'sine', 0.15, 0.22);
    setTimeout(() => {
      this.playTone(baseFreq * 1.25, 'triangle', 0.2, 0.18);
    }, 45);
    setTimeout(() => {
      this.playTone(baseFreq * 1.5, 'sine', 0.25, 0.14);
    }, 90);
  }

  // Generator tap sound (soft pop/spring)
  public playGeneratorTap() {
    if (this.isMuted) return;
    this.initCtx();
    this.playTone(320, 'sine', 0.12, 0.25, 0.001, true);
    setTimeout(() => {
      this.playTone(540, 'triangle', 0.1, 0.15);
    }, 40);
  }

  // Coin collect ping
  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    this.playTone(987.77, 'sine', 0.09, 0.18); // B5
    setTimeout(() => {
      this.playTone(1318.51, 'sine', 0.18, 0.14); // E6
    }, 60);
  }

  // Gem sparkle
  public playGem() {
    if (this.isMuted) return;
    this.initCtx();
    const notes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
    notes.forEach((note, idx) => {
      setTimeout(() => {
        this.playTone(note, 'sine', 0.18, 0.15);
      }, idx * 45);
    });
  }

  // Energy collect swoosh
  public playEnergy() {
    if (this.isMuted) return;
    this.initCtx();
    this.playTone(440, 'triangle', 0.18, 0.18);
    setTimeout(() => {
      this.playTone(660, 'sine', 0.22, 0.15);
    }, 50);
  }

  // Order Complete Fanfare
  public playOrderComplete() {
    if (this.isMuted) return;
    this.initCtx();
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chord.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.35, 0.22);
      }, i * 65);
    });
  }

  // Level Up Fanfare!
  public playLevelUp() {
    if (this.isMuted) return;
    this.initCtx();
    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.15 }, // G5
      { f: 1046.5, d: 0.35 }, // C6
      { f: 880.0, d: 0.18 },  // A5
      { f: 1046.5, d: 0.5 },  // C6
    ];

    let delay = 0;
    melody.forEach((note) => {
      setTimeout(() => {
        this.playTone(note.f, 'triangle', note.d, 0.25);
        this.playTone(note.f * 1.5, 'sine', note.d, 0.1);
      }, delay);
      delay += note.d * 750;
    });
  }

  // Chest Open
  public playChestOpen() {
    if (this.isMuted) return;
    this.initCtx();
    const notes = [440, 554.37, 659.25, 880, 1108.7];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.25, 0.2);
      }, idx * 55);
    });
  }

  // Bubble Pop
  public playBubblePop() {
    if (this.isMuted) return;
    this.initCtx();
    this.playTone(850, 'sine', 0.08, 0.2, 0.001, true);
  }

  // UI Button Click
  public playButtonClick() {
    if (this.isMuted) return;
    this.initCtx();
    this.playTone(600, 'sine', 0.05, 0.1);
  }

  // Discovery Fanfare
  public playDiscovery() {
    if (this.isMuted) return;
    this.initCtx();
    const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.3, 0.2);
      }, idx * 80);
    });
  }

  // Ambient cozy harp synthesizer for background music (very gentle and subtle)
  public startMusic() {
    if (this.isMusicMuted || this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]; // C Major pentatonic
    let step = 0;

    this.musicInterval = window.setInterval(() => {
      if (this.isMusicMuted || !this.isMusicPlaying) return;
      try {
        this.initCtx();
        if (!this.ctx) return;
        
        // Pick a peaceful note from scale
        const noteIndex = (step % 2 === 0) ? (step % 5) : Math.floor(Math.random() * scale.length);
        const freq = scale[noteIndex];
        
        // Soft pluck
        this.playTone(freq, 'sine', 0.6, 0.04);
        if (step % 4 === 0) {
          this.playTone(freq * 0.5, 'sine', 0.8, 0.03); // gentle bass
        }
        step++;
      } catch {
        // ignore
      }
    }, 1200);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const audio = new AudioManager();
