import { addRules } from "./validation";

export type WindowFunction = (input: number) => number;

const validate = addRules({
    size: ["int"],
});

export function hann(size: number): WindowFunction {
    validate({ size: size });

    const table = new Float32Array(size);

    for (let i = 0; i < size; i++) {
        table[i] = 0.5 * (1 - Math.cos((Math.PI * 2 * i) / (size - 1)));
    }

    return i => {
        return table[i];
    };
}

export function hamming(size: number): WindowFunction {
    validate({ size: size });

    const alpha = 0.54,
        beta = 1 - alpha,
        table = new Float32Array(size);

    for (let i = 0; i < size; i++) {
        table[i] = alpha - beta * Math.cos((Math.PI * 2 * i) / size - 1);
    }
    return i => {
        return table[i];
    };
}

export function blackman(size: number): WindowFunction {
    validate({ size: size });
    const table = new Float32Array(size),
        alpha = 0.16,
        a0 = 1 - alpha / 2,
        a1 = 0.5,
        a2 = alpha / 2;

    for (let i = 0; i < size; i++) {
        table[i] =
            a0 -
            a1 * Math.cos((Math.PI * 2 * i) / size - 1) +
            a2 * Math.cos((2 * Math.PI * 2 * i) / size - 1);
    }
    return i => {
        return table[i];
    };
}

export function bartlett(size: number): WindowFunction {
    validate({ size: size });

    const table = new Float32Array(size);

    for (let i = 0; i < size / 2; i++) {
        table[i] = (2 * i) / size;
    }
    for (let i = size / 2; i < size; i++) {
        table[i] = 2 - (2 * i) / size;
    }

    return i => {
        return table[i];
    };
}
