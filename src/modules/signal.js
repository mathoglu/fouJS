import validation from './validation.js';

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
	TYPES = {
		SINE: (step, a) => { return a*Math.sin(TwoPi * step) },
		SAW: (step) => { },
		SQUARE: (step) => {},
		TRIANGLE: (step) => {}
	},
	signal = (opts)=> {

		// Validate opts
		validate(opts);

		let N = opts.length * opts.Fs,
			fq = 1 / (opts.Fs / opts.freq), // frequency described in 1/samples, i.e. period length in samples
			generator = TYPES[opts.type.toUpperCase()],
			x = new Float32Array(N);

		for(let i = 0; i < x.length; i++) {
			x[i] = generator(i * fq, opts.amp) * opts.amp;
		}

		return x;
	};

export default signal;