import validation from './validation.js';

let validate =validation.addRules({
	size: 'int'
});

let hann = (size)=> {
		validate({size: size});

		let table = new Float32Array(size),
			cos = Math.cos,
			twoPi = Math.PI*2;

		for(let i = 0; i < size; i++) {
			table[i] = 0.5*(1-cos((twoPi*i)/size-1));
		}

		return (i)=> { return table[i] };
	};

let hamming = (size)=> {

		validate({size: size});

		let alpha = 0.54,
			beta = 1-alpha,
			table = new Float32Array(size),
			cos = Math.cos,
			twoPi = Math.PI*2;

		for(let i = 0; i < size; i++) {
			table[i] = alpha - beta*cos( twoPi*i / size-1 );
		}
		return (i)=> { return table[i] };
	};

let blackman = (size)=> {

		validate({size: size});

		let alpha = 0.16,
			a0 = 1-alpha/2,
			a1 = 0.5,
			a2 = alpha/2,
			table = new Float32Array(size),
			cos = Math.cos,
			twoPi = Math.PI*2;

		for(let i = 0; i < size; i++) {
			table[i] = a0 - a1*cos( twoPi*i / size-1 ) + a2*cos( 2*twoPi*i / size-1 );
		}
		return (i)=> { return table[i] };
	};

let bartlett = (size)=> {

		validate({size: size});

		let table = new Float32Array(size);

		for(let i = 0; i < size/2; i++) {
			table[i] = 2*i / size;
		}
		for(let i = size/2 ;i < size; i++) {
			table[i] = 2 - ( 2*i / size);
		}

		return (i)=> { return table[i] };
	};

export default {
	hann,
	blackman,
	bartlett,
	hamming
}