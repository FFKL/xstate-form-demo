import type { TransitionConfig } from 'xstate';

export interface AsyncValidationResult {
  valid: boolean;
  message: string;
}

export type AsyncValidatorFn = (value: string) => Promise<AsyncValidationResult>;
export type SyncValidatorFn = (value: string) => boolean;

export interface AsyncValidator {
  validate: AsyncValidatorFn;
  name: string;
}

export interface SyncValidator {
  validate: SyncValidatorFn;
  message: string;
  name: string;
}

export interface ControlValidators {
  sync?: SyncValidator[];
  async?: AsyncValidator[];
}

export interface FormControl {
  value: string;
  validators?: ControlValidators;
}

export interface FormControls {
  [name: string]: FormControl
}

export interface FormConfig {
  controls: FormControls;
}

export type AsyncTransition =  AsyncValidator;

export type SyncTransition = TransitionConfig<any, any>;

export interface ValidatorsTransition {
  async: AsyncTransition[];
  sync: SyncTransition[];
}

export interface AsyncTransitionResult {
  name: string;
  result: AsyncValidationResult;
}
