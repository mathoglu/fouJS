import validation from './validation.js';
import {table, type} from './utils.js';

let bandWidth,
	validate = validation.addRules(
		{
			N: 			'int',
			Fs: 		'int'
		},
		{
			windowFunc: 'func'
		}
	);

let dft = (opts)=> {

	validate(opts);

	if(type.isUndefined(opts.windowFunc)) {
		opts.windowFunc = ()=> { return 1; }
	}


	let sin = table( 'sin', opts.N * opts.N/2, opts.N ),
		cos = table( 'cos', opts.N * opts.N/2, opts.N );

	let dftFunc = (input)=> {

		let windowSize = opts.N,
			img,
			real,
			output = [],
			_sin = sin,
			_cos = cos,
			inputLength = input.length,
			wFunc = opts.windowFunc || ((x) => {return x;});

		for(let k = 0; k < windowSize/2; k++) {

			img = 0.0;
			real = 0.0;

			for(let n = 0; n < inputLength; n++) {
				real += wFunc(n) * input[n] * _cos[n*k];
				img += wFunc(n) * input[n] * _sin[n*k];
			}

			output.push({
				r: real,
				i: img
			});
		}

		return output;
	};

	return dftFunc;
};

export default dft