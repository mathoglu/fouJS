import validation from './validation.js';
import {table, type} from './utils.js';

let validate = validation.addRules(
		{
			N: 				'int'
		},
		{
			windowFunc: 	'func'
		}
	);

let fft = (opts)=> {

	validate(opts);

	if(type.isUndefined(opts.windowFunc)) {
		opts.windowFunc = ()=> { return 1; }
	}

	let reverse = table('reverseBit', opts.N),
		sin = table('variableSin', opts.N),
		cos = table('variableCos', opts.N),
		N = opts.N,
		windowFunc = opts.windowFunc;

	let fftFunc = (input)=> {
		let output = [],
			size = 1,
			i,
			off,
			target,
			current,
			phaseShift,
			currentPhaseShift;

		for(let j = 0; j < N; j++) {
			output[j] = { r: windowFunc(reverse[j]) * input[reverse[j]], i: 0 }
		}

		while( size < N ) {

			phaseShift = {r: cos[size], i: sin[size]};

			currentPhaseShift = {r: 1.0000, i: 0.0000};

			for (let step = 0; step < size; step++) {
				i = step;

				while (i < N) {
					off = i + size;

					// get the pairs to add together
					target = output[off];
					current = output[i];

					let t = {r: 0, i:0};

					// Calculate the complex multiplication newTarget = currentPhaseShift * target
					t.r = (currentPhaseShift.r * target.r) - (currentPhaseShift.i * target.i);
					t.i = (currentPhaseShift.r * target.i) + (currentPhaseShift.i * target.r);

					// Complex subtraction current - newTarget
					target.r = current.r - t.r;
					target.i = current.i - t.i;

					// Complex addition current = current + newTarget
					current.r += t.r;
					current.i += t.i;

					i += size << 1;
				}

				// Complex multiplication currentPhaseShiftReal
				let oldPhaseShift = {r: currentPhaseShift.r, i: currentPhaseShift.i};
				currentPhaseShift.r = (oldPhaseShift.r * phaseShift.r) - (oldPhaseShift.i * phaseShift.i);
				currentPhaseShift.i = (oldPhaseShift.r * phaseShift.i) + (oldPhaseShift.i * phaseShift.r);
			}

			size = size << 1;
		}

		return output;
	};

	return fftFunc;
};

export default fft