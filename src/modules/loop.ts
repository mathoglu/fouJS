import { addRules } from "./validation.js";
import { Validator } from "./utils.js";

type LoopRequiredOptions = {
    N: number;
    onProcess: (data: Float32Array) => void;
    signal: Float32Array;
};

type LoopOptionalOptions = {
    hopSize: number;
    async: boolean;
    onProcessDone: (data: Float32Array[]) => void;
};

function loop(opts: LoopRequiredOptions & Partial<LoopOptionalOptions>) {
    // Validate opts
    addRules<LoopRequiredOptions, Partial<LoopOptionalOptions>>(
        {
            signal: [
                ((s: ArrayLike<unknown>) => {
                    if (s.length == 0) {
                        return false;
                    }
                    return true;
                }) as Validator,
            ],
            N: "int",
            onProcess: "func",
        },
        {
            hopSize: "int",
            onProcessDone: "func",
            async: "bool",
        },
    )(opts);

    // return start function
    return () => {
        const all = [],
            {
                signal,
                N,
                hopSize = 0,
                onProcessDone = () => {},
                onProcess,
                async = false,
            } = opts,
            signalLength = signal.length;

        let start = 0;

        // Make callbacks async or not
        let doneCallback, progressCallback;
        if (async) {
            progressCallback = (s: Float32Array) => {
                setTimeout(() => {
                    onProcess(s);
                }, 0);
            };
            doneCallback = (all: Float32Array[]) => {
                setTimeout(() => {
                    onProcessDone(all);
                }, 0);
            };
        } else {
            doneCallback = onProcessDone;
            progressCallback = onProcess;
        }

        // start loop
        while (signalLength > start) {
            let s;
            if (signalLength < start + N) {
                s = new Float32Array(N);
                for (let j = start; j < signalLength; j++) {
                    s[j - start] = signal[j];
                }
            } else {
                s = signal.subarray(start, start + N);
            }

            progressCallback(s);

            all.push(s);
            start += N - hopSize;
        }
        doneCallback(all);
    };
}

export default loop;
