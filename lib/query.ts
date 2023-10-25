import { Algebra, translate, Factory as AlgebraFactory, Util } from 'sparqlalgebrajs';
import { PropertyObject, SimplePropertyObject } from './types';
import { Term } from "@rdfjs/types"

export function createSimplePropertyObjectFromQuery(query: string): PropertyObject[] {
    const resp: PropertyObject[] = [];
    const algebraQuery = translate(query);

    const addProperty = (quad: any): boolean => {
        const predicate = quad.predicate as Term;
        const object = quad.object as Term;
        if (predicate.termType === "NamedNode") {
            const propertyIri = quad.predicate.value;
            resp.push(new SimplePropertyObject(
                propertyIri,
                object
            ));
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