import { addRules } from "./validation.js";
import { Validator } from "./utils.js";

type LoopOptions = {
    windowSize: number;
    signal: Float32Array;
    hopSize?: number;
    async?: boolean;
    onProcess: (data: Float32Array) => void;
    onProcessDone?: (data: Float32Array[]) => void;
};

export function loop(opts: LoopOptions) {
    // Validate opts
    addRules<LoopOptions>({
        signal: [
            ((s: ArrayLike<unknown>) => {
                if (s.length == 0) {
                    return false;
                }
                return true;
            }) as Validator,
        ],
        windowSize: ["int", "required"],
        onProcess: ["func", "required"],
        hopSize: ["int"],
        onProcessDone: ["func"],
        async: ["bool"],
    })(opts);

    // return start function
    return () => {
        const all = [],
            {
                signal,
                windowSize,
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
            if (signalLength < start + windowSize) {
                s = new Float32Array(windowSize);
                for (let j = start; j < signalLength; j++) {
                    s[j - start] = signal[j];
                }
            } else {
                s = signal.subarray(start, start + windowSize);
            }

            progressCallback(s);

            all.push(s);
            start += windowSize - hopSize;
        }
        doneCallback(all);
    };
}
