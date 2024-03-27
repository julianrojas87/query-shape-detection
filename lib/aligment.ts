import type { Term } from '@rdfjs/types';

export interface ITriple extends ITripleArgs {
  isAlignedWithShape: (shape: IShape) => boolean;
  toObject: () => ITripleArgs;
}

export interface ITripleArgs {
  subject: string;
  // / The iri of a property
  predicate: string;
  // / The object related to the property
  object: Term;
}

export class Triple implements ITriple {
  public readonly predicate: string;
  public readonly subject: string;
  public readonly object: Term;

  public constructor({ subject, predicate, object }: ITripleArgs) {
    this.predicate = predicate;
    this.object = object;
    this.subject = subject;
  }

  public toObject(): ITripleArgs {
    return {
      subject: this.subject,
      predicate: this.predicate,
      object: this.object,
    };
  }

  public isAlignedWithShape(shape: IShape): boolean {
    if (shape.closed === false) {
      return true;
    }

    for (const predicat of shape.rejectedPredicates()) {
      if (predicat === this.predicate) {
        return false;
      }
    }

    for (const predicat of shape.expectedPredicate()) {
      if (predicat === this.predicate) {
        return true;
      }
    }

    return false;
  }
}

export function hasOneAlign(queryProperties: ITriple[], shape: IShape): boolean | undefined {
  if (queryProperties.length === 0) {
    return undefined;
  }

  for (const property of queryProperties) {
    const isAlign = property.isAlignedWithShape(shape);
    if (isAlign) {
      return true;
    }
  }
  return false;
}

export interface IShape {
  name: string;
  expectedPredicate: () => string[];
  rejectedPredicates: () => string[];
  closed?: boolean;
}

export class ShapeWithPositivePredicate implements IShape {
  public readonly name: string;
  private readonly predicates: string[];
  public readonly closed?: boolean;

  public constructor(name: string, predicates: string[], closed?: boolean) {
    this.name = name;
    this.predicates = predicates;
    this.closed = closed === undefined ? false : closed;
  }

  public expectedPredicate(): string[] {
    return this.predicates;
  }

  public rejectedPredicates(): string[] {
    return [];
  }
}

export class Shape implements IShape {
  public readonly name: string;
  private readonly predicates: string[];
  private readonly negativePredicates: string[];
  public readonly closed?: boolean;

  public constructor(name: string, predicates: string[], negativePredicates: string[], closed?: boolean) {
    this.name = name;
    this.predicates = predicates;
    this.negativePredicates = negativePredicates;
    this.closed = closed ?? false;
  }

  public expectedPredicate(): string[] {
    return this.predicates;
  }

  public rejectedPredicates(): string[] {
    return this.negativePredicates;
  }
}

export function generateDiscriminantShape(targetShape: IShape, others: IShape[]): IShape {
  const disciminantPredicates: string[] = [];

  const otherPredicates: Set<string> = new Set(others
    .map(shape => shape.expectedPredicate())
    .reduce((acc: string[], current: string[]) => [ ...acc, ...current ]));

  for (const predicate of targetShape.expectedPredicate()) {
    if (!otherPredicates.has(predicate)) {
      disciminantPredicates.push(predicate);
    }
  }
  return new Shape(
    targetShape.name,
    disciminantPredicates,
    targetShape.rejectedPredicates(),
  );
}
