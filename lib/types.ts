import { Term } from "@rdfjs/types"

export interface PropertyObject {
    /// The iri of a property
    property_iri: string,
    /// The object related to the property
    object: Term,

    isAlignedWithShape(shape: SimpleShape): boolean
}

export class SimplePropertyObject implements PropertyObject {
    public readonly property_iri: string;
    public readonly object: Term;

    public constructor(property_iri: string, object: Term) {
        this.property_iri = property_iri;
        this.object = object;
    }

    public isAlignedWithShape(shape: SimpleShape): boolean {
        for (const predicat of shape.predicates) {
            if (predicat === this.property_iri) {
                return true;
            }
        }

        return false;
    }

}

/**
 * We are going to extend it with other classes to consider nested properties
 * and filter constraint and the like
export interface PropertyObjectExtended extends PropertyObject {
    /// Triples in the query defining the object
    object_neighbors: Term[],
}

export interface PropertyObjectExtendedWithConstraint extends PropertyObjectExtended {
    /// The related filter expression segments in relation to the object
    filter_contraint: string[]
}
*/

export interface SimpleShape {
    name: string,
    predicates: string[],
    // will be necesary because we will not match align on negated properties and
    // maybe for some link ordering the negation will be useful
    // predicates_not: string[]
}

export interface ShapeWithConstraint extends SimpleShape {
    constraint: Map<string, ObjectConstraint>
}

export type ObjectConstraint = string | SimpleShape| undefined;