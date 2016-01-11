import {validation} from '../../src/fou.js';

describe('Validation', ()=> {

	describe('function "addRules"', ()=> {
		it('should return function', ()=> {
			// Setup
			let func = validation.addRules({test: 'int'});

			// Assertions
			expect(func).toEqual(jasmine.any(Function));
		});

		it('should return throw error if input is not object or empty', ()=> {
			// Assertions
			expect(validation.addRules).toThrow( new Error('Inputted specification is not object.') );
			expect(()=> validation.addRules({})).toThrow( new Error('Inputted empty specification object.') );
		});

		describe('returned validation function', ()=> {
			it('should validate standard type "int"', ()=> {
				// Setup
				let func = validation.addRules({test: 'int'});

				let validateCorrect = ()=> {
					func({ test: 1});
				};
				let validateFalse = ()=> {
					func({ test: 'string'});
				};

				// Assertions
				expect(validateCorrect).not.toThrow();
				expect(validateFalse).toThrow();
			});

			it('should validate standard type "func"', ()=> {
				// Setup
				let func = validation.addRules({test: 'func'});

				let validateCorrect = ()=> {
					func({ test: ()=> {}});
				};
				let validateFalse = ()=> {
					func({ test: 'string'});
				};

				// Assertions
				expect(validateCorrect).not.toThrow();
				expect(validateFalse).toThrow();
			});

			it('should validate standard type "powerOfTwo"', ()=> {
				// Setup
				let func = validation.addRules({test: 'powerOfTwo'});

				let validateCorrect = ()=> {
					func({ test: 1024});
				};
				let validateFalse = ()=> {
					func({ test: 1000});
				};

				// Assertions
				expect(validateCorrect).not.toThrow();
				expect(validateFalse).toThrow();
			});

			it('should allow custom validation methods', ()=> {
				// Setup
				let custom = (s)=> { return s === '1337'; };

				// Action
				let func = validation.addRules({test: custom});

				let validateCorrect = ()=> {
					func({ test: '1337'});
				};
				let validateFalse = ()=> {
					func({ test: '1338'});
				};

				// Assertion
				expect(validateCorrect).not.toThrow();
				expect(validateFalse).toThrow();
			})
		});
	});
});