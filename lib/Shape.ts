export interface IShape extends IShapeArgs {
  toObject: () => IShapeArgs;
}

export interface IShapeArgs {
  name: string;
  closed?: boolean;
  positivePredicates: string[];
  negativePredicates?: string[];
}

export class Shape implements IShape {
  public readonly name: string;
  public readonly positivePredicates: string[];
  public readonly negativePredicates: string[];
  public readonly closed?: boolean;

  public constructor({ name, positivePredicates, negativePredicates, closed }: IShapeArgs) {
    this.name = name;
    this.positivePredicates = positivePredicates;
    this.negativePredicates = negativePredicates ?? [];
    this.closed = closed ?? false;

    this.validatePredicates();

    Object.freeze(this.name);
    Object.freeze(this.positivePredicates);
    Object.freeze(this.negativePredicates);
    Object.freeze(this.closed);
  }

  private validatePredicates(): void {
    const setNegativePredicates = new Set(this.negativePredicates);
    for (const predicate of this.positivePredicates) {
      if (setNegativePredicates.has(predicate)) {
        throw new InconsistentPositiveAndNegativePredicateError(
          `the predicate ${predicate} is defined in the positive and the negative property`,
        );
      }
    }
  }

  public toObject(): IShapeArgs {
    return {
      name: this.name,
      closed: this.closed,
      positivePredicates: this.positivePredicates,
      negativePredicates: this.negativePredicates,
    };
  }
}

export class InconsistentPositiveAndNegativePredicateError extends Error {
  public constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, InconsistentPositiveAndNegativePredicateError.prototype);
  }
}

