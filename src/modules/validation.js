import {type} from './utils.js';

let standardValidators = {
		int: (i)=> { return i === parseInt(i, 10); },
		func: type.isFunction,
		float: type.isFloat,
		powerOfTwo: (i)=> {
			let exp = Math.log(i) / Math.LN2;
			return exp === parseInt(exp, 10);
		}
	},
	addRules = (required, optional)=> {

		// check for empty input
		if( type.isUndefined(required) || !type.isObject(required)) {
			throw new Error('Inputted specification is not object.');
		}

		if( type.isEmpty(required) ) {
			throw new Error('Inputted empty specification object.');
		}

		let _validate = (option, value, func)=> {
				if (!type.isFunction(func)) {
					throw new Error('No validator for "' + option + '" found.');
				}
				if (!func(value)) {
					throw new Error('Input for "' + option + '" is not valid. Value:', value);
				}
			},
			validateOption = (current, value)=> {
				if(type.isArray(current)) {
					let what,
						validator;

					for(let j = 0; j < current.length; j++) {
						let currType = current[j];
						if(type.isString(currType)) {
							validator = standardValidators[currType];
							what = current;
						}
						else if(type.isFunction(currType)) {
							validator = currType;
							what = 'user inputted function';
						}

						_validate(what, value, validator);
					}
				}
				else if(type.isString(current)) {
					_validate(current, value, standardValidators[current]);
				}
				else if(type.isFunction(current)){
					_validate('user inputted function', value, current)
				}
			};

		// return validation function
		return (opts)=> {

			// loop all required options and validate
			let keys = Object.keys(required);
			for (let i = 0; i < keys.length; i++) {
				let opt = keys[i],
					value = opts[opt];

				if(type.isUndefined(value)) {
					throw new Error('Required parameter "' + opt + '" not in options object.');
				}

				else {
					validateOption(required[opt], value)
				}
			}

			// loop all optional options and validate if present
			keys = Object.keys(optional);
			for (let i = 0; i < keys.length; i++) {
				let opt = keys[i],
					value = opts[opt];

				if(!type.isUndefined(value)) {
					validateOption(optional[opt], value)
				}
			}
		}
	};

export default {addRules}