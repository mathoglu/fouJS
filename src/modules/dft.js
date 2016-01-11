import validation from './validation.js';
import {table, formatters} from './utils.js';

let bandWidth,
	freqForBin = (nr)=> {
		return bandWidth * nr + bandWidth / 2
	},
	validate = validation.addRules(
		{
			N: 			'int',
			Fs: 		'int',
			windowFunc: 'func'
		}
	);

let dft = (opts)=> {

	validate(opts);

	let sin = table( 'sin', opts.N * opts.N/2, opts.N ),
		cos = table( 'cos', opts.N * opts.N/2, opts.N ),
		output;

	if (opts.complex) {
		output = [];
	}
	else {
		output = new Float32Array( opts.N/2 );
	}

	bandWidth = (opts.Fs / opts.N);

	let dftFunc = (input)=> {

		let distance = (r, i)=> { return Math.sqrt((r*r) + (i*i)); },
			windowSize = opts.N,
			img,
			real,
			_output = output,
			_sin = sin,
			_cos = cos,
			wFunc = opts.windowFunc || ((x) => {return x;});

		for(let k = 0; k < windowSize/2; k++) {

			img = 0.0;
			real = 0.0;

			for(let n = 0; n < input.length; n++) {
				real += wFunc(n) * input[n] * _cos[n*k];
				img += wFunc(n) * input[n] * _sin[n*k];
			}

			_output[k] = 2 * distance(real,img) / windowSize;
		}

		return _output;
	};

	return {dftFunc, freqForBin}
};

export default dft