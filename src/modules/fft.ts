import { addRules } from "./validation";
import { type ImaginaryPoint, table, type } from "./utils";

const validate = addRules(
    {
        N: "int",
    },
    {
        windowFunc: "func",
    },
);
type WindowFunc = (input: number) => number;
type FFTOptions = { N: number; windowFunc: WindowFunc };

export function fft(opts: FFTOptions) {
    validate(opts);

    if (type.isUndefined(opts.windowFunc)) {
        opts.windowFunc = () => {
            return 1;
        };
    }

    const reverse = table("reverseBit", opts.N);
    const sin = table("variableSin", opts.N);
    const cos = table("variableCos", opts.N);

    const N = opts.N;
    const windowFunc = opts.windowFunc;

    const fftFunc = (input: ArrayLike<number>) => {
        const output = [];
        let size = 1,
            i = 0,
            off = 0,
            target: ImaginaryPoint,
            current: ImaginaryPoint,
            phaseShift: ImaginaryPoint,
            currentPhaseShift: ImaginaryPoint;

        for (let j = 0; j < N; j++) {
            output[j] = { r: windowFunc(reverse[j]) * input[reverse[j]], i: 0 };
        }

        while (size < N) {
            phaseShift = { r: cos[size], i: sin[size] };

            currentPhaseShift = { r: 1.0, i: 0.0 };

            for (let step = 0; step < size; step++) {
                i = step;

                while (i < N) {
                    off = i + size;

                    // get the pairs to add together
                    target = output[off];
                    current = output[i];

                    const t = { r: 0, i: 0 };

                    // Calculate the complex multiplication newTarget = currentPhaseShift * target
                    t.r =
                        currentPhaseShift.r * target.r -
                        currentPhaseShift.i * target.i;
                    t.i =
                        currentPhaseShift.r * target.i +
                        currentPhaseShift.i * target.r;

                    // Complex subtraction current - newTarget
                    target.r = current.r - t.r;
                    target.i = current.i - t.i;

                    // Complex addition current = current + newTarget
                    current.r += t.r;
                    current.i += t.i;

                    i += size << 1;
                }

                // Complex multiplication currentPhaseShiftReal
                const oldPhaseShift = {
                    r: currentPhaseShift.r,
                    i: currentPhaseShift.i,
                };
                currentPhaseShift.r =
                    oldPhaseShift.r * phaseShift.r -
                    oldPhaseShift.i * phaseShift.i;
                currentPhaseShift.i =
                    oldPhaseShift.r * phaseShift.i +
                    oldPhaseShift.i * phaseShift.r;
            }

            size = size << 1;
        }

        return output;
    };

    return fftFunc;
}
