import { Validator } from "./utils";
import { addRules } from "./validation";

export type AnalyserRequiredOptions = {
    N: number;
    hopSize: number;
    onProcess: (data: Float32Array) => Float32Array;
};
// eslint-disable-next-line @typescript-eslint/ban-types
export type AnalyserOptionalOptions = {};
type AnalyserFunction = (input: Float32Array) => Float32Array[];

function analyser(opts: AnalyserRequiredOptions): AnalyserFunction {
    // Validate opts
    addRules<AnalyserRequiredOptions, AnalyserOptionalOptions>({
        N: "int",
        hopSize: [
            "int",
            ((value: number): boolean => {
                return value > 0 && value <= opts.N;
            }) as Validator,
        ],
        onProcess: "func",
    })(opts);

    const hopSize = opts.hopSize;
    const N = opts.N;
    const bufferStore = new Float32Array(2 * N); // store two consecutive frames

    let isFirst = true;
    let start = hopSize;

    return (input: Float32Array): Float32Array[] => {
        const tFunc = opts.onProcess;
        // first run, use first frame
        if (isFirst || hopSize === N) {
            if (isFirst) {
                bufferStore.set(input, 0);
                isFirst = false;
            }

            return [tFunc(input)];
        }

        // Concat second (current) frame with buffer store
        bufferStore.set(input, N);

        const data: Float32Array[] = [];

        // loop through all frames that fit into the current buffer store
        while (start <= bufferStore.length) {
            data.push(tFunc(bufferStore.subarray(start, start + N)));
            start += hopSize;
        }

        // remove used data by moving second frame in buffer to beginning of array
        bufferStore.set(bufferStore.subarray(N, 2 * N), 0);
        start -= N;

        return data;
    };
}

export default analyser;
