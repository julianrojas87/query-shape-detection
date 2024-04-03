export interface IShape extends IShapeObj {
  toObject: () => IShapeObj;
  get: (predicate: string) => IPredicate | undefined;
  getAll: () => IPredicate[];
}

export interface IPredicate {
  name: string;
  constraint?: IContraint;
  cardinality?: any;
}

export interface IContraint {
  value: string[];
  type: ContraintType;
}

export interface ICardinality {
  min: number;
  max: number;
}

export enum ContraintType {
  SHAPE,
  TYPE
}

export interface IShapeObj {
  name: string;
  closed?: boolean;
  positivePredicates: string[];
  negativePredicates?: string[];
}

export interface IShapeArgs extends Omit<IShapeObj, 'positivePredicates' | 'negativePredicates'> {
  positivePredicates: (IPredicate | string)[];
  negativePredicates?: (IPredicate | string)[];
}

export class Shape implements IShape {
  public readonly name: string;
  public readonly positivePredicates: string[];
  public readonly negativePredicates: string[];
  public readonly closed?: boolean;
  private readonly predicates: Map<string, IPredicate> = new Map();

  public constructor({ name, positivePredicates, negativePredicates, closed }: IShapeArgs) {
    this.name = name;
    this.positivePredicates = positivePredicates.map(val => {
      if (typeof val === 'string') {
        return val;
      }
      return val.name;
    });
    this.negativePredicates = negativePredicates === undefined ?
      [] :
      negativePredicates.map(val => {
        if (typeof val === 'string') {
          return val;
        }
        return val.name;
      });
    this.closed = closed ?? false;

    this.validatePredicates();
    for (const predicate of positivePredicates.concat(negativePredicates ?? [])) {
      if (typeof predicate === 'string') {
        this.predicates.set(predicate, { name: predicate });
      } else {
        this.predicates.set(predicate.name, predicate);
      }
    }

    Object.freeze(this.name);
    Object.freeze(this.positivePredicates);
    Object.freeze(this.negativePredicates);
    Object.freeze(this.predicates);
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

  public toObject(): IShapeObj {
    return {
      name: this.name,
      closed: this.closed,
      positivePredicates: this.positivePredicates,
      negativePredicates: this.negativePredicates,
    };
  }

  public get(predicate: string): IPredicate | undefined {
    return this.predicates.get(predicate);
  }

  public getAll(): IPredicate[] {
    return [ ...this.predicates.values() ];
  }
}

export class InconsistentPositiveAndNegativePredicateError extends Error {
  public constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, InconsistentPositiveAndNegativePredicateError.prototype);
  }
}

