import { Validator } from "./utils";
import { addRules } from "./validation";

const TYPES = {
    SINE: (step: number) => {
        return Math.sin(Math.PI * 2 * step);
    },
    SAW: (step: number) => {
        return 2 * (step - Math.round(step));
    },
    SQUARE: (step: number) => {
        return step < 0.5 ? 1 : -1;
    },
    TRIANGLE: (step: number) => {
        return 1 - 4 * Math.abs(Math.round(step) - step);
    },
    RANDOM: () => {
        return Math.random();
    },
};

const validate = addRules({
    length: "float",
    freq: "int",
    amp: "float",
    Fs: "int",
    type: [
        ((value: string) => {
            return Object.keys(TYPES).indexOf(value.toUpperCase()) > -1;
        }) as Validator,
    ],
});

type SignalRequiredOptions = {
    length: number;
    freq: number;
    amp: number;
    Fs: number;
    type: keyof typeof TYPES;
};
// eslint-disable-next-line @typescript-eslint/ban-types
type SignalOptionalOptions = {};

export function signal(
    opts: SignalRequiredOptions & Partial<SignalOptionalOptions>,
) {
    // Validate opts
    validate(opts);

    const N = opts.length * opts.Fs,
        Ts = opts.Fs / opts.freq, // period length in samples
        generator = TYPES[opts.type],
        x = new Float32Array(N);

    for (let i = 0; i < x.length; i++) {
        x[i] = generator((i % Ts) / Ts) * opts.amp;
    }

    return x;
}
