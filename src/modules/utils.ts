// Table helpers
const sin = (N: number, periodLength: number) => {
    const table = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        table[i] = Math.sin((Math.PI * 2 * i) / periodLength);
    }
    return table;
};
const cos = (N: number, periodLength: number) => {
    const table = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        table[i] = Math.cos((-(Math.PI * 2) * i) / periodLength);
    }
    return table;
};
const reverse = (N: number) => {
    const table = new Uint32Array(N);
    let top = 1;
    let add = N >> 1;

    while (top < N) {
        for (let i = 0; i < top; i++) {
            table[i + top] = table[i] + add;
        }

        top = top << 1;
        add = add >> 1;
    }
    return table;
};
const varCos = (N: number) => {
    const table = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        table[i] = Math.cos(-Math.PI / i);
    }
    return table;
};
const varSin = (N: number) => {
    const table = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        table[i] = Math.sin(-Math.PI / i);
    }
    return table;
};

// Validators
export type Validator = (input: unknown) => boolean;
export const type = {
    isFunction: <F extends () => void>(f: unknown): f is F => {
        return typeof f === "function";
    },
    isUndefined: (u: unknown): u is undefined => {
        return typeof u == "undefined";
    },
    isObject: <O>(obj: unknown): obj is O => {
        return obj !== null && typeof obj === "object" && !Array.isArray(obj);
    },
    isEmpty: (obj: unknown): obj is Record<string, never> => {
        return (
            type.isObject<Record<string, unknown>>(obj) &&
            Object.keys(obj).length == 0
        );
    },
    isString: (s: unknown): s is string => {
        return typeof s === "string";
    },
    isArray: <A>(a: unknown): a is A => {
        return Array.isArray(a);
    },
    isFloat: (f: unknown): f is number => {
        return f === Number(f) && f % 1 !== 0;
    },
    isBoolean: (b: unknown): b is boolean => {
        return typeof b === "boolean";
    },
};

export type ImaginaryPoint = { r: number; i: number };

// Magnitude calculators
export const mag = (point: ImaginaryPoint) => {
    return Math.sqrt(point.r * point.r + point.i * point.i);
};
export const db = (x: number) => {
    return 10 * Math.log(x);
};

// Table generation
type TableTypes = "sin" | "cos" | "variableSin" | "variableCos" | "reverseBit";

export const table = (
    type: TableTypes,
    length: number,
    periodLength = length,
): Float32Array | Uint32Array => {
    if (type === "sin") {
        return sin(length, periodLength);
    } else if (type === "variableSin") {
        return varSin(length);
    } else if (type === "cos") {
        return cos(length, periodLength);
    } else if (type === "variableCos") {
        return varCos(length);
    } else if (type === "reverseBit") {
        return reverse(length);
    } else {
        return new Float32Array(0);
    }
};
