(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _modulesAnalyserJs = require('./modules/analyser.js');

var _modulesAnalyserJs2 = _interopRequireDefault(_modulesAnalyserJs);

var _modulesDftJs = require('./modules/dft.js');

var _modulesDftJs2 = _interopRequireDefault(_modulesDftJs);

var _modulesFftJs = require('./modules/fft.js');

var _modulesFftJs2 = _interopRequireDefault(_modulesFftJs);

var _modulesUtilsJs = require('./modules/utils.js');

var _modulesUtilsJs2 = _interopRequireDefault(_modulesUtilsJs);

exports['default'] = {
	analyser: _modulesAnalyserJs2['default'],
	dft: _modulesDftJs2['default'],
	fft: _modulesFftJs2['default'],
	utils: _modulesUtilsJs2['default']
};
module.exports = exports['default'];

},{"./modules/analyser.js":2,"./modules/dft.js":3,"./modules/fft.js":4,"./modules/utils.js":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var analyser = function analyser(opts) {

	var bufferStore = undefined,
	    start = 0,
	    N = opts.N;

	var hopSize = opts.hopSize,
	    tFunc = opts.transformFunction;

	return function (input) {
		// first run
		if (typeof bufferStore === 'undefined') {
			// Initialize as max size
			bufferStore = new Float32Array(N + hopSize);

			// set to only contain what is needed to next iteration
			bufferStore.set(input.subarray(N - hopSize, N), 0);

			return tFunc(input);
		}
		// Concat input with buffer store
		bufferStore.set(input, hopSize);

		// Slice out what is needed for this analysis iteration
		var data = bufferStore.subarray(start, opts.N);

		// Remove used data
		bufferStore.set(bufferStore.subarray(N - hopSize, bufferStore.length), 0);

		return tFunc(data);
	};
};

exports['default'] = analyser;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _validationJs = require('./validation.js');

var _validationJs2 = _interopRequireDefault(_validationJs);

var _utilsJs = require('./utils.js');

var bandWidth = undefined,
    freqForBin = function freqForBin(nr) {
	return bandWidth * nr + bandWidth / 2;
};

var dft = function dft(opts) {

	if (!_validationJs2['default'].options(opts)) {
		return null;
	}

	var sin = (0, _utilsJs.table)('sin', opts.N * opts.N / 2, opts.N),
	    cos = (0, _utilsJs.table)('cos', opts.N * opts.N / 2, opts.N),
	    output = undefined;

	if (opts.complex) {
		output = [];
	} else {
		output = new Float32Array(opts.N / 2);
	}

	bandWidth = opts.Fs / opts.N;

	var dftFunc = function dftFunc(input) {

		var distance = function distance(r, i) {
			return Math.sqrt(r * r + i * i);
		},
		    windowSize = opts.N,
		    img = undefined,
		    real = undefined,
		    _output = output,
		    _sin = sin,
		    _cos = cos;

		for (var k = 0; k < windowSize / 2; k++) {

			img = 0.0;
			real = 0.0;

			for (var n = 0; n < input.length; n++) {
				real += input[n] * _cos[n * k];
				img += input[n] * _sin[n * k];
			}

			_output[k] = 2 * distance(real, img) / windowSize;
		}
	};

	return { dftFunc: dftFunc, output: output, freqForBin: freqForBin };
};

exports['default'] = dft;
module.exports = exports['default'];

},{"./utils.js":5,"./validation.js":6}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _validationJs = require('./validation.js');

var _validationJs2 = _interopRequireDefault(_validationJs);

var _utilsJs = require('./utils.js');

var bandWidth = undefined,
    freqForBin = function freqForBin(nr) {
	return bandWidth * nr + bandWidth / 2;
};

var fft = function fft(opts) {

	if (!_validationJs2['default'].options(opts, {})) {
		return null;
	}

	var sin = _utilsJs.trigonometric.sin,
	    cos = _utilsJs.trigonometric.cos;

	var fftFunc = function fftFunc(input) {
		var N = input.length;

		if (N == 1) {
			return [{ r: input[0], i: 0 }];
		} else {
			var _splitEvenOdd = (0, _utilsJs.splitEvenOdd)(input);

			var even = _splitEvenOdd.even;
			var odd = _splitEvenOdd.odd;
			var inputEven = fftFunc(even);
			var inputOdd = fftFunc(odd);
			var output = [];
			var t = undefined;
			var e = undefined;

			for (var i = 0; i < N / 2; i++) {
				t = inputEven[i];
				e = _utilsJs.complex.multiply({ r: cos(i, N), i: sin(i, N) }, inputOdd[i]);

				output[i] = _utilsJs.complex.add(t, e);
				output[i + N / 2] = _utilsJs.complex.subtract(t, e);
			}
			return output;
		}
	};

	return { fftFunc: fftFunc, freqForBin: freqForBin };
};

exports['default'] = { fft: fft };
module.exports = exports['default'];

},{"./utils.js":5,"./validation.js":6}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});
var db = function db(x, type) {
	return 10 * Math.log(x);
};

var sqrt = Math.sqrt,
    mag = function mag(point) {
	return sqrt(point.r * point.r + point.i * point.i);
};

var table = function table(type, length, windowSize) {

	var _sin = function _sin(N) {
		var table = new Float32Array(N),
		    twoPi = Math.PI * 2;
		for (var i = 0; i < N; i++) {
			table[i] = Math.sin(twoPi * i / windowSize);
		}
		return table;
	},
	    _cos = function _cos(N) {
		var table = new Float32Array(N),
		    twoPi = Math.PI * 2;
		for (var i = 0; i < N; i++) {
			table[i] = Math.cos(-twoPi * i / windowSize);
		}
		return table;
	};

	if (type === 'sin') {
		return _sin(length);
	} else if (type === 'cos') {
		return _cos(length);
	} else {
		return [];
	}
};

var sinus = Math.sin,
    cosinus = Math.cos,
    twoPi = Math.PI * 2,
    trigonometric = {
	sin: function sin(k, N) {
		return sinus(-twoPi * (k / N));
	},
	cos: function cos(k, N) {
		return cosinus(-twoPi * (k / N));
	}
};

var splitEvenOdd = function splitEvenOdd(array) {
	var even = [],
	    odd = [];

	for (var i = 0; i < array.length; i++) {
		if ((i + 2) % 2 == 0) {
			even.push(array[i]);
		} else {
			odd.push(array[i]);
		}
	}
	return { even: even, odd: odd };
};

var complex = {
	add: function add(a, b) {
		return { r: a.r + b.r, i: a.i + b.i };
	},
	subtract: function subtract(a, b) {
		return { r: a.r - b.r, i: a.i - b.i };
	},
	multiply: function multiply(a, b) {
		return {
			r: a.r * b.r - a.i * b.i,
			i: a.r * b.i + a.i * b.r
		};
	}
};

var formatters = {
	magnitude: function magnitude(x) {
		return 2 * distance(real, img) / windowSize;
	}
};

exports['default'] = {
	db: db,
	mag: mag,
	table: table,
	splitEvenOdd: splitEvenOdd,
	complex: complex,
	formatters: formatters,
	trigonometric: trigonometric
};
module.exports = exports['default'];

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var options = function options(opts, spec) {

	//for(let [opt, value] of opts) {
	//	console.log(opt, value);
	//	if(!spec.hasOwnProperty(opt)) {throw new Error('Inputted option "' + opt + '" not allowed')}
	//
	//}
	//if (!opts.hasOwnProperty('Fs')) {
	//	throw new Error('Options need to contain sampling frequency "Fs"');
	//}
	//
	//if (!opts.hasOwnProperty('N')) {
	//	throw new Error('Options need to contain window size "N"');
	//}

	return true;
};

exports["default"] = { options: options };
module.exports = exports["default"];

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9taG9nL1Byb2plY3RzL2RpcHBhbmkvZm91SlMvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL21ob2cvUHJvamVjdHMvZGlwcGFuaS9mb3VKUy9zcmMvZmFrZV83MjkwZGFhYS5qcyIsIi9Vc2Vycy9taG9nL1Byb2plY3RzL2RpcHBhbmkvZm91SlMvc3JjL21vZHVsZXMvYW5hbHlzZXIuanMiLCIvVXNlcnMvbWhvZy9Qcm9qZWN0cy9kaXBwYW5pL2ZvdUpTL3NyYy9tb2R1bGVzL2RmdC5qcyIsIi9Vc2Vycy9taG9nL1Byb2plY3RzL2RpcHBhbmkvZm91SlMvc3JjL21vZHVsZXMvZmZ0LmpzIiwiL1VzZXJzL21ob2cvUHJvamVjdHMvZGlwcGFuaS9mb3VKUy9zcmMvbW9kdWxlcy91dGlscy5qcyIsIi9Vc2Vycy9taG9nL1Byb2plY3RzL2RpcHBhbmkvZm91SlMvc3JjL21vZHVsZXMvdmFsaWRhdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7O2lDQ0FxQix1QkFBdUI7Ozs7NEJBQzVCLGtCQUFrQjs7Ozs0QkFDbEIsa0JBQWtCOzs7OzhCQUNoQixvQkFBb0I7Ozs7cUJBRXZCO0FBQ2QsU0FBUSxnQ0FBQTtBQUNSLElBQUcsMkJBQUE7QUFDSCxJQUFHLDJCQUFBO0FBQ0gsTUFBSyw2QkFBQTtDQUNMOzs7Ozs7Ozs7QUNWRCxJQUFJLFFBQVEsR0FBRyxTQUFYLFFBQVEsQ0FBSSxJQUFJLEVBQUk7O0FBRXZCLEtBQUksV0FBVyxZQUFBO0tBQ2QsS0FBSyxHQUFHLENBQUM7S0FDVCxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFWixLQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTztLQUMzQixLQUFLLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDOztBQUVoQyxRQUFP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QUNoQixTQUFPLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFDLEdBQUcsQ0FBQyxHQUFHLFVBQVUsQ0FBQztFQUMzQztDQUNELENBQUM7O3FCQUVhO0FBQ2QsR0FBRSxFQUFGLEVBQUU7QUFDRixJQUFHLEVBQUgsR0FBRztBQUNILE1BQUssRUFBTCxLQUFLO0FBQ0wsYUFBWSxFQUFaLFlBQVk7QUFDWixRQUFPLEVBQVAsT0FBTztBQUNQLFdBQVUsRUFBVixVQUFVO0FBQ1YsY0FBYSxFQUFiLGFBQWE7Q0FDYjs7Ozs7Ozs7O0FDdkZELElBQUksT0FBTyxHQUFHLFNBQVYsT0FBTyxDQUFJLElBQUksRUFBRSxJQUFJLEVBQUk7Ozs7Ozs7Ozs7Ozs7OztBQWU1QixRQUFPLElBQUksQ0FBQztDQUNaLENBQUM7O3FCQUVhLEVBQUMsT0FBTyxFQUFQLE9BQU8sRUFBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgYW5hbHlzZXIgZnJvbSAnLi9tb2R1bGVzL2FuYWx5c2VyLmpzJztcbmltcG9ydCBkZnQgZnJvbSAnLi9tb2R1bGVzL2RmdC5qcyc7XG5pbXBvcnQgZmZ0IGZyb20gJy4vbW9kdWxlcy9mZnQuanMnO1xuaW1wb3J0IHV0aWxzIGZyb20gJy4vbW9kdWxlcy91dGlscy5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0YW5hbHlzZXIsXG5cdGRmdCxcblx0ZmZ0LFxuXHR1dGlsc1xufTsiLCJsZXQgYW5hbHlzZXIgPSAob3B0cyk9PiB7XG5cblx0bGV0IGJ1ZmZlclN0b3JlLFxuXHRcdHN0YXJ0ID0gMCxcblx0XHROID0gb3B0cy5OO1xuXG5cdGNvbnN0IGhvcFNpemUgPSBvcHRzLmhvcFNpemUsXG5cdFx0dEZ1bmMgPSBvcHRzLnRyYW5zZm9ybUZ1bmN0aW9uO1xuXG5cdHJldHVybiAoaW5wdXQpPT4ge1xuXHRcdC8vIGZpcnN0IHJ1blxuXHRcdGlmKHR5cGVvZiBidWZmZXJTdG9yZSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdC8vIEluaXRpYWxpemUgYXMgbWF4IHNpemVcblx0XHRcdGJ1ZmZlclN0b3JlID0gbmV3IEZsb2F0MzJBcnJheShOICsgaG9wU2l6ZSk7XG5cblx0XHRcdC8vIHNldCB0byBvbmx5IGNvbnRhaW4gd2hhdCBpcyBuZWVkZWQgdG8gbmV4dCBpdGVyYXRpb25cblx0XHRcdGJ1ZmZlclN0b3JlLnNldChpbnB1dC5zdWJhcnJheShOIC0gaG9wU2l6ZSwgTiksIDApO1xuXG5cdFx0XHRyZXR1cm4gdEZ1bmMoaW5wdXQpO1xuXHRcdH1cblx0XHQvLyBDb25jYXQgaW5wdXQgd2l0aCBidWZmZXIgc3RvcmVcblx0XHRidWZmZXJTdG9yZS5zZXQoaW5wdXQsIGhvcFNpemUpO1xuXG5cdFx0Ly8gU2xpY2Ugb3V0IHdoYXQgaXMgbmVlZGVkIGZvciB0aGlzIGFuYWx5c2lzIGl0ZXJhdGlvblxuXHRcdGxldCBkYXRhID0gYnVmZmVyU3RvcmUuc3ViYXJyYXkoc3RhcnQsIG9wdHMuTik7XG5cblx0XHQvLyBSZW1vdmUgdXNlZCBkYXRhXG5cdFx0YnVmZmVyU3RvcmUuc2V0KGJ1ZmZlclN0b3JlLnN1YmFycmF5KE4gLSBob3BTaXplLCBidWZmZXJTdG9yZS5sZW5ndGgpLCAwKTtcblxuXHRcdHJldHVybiB0RnVuYyhkYXRhKTtcblx0fTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFuYWx5c2VyOyIsImltcG9ydCB2YWxpZGF0ZSBmcm9tICcuL3ZhbGlkYXRpb24uanMnO1xuaW1wb3J0IHt0YWJsZSwgZm9ybWF0dGVyc30gZnJvbSAnLi91dGlscy5qcyc7XG5cbmxldCBiYW5kV2lkdGgsXG5cdGZyZXFGb3JCaW4gPSAobnIpPT4ge1xuXHRcdHJldHVybiBiYW5kV2lkdGggKiBuciArIGJhbmRXaWR0aCAvIDJcblx0fTtcblxubGV0IGRmdCA9IChvcHRzKT0+IHtcblxuXHRpZiAoIXZhbGlkYXRlLm9wdGlvbnMob3B0cykpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdGxldCBzaW4gPSB0YWJsZSggJ3NpbicsIG9wdHMuTiAqIG9wdHMuTi8yLCBvcHRzLk4gKSxcblx0XHRjb3MgPSB0YWJsZSggJ2NvcycsIG9wdHMuTiAqIG9wdHMuTi8yLCBvcHRzLk4gKSxcblx0XHRvdXRwdXQ7XG5cblx0aWYgKG9wdHMuY29tcGxleCkge1xuXHRcdG91dHB1dCA9IFtdO1xuXHR9XG5cdGVsc2Uge1xuXHRcdG91dHB1dCA9IG5ldyBGbG9hdDMyQXJyYXkoIG9wdHMuTi8yICk7XG5cdH1cblxuXHRiYW5kV2lkdGggPSAob3B0cy5GcyAvIG9wdHMuTik7XG5cblx0bGV0IGRmdEZ1bmMgPSAoaW5wdXQpPT4ge1xuXG5cdFx0bGV0IGRpc3RhbmNlID0gKHIsIGkpPT4geyByZXR1cm4gTWF0aC5zcXJ0KChyKnIpICsgKGkqaSkpOyB9LFxuXHRcdFx0d2luZG93U2l6ZSA9IG9wdHMuTixcblx0XHRcdGltZyxcblx0XHRcdHJlYWwsXG5cdFx0XHRfb3V0cHV0ID0gb3V0cHV0LFxuXHRcdFx0X3NpbiA9IHNpbixcblx0XHRcdF9jb3MgPSBjb3M7XG5cblx0XHRmb3IobGV0IGsgPSAwOyBrIDwgd2luZG93U2l6ZS8yOyBrKyspIHtcblxuXHRcdFx0aW1nID0gMC4wO1xuXHRcdFx0cmVhbCA9IDAuMDtcblxuXHRcdFx0Zm9yKGxldCBuID0gMDsgbiA8IGlucHV0Lmxlbmd0aDsgbisrKSB7XG5cdFx0XHRcdHJlYWwgKz0gaW5wdXRbbl0gKiBfY29zW24qa107XG5cdFx0XHRcdGltZyArPSBpbnB1dFtuXSAqIF9zaW5bbiprXTtcblx0XHRcdH1cblxuXHRcdFx0X291dHB1dFtrXSA9IDIgKiBkaXN0YW5jZShyZWFsLGltZykgLyB3aW5kb3dTaXplO1xuXG5cdFx0fVxuXHR9O1xuXG5cdHJldHVybiB7ZGZ0RnVuYywgb3V0cHV0LCBmcmVxRm9yQmlufVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZGZ0IiwiaW1wb3J0IHZhbGlkYXRlIGZyb20gJy4vdmFsaWRhdGlvbi5qcyc7XG5pbXBvcnQge3NwbGl0RXZlbk9kZCwgY29tcGxleCwgdHJpZ29ub21ldHJpY30gZnJvbSAnLi91dGlscy5qcyc7XG5cbmxldCBiYW5kV2lkdGgsXG5cdGZyZXFGb3JCaW4gPSAobnIpPT4ge1xuXHRcdHJldHVybiBiYW5kV2lkdGggKiBuciArIGJhbmRXaWR0aCAvIDJcblx0fTtcblxubGV0IGZmdCA9IChvcHRzKT0+IHtcblxuXHRpZiAoIXZhbGlkYXRlLm9wdGlvbnMob3B0cywge30pKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHRsZXQgc2luID0gdHJpZ29ub21ldHJpYy5zaW4sXG5cdFx0Y29zID0gdHJpZ29ub21ldHJpYy5jb3M7XG5cblx0bGV0IGZmdEZ1bmMgPSAoaW5wdXQpPT4ge1xuXHRcdGxldCBOID0gaW5wdXQubGVuZ3RoO1xuXG5cdFx0aWYoTiA9PSAxKSB7XG5cdFx0XHRyZXR1cm4gW3tyOiBpbnB1dFswXSwgaTogMH1dO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdGxldCB7ZXZlbiwgb2RkfSA9IHNwbGl0RXZlbk9kZChpbnB1dCksXG5cdFx0XHRcdGlucHV0RXZlbiA9IGZmdEZ1bmMoZXZlbiksXG5cdFx0XHRcdGlucHV0T2RkID0gZmZ0RnVuYyhvZGQpLFxuXHRcdFx0XHRvdXRwdXQgPSBbXSxcblx0XHRcdFx0dCxcblx0XHRcdFx0ZTtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBOIC8gMjsgaSsrKSB7XG5cdFx0XHRcdHQgPSBpbnB1dEV2ZW5baV07XG5cdFx0XHRcdGUgPSBjb21wbGV4Lm11bHRpcGx5KHtyOiBjb3MoaSwgTiksIGk6IHNpbihpLCBOKX0sIGlucHV0T2RkW2ldKTtcblxuXHRcdFx0XHRvdXRwdXRbaV0gPSBjb21wbGV4LmFkZCh0LCBlKTtcblx0XHRcdFx0b3V0cHV0W2kgKyAoTiAvIDIpXSA9IGNvbXBsZXguc3VidHJhY3QodCwgZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb3V0cHV0O1xuXHRcdH1cblxuXHR9O1xuXG5cdHJldHVybiB7ZmZ0RnVuYywgZnJlcUZvckJpbn1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtmZnR9IiwibGV0IGRiID0gKHgsIHR5cGUpPT4ge1xuXHRyZXR1cm4gMTAqTWF0aC5sb2coeCk7XG59O1xuXG5sZXQgc3FydCA9IE1hdGguc3FydCxcblx0bWFnID0gKHBvaW50KT0+IHtcblx0XHRyZXR1cm4gc3FydChwb2ludC5yICogcG9pbnQuciArIHBvaW50LmkgKiBwb2ludC5pKTtcblx0fTtcblxubGV0IHRhYmxlID0gKHR5cGUsIGxlbmd0aCwgd2luZG93U2l6ZSk9PiB7XG5cblx0bGV0IF9zaW4gPSAoIE4gKT0+IHtcblx0XHRcdGxldCB0YWJsZSA9IG5ldyBGbG9hdDMyQXJyYXkoIE4gKSxcblx0XHRcdFx0dHdvUGkgPSBNYXRoLlBJICogMjtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgTjsgaSsrKSB7XG5cdFx0XHRcdHRhYmxlW2ldID0gTWF0aC5zaW4oIHR3b1BpICogaSAvIHdpbmRvd1NpemUgKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRhYmxlXG5cdFx0fSxcblx0XHRfY29zID0gKCBOICk9PiB7XG5cdFx0XHRsZXQgdGFibGUgPSBuZXcgRmxvYXQzMkFycmF5KCBOICksXG5cdFx0XHRcdHR3b1BpID0gTWF0aC5QSSAqIDI7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IE47IGkrKykge1xuXHRcdFx0XHR0YWJsZVtpXSA9IE1hdGguY29zKCAtdHdvUGkgKiBpIC8gd2luZG93U2l6ZSApXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGFibGVcblx0XHR9O1xuXG5cdGlmKHR5cGUgPT09ICdzaW4nKSB7XG5cdFx0cmV0dXJuIF9zaW4obGVuZ3RoKTtcblx0fVxuXHRlbHNlIGlmICh0eXBlID09PSAnY29zJykge1xuXHRcdHJldHVybiBfY29zKGxlbmd0aCk7XG5cdH1cblx0ZWxzZSB7XG5cdFx0cmV0dXJuIFtdO1xuXHR9XG59O1xuXG5sZXQgc2ludXMgPSBNYXRoLnNpbixcblx0Y29zaW51cyA9IE1hdGguY29zLFxuXHR0d29QaSA9IE1hdGguUEkgKiAyLFxuXHR0cmlnb25vbWV0cmljID0ge1xuXHRcdHNpbjogKGssIE4pPT57IHJldHVybiBzaW51cyggLXR3b1BpICogKGsgLyBOKSApIH0sXG5cdFx0Y29zOiAoaywgTik9PiB7IHJldHVybiBjb3NpbnVzKCAtdHdvUGkgKiAoayAvIE4pICkgfVxuXHR9O1xuXG5sZXQgc3BsaXRFdmVuT2RkID0gKGFycmF5KT0+IHtcblx0bGV0IGV2ZW4gPSBbXSxcblx0XHRvZGQgPSBbXTtcblxuXHRmb3IobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcblx0XHRpZigoaSsyKSAlIDIgPT0gMCkge1xuXHRcdFx0ZXZlbi5wdXNoKGFycmF5W2ldKVxuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdG9kZC5wdXNoKGFycmF5W2ldKVxuXHRcdH1cblx0fVxuXHRyZXR1cm4ge2V2ZW46IGV2ZW4sIG9kZDogb2RkfVxufTtcblxubGV0IGNvbXBsZXggPSB7XG5cdGFkZDogKGEsIGIpPT4geyByZXR1cm4geyByOiBhLnIgKyBiLnIsIGk6IGEuaSArIGIuaSAgfSB9LFxuXHRzdWJ0cmFjdDogKGEsIGIpPT4geyByZXR1cm4geyByOiBhLnIgLSBiLnIsIGk6IGEuaSAtIGIuaSAgfSB9LFxuXHRtdWx0aXBseTogKGEsIGIpPT4ge1xuXHRcdHJldHVybiB7XG5cdFx0XHRyOiAoYS5yICogYi5yIC0gYS5pICogYi5pKSxcblx0XHRcdGk6IChhLnIgKiBiLmkgKyBhLmkgKiBiLnIpXG5cdFx0fVxuXHR9XG59O1xuXG5sZXQgZm9ybWF0dGVycyA9IHtcblx0bWFnbml0dWRlOiAoeCk9PiB7XG5cdFx0cmV0dXJuIDIgKiBkaXN0YW5jZShyZWFsLGltZykgLyB3aW5kb3dTaXplO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cdGRiLFxuXHRtYWcsXG5cdHRhYmxlLFxuXHRzcGxpdEV2ZW5PZGQsXG5cdGNvbXBsZXgsXG5cdGZvcm1hdHRlcnMsXG5cdHRyaWdvbm9tZXRyaWNcbn0iLCJsZXQgb3B0aW9ucyA9IChvcHRzLCBzcGVjKT0+IHtcblxuXHQvL2ZvcihsZXQgW29wdCwgdmFsdWVdIG9mIG9wdHMpIHtcblx0Ly9cdGNvbnNvbGUubG9nKG9wdCwgdmFsdWUpO1xuXHQvL1x0aWYoIXNwZWMuaGFzT3duUHJvcGVydHkob3B0KSkge3Rocm93IG5ldyBFcnJvcignSW5wdXR0ZWQgb3B0aW9uIFwiJyArIG9wdCArICdcIiBub3QgYWxsb3dlZCcpfVxuXHQvL1xuXHQvL31cblx0Ly9pZiAoIW9wdHMuaGFzT3duUHJvcGVydHkoJ0ZzJykpIHtcblx0Ly9cdHRocm93IG5ldyBFcnJvcignT3B0aW9ucyBuZWVkIHRvIGNvbnRhaW4gc2FtcGxpbmcgZnJlcXVlbmN5IFwiRnNcIicpO1xuXHQvL31cblx0Ly9cblx0Ly9pZiAoIW9wdHMuaGFzT3duUHJvcGVydHkoJ04nKSkge1xuXHQvL1x0dGhyb3cgbmV3IEVycm9yKCdPcHRpb25zIG5lZWQgdG8gY29udGFpbiB3aW5kb3cgc2l6ZSBcIk5cIicpO1xuXHQvL31cblxuXHRyZXR1cm4gdHJ1ZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHtvcHRpb25zfSJdfQ==
