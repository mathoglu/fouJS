// Type checks
let types = {
	isFunction: (f)=> { return typeof f === 'function'; },
	isUndefined: (u) => { return typeof u == 'undefined' },
	isObject: (obj) => { return obj !== null && typeof obj === 'object' && !Array.isArray(obj) },
	isEmpty: (obj) => { return types.isObject(obj) && Object.keys(obj).length == 0 },
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
let table = (type, length, periodLength)=> {

	if(types.isUndefined(periodLength)) {
		periodLength = length;
	}

	let _sin = ( N )=> {
			let table = new Float32Array( N ),
				twoPi = Math.PI * 2,
				sin = Math.sin;
			for (let i = 0; i < N; i++) {
				table[i] = sin( twoPi * i / periodLength )
			}
			return table
		},
		_cos = ( N )=> {
			let table = new Float32Array( N ),
				twoPi = Math.PI * 2,
				cos = Math.cos;
			for (let i = 0; i < N; i++) {
				table[i] = cos( -twoPi * i / periodLength )
			}
			return table
		},
		_reverse = ( N )=> {
			let table = new Uint32Array(N),
				top = 1,
				add = N >> 1;

			while (top < N) {
				for (let i = 0; i < top; i++) {
					table[i + top] = table[i] + add;
				}

				top = top << 1;
				add = add >> 1;
			}
			return table;
		},
		_varCos = ( N )=> {
			let table = new Float32Array( N ),
				Pi = Math.PI,
				cos = Math.cos;
			for (let i = 0; i < N; i++) {
				table[i] = cos( -Pi / i )
			}
			return table
		},
		_varSin = ( N )=> {
			let table = new Float32Array( N ),
				Pi = Math.PI,
				cos = Math.sin;
			for (let i = 0; i < N; i++) {
				table[i] = cos( -Pi / i )
			}
			return table
		};

	if(type === 'sin') {
		return _sin(length);
	}
	else if (type === 'variableSin') {
		return _varSin(length);
	}
	else if (type === 'cos') {
		return _cos(length);
	}
	else if (type === 'variableCos') {
		return _varCos(length);
	}
	else if (type === 'reverseBit') {
		return _reverse(length);
	}
	else {
		return [];
	}
};

export default {
	type: types,
	db,
	mag,
	table
}