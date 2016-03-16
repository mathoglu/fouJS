import validation from './validation.js';

let validate = validation.addRules(
		{
			length: 			'float',
			freq: 				'int',
			amp:				'float',
			Fs: 				'int',
			type:				(value)=> { return Object.keys(TYPES).indexOf(value.toUpperCase()) > -1; }
		}
	),
	TwoPi = Math.PI * 2,
	sin = Math.sin,
	TYPES = {
		SINE: (step) => { return sin(TwoPi * step) },
		SAW: (step) => { return 2 * (step - Math.round(step)) },
		SQUARE: (step) => { return step < 0.5 ? 1 : -1 },
		TRIANGLE: (step) => { return 1 - 4 * Math.abs(Math.round(step) - step) },
		RANDOM: (step) => { return Math.random(); }
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