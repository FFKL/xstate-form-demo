import { interpret, Machine, StateMachine, assign} from 'xstate';
import { mapValues } from 'xstate/lib/utils';

import { FormControlBuilder } from './form-control-builder';

import type { FormConfig, FormControls } from './types';

export function formService(config: FormConfig) {
  return interpret(formMachine(config));
}

function formMachine(config: FormConfig): StateMachine<any, any, any> {
  return Machine({
    id: 'formMachine',
    initial: 'draft',
    context: {
      ...mapValues(config.controls, (control) => control.value),
      __errorMessages: mapValues(config.controls, () => ''),
    },
    states: {
      success: { type: 'final' },
      error: {
        on: {
          TRY_AGAIN: {
            target: 'draft',
            actions: assign(() => ({
              ...mapValues(config.controls, (control) => control.value),
              __errorMessages: mapValues(config.controls, () => ''),
            }))
          }
        }
      },
      loading: {
        on: {
          LOAD_SUCCESS: 'success',
          LOAD_ERROR: 'error',
        }
      },
      draft: {
        type: 'parallel',
        states: createControls(config.controls),
      },
    },
    on: {
      SUBMIT: {
        target: 'loading',
        in: {
          draft: mapValues(config.controls, () => 'valid'),
        },
      },
    },
  });
}

function createControls(controls: FormControls) {
  return mapValues(controls, (control, name) =>
    new FormControlBuilder(name as string, control).build()
  );
}
