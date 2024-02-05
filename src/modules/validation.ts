import { type Validator, type } from "./utils";

const standardValidators = {
    int: ((i: unknown) => {
        return i === parseInt(i as string, 10);
    }) as Validator,
    func: type.isFunction,
    float: type.isFloat,
    bool: type.isBoolean,
    isPowerOfTwo: ((i: number) => {
        const exp = Math.log(i) / Math.LN2;
        return exp === Math.trunc(exp);
    }) as Validator,
};
type RuleSet<T extends string | number | symbol> = Record<
    T,
    | keyof typeof standardValidators
    | (keyof typeof standardValidators | ((value: unknown) => boolean))[]
>;
export function addRules<
    R extends Record<string, unknown>,
    O extends Record<string, unknown>,
>(
    required: RuleSet<keyof R>,
    optional: RuleSet<keyof O> | null = null,
): (input: O & R) => void {
    if (
        !(optional !== null && type.isObject(optional)) ||
        !type.isObject(required)
    ) {
        throw new Error("Inputted specification is not object.");
    }

    if (type.isEmpty(required) && type.isEmpty(optional)) {
        throw new Error("Both inputted specification objects are empty?.");
    }

    const validate = <V>(option: string, value: V, func: Validator) => {
        if (!type.isFunction(func)) {
            throw new Error('No validator for "' + option + '" found.');
        }
        if (!func(value)) {
            throw new Error(
                'Input for "' + option + '" is not valid. Value: ' + value,
            );
        }
    };
    const validateOption = <V>(
        option: string,
        validators: RuleSet<string>[keyof RuleSet<string>],
        value: V,
    ) => {
        if (
            type.isArray<
                (
                    | keyof typeof standardValidators
                    | ((value: unknown) => boolean)
                )[]
            >(validators)
        ) {
            validators.forEach(val => {
                if (type.isString(val)) {
                    validate(option, value, standardValidators[val]);
                } else if (type.isFunction(val)) {
                    validate(option, value, val);
                }
            });
        } else if (type.isString(validators)) {
            validate(option, value, standardValidators[validators]);
        } else if (type.isFunction(validators)) {
            validate(option, value, validators);
        }
    };

    // return validation function
    return (opts: R & O) => {
        // loop all required options and validate

        Object.entries(required).map(([key, value]) => {
            if (type.isUndefined(value)) {
                throw new Error(
                    'Required parameter "' + key + '" not in options object.',
                );
            } else {
                validateOption(key, value, opts[key]);
            }
        });

        // loop all optional options and validate if present
        Object.entries(optional || {}).map(([key, value]) => {
            if (!type.isUndefined(value)) {
                validateOption(key, optional[key], value);
            }
        });
    };
}
