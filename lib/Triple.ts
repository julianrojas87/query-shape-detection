import type { Term } from '@rdfjs/types';
import type { IShape } from './Shape';

/**
 * A Triple interface
 */
export interface ITriple extends ITripleArgs {
  isWeaklyAlign: (shape: IShape) => boolean;
  toObject: () => ITripleArgs;
  getLinkedSubjectGroup: () => string | undefined
}
/**
 * The type of alignment
 */
export const enum AlignmentType {
  WEAK,
  STRONG,
  None,
}
/**
 * A Triple object
 */
export interface ITripleArgs {
  subject: string;
  // / The iri of a property
  predicate: string;
  // / The object related to the property
  object: Term;
  isOptional?: boolean;
}
/**
 * A Triple
 */
export class Triple implements ITriple {
  public readonly predicate: string;
  public readonly subject: string;
  public readonly object: Term;

  /**
   *
   * @param {ITripleArgs} tripleObject - A triple object
   */
  public constructor({ subject, predicate, object }: ITripleArgs) {
    this.predicate = predicate;
    this.object = object;
    this.subject = subject;

    Object.freeze(this.predicate);
    Object.freeze(this.object);
    Object.freeze(this.subject);
  }

  /**
   * Return a triple object
   * @returns {ITripleArgs} a Triple object
   */
  public toObject(): ITripleArgs {
    return {
      subject: this.subject,
      predicate: this.predicate,
      object: this.object,
    };
  }

  public getLinkedSubjectGroup(): string | undefined {
    if (this.object.termType === "Variable") {
      return this.object.value
    }
  }

  /**
   * Calculate the weak alignment with a shape
   * @param {IShape} shape - A shape
   * @returns {boolean} - return true if the triple is weakly aligned with the shape
   */
  public isWeaklyAlign(shape: IShape): boolean {
    if (shape.closed === false) {
      return true;
    }

    for (const predicat of shape.positivePredicates) {
      if (predicat === this.predicate) {
        return true;
      }
    }

    return false;
  }
}
