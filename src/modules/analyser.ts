import { Validator } from "./utils";
import { addRules } from "./validation";

export type AnalyserOptions<O> = {
    windowSize: number; // in samples
    hopSize?: number;
    processor: (data: Float32Array) => O;
};
type AnalyserFunction<O> = (input: Float32Array) => O;

export function analyser<Output = Float32Array>(
    opts: AnalyserOptions<Output>,
): AnalyserFunction<Output> {
    // // Validate opts
    addRules<AnalyserOptions<Output>>({
        windowSize: ["int", "required"],
        hopSize: [
            "int",
            ((value: number): boolean => {
                return value > -1 && value <= opts.windowSize;
            }) as Validator,
        ],
        processor: ["func", "required"],
    })(opts);

    const { windowSize, hopSize = 0, processor } = opts;
    let bufferStore: Float32Array;

    return (input: Float32Array): Output => {
        // first run
        if (typeof bufferStore === "undefined") {
            // Initialize as max size
            bufferStore = new Float32Array(windowSize + hopSize);

            // set to only contain what is needed to next iteration
            bufferStore.set(
                input.subarray(windowSize - hopSize, windowSize),
                0,
            );

            return processor(input);
        }
        // Concat input with buffer store
        bufferStore.set(input, hopSize);

        // Slice out what is needed for this analysis iteration
        const data = bufferStore.subarray(0, windowSize);

        // Remove used data
        bufferStore.set(
            bufferStore.subarray(windowSize - hopSize, bufferStore.length),
            0,
        );

        return processor(data);
    };
}
