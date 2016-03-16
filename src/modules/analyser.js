import validation from './validation.js';
import {type} from './utils.js'

let analyser = (opts)=> {

	// Validate opts
	validation.addRules(
		{
			N: 					'int',
			hopSize: 			['int', (value)=> { return value > 0 && value <= opts.N; }],
			onProcess: 			'func'
		}
	)(opts);

	const hopSize = opts.hopSize,
		N = opts.N,
		bufferStore = new Float32Array(2*N); // store two consecutive frames

	let isFirst = true,
		start = hopSize;

	return (input)=> {
		let tFunc = opts.onProcess;
		// first run, use first frame
		if(isFirst || hopSize === N) {
			if(isFirst) {
				bufferStore.set(input, 0);
				isFirst = false;
			}

			return tFunc(input);
		}

		// Concat second (current) frame with buffer store
		bufferStore.set(input, N);

		let data = [],
			bufferStoreLength = bufferStore.length;

		// loop through all frames that fit into the current buffer store
		while(start <= bufferStoreLength) {
			let frame = bufferStore.subarray(start, start+N);
			data.push( tFunc(frame) );
			start += hopSize;
		}

		// remove used data by moving second frame in buffer to beginning of array
		bufferStore.set(bufferStore.subarray(N, 2*N), 0);
		start -= N;


		return data;
	};
};

export default analyser;