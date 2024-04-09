/**
 * A shape interface
 */
export interface IShape extends IShapeObj {
  /**
   * Convert a shape to an object
   * @returns {IShapeObj}
   */
  toObject: () => IShapeObj;
  /**
   * Get the information about a predicate
   * @param {string} predicate - the predicate
   * @returns {IPredicate | undefined} - the information about the predicate or undefined if it is not in the shape
   */
  get: (predicate: string) => IPredicate | undefined;
  /**
   * Get all the predicates with all their information
   * @returns {IPredicate[]} - all the predicates with extra information
   */
  getAll: () => IPredicate[];
}

/**
 * A predicate
 */
export interface IPredicate {
  name: string;
  constraint?: IContraint;
  cardinality?: ICardinality;
  negative?: boolean;
  optional?: boolean;
}
/**
 * A constraint
 */
export interface IContraint {
  value: Set<string>;
  type: ContraintType;
}
/**
 * A cardinality
 */
export interface ICardinality {
  min: number;
  // If the value is -1 then there is no limit
  max: number;
}

/**
 * A constraint type
 */
export const enum ContraintType {
  // Is bound to another shape
  SHAPE,
  // Is bound by an RDF type
  TYPE
}
/**
 * A simple Shape object
 */
export interface IShapeObj {
  name: string;
  closed?: boolean;
  positivePredicates: string[];
  negativePredicates?: string[];
}

/**
 * The argument to generate a {Shape} instance
 */
export interface IShapeArgs extends Omit<IShapeObj, 'positivePredicates' | 'negativePredicates'> {
  positivePredicates: (IPredicate | string)[];
  negativePredicates?: (IPredicate | string)[];
}

/**
 * A shape
 */
export class Shape implements IShape {
  public readonly name: string;
  public readonly positivePredicates: string[];
  public readonly negativePredicates: string[];
  public readonly closed?: boolean;
  // All the predicate with extra information
  private readonly predicates: Map<string, IPredicate> = new Map();

  /**
   *
   * @param {IShapeArgs} args - The argument to build a shape
   */
  public constructor({ name, positivePredicates, negativePredicates, closed }: IShapeArgs) {
    this.name = name;
    this.closed = closed ?? false;

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

    this.validatePredicates();

    for (const predicate of positivePredicates) {
      if (typeof predicate === 'string') {
        this.predicates.set(predicate, { name: predicate });
      } else {
        this.predicates.set(predicate.name,
          {
            ...predicate,
            optional: predicate?.cardinality?.min === 0,
          });
      }
    }

    for (const predicate of negativePredicates ?? []) {
      if (typeof predicate === 'string') {
        this.predicates.set(predicate, { name: predicate, negative: true });
      } else {
        this.predicates.set(predicate.name, { ...predicate, negative: true });
      }
    }

    Object.freeze(this.name);
    Object.freeze(this.positivePredicates);
    Object.freeze(this.negativePredicates);
    Object.freeze(this.predicates);
    Object.freeze(this.closed);
  }

  /**
   * Validate if the shape don't have inconsistencies with the positive and negative properties
   * @throws {InconsistentPositiveAndNegativePredicateError}
   */
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
/**
 * An error to indicate that there is an inconsistency with the positive and negative properties
 */
export class InconsistentPositiveAndNegativePredicateError extends Error {
  public constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, InconsistentPositiveAndNegativePredicateError.prototype);
  }
}

