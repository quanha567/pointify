export abstract class Entity<T, TId = string> {
  protected readonly _id: TId;
  protected props: T;

  constructor(id: TId, props: T) {
    this._id = id;
    this.props = props;
  }

  get id(): TId {
    return this._id;
  }

  public equals(object?: Entity<T, TId>): boolean {
    if (object === null || object === undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof Entity)) {
      return false;
    }

    return this._id === object._id;
  }
}
