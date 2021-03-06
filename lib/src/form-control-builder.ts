import { assign, InvokeConfig, StateNodeConfig, TransitionConfig } from 'xstate';

import { assignErrorMessage, getAsyncTransitionResult } from './util';

import type {
  ValidatorsTransition,
  AsyncValidator,
  AsyncTransitionResult,
  FormControl,
} from './types';

export class FormControlBuilder {
  constructor(private readonly controlName: string, private readonly control: FormControl) {}

  build(): StateNodeConfig<any, any, any> {
    const transitions = this.createTransitions();

    return {
      initial: 'pristine',
      states: {
        pristine: {},
        editing: {},
        valid: {},
        validating: this.createAsyncValidatingService(transitions.async),
        invalid: this.createInvalidStates(),
      },
      on: {
        [`SET_${this.controlName.toUpperCase()}`]: {
          target: '.editing',
          actions: assign({
            [this.controlName]: (ctx: unknown, event: Record<string, string>) =>
              event[this.controlName],
          }),
        },
        [`LEAVE_${this.controlName.toUpperCase()}`]: this.createLeaveTransitions(transitions),
      },
    };
  }

  private createAsyncValidatingService(
    validators: AsyncValidator[] = []
  ): { invoke?: InvokeConfig<any, any> } {
    if (validators.length === 0) return {};

    return {
      invoke: {
        src: (ctx) => Promise.all(this.runAsyncValidators(validators, ctx[this.controlName])),
        onDone: [
          ...this.createAsyncLeaveTransitions(validators),
          {
            target: 'valid',
            actions: assignErrorMessage(this.controlName, ''),
          },
        ],
        onError: {
          target: 'valid',
          actions: (ctx, { data }) => console.error(data)
        },
      },
    };
  }

  private createInvalidStates(): StateNodeConfig<any, any, any> {
    const { validators } = this.control;
    if (validators === undefined) return {};
    if (validators.async === undefined && validators.sync === undefined) return {};

    const { async = [], sync = [] } = validators;
    const initial = [...sync, ...async].shift()?.name;

    if (initial === undefined) {
      throw new Error('Name of initial state does not exist. Please check validators lists.');
    }

    return {
      initial,
      states: Object.fromEntries([...sync, ...async].map(({ name }) => [name, {}])),
    };
  }

  private runAsyncValidators(
    validators: AsyncValidator[],
    value: string
  ): Promise<AsyncTransitionResult>[] {
    return validators.map(({ name, validate }) =>
      validate(value).then((result) => ({ name, result }))
    );
  }

  private createTransitions(): ValidatorsTransition {
    if (this.control.validators === undefined) {
      return { async: [], sync: [] };
    }
    const { async = [], sync = [] } = this.control.validators;

    return {
      async,
      sync: sync.map(({ name, message, validate }) => ({
        target: `.invalid.${name}`,
        cond: (ctx) => !validate(ctx[this.controlName]),
        actions: assignErrorMessage(this.controlName, message),
      })),
    };
  }

  private createLeaveTransitions({
    async,
    sync,
  }: ValidatorsTransition): TransitionConfig<any, any>[] {
    const result: TransitionConfig<any, any>[] = [];
    if (sync.length > 0) result.push(...sync);
    if (async.length > 0) result.push({ target: '.validating' });
    if (async.length === 0)
      result.push({
        target: '.valid',
        actions: assignErrorMessage(this.controlName, ''),
      });

    return result;
  }

  private createAsyncLeaveTransitions(
    async: AsyncValidator[]
  ): TransitionConfig<any, { type: string; data: AsyncTransitionResult[] }>[] {
    return async.map(({ name }) => ({
      target: `invalid.${name}`,
      cond: (ctx, { data }) => {
        const { result } = getAsyncTransitionResult(data, name);

        return !result.valid;
      },
      actions: assign({
        __errorMessages: (ctx, { data }) => {
          const { result } = getAsyncTransitionResult(data, name);

          return {
            ...ctx.__errorMessages,
            [this.controlName]: result.message,
          };
        },
      }),
    }));
  }
}
