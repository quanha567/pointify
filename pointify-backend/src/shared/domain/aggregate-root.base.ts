import { Entity } from './entity.base.js';
import type { IDomainEvent } from './domain-event.interface.js';

export abstract class AggregateRoot<T, TId = string> extends Entity<T, TId> {
  private _domainEvents: IDomainEvent[] = [];
  protected _version: number = 0;

  get version(): number {
    return this._version;
  }

  get domainEvents(): ReadonlyArray<IDomainEvent> {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: IDomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public setVersion(version: number): void {
    this._version = version;
  }

  public incrementVersion(): void {
    this._version += 1;
  }
}
