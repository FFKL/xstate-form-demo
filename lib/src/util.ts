import { AsyncTransitionResult } from './types';
import { assign, AssignAction } from 'xstate';

export function assignErrorMessage(
  controlName: string,
  message: string
): AssignAction<{ __errorMessages: Record<string, string> }, any> {
  return assign<{ __errorMessages: Record<string, string> }>({
    __errorMessages: (ctx) => ({
      ...ctx.__errorMessages,
      [controlName]: message,
    }),
  });
}

export function getAsyncTransitionResult(
  data: AsyncTransitionResult[],
  validatorName: string
): AsyncTransitionResult {
  const result = data.find((r) => r.name === validatorName);
  if (result === undefined) {
    throw new Error('Result without name!');
  }

  return result;
}
