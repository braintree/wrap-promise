import { promiseOrCallback } from "./lib/promise-or-callback";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ClassContructor = {
  new (...args: any[]): any;
  [propName: string]: any;
};

export type WrapPrototypeOptions = {
  ignoreMethods?: string[];
  transformPrivateMethods?: boolean;
};

export type FunctionThatReturnsAPromiseOrValue = (
  ...args: unknown[]
) => Promise<unknown> | unknown;

export type FunctionThatReturnsAPromiseOrCallback = (
  ...args: unknown[]
) => ReturnType<typeof promiseOrCallback>;
