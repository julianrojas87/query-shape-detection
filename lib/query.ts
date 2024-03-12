import type { Term } from '@rdfjs/types';
import { Algebra, translate, Util } from 'sparqlalgebrajs';
import type { IPropertyObject } from './aligment';
import { PropertyObject } from './aligment';

export function createSimplePropertyObjectFromQuery(query: string): IPropertyObject[] {
  const resp: IPropertyObject[] = [];
  const algebraQuery = translate(query);

  const addProperty = (quad: any): boolean => {
    const predicate = <Term> quad.predicate;
    const object = <Term> quad.object;
    if (predicate.termType === 'NamedNode') {
      const propertyIri = quad.predicate.value;
      resp.push(new PropertyObject(
        propertyIri,
        object,
      ));
    }

    return true;
  };

  Util.recurseOperation(
    algebraQuery,
    {
      [Algebra.types.PATH]: addProperty,
      [Algebra.types.PATTERN]: addProperty,
    },
  );
  return resp;
}
