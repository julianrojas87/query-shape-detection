import type { Term, BaseQuad } from '@rdfjs/types';
import { Algebra, translate, Util } from 'sparqlalgebrajs';
import type { IPropertyObject } from './aligment';
import { PropertyObject } from './aligment';
import { DataFactory, Quad } from 'rdf-data-factory';

const DF = new DataFactory<BaseQuad>();

export function createSimplePropertyObjectFromQuery(query: string): IPropertyObject[] {
  const resp: IPropertyObject[] = [];
  const algebraQuery = translate(query);

  const addProperty = (quad: any): boolean => {
    const predicate = <Term>quad.predicate;
    const object = <Term>quad.object;
    if (predicate.termType === 'NamedNode') {
      const propertyIri = quad.predicate.value;
      resp.push(new PropertyObject(
        propertyIri,
        object,
      ));
    }

    return true;
  };

  const addPropertySeq = (element: any): boolean => {
    const quadArray = <Term[]>((<any[]>element.input).map((value) => {
      return value.iri;
    }));
    for (const predicate of quadArray) {
      if (predicate.termType === 'NamedNode') {
        resp.push(new PropertyObject(
          predicate.value,
          // for the moment we will simply ignore this
          DF.blankNode(),
        ));
      }

    }
    return true;
  }

  const addPropertyPath = (element: any): boolean => {
    const predicate = <Term>(element.iri);

    if (predicate.termType === 'NamedNode') {
      resp.push(new PropertyObject(
        predicate.value,
        // for the moment we will simply ignore this
        DF.blankNode(),
      ));

    }
    return true;
  }

  Util.recurseOperation(
    algebraQuery,
    {
      [Algebra.types.PATH]: addProperty,
      [Algebra.types.PATTERN]: addProperty,
      [Algebra.types.LINK]: addPropertyPath,
    },
  );
  return resp;
}
