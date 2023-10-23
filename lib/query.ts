import { Algebra, translate, Factory as AlgebraFactory, Util } from 'sparqlalgebrajs';
import { PropertyObject } from './types';
import { Term } from "@rdfjs/types"

export function findIriPropertiesWithObject(query: string): PropertyObject[] {
    const resp: PropertyObject[] = [];
    const algebraQuery = translate(query);

    const addProperty = (quad: any): boolean => {
        const predicate = quad.predicate as Term;
        const object = quad.object as Term;
        if (predicate.termType === "NamedNode") {
            const propertyIri = quad.predicate.value;
            resp.push({
                property_iri: propertyIri,
                object
            });
        }

        return true;
    };

    Util.recurseOperation(
        algebraQuery,
        {
            [Algebra.types.PATH]: addProperty,
            [Algebra.types.PATTERN]: addProperty,
        }
    );
    return resp;
}