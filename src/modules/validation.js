import {type} from './utils.js';

let standardValidators = {
		int: (i)=> { return i === parseInt(i, 10); },
		func: type.isFunction,
		powerOfTwo: (i)=> {
			let exp = Math.log(i) / Math.LN2;
			return exp === parseInt(exp, 10);
		}
	},
	addRules = (spec)=> {

		// check for empty input
		if( type.isUndefined(spec) || !type.isObject(spec)) {
			throw new Error('Inputted specification is not object.');
		}

		if( type.isEmpty(spec) ) {
			throw new Error('Inputted empty specification object.');
		}
		let validate = (option, value, func)=> {
			if (!type.isFunction(func)) {
				throw new Error('No validator for "' + option + '" found.');
			}
			if (!func(value)) {
				throw new Error('Input "' + option + '" is not valid. Value:', value);
			}
		};
		// return validation function
		return (opts)=> {

			// loop all options and validate
			let keys = Object.keys(opts);
			for (let i = 0; i < keys.length; i++) {
				let opt = keys[i],
					value = opts[opt];

				if (!spec.hasOwnProperty(opt)) {
					throw new Error('Inputted option "' + opt + '" not allowed')
				}

				else {
					let validator,
						current = spec[opt];

					if(type.isArray(current)) {
						let what;
						current.forEach((type)=> {
							if(type.isString(type)) {
								validator = standardValidators[type];
								what = current;
							}
							else if(type.isFunction(type)) {
								validator = type;
								what = 'user inputted function';
							}

							validate(what, value, validator);
						});
					}
					else if(type.isString(current)) {
						validate(current, value, standardValidators[current]);
					}
					else if(type.isFunction(current)){
						validate('user inputted function', value, current)
					}
				}
			}
		}
	};

export default {addRules}