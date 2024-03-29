import type { Term } from '@rdfjs/types';
import { IShape } from './Shape';

export interface ITriple extends ITripleArgs {
    isWeaklyAlign: (shape: IShape) => boolean;
    toObject: () => ITripleArgs;
}

export interface ITripleArgs {
    subject: string;
    // / The iri of a property
    predicate: string;
    // / The object related to the property
    object: Term;
    isOptional?: boolean
}

export class Triple implements ITriple {
    public readonly predicate: string;
    public readonly subject: string;
    public readonly object: Term;

    public constructor({ subject, predicate, object }: ITripleArgs) {
        this.predicate = predicate;
        this.object = object;
        this.subject = subject;

        Object.freeze(this.predicate);
        Object.freeze(this.object);
        Object.freeze(this.subject);
    }

    public toObject(): ITripleArgs {
        return {
            subject: this.subject,
            predicate: this.predicate,
            object: this.object,
        };
    }

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