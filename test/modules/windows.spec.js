import {windows} from '../../src/fou.js';

describe('Windows', ()=> {

	it('should all take parameter "size"', ()=> {
		// Setup, Action and Assertions
		let all = Object.keys(windows);
		for(let i = 0; i < all.length; i++) {
			let window = windows[all[i]];

			expect(()=> { window(10) }).not.toThrow();
			expect(()=> { window() }).toThrow();
		}
	});

	it('should all return function', ()=> {
		// Setup, Action and Assertions
		let all = Object.keys(windows);
		for(let i = 0; i < all.length; i++) {
			let window = windows[all[i]],
				func = window(10);

			expect(func).toEqual(jasmine.any(Function));
		}
	});
});