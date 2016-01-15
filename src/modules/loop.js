import validation from './validation.js';

let loop = (opts) => {

	// Validate opts
	validation.addRules(
		{
			signal: 			null,
			N: 					'int',
			hopSize: 			'int',
			process:			'func',
			done:				'func'
		},
		{

		}
	)(opts);

	return ()=> {
		let start = 0,
			all = [];
		while ( opts.signal.length > start ) {
			let s;
			if (opts.signal.length < start + opts.N) {
				s = new Float32Array(opts.N);
				for(let j = start; j < opts.signal.length; j++) {
					s[j-start] = opts.signal[j]
				}
			}
			else {
				s = opts.signal.subarray(start, start+opts.N)
			}
			opts.process( s );
			all.push(s);
			start += (opts.N - opts.hopSize);
		}
		opts.done( all );
	}
};

export default loop;