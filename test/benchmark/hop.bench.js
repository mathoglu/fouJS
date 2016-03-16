import {signal, fft, analyser, windows} from '../../src/fou.js';

let console = (typeof window !== "undefined" && window !== null ? window.console : void 0) || { log: ()=> {} };
let N = 8192,
	x = signal({
	freq: 440,
	amp: 2.01,
	length: N/44100,
	Fs: 44100,
	type: 'random'
});


let init = (opts)=> {
	let fftFunc = fft({
		N: opts.N,
		Fs: 44100
	});

	return analyser({
		N: opts.N,
		Fs: opts.Fs,
		onProcess: fftFunc,
		hopSize: opts.hopSize
	})
};
let stats = {};
for(let i = 0; i < 8; i++) {
	let hop = N-(i*N/8),
		analyserFunc = init({
			N: N,
			hopSize: hop,
			Fs: 44100
		}),
		frames = 10,
		testFunc = ()=> {
			for(let j = 0; j < frames;j++) {
				analyserFunc(x);
			}
		};


	let suite = new Benchmark('fft', testFunc).run();

	stats[hop] = {
		mean: suite.stats.mean * 1000/frames,
		variance: suite.stats.variance * 1000/frames,
		standardDeviation: suite.stats.deviation * 1000/frames,
		marginOfError: {
			value: suite.stats.moe * 1000/frames,
			percent: suite.stats.rme
		},
		count: suite.count
	};
	console.log('done with', hop, suite);
}

document.getElementById('data').innerHTML = JSON.stringify(stats);


