import { assign, Machine, StateNodeConfig, TransitionConfig, interpret } from 'xstate';

const AsyncFunction = (async () => { }).constructor;

type AsyncValidator = (value: string) => Promise<boolean>;

type SyncValidator = (value: string) => boolean;

type InputValidator = AsyncValidator | SyncValidator;

interface InputValidators {
  [name: string]: InputValidator;
}

interface FormInput {
  validators: InputValidators;
}

interface FormInputs {
  [name: string]: FormInput
}

interface FormConfig {
  inputs: FormInputs;
}

interface AsyncTransition {
  name: string;
  validate: AsyncValidator;
}

type SyncTransition = TransitionConfig<any, any>;

interface ValidatorsTransition {
  async: AsyncTransition[];
  sync: SyncTransition[];
}

function createValidators(inputName: string, validators: InputValidators): ValidatorsTransition {
  const entires = Object.entries(validators);

  return {
    async: entires
      .filter((e): e is [string, AsyncValidator] => e[1] instanceof AsyncFunction)
      .map(([name, validate]) => ({ name, validate })),
    sync: entires
      .filter((e): e is [string, SyncValidator] => !(e[1] instanceof AsyncFunction))
      .map(([name, validate]) => ({ target: `.invalid.${name}`, cond: ctx => validate(ctx[inputName]) }))
  }
}

function createLeaveTransitions({ async, sync }: ValidatorsTransition): TransitionConfig<any, any>[] {
  const result: TransitionConfig<any, any>[] = [];
  if (sync.length > 0) result.push(...sync);
  if (async.length > 0) result.push({ target: '.validating' });
  if (async.length === 0) result.push({ target: '.valid' });

  return result;
}

function createInput(name: string, input: FormInput): StateNodeConfig<any, any, any> {
  const validators = createValidators(name, input.validators);
  return {
    initial: 'pristine',
    states: {
      pristine: {},
      editing: {},
      validating: {
        invoke: {
          src: (ctx, event) => Promise.all(validators.async),
          onDone: [
            {
              target: 'valid',
              // cond: (ctx, { data }) => data.every()
            },
            {
              target: 'valid'
            }
          ],
          onError: 'valid'
        }
      },
      valid: {},
      invalid: {
        initial: 'empty',
        states: Object.fromEntries(Object.keys(input.validators).map(key => [key, {}]))
      }
    },
    on: {
      [`SET_${name.toUpperCase()}`]: {
        target: '.editing',
        actions: assign({ [name]: (ctx: any, event: any) => event[name] })
      },
      [`LEAVE_${name.toUpperCase()}`]: createLeaveTransitions(validators)
    }
  }
}

function createInputStates(inputs: FormInputs) {
  return Object.fromEntries(Object.entries(inputs).map(([name, config]) => [name, createInput(name, config)]));
}

export function formMachine<C extends object>(config: FormConfig) {
  return Machine<C>({
    id: 'formMachine',
    initial: 'draft',
    context: {
      ...Object.fromEntries(Object.keys(config.inputs).map(key => [key, ''])) as C,
      asyncValidationResult: []
    },
    states: {
      success: { type: 'final' },
      error: { type: 'final' },
      loading: {
        on: {
          LOAD_SUCCESS: 'success',
          LOAD_ERROR: 'error',
        },
      },
      draft: {
        type: 'parallel',
        states: createInputStates(config.inputs)
      }
    },
    on: {
      SUBMIT: {
        target: 'loading',
        in: {
          draft: Object.fromEntries(Object.keys(config.inputs).map(key => [key, 'valid']))
        }
      },
    },
  });
}

export function formService(config: FormConfig) {
  return interpret(formMachine(config));
}

const formConfig: FormConfig = {
  inputs: {
    message: {
      validators: {
        empty: (val: string) => val.length === 0,
        minLength: (val: string) => val.length < 4,
      },
    },
    email: {
      validators: {
        empty: (val: string) => val.length === 0,
        incorrectEmail: (val: string) => !val.includes('@'),
        unregistered: async (val: string) => Promise.resolve(true),
      },
    },
  }
};

const generatedForm = formMachine(formConfig);
