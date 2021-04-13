import type { SyncValidatorFn } from './types';

export function required(): SyncValidatorFn {
  return val => val != null && val.length > 0;
}

export function min(minValue: number): SyncValidatorFn {
  return val => val.length >= minValue;
}

export function email(): SyncValidatorFn {
  return val => val.includes('@');
}
