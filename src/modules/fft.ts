import { addRules } from "./validation";
import {
    type ImaginaryPoint,
    trigonometric,
    splitEvenOdd,
    complex,
} from "./utils";

type WindowFunc = (input: number) => number;
type FFTOptions = { windowSize: number; windowFunc?: WindowFunc };

const validate = addRules<FFTOptions>({
    windowSize: ["int", "required"],
    windowFunc: ["func"],
});

export function getFFTProcessor(opts: FFTOptions) {
    validate(opts);

    const { windowFunc = () => 1 } = opts;

    const fftFunc = (input: Float32Array): ImaginaryPoint[] => {
        const output = [];
        const sin = trigonometric.sin,
            cos = trigonometric.cos;
        const N = input.length;

        if (N == 1) {
            return [{ r: windowFunc(0) * input[0], i: 0 }];
        } else {
            const { even, odd } = splitEvenOdd(input),
                inputEven = fftFunc(even),
                inputOdd = fftFunc(odd);

            for (let i = 0; i < N / 2; i++) {
                const twiddle = complex.multiply(
                    { r: cos(i, N), i: sin(i, N) },
                    inputOdd[i],
                );

                output[i] = complex.add(inputEven[i], twiddle);
                output[i + N / 2] = complex.subtract(inputEven[i], twiddle);
            }
            return output;
        }
    };
    return fftFunc;
}
