(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { 'default': obj };
}

var _modulesAnalyserJs = require('./modules/analyser.js');

var _modulesAnalyserJs2 = _interopRequireDefault(_modulesAnalyserJs);

var _modulesLoopJs = require('./modules/loop.js');

var _modulesLoopJs2 = _interopRequireDefault(_modulesLoopJs);

var _modulesSignalJs = require('./modules/signal.js');

var _modulesSignalJs2 = _interopRequireDefault(_modulesSignalJs);

var _modulesWindowsJs = require('./modules/windows.js');

var _modulesWindowsJs2 = _interopRequireDefault(_modulesWindowsJs);

var _modulesValidationJs = require('./modules/validation.js');

var _modulesValidationJs2 = _interopRequireDefault(_modulesValidationJs);

var _modulesDftJs = require('./modules/dft.js');

var _modulesDftJs2 = _interopRequireDefault(_modulesDftJs);

var _modulesFftJs = require('./modules/fft.js');

var _modulesFftJs2 = _interopRequireDefault(_modulesFftJs);

var _modulesUtilsJs = require('./modules/utils.js');

var _modulesUtilsJs2 = _interopRequireDefault(_modulesUtilsJs);

exports['default'] = {
	analyser: _modulesAnalyserJs2['default'],
	loop: _modulesLoopJs2['default'],
	signal: _modulesSignalJs2['default'],
	windows: _modulesWindowsJs2['default'],
	validation: _modulesValidationJs2['default'],
	dft: _modulesDftJs2['default'],
	fft: _modulesFftJs2['default'],
	utils: _modulesUtilsJs2['default']
};
module.exports = exports['default'];

},{"./modules/analyser.js":2,"./modules/dft.js":3,"./modules/fft.js":4,"./modules/loop.js":5,"./modules/signal.js":6,"./modules/utils.js":7,"./modules/validation.js":8,"./modules/windows.js":9}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { 'default': obj };
}

var _validationJs = require('./validation.js');

var _validationJs2 = _interopRequireDefault(_validationJs);

var _utilsJs = require('./utils.js');

var analyser = function analyser(opts) {

	// Validate opts
	_validationJs2['default'].addRules({
		N: 'int',
		hopSize: ['int', function (value) {
			return value > 0 && value <= opts.N;
		}],
		onProcess: 'func'
	})(opts);

	var hopSize = opts.hopSize,
	    N = opts.N,
	    bufferStore = new Float32Array(2 * N); // store two consecutive frames

	var isFirst = true,
	    start = hopSize;

	return function (input) {
		var tFunc = opts.onProcess;
		// first run, use first frame
		if (isFirst || hopSize === N) {
			if (isFirst) {
				bufferStore.set(input, 0);
				isFirst = false;
			}

			return tFunc(input);
		}

		// Concat second (current) frame with buffer store
		bufferStore.set(input, N);

		var data = [],
		    bufferStoreLength = bufferStore.length;

		// loop through all frames that fit into the current buffer store
		while (start <= bufferStoreLength) {
			var frame = bufferStore.subarray(start, start + N);
			data.push(tFunc(frame));
			start += hopSize;
		}

		// remove used data by moving second frame in buffer to beginning of array
		bufferStore.set(bufferStore.subarray(N, 2 * N), 0);
		start -= N;

		return data;
	};
};

exports['default'] = analyser;
module.exports = exports['default'];

},{"./utils.js":7,"./validation.js":8}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { 'default': obj };
}

var _validationJs = require('./validation.js');

var _validationJs2 = _interopRequireDefault(_validationJs);

var _utilsJs = require('./utils.js');

var bandWidth = undefined,
    validate = _validationJs2['default'].addRules({
	N: 'int',
	Fs: 'int'
}, {
	windowFunc: 'func'
});

var dft = function dft(opts) {

	validate(opts);

	if (_utilsJs.type.isUndefined(opts.windowFunc)) {
		opts.windowFunc = function () {
			return 1;
		};
	}

	var sin = (0, _utilsJs.table)('sin', opts.N * opts.N / 2, opts.N),
	    cos = (0, _utilsJs.table)('cos', opts.N * opts.N / 2, opts.N);

	var dftFunc = function dftFunc(input) {

		var windowSize = opts.N,
		    img = undefined,
		    real = undefined,
		    output = [],
		    _sin = sin,
		    _cos = cos,
		    inputLength = input.length,
		    wFunc = opts.windowFunc || function (x) {
			return x;
		};

		for (var k = 0; k < windowSize / 2; k++) {

			img = 0.0;
			real = 0.0;

			for (var n = 0; n < inputLength; n++) {
				real += wFunc(n) * input[n] * _cos[n * k];
				img += wFunc(n) * input[n] * _sin[n * k];
			}

			output.push({
				r: real,
				i: img
			});
		}

		return output;
	};

	return dftFunc;
};

exports['default'] = dft;
module.exports = exports['default'];

},{"./utils.js":7,"./validation.js":8}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { 'default': obj };
}

var _validationJs = require('./validation.js');

var _validationJs2 = _interopRequireDefault(_validationJs);

var _utilsJs = require('./utils.js');

var validate = _validationJs2['default'].addRules({
	N: 'int'
}, {
	windowFunc: 'func'
});

var fft = function fft(opts) {

	validate(opts);

	if (_utilsJs.type.isUndefined(opts.windowFunc)) {
		opts.windowFunc = function () {
			return 1;
		};
	}

	var reverse = (0, _utilsJs.table)('reverseBit', opts.N),
	    sin = (0, _utilsJs.table)('variableSin', opts.N),
	    cos = (0, _utilsJs.table)('variableCos', opts.N),
	    N = opts.N,
	    windowFunc = opts.windowFunc;

	var fftFunc = function fftFunc(input) {
		var output = [],
		    size = 1,
		    i = undefined,
		    off = undefined,
		    target = undefined,
		    current = undefined,
		    phaseShift = undefined,
		    currentPhaseShift = undefined;

		for (var j = 0; j < N; j++) {
			output[j] = { r: windowFunc(reverse[j]) * input[reverse[j]], i: 0 };
		}

		while (size < N) {

			phaseShift = { r: cos[size], i: sin[size] };

			currentPhaseShift = { r: 1.0000, i: 0.0000 };

			for (var step = 0; step < size; step++) {
				i = step;

				while (i < N) {
					off = i + size;

					// get the pairs to add together
					target = output[off];
					current = output[i];

					var t = { r: 0, i: 0 };

					// Calculate the complex multiplication newTarget = currentPhaseShift * target
					t.r = currentPhaseShift.r * target.r - currentPhaseShift.i * target.i;
					t.i = currentPhaseShift.r * target.i + currentPhaseShift.i * target.r;

					// Complex subtraction current - newTarget
					target.r = current.r - t.r;
					target.i = current.i - t.i;

					// Complex addition current = current + newTarget
					current.r += t.r;
					current.i += t.i;

					i += size << 1;
				}

				// Complex multiplication currentPhaseShiftReal
				var oldPhaseShift = { r: currentPhaseShift.r, i: currentPhaseShift.i };
				currentPhaseShift.r = oldPhaseShift.r * phaseShift.r - oldPhaseShift.i * phaseShift.i;
				currentPhaseShift.i = oldPhaseShift.r * phaseShift.i + oldPhaseShift.i * phaseShift.r;
			}

			size = size << 1;
		}

		return output;
	};

	return fftFunc;
};

exports['default'] = fft;
module.exports = exports['default'];

},{"./utils.js":7,"./validation.js":8}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { 'default': obj };
}

var _validationJs = require('./validation.js');

var _validationJs2 = _interopRequireDefault(_validationJs);

var _utilsJs = require('./utils.js');

var loop = function loop(opts) {

	// Validate opts
	_validationJs2['default'].addRules({
		signal: function signal(s) {
			if (s.length == 0) {
				return false;
			}
			return true;
		},
		N: 'int',
		onProcess: 'func'
	}, {
		hopSize: 'int',
		onProcessDone: 'func',
		async: 'bool'
	})(opts);

	if (_utilsJs.type.isUndefined(opts.hopSize)) {
		opts.hopSize = 0;
	}

	if (_utilsJs.type.isUndefined(opts.async)) {
		opts.async = false;
	}

	if (_utilsJs.type.isUndefined(opts.onProcessDone)) {
		opts.onProcessDone = function () {};
	}

	// return start function
	return function () {
		var start = 0;
		var all = [];
		var signal = opts.signal;
		var N = opts.N;
		var hopSize = opts.hopSize;
		var onProcessDone = opts.onProcessDone;
		var onProcess = opts.onProcess;
		var async = opts.async;
		var signalLength = signal.length;

		// Make callbacks async or not
		var doneCallback = undefined,
		    progressCallback = undefined;
		if (async) {
			progressCallback = function (s) {
				setTimeout(function () {
					onProcess(s);
				}, 0);
			};
			doneCallback = function (all) {
				setTimeout(function () {
					onProcessDone(all);
				}, 0);
			};
		} else {
			doneCallback = onProcessDone;
			progressCallback = onProcess;
		}

		// start loop
		while (signalLength > start) {
			var s = undefined;
			if (signalLength < start + N) {
				s = new Float32Array(N);
				for (var j = start; j < signalLength; j++) {
					s[j - start] = signal[j];
				}
			} else {
				s = signal.subarray(start, start + N);
			}

			progressCallback(s);

			all.push(s);
			start += N - hopSize;
		}
		doneCallback(all);
	};
};

exports['default'] = loop;
module.exports = exports['default'];

},{"./utils.js":7,"./validation.js":8}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { 'default': obj };
}

var _validationJs = require('./validation.js');

var _validationJs2 = _interopRequireDefault(_validationJs);

var validate = _validationJs2['default'].addRules({
	length: 'float',
	freq: 'int',
	amp: 'float',
	Fs: 'int',
	type: function type(value) {
		return Object.keys(TYPES).indexOf(value.toUpperCase()) > -1;
	}
}),
    TwoPi = Math.PI * 2,
    sin = Math.sin,
    TYPES = {
	SINE: function SINE(step) {
		return sin(TwoPi * step);
	},
	SAW: function SAW(step) {
		return 2 * (step - Math.round(step));
	},
	SQUARE: function SQUARE(step) {
		return step < 0.5 ? 1 : -1;
	},
	TRIANGLE: function TRIANGLE(step) {
		return 1 - 4 * Math.abs(Math.round(step) - step);
	},
	RANDOM: function RANDOM(step) {
		return Math.random();
	}
},
    signal = function signal(opts) {

	// Validate opts
	validate(opts);

	var N = opts.length * opts.Fs,
	    Ts = opts.Fs / opts.freq,
	   
	// period length in samples
	generator = TYPES[opts.type.toUpperCase()],
	    x = new Float32Array(N);

	for (var i = 0; i < x.length; i++) {
		x[i] = generator(i % Ts / Ts) * opts.amp;
	}

	return x;
};

exports['default'] = signal;
module.exports = exports['default'];

},{"./validation.js":8}],7:[function(require,module,exports){
// Type checks
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var types = {
	isFunction: function isFunction(f) {
		return typeof f === 'function';
	},
	isUndefined: function isUndefined(u) {
		return typeof u == 'undefined';
	},
	isObject: function isObject(obj) {
		return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
	},
	isEmpty: function isEmpty(obj) {
		return types.isObject(obj) && Object.keys(obj).length == 0;
	},
	isString: function isString(s) {
		return typeof s === 'string';
	},
	isArray: function isArray(a) {
		return Array.isArray(a);
	},
	isFloat: function isFloat(f) {
		return f === Number(f) && f % 1 !== 0;
	},
	isBoolean: function isBoolean(b) {
		return typeof b === 'boolean';
	}
};

// Magnitude calculators
var sqrt = Math.sqrt,
    mag = function mag(point) {
	return sqrt(point.r * point.r + point.i * point.i);
},
    db = function db(x) {
	return 10 * Math.log(x);
};

// Table generation
var table = function table(type, length, periodLength) {

	if (types.isUndefined(periodLength)) {
		periodLength = length;
	}

	var _sin = function _sin(N) {
		var table = new Float32Array(N),
		    twoPi = Math.PI * 2,
		    sin = Math.sin;
		for (var i = 0; i < N; i++) {
			table[i] = sin(twoPi * i / periodLength);
		}
		return table;
	},
	    _cos = function _cos(N) {
		var table = new Float32Array(N),
		    twoPi = Math.PI * 2,
		    cos = Math.cos;
		for (var i = 0; i < N; i++) {
			table[i] = cos(-twoPi * i / periodLength);
		}
		return table;
	},
	    _reverse = function _reverse(N) {
		var table = new Uint32Array(N),
		    top = 1,
		    add = N >> 1;

		while (top < N) {
			for (var i = 0; i < top; i++) {
				table[i + top] = table[i] + add;
			}

			top = top << 1;
			add = add >> 1;
		}
		return table;
	},
	    _varCos = function _varCos(N) {
		var table = new Float32Array(N),
		    Pi = Math.PI,
		    cos = Math.cos;
		for (var i = 0; i < N; i++) {
			table[i] = cos(-Pi / i);
		}
		return table;
	},
	    _varSin = function _varSin(N) {
		var table = new Float32Array(N),
		    Pi = Math.PI,
		    cos = Math.sin;
		for (var i = 0; i < N; i++) {
			table[i] = cos(-Pi / i);
		}
		return table;
	};

	if (type === 'sin') {
		return _sin(length);
	} else if (type === 'variableSin') {
		return _varSin(length);
	} else if (type === 'cos') {
		return _cos(length);
	} else if (type === 'variableCos') {
		return _varCos(length);
	} else if (type === 'reverseBit') {
		return _reverse(length);
	} else {
		return [];
	}
};

exports['default'] = {
	type: types,
	db: db,
	mag: mag,
	table: table
};
module.exports = exports['default'];

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _utilsJs = require('./utils.js');

var standardValidators = {
	int: function int(i) {
		return i === parseInt(i, 10);
	},
	func: _utilsJs.type.isFunction,
	float: _utilsJs.type.isFloat,
	bool: _utilsJs.type.isBoolean,
	powerOfTwo: function powerOfTwo(i) {
		var exp = Math.log(i) / Math.LN2;
		return exp === parseInt(exp, 10);
	}
},
    addRules = function addRules(required, optional) {

	if (_utilsJs.type.isUndefined(optional)) {
		optional = {};
	}

	if (_utilsJs.type.isUndefined(required)) {
		required = {};
	}

	if (!_utilsJs.type.isObject(optional) || !_utilsJs.type.isObject(required)) {
		throw new Error('Inputted specification is not object.');
	}

	if (_utilsJs.type.isEmpty(required) && _utilsJs.type.isEmpty(optional)) {
		throw new Error('Both inputted specification objects are empty?.');
	}

	var _validate = function _validate(option, value, func) {
		if (!_utilsJs.type.isFunction(func)) {
			throw new Error('No validator for "' + option + '" found.');
		}
		if (!func(value)) {
			throw new Error('Input for "' + option + '" is not valid. Value: ' + value);
		}
	},
	    validateOption = function validateOption(option, validator, value) {
		if (_utilsJs.type.isArray(validator)) {
			var validatorFunc = undefined;

			for (var j = 0; j < validator.length; j++) {
				var val = validator[j];
				if (_utilsJs.type.isString(val)) {
					validatorFunc = standardValidators[val];
				} else if (_utilsJs.type.isFunction(val)) {
					validatorFunc = val;
				}

				_validate(option, value, validatorFunc);
			}
		} else if (_utilsJs.type.isString(validator)) {
			_validate(option, value, standardValidators[validator]);
		} else if (_utilsJs.type.isFunction(validator)) {
			_validate(option, value, validator);
		}
	};

	// return validation function
	return function (opts) {

		// loop all required options and validate
		var keys = Object.keys(required);
		for (var i = 0; i < keys.length; i++) {
			var opt = keys[i],
			    value = opts[opt];

			if (_utilsJs.type.isUndefined(value)) {
				throw new Error('Required parameter "' + opt + '" not in options object.');
			} else {
				validateOption(opt, required[opt], value);
			}
		}

		// loop all optional options and validate if present
		keys = Object.keys(optional);
		for (var i = 0; i < keys.length; i++) {
			var opt = keys[i],
			    value = opts[opt];

			if (!_utilsJs.type.isUndefined(value)) {
				validateOption(opt, optional[opt], value);
			}
		}
	};
};

exports['default'] = { addRules: addRules };
module.exports = exports['default'];

},{"./utils.js":7}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : { 'default': obj };
}

var _validationJs = require('./validation.js');

var _validationJs2 = _interopRequireDefault(_validationJs);

var validate = _validationJs2['default'].addRules({
	size: 'int'
});

var hann = function hann(size) {
	validate({ size: size });

	var table = new Float32Array(size),
	    cos = Math.cos,
	    twoPi = Math.PI * 2;

	for (var i = 0; i < size; i++) {
		table[i] = 0.5 * (1 - cos(twoPi * i / size - 1));
	}

	return function (i) {
		return table[i];
	};
};

var hamming = function hamming(size) {

	validate({ size: size });

	var alpha = 0.54,
	    beta = 1 - alpha,
	    table = new Float32Array(size),
	    cos = Math.cos,
	    twoPi = Math.PI * 2;

	for (var i = 0; i < size; i++) {
		table[i] = alpha - beta * cos(twoPi * i / size - 1);
	}
	return function (i) {
		return table[i];
	};
};

var blackman = function blackman(size) {

	validate({ size: size });

	var alpha = 0.16,
	    a0 = 1 - alpha / 2,
	    a1 = 0.5,
	    a2 = alpha / 2,
	    table = new Float32Array(size),
	    cos = Math.cos,
	    twoPi = Math.PI * 2;

	for (var i = 0; i < size; i++) {
		table[i] = a0 - a1 * cos(twoPi * i / size - 1) + a2 * cos(2 * twoPi * i / size - 1);
	}
	return function (i) {
		return table[i];
	};
};

var bartlett = function bartlett(size) {

	validate({ size: size });

	var table = new Float32Array(size);

	for (var i = 0; i < size / 2; i++) {
		table[i] = 2 * i / size;
	}
	for (var i = size / 2; i < size; i++) {
		table[i] = 2 - 2 * i / size;
	}

	return function (i) {
		return table[i];
	};
};

exports['default'] = {
	hann: hann,
	blackman: blackman,
	bartlett: bartlett,
	hamming: hamming
};
module.exports = exports['default'];

},{"./validation.js":8}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9taG9nL1Byb2plY3RzL2RpcHBhbmkvZm91SlMvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21ob2cvUHJvamVjdHMvZGlwcGFuaS9mb3VKUy9zcmMvZmFrZV9mOWUzNzhiMC5qcyIsIi9Vc2Vycy9taG9nL1Byb2plY3RzL2RpcHBhbmkvZm91SlMvc3JjL21vZHVsZXMvYW5hbHlzZXIuanMiLCIvVXNlcnMvbWhvZy9Qcm9qZWN0cy9kaXBwYW5pL2ZvdUpTL3NyYy9tb2R1bGVzL2RmdC5qcyIsIi9Vc2Vycy9taG9nL1Byb2plY3RzL2RpcHBhbmkvZm91SlMvc3JjL21vZHVsZXMvZmZ0LmpzIiwiL1VzZXJzL21ob2cvUHJvamVjdHMvZGlwcGFuaS9mb3VKUy9zcmMvbW9kdWxlcy9sb29wLmpzIiwiL1VzZXJzL21ob2cvUHJvamVjdHMvZGlwcGFuaS9mb3VKUy9zcmMvbW9kdWxlcy9zaWduYWwuanMiLCIvVXNlcnMvbWhvZy9Qcm9qZWN0cy9kaXBwYW5pL2ZvdUpTL3NyYy9tb2R1bGVzL3V0aWxzLmpzIiwiL1VzZXJzL21ob2cvUHJvamVjdHMvZGlwcGFuaS9mb3VKUy9zcmMvbW9kdWxlcy92YWxpZGF0aW9uLmpzIiwiL1VzZXJzL21ob2cvUHJvamVjdHMvZGlwcGFuaS9mb3VKUy9zcmMvbW9kdWxlcy93aW5kb3dzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsWUFBWSxDQUFDOztBQUViLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRTtBQUM1QyxNQUFLLEVBQUUsSUFBSTtDQUNYLENBQUMsQ0FBQzs7QUFFSCxTQUFTLHNCQUFzQixDQUFDLEdBQUcsRUFBRTtBQUFFLFFBQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxHQUFHLEVBQUUsU0FBUyxF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QU8sVUFBQyxDQUFDLEVBQUk7QUFBRSxTQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtFQUFFLENBQUM7Q0FDakMsQ0FBQzs7QUFvQkgsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQWxCSDtBQUNkLEtBQUksRUFBSixJQUFJO0FBQ0osU0FBUSxFQUFSLFFBQVE7QUFDUixTQUFRLEVBQVIsUUFBUTtBQUNSLFFBQU8sRUFBUCxPQUFPO0NBQ1AsQ0FBQTtBQW1CRCxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgYW5hbHlzZXIgZnJvbSAnLi9tb2R1bGVzL2FuYWx5c2VyLmpzJztcbmltcG9ydCBsb29wIGZyb20gJy4vbW9kdWxlcy9sb29wLmpzJztcbmltcG9ydCBzaWduYWwgZnJvbSAnLi9tb2R1bGVzL3NpZ25hbC5qcyc7XG5pbXBvcnQgd2luZG93cyBmcm9tICcuL21vZHVsZXMvd2luZG93cy5qcyc7XG5pbXBvcnQgdmFsaWRhdGlvbiBmcm9tICcuL21vZHVsZXMvdmFsaWRhdGlvbi5qcyc7XG5pbXBvcnQgZGZ0IGZyb20gJy4vbW9kdWxlcy9kZnQuanMnO1xuaW1wb3J0IGZmdCBmcm9tICcuL21vZHVsZXMvZmZ0LmpzJztcbmltcG9ydCB1dGlscyBmcm9tICcuL21vZHVsZXMvdXRpbHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cdGFuYWx5c2VyLFxuXHRsb29wLFxuXHRzaWduYWwsXG5cdHdpbmRvd3MsXG5cdHZhbGlkYXRpb24sXG5cdGRmdCxcblx0ZmZ0LFxuXHR1dGlsc1xufTsiLCJpbXBvcnQgdmFsaWRhdGlvbiBmcm9tICcuL3ZhbGlkYXRpb24uanMnO1xuaW1wb3J0IHt0eXBlfSBmcm9tICcuL3V0aWxzLmpzJ1xuXG5sZXQgYW5hbHlzZXIgPSAob3B0cyk9PiB7XG5cblx0Ly8gVmFsaWRhdGUgb3B0c1xuXHR2YWxpZGF0aW9uLmFkZFJ1bGVzKFxuXHRcdHtcblx0XHRcdE46IFx0XHRcdFx0XHQnaW50Jyxcblx0XHRcdGhvcFNpemU6IFx0XHRcdFsnaW50JywgKHZhbHVlKT0+IHsgcmV0dXJuIHZhbHVlID4gMCAmJiB2YWx1ZSA8PSBvcHRzLk47IH1dLFxuXHRcdFx0b25Qcm9jZXNzOiBcdFx0XHQnZnVuYydcblx0XHR9XG5cdCkob3B0cyk7XG5cblx0Y29uc3QgaG9wU2l6ZSA9IG9wdHMuaG9wU2l6ZSxcblx0XHROID0gb3B0cy5OLFxuXHRcdGJ1ZmZlclN0b3JlID0gbmV3IEZsb2F0MzJBcnJheSgyKk4pOyAvLyBzdG9yZSB0d28gY29uc2VjdXRpdmUgZnJhbWVzXG5cblx0bGV0IGlzRmlyc3QgPSB0cnVlLFxuXHRcdHN0YXJ0ID0gaG9wU2l6ZTtcblxuXHRyZXR1cm4gKGlucHV0KT0+IHtcblx0XHRsZXQgdEZ1bmMgPSBvcHRzLm9uUHJvY2Vzcztcblx0XHQvLyBmaXJzdCBydW4sIHVzZSBmaXJzdCBmcmFtZVxuXHRcdGlmKGlzRmlyc3QgfHwgaG9wU2l6ZSA9PT0gTikge1xuXHRcdFx0aWYoaXNGaXJzdCkge1xuXHRcdFx0XHRidWZmZXJTdG9yZS5zZXQoaW5wdXQsIDApO1xuXHRcdFx0XHRpc0ZpcnN0ID0gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0RnVuYyhpbnB1dCk7XG5cdFx0fVxuXG5cdFx0Ly8gQ29uY2F0IHNlY29uZCAoY3VycmVudCkgZnJhbWUgd2l0aCBidWZmZXIgc3RvcmVcblx0XHRidWZmZXJTdG9yZS5zZXQoaW5wdXQsIE4pO1xuXG5cdFx0bGV0IGRhdGEgPSBbXSxcblx0XHRcdGJ1ZmZlclN0b3JlTGVuZ3RoID0gYnVmZmVyU3RvcmUubGVuZ3RoO1xuXG5cdFx0Ly8gbG9vcCB0aHJvdWdoIGFsbCBmcmFtZXMgdGhhdCBmaXQgaW50byB0aGUgY3VycmVudCBidWZmZXIgc3RvcmVcblx0XHR3aGlsZShzdGFydCA8PSBidWZmZXJTdG9yZUxlbmd0aCkge1xuXHRcdFx0bGV0IGZyYW1lID0gYnVmZmVyU3RvcmUuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0K04pO1xuXHRcdFx0ZGF0YS5wdXNoKCB0RnVuYyhmcmFtZSkgKTtcblx0XHRcdHN0YXJ0ICs9IGhvcFNpemU7XG5cdFx0fVxuXG5cdFx0Ly8gcmVtb3ZlIHVzZWQgZGF0YSBieSBtb3Zpbmcgc2Vjb25kIGZyYW1lIGluIGJ1ZmZlciB0byBiZWdpbm5pbmcgb2YgYXJyYXlcblx0XHRidWZmZXJTdG9yZS5zZXQoYnVmZmVyU3RvcmUuc3ViYXJyYXkoTiwgMipOKSwgMCk7XG5cdFx0c3RhcnQgLT0gTjtcblxuXG5cdFx0cmV0dXJuIGRhdGE7XG5cdH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhbmFseXNlcjsiLCJpbXBvcnQgdmFsaWRhdGlvbiBmcm9tICcuL3ZhbGlkYXRpb24uanMnO1xuaW1wb3J0IHt0YWJsZSwgdHlwZX0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmxldCBiYW5kV2lkdGgsXG5cdHZhbGlkYXRlID0gdmFsaWRhdGlvbi5hZGRSdWxlcyhcblx0XHR7XG5cdFx0XHROOiBcdFx0XHQnaW50Jyxcblx0XHRcdEZzOiBcdFx0J2ludCdcblx0XHR9LFxuXHRcdHtcblx0XHRcdHdpbmRvd0Z1bmM6ICdmdW5jJ1xuXHRcdH1cblx0KTtcblxubGV0IGRmdCA9IChvcHRzKT0+IHtcblxuXHR2YWxpZGF0ZShvcHRzKTtcblxuXHRpZih0eXBlLmlzVW5kZWZpbmVkKG9wdHMud2luZG93RnVuYykpIHtcblx0XHRvcHRzLndpbmRvd0Z1bmMgPSAoKT0+IHsgcmV0dXJuIDE7IH1cblx0fVxuXG5cblx0bGV0IHNpbiA9IHRhYmxlKCAnc2luJywgb3B0cy5OICogb3B0cy5OLzIsIG9wdHMuTiApLFxuXHRcdGNvcyA9IHRhYmxlKCAnY29zJywgb3B0cy5OICogb3B0cy5OLzIsIG9wdHMuTiApO1xuXG5cdGxldCBkZnRGdW5jID0gKGlucHV0KT0+IHtcblxuXHRcdGxldCB3aW5kb3dTaXplID0gb3B0cy5OLFxuXHRcdFx0aW1nLFxuXHRcdFx0cmVhbCxcblx0XHRcdG91dHB1dCA9IFtdLFxuXHRcdFx0X3NpbiA9IHNpbixcblx0XHRcdF9jb3MgPSBjb3MsXG5cdFx0XHRpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aCxcblx0XHRcdHdGdW5jID0gb3B0cy53aW5kb3dGdW5jIHx8ICgoeCkgPT4ge3JldHVybiB4O30pO1xuXG5cdFx0Zm9yKGxldCBrID0gMDsgayA8IHdpbmRvd1NpemUvMjsgaysrKSB7XG5cblx0XHRcdGltZyA9IDAuMDtcblx0XHRcdHJlYWwgPSAwLjA7XG5cblx0XHRcdGZvcihsZXQgbiA9IDA7IG4gPCBpbnB1dExlbmd0aDsgbisrKSB7XG5cdFx0XHRcdHJlYWwgKz0gd0Z1bmMobikgKiBpbnB1dFtuXSAqIF9jb3NbbiprXTtcblx0XHRcdFx0aW1nICs9IHdGdW5jKG4pICogaW5wdXRbbl0gKiBfc2luW24qa107XG5cdFx0XHR9XG5cblx0XHRcdG91dHB1dC5wdXNoKHtcblx0XHRcdFx0cjogcmVhbCxcblx0XHRcdFx0aTogaW1nXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9O1xuXG5cdHJldHVybiBkZnRGdW5jO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZGZ0IiwiaW1wb3J0IHZhbGlkYXRpb24gZnJvbSAnLi92YWxpZGF0aW9uLmpzJztcbmltcG9ydCB7dGFibGUsIHR5cGV9IGZyb20gJy4vdXRpbHMuanMnO1xuXG5sZXQgdmFsaWRhdGUgPSB2YWxpZGF0aW9uLmFkZFJ1bGVzKFxuXHRcdHtcblx0XHRcdE46IFx0XHRcdFx0J2ludCdcblx0XHR9LFxuXHRcdHtcblx0XHRcdHdpbmRvd0Z1bmM6IFx0J2Z1bmMnXG5cdFx0fVxuXHQpO1xuXG5sZXQgZmZ0ID0gKG9wdHMpPT4ge1xuXG5cdHZhbGlkYXRlKG9wdHMpO1xuXG5cdGlmKHR5cGUuaXNVbmRlZmluZWQob3B0cy53aW5kb3dGdW5jKSkge1xuXHRcdG9wdHMud2luZG93RnVuYyA9ICgpPT4geyByZXR1cm4gMTsgfVxuXHR9XG5cblx0bGV0IHJldmVyc2UgPSB0YWJsZSgncmV2ZXJzZUJpdCcsIG9wdHMuTiksXG5cdFx0c2luID0gdGFibGUoJ3ZhcmlhYmxlU2luJywgb3B0cy5OKSxcblx0XHRjb3MgPSB0YWJsZSgndmFyaWFibGVDb3MnLCBvcHRzLk4pLFxuXHRcdE4gPSBvcHRzLk4sXG5cdFx0d2luZG93RnVuYyA9IG9wdHMud2luZG93RnVuYztcblxuXHRsZXQgZmZ0RnVuYyA9IChpbnB1dCk9PiB7XG5cdFx0bGV0IG91dHB1dCA9IFtdLFxuXHRcdFx0c2l6ZSA9IDEsXG5cdFx0XHRpLFxuXHRcdFx0b2ZmLFxuXHRcdFx0dGFyZ2V0LFxuXHRcdFx0Y3VycmVudCxcblx0XHRcdHBoYXNlU2hpZnQsXG5cdFx0XHRjdXJyZW50UGhhc2VTaGlmdDtcblxuXHRcdGZvcihsZXQgaiA9IDA7IGogPCBOOyBqKyspIHtcblx0XHRcdG91dHB1dFtqXSA9IHsgcjogd2luZG93RnVuYyhyZXZlcnNlW2pdKSAqIGlucHV0W3JldmVyc2Vbal1dLCBpOiAwIH1cblx0XHR9XG5cblx0XHR3aGlsZSggc2l6ZSA8IE4gKSB7XG5cblx0XHRcdHBoYXNlU2hpZnQgPSB7cjogY29zW3NpemVdLCBpOiBzaW5bc2l6ZV19O1xuXG5cdFx0XHRjdXJyZW50UGhhc2VTaGlmdCA9IHtyOiAxLjAwMDAsIGk6IDAuMDAwMH07XG5cblx0XHRcdGZvciAobGV0IHN0ZXAgPSAwOyBzdGVwIDwgc2l6ZTsgc3RlcCsrKSB7XG5cdFx0XHRcdGkgPSBzdGVwO1xuXG5cdFx0XHRcdHdoaWxlIChpIDwgTikge1xuXHRcdFx0XHRcdG9mZiA9IGkgKyBzaXplO1xuXG5cdFx0XHRcdFx0Ly8gZ2V0IHRoZSBwYWlycyB0byBhZGQgdG9nZXRoZXJcblx0XHRcdFx0XHR0YXJnZXQgPSBvdXRwdXRbb2ZmXTtcblx0XHRcdFx0XHRjdXJyZW50ID0gb3V0cHV0W2ldO1xuXG5cdFx0XHRcdFx0bGV0IHQgPSB7cjogMCwgaTowfTtcblxuXHRcdFx0XHRcdC8vIENhbGN1bGF0ZSB0aGUgY29tcGxleCBtdWx0aXBsaWNhdGlvbiBuZXdUYXJnZXQgPSBjdXJyZW50UGhhc2VTaGlmdCAqIHRhcmdldFxuXHRcdFx0XHRcdHQuciA9IChjdXJyZW50UGhhc2VTaGlmdC5yICogdGFyZ2V0LnIpIC0gKGN1cnJlbnRQaGFzZVNoaWZ0LmkgKiB0YXJnZXQuaSk7XG5cdFx0XHRcdFx0dC5pID0gKGN1cnJlbnRQaGFzZVNoaWZ0LnIgKiB0YXJnZXQuaSkgKyAoY3VycmVudFBoYXNlU2hpZnQuaSAqIHRhcmdldC5yKTtcblxuXHRcdFx0XHRcdC8vIENvbXBsZXggc3VidHJhY3Rpb24gY3VycmVudCAtIG5ld1RhcmdldFxuXHRcdFx0XHRcdHRhcmdldC5yID0gY3VycmVudC5yIC0gdC5yO1xuXHRcdFx0XHRcdHRhcmdldC5pID0gY3VycmVudC5pIC0gdC5pO1xuXG5cdFx0XHRcdFx0Ly8gQ29tcGxleCBhZGRpdGlvbiBjdXJyZW50ID0gY3VycmVudCArIG5ld1RhcmdldFxuXHRcdFx0XHRcdGN1cnJlbnQuciArPSB0LnI7XG5cdFx0XHRcdFx0Y3VycmVudC5pICs9IHQuaTtcblxuXHRcdFx0XHRcdGkgKz0gc2l6ZSA8PCAxO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ29tcGxleCBtdWx0aXBsaWNhdGlvbiBjdXJyZW50UGhhc2VTaGlmdFJlYWxcblx0XHRcdFx0bGV0IG9sZFBoYXNlU2hpZnQgPSB7cjogY3VycmVudFBoYXNlU2hpZnQuciwgaTogY3VycmVudFBoYXNlU2hpZnQuaX07XG5cdFx0XHRcdGN1cnJlbnRQaGFzZVNoaWZ0LnIgPSAob2xkUGhhc2VTaGlmdC5yICogcGhhc2VTaGlmdC5yKSAtIChvbGRQaGFzZVNoaWZ0LmkgKiBwaGFzZVNoaWZ0LmkpO1xuXHRcdFx0XHRjdXJyZW50UGhhc2VTaGlmdC5pID0gKG9sZFBoYXNlU2hpZnQuciAqIHBoYXNlU2hpZnQuaSkgKyAob2xkUGhhc2VTaGlmdC5pICogcGhhc2VTaGlmdC5yKTtcblx0XHRcdH1cblxuXHRcdFx0c2l6ZSA9IHNpemUgPDwgMTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9O1xuXG5cdHJldHVybiBmZnRGdW5jO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgZmZ0IiwiaW1wb3J0IHZhbGlkYXRpb24gZnJvbSAnLi92YWxpZGF0aW9uLmpzJztcbmltcG9ydCB7dHlwZX0gZnJvbSAnLi91dGlscy5qcyc7XG5cbmxldCBsb29wID0gKG9wdHMpID0+IHtcblxuXHQvLyBWYWxpZGF0ZSBvcHRzXG5cdHZhbGlkYXRpb24uYWRkUnVsZXMoXG5cdFx0e1xuXHRcdFx0c2lnbmFsOiAocyk9PiB7XG5cdFx0XHRcdGlmKHMubGVuZ3RoID09IDApIHsgcmV0dXJuIGZhbHNlOyB9XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSxcblx0XHRcdE46IFx0XHRcdFx0XHQnaW50Jyxcblx0XHRcdG9uUHJvY2VzczpcdFx0XHQnZnVuYydcblx0XHR9LFxuXHRcdHtcblx0XHRcdGhvcFNpemU6IFx0XHRcdCdpbnQnLFxuXHRcdFx0b25Qcm9jZXNzRG9uZTpcdFx0J2Z1bmMnLFxuXHRcdFx0YXN5bmM6IFx0XHRcdFx0J2Jvb2wnXG5cdFx0fVxuXHQpKG9wdHMpO1xuXG5cdGlmKHR5cGUuaXNVbmRlZmluZWQob3B0cy5ob3BTaXplKSkge1xuXHRcdG9wdHMuaG9wU2l6ZSA9IDA7XG5cdH1cblxuXHRpZih0eXBlLmlzVW5kZWZpbmVkKG9wdHMuYXN5bmMpKSB7XG5cdFx0b3B0cy5hc3luYyA9IGZhbHNlO1xuXHR9XG5cblx0aWYodHlwZS5pc1VuZGVmaW5lZChvcHRzLm9uUHJvY2Vzc0RvbmUpKSB7XG5cdFx0b3B0cy5vblByb2Nlc3NEb25lID0gKCk9PiB7fTtcblx0fVxuXG5cdC8vIHJldHVybiBzdGFydCBmdW5jdGlvblxuXHRyZXR1cm4gKCk9PiB7XG5cdFx0bGV0IHN0YXJ0ID0gMCxcblx0XHRcdGFsbCA9IFtdLFxuXHRcdFx0e3NpZ25hbCwgTiwgaG9wU2l6ZSwgb25Qcm9jZXNzRG9uZSwgb25Qcm9jZXNzLCBhc3luYyB9ID0gb3B0cyxcblx0XHRcdHNpZ25hbExlbmd0aCA9IHNpZ25hbC5sZW5ndGg7XG5cblx0XHQvLyBNYWtlIGNhbGxiYWNrcyBhc3luYyBvciBub3Rcblx0XHRsZXQgZG9uZUNhbGxiYWNrLCBwcm9ncmVzc0NhbGxiYWNrO1xuXHRcdGlmKGFzeW5jKSB7XG5cdFx0XHRwcm9ncmVzc0NhbGxiYWNrID0gKHMpPT4ge1xuXHRcdFx0XHRzZXRUaW1lb3V0KFxuXHRcdFx0XHRcdCgpPT4ge1xuXHRcdFx0XHRcdFx0b25Qcm9jZXNzKHMpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQwXG5cdFx0XHRcdClcblx0XHRcdH07XG5cdFx0XHRkb25lQ2FsbGJhY2sgPSAoYWxsKT0+IHtcblx0XHRcdFx0c2V0VGltZW91dChcblx0XHRcdFx0XHQoKT0+IHtcblx0XHRcdFx0XHRcdG9uUHJvY2Vzc0RvbmUoYWxsKVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0MFxuXHRcdFx0XHQpXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGRvbmVDYWxsYmFjayA9IG9uUHJvY2Vzc0RvbmU7XG5cdFx0XHRwcm9ncmVzc0NhbGxiYWNrID0gb25Qcm9jZXNzO1xuXHRcdH1cblxuXHRcdC8vIHN0YXJ0IGxvb3Bcblx0XHR3aGlsZSAoIHNpZ25hbExlbmd0aCA+IHN0YXJ0ICkge1xuXHRcdFx0bGV0IHM7XG5cdFx0XHRpZiAoc2lnbmFsTGVuZ3RoIDwgc3RhcnQgKyBOKSB7XG5cdFx0XHRcdHMgPSBuZXcgRmxvYXQzMkFycmF5KE4pO1xuXHRcdFx0XHRmb3IobGV0IGogPSBzdGFydDsgaiA8IHNpZ25hbExlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0c1tqLXN0YXJ0XSA9IHNpZ25hbFtqXVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0cyA9IHNpZ25hbC5zdWJhcnJheShzdGFydCwgc3RhcnQrTilcblx0XHRcdH1cblxuXHRcdFx0cHJvZ3Jlc3NDYWxsYmFjayhzKTtcblxuXHRcdFx0YWxsLnB1c2gocyk7XG5cdFx0XHRzdGFydCArPSAoTiAtIGhvcFNpemUpO1xuXHRcdH1cblx0XHRkb25lQ2FsbGJhY2soIGFsbCApO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBsb29wOyIsImltcG9ydCB2YWxpZGF0aW9uIGZyb20gJy4vdmFsaWRhdGlvbi5qcyc7XG5cbmxldCB2YWxpZGF0ZSA9IHZhbGlkYXRpb24uYWRkUnVsZXMoXG5cdFx0e1xuXHRcdFx0bGVuZ3RoOiBcdFx0XHQnZmxvYXQnLFxuXHRcdFx0ZnJlcTogXHRcdFx0XHQnaW50Jyxcblx0XHRcdGFtcDpcdFx0XHRcdCdmbG9hdCcsXG5cdFx0XHRGczogXHRcdFx0XHQnaW50Jyxcblx0XHRcdHR5cGU6XHRcdFx0XHQodmFsdWUpPT4geyByZXR1cm4gT2JqZWN0LmtleXMoVFlQRVMpLmluZGV4T2YodmFsdWUudG9VcHBlckNhc2UoKSkgPiAtMTsgfVxuXHRcdH1cblx0KSxcblx0VHdvUGkgPSBNYXRoLlBJICogMixcblx0c2luID0gTWF0aC5zaW4sXG5cdFRZUEVTID0ge1xuXHRcdFNJTkU6IChzdGVwKSA9PiB7IHJldHVybiBzaW4oVHdvUGkgKiBzdGVwKSB9LFxuXHRcdFNBVzogKHN0ZXApID0+IHsgcmV0dXJuIDIgKiAoc3RlcCAtIE1hdGgucm91bmQoc3RlcCkpIH0sXG5cdFx0U1FVQVJFOiAoc3RlcCkgPT4geyByZXR1cm4gc3RlcCA8IDAuNSA/IDEgOiAtMSB9LFxuXHRcdFRSSUFOR0xFOiAoc3RlcCkgPT4geyByZXR1cm4gMSAtIDQgKiBNYXRoLmFicyhNYXRoLnJvdW5kKHN0ZXApIC0gc3RlcCkgfSxcblx0XHRSQU5ET006IChzdGVwKSA9PiB7IHJldHVybiBNYXRoLnJhbmRvbSgpOyB9XG5cdH0sXG5cdHNpZ25hbCA9IChvcHRzKT0+IHtcblxuXHRcdC8vIFZhbGlkYXRlIG9wdHNcblx0XHR2YWxpZGF0ZShvcHRzKTtcblxuXHRcdGxldCBOID0gb3B0cy5sZW5ndGggKiBvcHRzLkZzLFxuXHRcdFx0VHMgPSAob3B0cy5GcyAvIG9wdHMuZnJlcSksIC8vIHBlcmlvZCBsZW5ndGggaW4gc2FtcGxlc1xuXHRcdFx0Z2VuZXJhdG9yID0gVFlQRVNbb3B0cy50eXBlLnRvVXBwZXJDYXNlKCldLFxuXHRcdFx0eCA9IG5ldyBGbG9hdDMyQXJyYXkoTik7XG5cblx0XHRmb3IobGV0IGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKykge1xuXHRcdFx0eFtpXSA9IGdlbmVyYXRvcigoaSAlIFRzKS9UcykgKiBvcHRzLmFtcDtcblx0XHR9XG5cblx0XHRyZXR1cm4geDtcblx0fTtcblxuZXhwb3J0IGRlZmF1bHQgc2lnbmFsOyIsIi8vIFR5cGUgY2hlY2tzXG5sZXQgdHlwZXMgPSB7XG5cdGlzRnVuY3Rpb246IChmKT0+IHsgcmV0dXJuIHR5cGVvZiBmID09PSAnZnVuY3Rpb24nOyB9LFxuXHRpc1VuZGVmaW5lZDogKHUpID0+IHsgcmV0dXJuIHR5cGVvZiB1ID09ICd1bmRlZmluZWQnIH0sXG5cdGlzT2JqZWN0OiAob2JqKSA9PiB7IHJldHVybiBvYmogIT09IG51bGwgJiYgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkob2JqKSB9LFxuXHRpc0VtcHR5OiAob2JqKSA9PiB7IHJldHVybiB0eXBlcy5pc09iamVjdChvYmopICYmIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09IDAgfSxcblx0aXNTdHJpbmc6IChzKT0+IHsgcmV0dXJuIHR5cGVvZiBzID09PSAnc3RyaW5nJyB9LFxuXHRpc0FycmF5OiAoYSk9PiB7IHJldHVybiBBcnJheS5pc0FycmF5KGEpIH0sXG5cdGlzRmxvYXQ6IChmKT0+IHsgcmV0dXJuIGYgPT09IE51bWJlcihmKSAmJiBmICUgMSAhPT0gMDsgfSxcblx0aXNCb29sZWFuOiAoYik9PiB7IHJldHVybiB0eXBlb2YgYiA9PT0gJ2Jvb2xlYW4nOyB9XG59O1xuXG4vLyBNYWduaXR1ZGUgY2FsY3VsYXRvcnNcbmxldCBzcXJ0ID0gTWF0aC5zcXJ0LFxuXHRtYWcgPSAocG9pbnQpPT4ge1xuXHRcdHJldHVybiBzcXJ0KHBvaW50LnIgKiBwb2ludC5yICsgcG9pbnQuaSAqIHBvaW50LmkpO1xuXHR9LFxuXHRkYiA9ICh4KT0+IHtcblx0XHRyZXR1cm4gMTAqTWF0aC5sb2coeCk7XG5cdH07XG5cbi8vIFRhYmxlIGdlbmVyYXRpb25cbmxldCB0YWJsZSA9ICh0eXBlLCBsZW5ndGgsIHBlcmlvZExlbmd0aCk9PiB7XG5cblx0aWYodHlwZXMuaXNVbmRlZmluZWQocGVyaW9kTGVuZ3RoKSkge1xuXHRcdHBlcmlvZExlbmd0aCA9IGxlbmd0aDtcblx0fVxuXG5cdGxldCBfc2luID0gKCBOICk9PiB7XG5cdFx0XHRsZXQgdGFibGUgPSBuZXcgRmxvYXQzMkFycmF5KCBOICksXG5cdFx0XHRcdHR3b1BpID0gTWF0aC5QSSAqIDIsXG5cdFx0XHRcdHNpbiA9IE1hdGguc2luO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBOOyBpKyspIHtcblx0XHRcdFx0dGFibGVbaV0gPSBzaW4oIHR3b1BpICogaSAvIHBlcmlvZExlbmd0aCApXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGFibGVcblx0XHR9LFxuXHRcdF9jb3MgPSAoIE4gKT0+IHtcblx0XHRcdGxldCB0YWJsZSA9IG5ldyBGbG9hdDMyQXJyYXkoIE4gKSxcblx0XHRcdFx0dHdvUGkgPSBNYXRoLlBJICogMixcblx0XHRcdFx0Y29zID0gTWF0aC5jb3M7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IE47IGkrKykge1xuXHRcdFx0XHR0YWJsZVtpXSA9IGNvcyggLXR3b1BpICogaSAvIHBlcmlvZExlbmd0aCApXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGFibGVcblx0XHR9LFxuXHRcdF9yZXZlcnNlID0gKCBOICk9PiB7XG5cdFx0XHRsZXQgdGFibGUgPSBuZXcgVWludDMyQXJyYXkoTiksXG5cdFx0XHRcdHRvcCA9IDEsXG5cdFx0XHRcdGFkZCA9IE4gPj4gMTtcblxuXHRcdFx0d2hpbGUgKHRvcCA8IE4pIHtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0b3A7IGkrKykge1xuXHRcdFx0XHRcdHRhYmxlW2kgKyB0b3BdID0gdGFibGVbaV0gKyBhZGQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0b3AgPSB0b3AgPDwgMTtcblx0XHRcdFx0YWRkID0gYWRkID4+IDE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGFibGU7XG5cdFx0fSxcblx0XHRfdmFyQ29zID0gKCBOICk9PiB7XG5cdFx0XHRsZXQgdGFibGUgPSBuZXcgRmxvYXQzMkFycmF5KCBOICksXG5cdFx0XHRcdFBpID0gTWF0aC5QSSxcblx0XHRcdFx0Y29zID0gTWF0aC5jb3M7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IE47IGkrKykge1xuXHRcdFx0XHR0YWJsZVtpXSA9IGNvcyggLVBpIC8gaSApXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGFibGVcblx0XHR9LFxuXHRcdF92YXJTaW4gPSAoIE4gKT0+IHtcblx0XHRcdGxldCB0YWJsZSA9IG5ldyBGbG9hdDMyQXJyYXkoIE4gKSxcblx0XHRcdFx0UGkgPSBNYXRoLlBJLFxuXHRcdFx0XHRjb3MgPSBNYXRoLnNpbjtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgTjsgaSsrKSB7XG5cdFx0XHRcdHRhYmxlW2ldID0gY29zKCAtUGkgLyBpIClcblx0XHRcdH1cblx0XHRcdHJldHVybiB0YWJsZVxuXHRcdH07XG5cblx0aWYodHlwZSA9PT0gJ3NpbicpIHtcblx0XHRyZXR1cm4gX3NpbihsZW5ndGgpO1xuXHR9XG5cdGVsc2UgaWYgKHR5cGUgPT09ICd2YXJpYWJsZVNpbicpIHtcblx0XHRyZXR1cm4gX3ZhclNpbihsZW5ndGgpO1xuXHR9XG5cdGVsc2UgaWYgKHR5cGUgPT09ICdjb3MnKSB7XG5cdFx0cmV0dXJuIF9jb3MobGVuZ3RoKTtcblx0fVxuXHRlbHNlIGlmICh0eXBlID09PSAndmFyaWFibGVDb3MnKSB7XG5cdFx0cmV0dXJuIF92YXJDb3MobGVuZ3RoKTtcblx0fVxuXHRlbHNlIGlmICh0eXBlID09PSAncmV2ZXJzZUJpdCcpIHtcblx0XHRyZXR1cm4gX3JldmVyc2UobGVuZ3RoKTtcblx0fVxuXHRlbHNlIHtcblx0XHRyZXR1cm4gW107XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0dHlwZTogdHlwZXMsXG5cdGRiLFxuXHRtYWcsXG5cdHRhYmxlXG59IiwiaW1wb3J0IHt0eXBlfSBmcm9tICcuL3V0aWxzLmpzJztcblxubGV0IHN0YW5kYXJkVmFsaWRhdG9ycyA9IHtcblx0XHRpbnQ6IChpKT0+IHsgcmV0dXJuIGkgPT09IHBhcnNlSW50KGksIDEwKTsgfSxcblx0XHRmdW5jOiB0eXBlLmlzRnVuY3Rpb24sXG5cdFx0ZmxvYXQ6IHR5cGUuaXNGbG9hdCxcblx0XHRib29sOiB0eXBlLmlzQm9vbGVhbixcblx0XHRwb3dlck9mVHdvOiAoaSk9PiB7XG5cdFx0XHRsZXQgZXhwID0gTWF0aC5sb2coaSkgLyBNYXRoLkxOMjtcblx0XHRcdHJldHVybiBleHAgPT09IHBhcnNlSW50KGV4cCwgMTApO1xuXHRcdH1cblx0fSxcblx0YWRkUnVsZXMgPSAocmVxdWlyZWQsIG9wdGlvbmFsKT0+IHtcblxuXHRcdGlmKHR5cGUuaXNVbmRlZmluZWQob3B0aW9uYWwpKSB7XG5cdFx0XHRvcHRpb25hbCA9IHt9O1xuXHRcdH1cblxuXHRcdGlmKHR5cGUuaXNVbmRlZmluZWQocmVxdWlyZWQpKSB7XG5cdFx0XHRyZXF1aXJlZCA9IHt9O1xuXHRcdH1cblxuXHRcdGlmKCAhdHlwZS5pc09iamVjdChvcHRpb25hbCkgfHwgIXR5cGUuaXNPYmplY3QocmVxdWlyZWQpKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0lucHV0dGVkIHNwZWNpZmljYXRpb24gaXMgbm90IG9iamVjdC4nKTtcblx0XHR9XG5cblx0XHRpZiggdHlwZS5pc0VtcHR5KHJlcXVpcmVkKSAmJiB0eXBlLmlzRW1wdHkob3B0aW9uYWwpICkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdCb3RoIGlucHV0dGVkIHNwZWNpZmljYXRpb24gb2JqZWN0cyBhcmUgZW1wdHk/LicpO1xuXHRcdH1cblxuXHRcdGxldCBfdmFsaWRhdGUgPSAob3B0aW9uLCB2YWx1ZSwgZnVuYyk9PiB7XG5cdFx0XHRcdGlmICghdHlwZS5pc0Z1bmN0aW9uKGZ1bmMpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdObyB2YWxpZGF0b3IgZm9yIFwiJyArIG9wdGlvbiArICdcIiBmb3VuZC4nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIWZ1bmModmFsdWUpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnB1dCBmb3IgXCInICsgb3B0aW9uICsgJ1wiIGlzIG5vdCB2YWxpZC4gVmFsdWU6ICcgKyB2YWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHR2YWxpZGF0ZU9wdGlvbiA9IChvcHRpb24sIHZhbGlkYXRvciwgdmFsdWUpPT4ge1xuXHRcdFx0XHRpZih0eXBlLmlzQXJyYXkodmFsaWRhdG9yKSkge1xuXHRcdFx0XHRcdGxldCB2YWxpZGF0b3JGdW5jO1xuXG5cdFx0XHRcdFx0Zm9yKGxldCBqID0gMDsgaiA8IHZhbGlkYXRvci5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0bGV0IHZhbCA9IHZhbGlkYXRvcltqXTtcblx0XHRcdFx0XHRcdGlmKHR5cGUuaXNTdHJpbmcodmFsKSkge1xuXHRcdFx0XHRcdFx0XHR2YWxpZGF0b3JGdW5jID0gc3RhbmRhcmRWYWxpZGF0b3JzW3ZhbF07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmKHR5cGUuaXNGdW5jdGlvbih2YWwpKSB7XG5cdFx0XHRcdFx0XHRcdHZhbGlkYXRvckZ1bmMgPSB2YWw7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdF92YWxpZGF0ZShvcHRpb24sIHZhbHVlLCB2YWxpZGF0b3JGdW5jKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZih0eXBlLmlzU3RyaW5nKHZhbGlkYXRvcikpIHtcblx0XHRcdFx0XHRfdmFsaWRhdGUob3B0aW9uLCB2YWx1ZSwgc3RhbmRhcmRWYWxpZGF0b3JzW3ZhbGlkYXRvcl0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYodHlwZS5pc0Z1bmN0aW9uKHZhbGlkYXRvcikpe1xuXHRcdFx0XHRcdF92YWxpZGF0ZShvcHRpb24sIHZhbHVlLCB2YWxpZGF0b3IpXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHQvLyByZXR1cm4gdmFsaWRhdGlvbiBmdW5jdGlvblxuXHRcdHJldHVybiAob3B0cyk9PiB7XG5cblx0XHRcdC8vIGxvb3AgYWxsIHJlcXVpcmVkIG9wdGlvbnMgYW5kIHZhbGlkYXRlXG5cdFx0XHRsZXQga2V5cyA9IE9iamVjdC5rZXlzKHJlcXVpcmVkKTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRsZXQgb3B0ID0ga2V5c1tpXSxcblx0XHRcdFx0XHR2YWx1ZSA9IG9wdHNbb3B0XTtcblxuXHRcdFx0XHRpZih0eXBlLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignUmVxdWlyZWQgcGFyYW1ldGVyIFwiJyArIG9wdCArICdcIiBub3QgaW4gb3B0aW9ucyBvYmplY3QuJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHR2YWxpZGF0ZU9wdGlvbihvcHQsIHJlcXVpcmVkW29wdF0sIHZhbHVlKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIGxvb3AgYWxsIG9wdGlvbmFsIG9wdGlvbnMgYW5kIHZhbGlkYXRlIGlmIHByZXNlbnRcblx0XHRcdGtleXMgPSBPYmplY3Qua2V5cyhvcHRpb25hbCk7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0bGV0IG9wdCA9IGtleXNbaV0sXG5cdFx0XHRcdFx0dmFsdWUgPSBvcHRzW29wdF07XG5cblx0XHRcdFx0aWYoIXR5cGUuaXNVbmRlZmluZWQodmFsdWUpKSB7XG5cdFx0XHRcdFx0dmFsaWRhdGVPcHRpb24ob3B0LCBvcHRpb25hbFtvcHRdLCB2YWx1ZSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuZXhwb3J0IGRlZmF1bHQge2FkZFJ1bGVzfSIsImltcG9ydCB2YWxpZGF0aW9uIGZyb20gJy4vdmFsaWRhdGlvbi5qcyc7XG5cbmxldCB2YWxpZGF0ZSA9dmFsaWRhdGlvbi5hZGRSdWxlcyh7XG5cdHNpemU6ICdpbnQnXG59KTtcblxubGV0IGhhbm4gPSAoc2l6ZSk9PiB7XG5cdFx0dmFsaWRhdGUoe3NpemU6IHNpemV9KTtcblxuXHRcdGxldCB0YWJsZSA9IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZSksXG5cdFx0XHRjb3MgPSBNYXRoLmNvcyxcblx0XHRcdHR3b1BpID0gTWF0aC5QSSoyO1xuXG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuXHRcdFx0dGFibGVbaV0gPSAwLjUqKDEtY29zKCh0d29QaSppKS9zaXplLTEpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKGkpPT4geyByZXR1cm4gdGFibGVbaV0gfTtcblx0fTtcblxubGV0IGhhbW1pbmcgPSAoc2l6ZSk9PiB7XG5cblx0XHR2YWxpZGF0ZSh7c2l6ZTogc2l6ZX0pO1xuXG5cdFx0bGV0IGFscGhhID0gMC41NCxcblx0XHRcdGJldGEgPSAxLWFscGhhLFxuXHRcdFx0dGFibGUgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUpLFxuXHRcdFx0Y29zID0gTWF0aC5jb3MsXG5cdFx0XHR0d29QaSA9IE1hdGguUEkqMjtcblxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcblx0XHRcdHRhYmxlW2ldID0gYWxwaGEgLSBiZXRhKmNvcyggdHdvUGkqaSAvIHNpemUtMSApO1xuXHRcdH1cblx0XHRyZXR1cm4gKGkpPT4geyByZXR1cm4gdGFibGVbaV0gfTtcblx0fTtcblxubGV0IGJsYWNrbWFuID0gKHNpemUpPT4ge1xuXG5cdFx0dmFsaWRhdGUoe3NpemU6IHNpemV9KTtcblxuXHRcdGxldCBhbHBoYSA9IDAuMTYsXG5cdFx0XHRhMCA9IDEtYWxwaGEvMixcblx0XHRcdGExID0gMC41LFxuXHRcdFx0YTIgPSBhbHBoYS8yLFxuXHRcdFx0dGFibGUgPSBuZXcgRmxvYXQzMkFycmF5KHNpemUpLFxuXHRcdFx0Y29zID0gTWF0aC5jb3MsXG5cdFx0XHR0d29QaSA9IE1hdGguUEkqMjtcblxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcblx0XHRcdHRhYmxlW2ldID0gYTAgLSBhMSpjb3MoIHR3b1BpKmkgLyBzaXplLTEgKSArIGEyKmNvcyggMip0d29QaSppIC8gc2l6ZS0xICk7XG5cdFx0fVxuXHRcdHJldHVybiAoaSk9PiB7IHJldHVybiB0YWJsZVtpXSB9O1xuXHR9O1xuXG5sZXQgYmFydGxldHQgPSAoc2l6ZSk9PiB7XG5cblx0XHR2YWxpZGF0ZSh7c2l6ZTogc2l6ZX0pO1xuXG5cdFx0bGV0IHRhYmxlID0gbmV3IEZsb2F0MzJBcnJheShzaXplKTtcblxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCBzaXplLzI7IGkrKykge1xuXHRcdFx0dGFibGVbaV0gPSAyKmkgLyBzaXplO1xuXHRcdH1cblx0XHRmb3IobGV0IGkgPSBzaXplLzIgO2kgPCBzaXplOyBpKyspIHtcblx0XHRcdHRhYmxlW2ldID0gMiAtICggMippIC8gc2l6ZSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChpKT0+IHsgcmV0dXJuIHRhYmxlW2ldIH07XG5cdH07XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0aGFubixcblx0YmxhY2ttYW4sXG5cdGJhcnRsZXR0LFxuXHRoYW1taW5nXG59Il19
