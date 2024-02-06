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
    required: <T>(r: unknown): r is T => typeof r !== "undefined",
};
type RuleType = keyof typeof standardValidators | ((value: unknown) => boolean);
type RuleSet<T extends string | number | symbol> = Record<T, RuleType[]>;

export function addRules<R extends Record<string, unknown>>(
    rules: RuleSet<keyof R>,
): (input: R) => void {
    if (!type.isObject(rules)) {
        throw new Error("Rules specification is not an object.");
    }

    if (type.isEmpty(rules)) {
        throw new Error("Rules specification is empty.");
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
    return (opts: R) => {
        const required = Object.entries(rules).filter(
            ([, value]) => value.indexOf("required") > 0,
        );
        const optional = Object.entries(rules).filter(
            ([, value]) => value.indexOf("required") < 0,
        );
        // loop all required options and validate
        required.map(([key, ruleDefinitions]) => {
            if (type.isUndefined(opts[key])) {
                throw new Error(
                    'Required parameter "' + key + '" not in options object.',
                );
            } else {
                validateOption(key, ruleDefinitions, opts[key]);
            }
        });

        // loop all optional options and validate if present
        optional.map(([key, ruleDefinitions]) => {
            if (!type.isUndefined(opts[key])) {
                validateOption(key, ruleDefinitions, opts[key]);
            }
        });
    };
}
