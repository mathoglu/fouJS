import {signal, dft, analyser, loop, windows} from '../../src/fou.js';

let console = (typeof window !== "undefined" && window !== null ? window.console : void 0) || { log: ()=> {} };

let average = (x)=> {
		let sum = 0;
		for(let i = 0; i < x.length; i++) {
			sum += x[i];
		}
		return sum/x.length;
	};

let Fs = 44100,
	N = 2048, //variable
	hop = 256,
	len = 15,
	hannFunc = windows.hann(N),
	output = new Float32Array(N),
	{dftFunc, freqForBin} = dft({
		N: N,
		Fs: Fs,
		windowFunc: hannFunc
	}),
	x = signal({
		freq: 440,
		amp: 2,
		length: len,
		Fs: Fs,
		type: 'sine'
	}),
	analyserFunc = analyser({
		N: N,
		hopSize: hop,
		transformFunction: dftFunc
	}),
	time = [],
	start = loop({
		signal: x,
		N: N,
		hopSize: 0,
		process: (s)=> {
			let x1 = Date.now();
			output = analyserFunc(s);
			time.push(Date.now()-x1);
		},
		done: () => {
			console.log('DFT: Average time per window:', average(time), 'ms');
		}
	});

let x2 = Date.now();
start();
console.log('DFT: Done in', Date.now() - x2, 'ms');

