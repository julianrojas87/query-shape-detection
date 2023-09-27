import { Term } from "@rdfjs/types"

export interface PropertyObject {
    /// The iri of a property
    property_iri: string,
    /// The object related to the property
    object: Term,
}

export interface PropertyObjectExtended extends PropertyObject {
    /// Triples in the query defining the object
    object_neighbors: Term[],
}

export interface PropertyObjectExtendedWithConstraint extends PropertyObjectExtended {
    /// The related filter expression segments in relation to the object
    filter_contraint: string[]
}