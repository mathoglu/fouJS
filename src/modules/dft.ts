import { addRules } from "./validation";
import { table, type } from "./utils.js";
import { type WindowFunction } from "./windows";

const validate = addRules(
    {
        N: "int",
        Fs: "int",
    },
    {
        windowFunc: "func",
    },
);
type DFTRequiredOptions = {
    N: number;
    Fs: number;
};
type DFTOptionalOptions = {
    windowFunc: WindowFunction;
};
function dft(opts: DFTRequiredOptions & DFTOptionalOptions) {
    validate(opts);

    if (type.isUndefined(opts.windowFunc)) {
        opts.windowFunc = () => {
            return 1;
        };
    }

    const sin = table("sin", (opts.N * opts.N) / 2, opts.N),
        cos = table("cos", (opts.N * opts.N) / 2, opts.N);

    const dftFunc = (input: ArrayLike<number>) => {
        const output = [],
            localSin = sin,
            localCos = cos,
            wFunc =
                opts.windowFunc ||
                (x => {
                    return x;
                });
        let img, real;

        for (let k = 0; k < opts.N / 2; k++) {
            img = 0.0;
            real = 0.0;

            for (let n = 0; n < input.length; n++) {
                real += wFunc(n) * input[n] * localCos[n * k];
                img += wFunc(n) * input[n] * localSin[n * k];
            }

            output.push({
                r: real,
                i: img,
            });
        }

        return output;
    };

    return dftFunc;
}

export default dft;
