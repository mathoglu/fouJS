import {utils} from '../../src/fou.js';

describe('Utils', ()=> {

	describe('Type check', ()=> {

		let type, checkTypes;
		beforeEach(()=> {
			type = utils.type;
			checkTypes = (corrects, falses, func)=> {
				for(let i = 0; i < corrects.length; i++) {
					expect(func(corrects[i])).toBeTruthy();
				}

				for(let i = 0; i < falses.length; i++) {
					expect(func(falses[i])).not.toBeTruthy();
				}
			};
		});

		describe('isFunction', ()=> {
			it('should validate type correctly', ()=> {
				// Setup
				let corrects = [(()=> {})],
					falses = ['string', 10, 0.1, [], {}];

				// Action and Assertions
				checkTypes(corrects, falses, type.isFunction);
			});
		});

		describe('isUndefined', ()=> {
			it('should validate type correctly', ()=> {
				// Setup
				let corrects = [],
					falses = ['string', 10, 0.1, [], {}];

				// Action and Assertions
				checkTypes(corrects, falses, type.isUndefined);
			});
		});

		describe('isObject', ()=> {
			it('should validate type correctly', ()=> {
				// Setup
				let corrects = [{}, {a:'a'}],
					falses = ['string', 10, 0.1, []];

				// Action and Assertions
				checkTypes(corrects, falses, type.isObject);
			});
		});

		describe('isEmpty', ()=> {
			it('should validate type correctly', ()=> {
				// Setup
				let corrects = [{}],
					falses = ['string', 10, 0.1, [], {a:'a'}];

				// Action and Assertions
				checkTypes(corrects, falses, type.isEmpty);
			});
		});

		describe('isString', ()=> {
			it('should validate type correctly', ()=> {
				// Setup
				let corrects = ['lol'],
					falses = [ 10, 0.1, [], {}];

				// Action and Assertions
				checkTypes(corrects, falses, type.isString);
			});
		});

		describe('isArray', ()=> {
			it('should validate type correctly', ()=> {
				// Setup
				let corrects = [[],[1,2]],
					falses = ['string', 10, 0.1, {}];

				// Action and Assertions
				checkTypes(corrects, falses, type.isArray);
			});
		});

		describe('isFloat', ()=> {
			it('should validate type correctly', ()=> {
				// Setup
				let corrects = [0.1, 1.2, 0.00001],
					falses = ['string', 10, 0, [], {}];

				// Action and Assertions
				checkTypes(corrects, falses, type.isFloat);
			});
		});
	});
});