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

		if(type.isUndefined(optional)) {
			optional = {};
		}

		if(type.isUndefined(required)) {
			required = {};
		}

		if( !type.isObject(optional) || !type.isObject(required)) {
			throw new Error('Inputted specification is not object.');
		}

		if( type.isEmpty(required) && type.isEmpty(optional) ) {
			throw new Error('Both inputted specification objects are empty?.');
		}

		let _validate = (option, value, func)=> {
				if (!type.isFunction(func)) {
					throw new Error('No validator for "' + option + '" found.');
				}
				if (!func(value)) {
					throw new Error('Input for "' + option + '" is not valid. Value: ' + value);
				}
			},
			validateOption = (option, validator, value)=> {
				if(type.isArray(validator)) {
					let validatorFunc;

					for(let j = 0; j < validator.length; j++) {
						let val = validator[j];
						if(type.isString(val)) {
							validatorFunc = standardValidators[val];
						}
						else if(type.isFunction(val)) {
							validatorFunc = val;
						}

						_validate(option, value, validatorFunc);
					}
				}
				else if(type.isString(validator)) {
					_validate(option, value, standardValidators[validator]);
				}
				else if(type.isFunction(validator)){
					_validate(option, value, validator)
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
					validateOption(opt, required[opt], value)
				}
			}

			// loop all optional options and validate if present
			keys = Object.keys(optional);
			for (let i = 0; i < keys.length; i++) {
				let opt = keys[i],
					value = opts[opt];

				if(!type.isUndefined(value)) {
					validateOption(opt, optional[opt], value)
				}
			}
		}
	};

export default {addRules}