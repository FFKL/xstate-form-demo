import { Machine, assign } from 'xstate';

const testFormMachine = Machine<{ message: string }>({
  id: 'form',
  initial: 'draft',
  context: {
    message: '',
  },
  states: {
    loading: {
      on: {
        LOAD_SUCCESS: 'success',
        LOAD_ERROR: 'error',
      },
    },
    success: { type: 'final' },
    error: { type: 'final' },
    draft: {
      type: 'parallel',
      states: {
        message: {
          initial: 'pristine',
          states: {
            pristine: {},
            editing: {},
            validating: {
              on: {
                RESOLVE: 'valid',
                REJECT: 'invalid.pending',
              }
            },
            valid: {},
            invalid: {
              initial: 'empty',
              states: {
                empty: {},
                pending: {},
              }
            }
          },
          on: {
            SET_MESSAGE: {
              target: '.editing',
              actions: assign({
                message: (ctx, event) => event['msg'],
              })
            },
            LEAVE: [
              {
                target: '.invalid.empty',
                cond: (ctx) => ctx.message.length === 0
              },
              {
                target: '.validating'
              }
            ]
          }
        },
        email: {
          initial: 'pristine',
          states: {
            pristine: {},
            editing: {},
            validating: {
              on: {
                RESOLVE: 'valid',
                REJECT: 'invalid.pending',
              }
            },
            valid: {},
            invalid: {
              initial: 'empty',
              states: {
                empty: {},
                pending: {},
              }
            }
          },
          on: {
            SET_MESSAGE: {
              target: '.editing',
              actions: assign({
                message: (ctx, event) => event['msg'],
              })
            },
            LEAVE: [
              {
                target: '.invalid.empty',
                cond: ctx => ctx.message.length === 0
              },
              {
                target: '.validating'
              }
            ]
          }
        }
      },
      on: {
        SUBMIT: {
          target: 'loading',
          in: {
            draft: {
              message: 'valid',
              email: 'valid'
            }
          }
        },
      },
    }
  }
});
