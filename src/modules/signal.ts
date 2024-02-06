import { Validator } from "./utils";
import { addRules } from "./validation";

const waveTypes = {
    sine: (step: number) => {
        return Math.sin(Math.PI * 2 * step);
    },
    saw: (step: number) => {
        return 2 * (step - Math.round(step));
    },
    square: (step: number) => {
        return step < 0.5 ? 1 : -1;
    },
    triangle: (step: number) => {
        return 1 - 4 * Math.abs(Math.round(step) - step);
    },
    random: () => {
        return Math.random();
    },
};

type SignalOptions = {
    length: number; // In seconds
    freq: number; // Wave period in herz
    sampleRate: number; // Sampling rate in herz
    type: keyof typeof waveTypes;
    amplitude?: number; // Arbitary number
};

const validate = addRules<SignalOptions>({
    length: ["float", "required"],
    freq: ["int", "required"],
    sampleRate: ["int", "required"],
    amplitude: ["int"],
    type: [
        ((value: string) => {
            return Object.keys(waveTypes).indexOf(value) > -1;
        }) as Validator,
    ],
});

export function signal(opts: SignalOptions) {
    // Validate opts
    validate(opts);

    const { length, sampleRate, freq, amplitude = 1 } = opts;
    const N = length * sampleRate,
        Ts = sampleRate / freq, // period length in samples
        generator = waveTypes[opts.type],
        x = new Float32Array(N);

    for (let i = 0; i < x.length; i++) {
        x[i] = generator((i % Ts) / Ts) * amplitude;
    }

    return x;
}
