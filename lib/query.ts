import type { Term } from '@rdfjs/types';
import { Algebra, Util } from 'sparqlalgebrajs';
import type { ITriple } from './aligment';
import { Triple } from './aligment';

export type Query = Map<string, ITriple[]>;

export function generateQuery(algebraQuery: Algebra.Operation): Query {
  const resp: Query = new Map();
  const paths: [any, { subject: string; object: Term }][] = [];

  const addProperty = (quad: any): boolean => {
    const subject = <Term>quad.subject;
    const predicate = <Term>quad.predicate;
    const object = <Term>quad.object;
    if (predicate.termType === 'NamedNode') {
      const subjectGroup = resp.get(subject.value);
      const propertyObject = new Triple({
        subject: subject.value,
        predicate: quad.predicate.value,
        object,
      });
      if (subjectGroup === undefined) {
        resp.set(subject.value, [ propertyObject ]);
      } else {
        subjectGroup.push(propertyObject);
      }
    }
    return true;
  };

  const addPaths = (element: any): boolean => {
    paths.push([ element, {
      subject: element.subject.value,
      object: element.object,
    }]);
    return true;
  };

  Util.recurseOperation(
    algebraQuery,
    {
      [Algebra.types.PATH]: addPaths,
      [Algebra.types.PATTERN]: addProperty,
    },
  );

  for (const [ path, { subject, object }] of paths) {
    const addPropertyPath = (element: any): boolean => {
      const predicate = <Term>(element.iri);
      if (predicate.termType === 'NamedNode') {
        const subjectGroup = resp.get(subject);
        const propertyObject = new Triple({
          subject,
          predicate: predicate.value,
          object,
        });
        if (subjectGroup === undefined) {
          resp.set(subject, [ propertyObject ]);
        } else {
          subjectGroup.push(propertyObject);
        }
      }

      return true;
    };
    Util.recurseOperation(
      path,
      {
        [Algebra.types.LINK]: addPropertyPath,

      },
    );
  }
  return resp;
}
