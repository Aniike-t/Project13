export default class AudioManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.melodies = {
            '1': 'nopghjklpp',
            '2': 'a'.repeat(5),
            '3': 'zzaa'
        };
    }

    playMelody(key, loop = false, interval = 0.15) {
        this.play(this.melodies[key], loop, interval);
    }

    play(melody, loop = false, interval ) {
        const playTone = (index) => {
            if (index >= melody.length) {
                if (loop) setTimeout(() => playTone(0), interval * 950);  // Restart the melody
                return;
            }
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = 'square'; 
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.frequency.setValueAtTime(220 + (melody.charCodeAt(index) % 88) * 10, this.context.currentTime);
            gain.gain.setValueAtTime(0, this.context.currentTime);
            gain.gain.linearRampToValueAtTime(1, this.context.currentTime + 0.05);  
            gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + interval);  
            osc.start();
            osc.stop(this.context.currentTime + interval);
            osc.onended = () => {
                setTimeout(() => playTone(index + 1), interval * 1000); 
            };
        };

        playTone(0);
    }
}
