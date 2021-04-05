import { Machine, assign } from 'xstate';

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

// const inputMachine = Machine(
//   {
//     id: 'input',
//     initial: 'pristine',
//     context: {
//       message: '',
//     },
//     states: {
//       pristine: {},
//       editing: {},
//       validating: {
//         on: {
//           RESOLVE: 'valid',
//           REJECT: 'invalid.pending',
//         }
//       },
//       valid: {},
//       invalid: {
//         initial: 'empty',
//         states: {
//           empty: {},
//           pending: {},
//         }
//       }
//     },
//     on: {
//       SET_MESSAGE: {
//         target: 'editing',
//         actions: assign((_, { msg }) => ({ message: msg }))
//       },
//       LEAVE: [
//         {
//           target: 'invalid.empty',
//           cond: ctx => ctx.message.length === 0
//         },
//         {
//           target: 'validating'
//         }
//       ]
//     }
//   }
// );

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

// const formMachine = Machine(
//   {
//     id: 'form',
//     initial: 'draft',
//     context: {
//       message: '',
//       email: '',
//       _async_unregistered: undefined,
//     },
//     states: {
//       draft: {
//         type: 'parallel',
//         states: {
//           message: {
//             initial: 'idle',
//             states: {
//               idle: {},
//               editing: {},
//               validating: {
//                 src: () => Promise.resolve(true),
//                 onDone: 'valid',
//                 onError: 'invalid.unregistered',
//               },
//               valid: {},
//               invalid: {
//                 initial: 'empty',
//                 states: {
//                   empty: {},
//                   unregistered: {},
//                 },
//               },
//             },
//             on: {
//               SUBMIT: [
//                 {
//                   target: '.validity.invalid.empty',
//                   cond: 'isMessageEmpty',
//                 },
//               ],
//               SET_MESSAGE: {
//                 target: '.validity.invalid',
//                 actions: 'setMessage',
//               },
//             },
//           },
//           // email: {
//           //   initial: 'valid',
//           //   states: {
//           //     valid: {},
//           //     _async_unregistered: {
//           //       src: async () => Promise.resolve(true),
//           //       onDone: {
//           //         target: 'valid',
//           //         cond: assign((ctx, { data }) => ({
//           //           _async_unregistered: data,
//           //         })),
//           //         actions: assign((ctx, { data }) => ({
//           //           _async_unregistered: data,
//           //         })),
//           //       },
//           //       onError: {
//           //         target: 'invalid.unregistered',
//           //       },
//           //     },
//           //     invalid: {
//           //       initial: 'empty',
//           //       states: {
//           //         empty: {},
//           //         incorrectEmail: {},
//           //         unregistered: {},
//           //       },
//           //     },
//           //   },
//           //   on: {
//           //     SUBMIT: [
//           //       {
//           //         target: '.invalid.empty',
//           //         cond: 'isEmailEmpty',
//           //       },
//           //       {
//           //         target: '.invalid.incorrectEmail',
//           //         cond: 'isEmailIncorrect',
//           //       },
//           //       {
//           //         target: '._async_unregistered',
//           //         cond: 'isEmailUnregistered',
//           //       },
//           //     ],
//           //     SET_EMAIL: {
//           //       target: '.valid',
//           //       actions: 'setEmail',
//           //     },
//           //   },
//           // },
//         },
//         on: {
//           SUBMIT: {
//             target: 'loading',
//             guards: ['#form.draft.message.validity.valid'],
//           },
//         },
//       },
//       loading: {
//         on: {
//           LOAD_SUCCESS: 'success',
//           LOAD_ERROR: 'error',
//         },
//       },
//       success: { type: 'final' },
//       error: { type: 'final' },
//     },
//   },
//   {
//     actions: {
//       setMessage: assign((ctx, { message }) => ({ message })),
//       setEmail: assign((ctx, { email }) => ({ email })),
//     },
//     guards: {
//       isMessageEmpty: (ctx) => ctx.message.length === 0,
//       isEmailEmpty: (ctx) => ctx.email.length === 0,
//       isEmailIncorrect: (ctx) => !ctx.email.includes('@'),
//       isEmailUnregistered: (ctx) => ctx.unregistered !== true,
//     },
//   }
// );
console.log('end');
