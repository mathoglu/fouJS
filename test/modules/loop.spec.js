import {loop} from '../../src/fou.js';

describe('Loop', ()=> {

	let mock;
	beforeEach( ()=> {
		mock = {
			signal: new Float32Array(20),
			N: 2,
			onProcess: ()=> {}
		}
	});

	it('should return function', ()=> {
		// Setup
		let func = loop(mock);

		// Assertions
		expect(func).toEqual(jasmine.any(Function));
	});

	it('should allow hop size not to be set', ()=> {
		// Setup
		let func = loop(mock);

		// Assertions
		expect(func).not.toThrow();
	});

	it('should loop through whole array correctly without hopSize', ()=> {
		// Setup
		let count = 0,
			loopCount = mock.signal.length / mock.N,
			process = (s)=> {
				if(s.length != mock.N) throw new Error();
				count++;
			},
			func = loop({
				signal: mock.signal,
				N: mock.N,
				onProcess: process
			});

		// Action
		func();


		// Assertions
		expect(count).toEqual(loopCount);
	});

	it('should loop through whole array correctly with hopSize', ()=> {
		// Setup
		let count = 0,
			hop = 1,
			loopCount = mock.signal.length / (mock.N-hop),
			process = (s)=> {
				if(s.length != mock.N) throw new Error();
				count++;
			},
			func = loop({
				signal: mock.signal,
				N: mock.N,
				onProcess: process,
				hopSize: hop
			});

		// Action
		func();

		// Assertions
		expect(count).toEqual(loopCount);
	});

	it('should input signal fraction to "process" callback correctly', ()=> {
		// Setup
		let count = 0,
			signal = new Float32Array([0,1,2,3,4,5,6,7,8,9]),
			process = (s)=> {
				expect(s[0]).toEqual(count);
				count++;
			},
			func = loop({
				signal: signal,
				N: 1,
				onProcess: process
			});

		// Action and assertions
		func();
	});

	it('should input array of fractions to "onProcessDone" callback correctly', ()=> {
		// Setup
		let signal = new Float32Array([0,1,2,3,4,5,6,7,8,9]),
			process = ()=> {},
			onProcessDone = (all)=> {
				for(let i = 0; i < all.length; i++) {
					expect(all[i][0]).toEqual(i);
				}
			},
			func = loop({
				signal: signal,
				N: 1,
				onProcess: process,
				onProcessDone: onProcessDone
			});

		// Action and assertions
		func();
	});
});