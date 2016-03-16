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
			onProcess:			'func'
		},
		{
			hopSize: 			'int',
			onProcessDone:		'func',
			async: 				'bool'
		}
	)(opts);

	if(type.isUndefined(opts.hopSize)) {
		opts.hopSize = 0;
	}

	if(type.isUndefined(opts.async)) {
		opts.async = false;
	}

	if(type.isUndefined(opts.onProcessDone)) {
		opts.onProcessDone = ()=> {};
	}

	// return start function
	return ()=> {
		let start = 0,
			all = [],
			{signal, N, hopSize, onProcessDone, onProcess, async } = opts,
			signalLength = signal.length;

		// Make callbacks async or not
		let doneCallback, progressCallback;
		if(async) {
			progressCallback = (s)=> {
				setTimeout(
					()=> {
						onProcess(s)
					},
					0
				)
			};
			doneCallback = (all)=> {
				setTimeout(
					()=> {
						onProcessDone(all)
					},
					0
				)
			};
		}
		else {
			doneCallback = onProcessDone;
			progressCallback = onProcess;
		}

		// start loop
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

			progressCallback(s);

			all.push(s);
			start += (N - hopSize);
		}
		doneCallback( all );
	}
};

export default loop;