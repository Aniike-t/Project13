export default class AudioManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.context.createGain();
        this.gainNode.connect(this.context.destination);
        this.melodies = {
            'melody1': 'miffif00mifbfh00heaehe00ifffif00iheaehefffff',
            'melody2': 'aaabbb00aaabbc00aaabbb00aaabbc00aaabbcccbbbb'
        };
        this.loopIntervalId = null;
    }
    playMelody(key, loop = false, I = 0.3) {
        const melody = this.melodies[key];
        this.play(melody, loop, I);
    }
    play(melody, loop = false, I = 0.3) {
        if (!melody) return;
        const startTime = this.context.currentTime;
        const playMelody = (startOffset) => {
            for (let i = 0; i < melody.length; i++) {
                if (melody[i] !== '0') {
                    const osc = this.context.createOscillator();
                    osc.connect(this.gainNode);
                    osc.start(startTime + startOffset + i * I + 0.3);
                    osc.frequency.setValueAtTime(440 * 1.06 ** (-105 + melody.charCodeAt(i)), startTime + startOffset + i * I + 0.3);
                    osc.type = 'sine';
                    this.gainNode.gain.setValueAtTime(0.5, startTime + startOffset + i * I + 0.3);
                    this.gainNode.gain.setTargetAtTime(0.001, startTime + startOffset + i * I + 0.3 + 0.1, 0.05);
                    osc.stop(startTime + startOffset + i * I + 0.3 + I - 0.01);
                }
            }
        };
        if (loop) {
            if (this.loopIntervalId) clearInterval(this.loopIntervalId); 
            this.loopIntervalId = setInterval(() => playMelody(0), melody.length * I);
        } else {
            if (this.loopIntervalId) clearInterval(this.loopIntervalId); 
            playMelody(0);
        }
    }
}
