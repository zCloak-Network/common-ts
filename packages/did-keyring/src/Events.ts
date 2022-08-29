import type { DidEvents } from './types';

import EventEmitter from 'eventemitter3';

import { Keyring } from './Keyring';

export class Events extends Keyring {
  #eventemitter = new EventEmitter();

  protected emit(type: DidEvents, ...args: unknown[]): boolean {
    return this.#eventemitter.emit(type, ...args);
  }

  public on(type: DidEvents, handler: (...args: any[]) => any): this {
    this.#eventemitter.on(type, handler);

    return this;
  }

  public off(type: DidEvents, handler: (...args: any[]) => any): this {
    this.#eventemitter.removeListener(type, handler);

    return this;
  }

  public once(type: DidEvents, handler: (...args: any[]) => any): this {
    this.#eventemitter.once(type, handler);

    return this;
  }
}
