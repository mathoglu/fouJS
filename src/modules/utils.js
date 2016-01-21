// Type checks
let type = {
	isFunction: (f)=> { return typeof f === 'function'; },
	isUndefined: (u) => { return typeof u == 'undefined' },
	isObject: (obj) => { return obj !== null && typeof obj === 'object' && !Array.isArray(obj) },
	isEmpty: (obj) => { return type.isObject(obj) && Object.keys(obj).length == 0 },
	isString: (s)=> { return typeof s === 'string' },
	isArray: (a)=> { return Array.isArray(a) },
	isFloat: (f)=> { return f === Number(f) && f % 1 !== 0; },
	isBoolean: (b)=> { return typeof b === 'boolean'; }
};

// Magnitude calculators
let sqrt = Math.sqrt,
	mag = (point)=> {
		return sqrt(point.r * point.r + point.i * point.i);
	},
	db = (x)=> {
		return 10*Math.log(x);
	};

// Table generation
let table = (type, length, windowSize)=> {

	let _sin = ( N )=> {
			let table = new Float32Array( N ),
				twoPi = Math.PI * 2,
				sin = Math.sin;
			for (let i = 0; i < N; i++) {
				table[i] = sin( twoPi * i / windowSize )
			}
			return table
		},
		_cos = ( N )=> {
			let table = new Float32Array( N ),
				twoPi = Math.PI * 2,
				cos = Math.cos;
			for (let i = 0; i < N; i++) {
				table[i] = cos( -twoPi * i / windowSize )
			}
			return table
		};

	if(type === 'sin') {
		return _sin(length);
	}
	else if (type === 'cos') {
		return _cos(length);
	}
	else {
		return [];
	}
};

// Trigonometric help functions (used in FFT)
let sinus = Math.sin,
	cosinus = Math.cos,
	twoPi = Math.PI * 2,
	trigonometric = {
		sin: (k, N)=>{ return sinus( -twoPi * (k / N) ) },
		cos: (k, N)=> { return cosinus( -twoPi * (k / N) ) }
	};

// Split array in even and odd parts
let splitEvenOdd = (array)=> {
	let even = [],
		odd = [];

	for(let i = 0; i < array.length; i++) {
		if((i+2) % 2 == 0) {
			even.push(array[i])
		}
		else {
			odd.push(array[i])
		}
	}
	return {even: even, odd: odd}
};


// Help functions for complex numbers
let complex = {
	add: (a, b)=> { return { r: a.r + b.r, i: a.i + b.i  } },
	subtract: (a, b)=> { return { r: a.r - b.r, i: a.i - b.i  } },
	multiply: (a, b)=> {
		return {
			r: (a.r * b.r - a.i * b.i),
			i: (a.r * b.i + a.i * b.r)
		}
	}
};

let complexArray = {
	add: (a, b)=> { return [(a[0] + b[0]),(a[1] + b[1]) ] },
	subtract: (a, b)=> { return [a[0] - b[0], a[1] - b[1] ] },
	multiply: (a, b)=> {
		return [
			(a[0] * b[0] - a[1] * b[1]),
			(a[0] * b[1] + a[1] * b[0])
		]
	}
};

export default {
	type,
	db,
	mag,
	table,
	splitEvenOdd,
	complex,
	complexArray,
	trigonometric
}