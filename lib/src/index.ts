import { assign, Machine, StateNodeConfig, TransitionConfig, interpret, InvokeConfig, StateMachine } from 'xstate';
import { mapValues } from 'xstate/lib/utils';
import type {
  ControlValidators,
  ValidatorsTransition,
  AsyncValidator,
  AsyncTransitionResult,
  FormControl,
  FormConfig,
  FormControls
} from './types';

function createValidators(controlName: string, validators?: ControlValidators): ValidatorsTransition {
  if (validators === undefined) {
    return { async: [], sync: [] }
  }
  const { async = [], sync = [] } = validators;

  return {
    async,
    sync: sync.map(({ name, message, validate }) => ({
      target: `.invalid.${name}`,
      cond: ctx => !validate(ctx[controlName]),
      actions: assign({ __errorMessages: ctx => ({ ...ctx.__errorMessages, [controlName]: message }) })
    }))
  }
}

function createLeaveTransitions(controlName: string, { async, sync }: ValidatorsTransition): TransitionConfig<any, any>[] {
  const result: TransitionConfig<any, any>[] = [];
  if (sync.length > 0) result.push(...sync);
  if (async.length > 0) result.push({ target: '.validating' });
  if (async.length === 0) result.push({ target: '.valid', actions: assign({ __errorMessages: ctx => ({ ...ctx.__errorMessages, [controlName]: '' }) }) });

  return result;
}

function createAsyncLeaveTransitions(controlName: string, async: AsyncValidator[]): TransitionConfig<any, { type: string, data: AsyncTransitionResult[] }>[] {
  return async.map(({ name }) => ({
    target: `invalid.${name}`,
    cond: (ctx, { data }) => {
      const foundResult = data.find(r => r.name === name);
      if (foundResult === undefined) {
        throw new Error('Result without name!');
      }

      return !foundResult.result.valid;
    },
    actions: assign({
      __errorMessages: (ctx, { data }) => {
        const foundResult = data.find(r => r.name === name);
        if (foundResult === undefined) {
          throw new Error('Result without name!');
        }

        return { ...ctx.__errorMessages, [controlName]: foundResult.result.message }
      }
    })
  }))
}

function prepareAsyncValidators(transitions: AsyncValidator[], value: string): Promise<AsyncTransitionResult>[] {
  return transitions.map(
    ({ name, validate }) => validate(value).then(result => ({ name, result }))
  )
}

function createValidatingService(controlName: string, validators: AsyncValidator[] = []): { invoke?: InvokeConfig<any, any> } {
  if (validators.length === 0) return {};

  return {
    invoke: {
      src: (ctx, event) => Promise.all(prepareAsyncValidators(validators, ctx[controlName])),
      onDone: [
        ...createAsyncLeaveTransitions(controlName, validators),
        { target: 'valid', actions: assign({ __errorMessages: ctx => ({ ...ctx.__errorMessages, [controlName]: '' }) }) }
      ],
      onError: 'valid'
    }
  }
}

function createInvalidStatesConfig(validators?: ControlValidators): StateNodeConfig<any, any, any> {
  if (validators === undefined) return {};
  if (validators.async === undefined && validators.sync === undefined) return {};
  const { async = [], sync = [] } = validators;

  const initial = [...sync, ...async].shift()?.name;
  if (initial === undefined) {
    throw new Error('Name of initial state does not exist. Please check validators lists.');
  }

  return {
    initial,
    states: Object.fromEntries([...sync, ...async].map(({ name }) => [name, {}]))
  }
}

function createControl(name: string, control: FormControl): StateNodeConfig<any, any, any> {
  const validators = createValidators(name, control.validators);
  return {
    initial: 'pristine',
    states: {
      pristine: {},
      editing: {},
      validating: createValidatingService(name, validators.async),
      valid: {},
      invalid: createInvalidStatesConfig(control.validators)
    },
    on: {
      [`SET_${name.toUpperCase()}`]: {
        target: '.editing',
        actions: assign({ [name]: (ctx: any, event: any) => event[name] })
      },
      [`LEAVE_${name.toUpperCase()}`]: createLeaveTransitions(name, validators)
    }
  }
}

function createControls(controls: FormControls) {
  return mapValues(controls, (control, name) => createControl(name as string, control))
}

export function formMachine(config: FormConfig): StateMachine<any, any, any> {
  return Machine({
    id: 'formMachine',
    initial: 'draft',
    context: {
      ...mapValues(config.controls, control => control.value),
      __errorMessages: mapValues(config.controls, () => '')
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
        states: createControls(config.controls)
      }
    },
    on: {
      SUBMIT: {
        target: 'loading',
        in: {
          draft: mapValues(config.controls, () => 'valid')
        }
      },
    },
  });
}

export function formService(config: FormConfig) {
  return interpret(formMachine(config));
}
