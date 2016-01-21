import validation from './validation.js';
import {type} from './utils.js';

let loop = (opts) => {

	// Validate opts
	validation.addRules(
		{
			signal: (s)=> {
				if(s.length == 0) { return false; }
				return true;
			},
			N: 					'int',
			process:			'func'
		},
		{
			hopSize: 			'int',
			done:				'func',
			async: 				'bool'
		}
	)(opts);

	if(type.isUndefined(opts.hopSize)) {
		opts.hopSize = 0;
	}

	if(type.isUndefined(opts.async)) {
		opts.async = false;
	}

	if(type.isUndefined(opts.done)) {
		opts.done = ()=> {};
	}

	return ()=> {
		let start = 0,
			all = [],
			{signal, N, hopSize, done, process, async } = opts,
			signalLength = signal.length;

		let callback;
		if(async) {
			callback = (s)=> {
				setTimeout(
					()=> {
						process(s)
					},
					0
				)
			}
		}
		else {
			callback = process;
		}

		while ( signalLength > start ) {
			let s;
			if (signalLength < start + N) {
				s = new Float32Array(N);
				for(let j = start; j < signalLength; j++) {
					s[j-start] = signal[j]
				}
			}
			else {
				s = signal.subarray(start, start+N)
			}

			callback(s);

			all.push(s);
			start += (N - hopSize);
		}
		done( all );
	}
};

export default loop;