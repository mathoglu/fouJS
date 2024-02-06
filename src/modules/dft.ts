import { addRules } from "./validation";
import { table, type } from "./utils.js";
import { type WindowFunction } from "./windows";

type DFTOptions = {
    windowSize: number;
    sampleRate: number;
    windowFunc?: WindowFunction;
};

const validate = addRules<DFTOptions>({
    windowSize: ["int", "required"],
    sampleRate: ["int", "required"],
    windowFunc: ["func"],
});

function dft(opts: DFTOptions) {
    validate(opts);

    if (type.isUndefined(opts.windowFunc)) {
        opts.windowFunc = () => {
            return 1;
        };
    }

    const sin = table(
            "sin",
            (opts.windowSize * opts.windowSize) / 2,
            opts.windowSize,
        ),
        cos = table(
            "cos",
            (opts.windowSize * opts.windowSize) / 2,
            opts.windowSize,
        );

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

        for (let k = 0; k < opts.windowSize / 2; k++) {
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
