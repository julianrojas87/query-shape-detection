import { Algebra, translate, Factory as AlgebraFactory, Util } from 'sparqlalgebrajs';
import { IPropertyObject, PropertyObject } from './aligment';
import { Term } from "@rdfjs/types"

export function createSimplePropertyObjectFromQuery(query: string): IPropertyObject[] {
    const resp: IPropertyObject[] = [];
    const algebraQuery = translate(query);

    const addProperty = (quad: any): boolean => {
        const predicate = quad.predicate as Term;
        const object = quad.object as Term;
        if (predicate.termType === "NamedNode") {
            const propertyIri = quad.predicate.value;
            resp.push(new PropertyObject(
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