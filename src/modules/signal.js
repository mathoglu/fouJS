import validation from './validation.js';
import {fastTrigonometric} from './utils.js';

let validate = validation.addRules(
		{
			length: 			'int',
			freq: 				'int',
			amp:				'float',
			Fs: 				'int',
			type:				null
		}
	),
	TwoPi = Math.PI * 2,
	sin = fastTrigonometric.sin,
	TYPES = {
		SINE: (step) => { return sin(TwoPi * step) },
		SAW: (step) => { return 2 * (step - Math.round(step)) },
		SQUARE: (step) => { return step < 0.5 ? 1 : -1 },
		TRIANGLE: (step) => { return 1 - 4 * Math.abs(Math.round(step) - step) }
	},
	signal = (opts)=> {

		// Validate opts
		validate(opts);

		let N = opts.length * opts.Fs,
			Ts = (opts.Fs / opts.freq), // period length in samples
			generator = TYPES[opts.type.toUpperCase()],
			x = new Float32Array(N);

		for(let i = 0; i < x.length; i++) {
			x[i] = generator((i % Ts)/Ts) * opts.amp;
		}

		return x;
	};

export default signal;