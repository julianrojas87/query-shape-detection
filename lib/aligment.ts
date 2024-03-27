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

    for (const predicat of shape.rejectedPredicate()) {
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
  rejectedPredicate: () => string[];
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

  public rejectedPredicate(): string[] {
    return [];
  }
}

type Intersection = Set<string>;

export function calculateIntersection(shapes: IShape[]): Intersection {
  const shapesProperties = [];
  for (const shape of shapes) {
    shapesProperties.push(shape.expectedPredicate());
  }
  const intersection = shapesProperties.reduce((a: string[], b: string[]) => a.filter(c => b.includes(c)));
  return new Set(intersection);
}

export function generateExclusivePropertyShape(shapes: IShape[], intersection: Intersection): Map<string, ExclusivePropertyShape> {
  const resp: Map<string, ExclusivePropertyShape> = new Map();

  for (const shape of shapes) {
    const properties: Set<string> = new Set();
    for (const property of shape.expectedPredicate()) {
      if (!intersection.has(property)) {
        properties.add(property);
      }
    }
    resp.set(shape.name, { properties });
  }
  return resp;
}

export function find1DeepStarPaterns(properties: ITriple[]): Map<string, ITriple[]> {
  const mapSubject: Map<string, ITriple[]> = new Map();
  for (const property of properties) {
    const listSubject = mapSubject.get(property.subject);
    if (listSubject) {
      listSubject.push(property);
    }
  }
  return mapSubject;
}

export function hasOneExclusivseProperty(shapes: Map<string, ExclusivePropertyShape>, mapQuerySubject: Map<string, ITriple[]>, intersection: Intersection) {
  let alignedShapes: string[] = [];
  for (const [ _, properties ] of mapQuerySubject) {
    let hitIntersection = false;
    const potentiallyAlignedShapes = [];
    for (const property of properties) {
      if (intersection.has(property.predicate)) {
        hitIntersection = true;
      }
      for (const [ shapeName, { properties }] of shapes) {
        if (properties.has(property.predicate)) {
          potentiallyAlignedShapes.push(shapeName);
        }
      }
    }
    if (hitIntersection) {
      alignedShapes = [ ...alignedShapes, ...potentiallyAlignedShapes ];
    }
  }
  return alignedShapes;
}

interface ExclusivePropertyShape {
  properties: Set<string>;
}
