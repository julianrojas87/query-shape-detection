import type { Term } from '@rdfjs/types';
import { Algebra, Util } from 'sparqlalgebrajs';
import { ITripleArgs, Triple, type ITriple } from './Triple';

/**
 * A query divided into subject group
 */
export type Query = Map<string, ITriple[]>;

/**
 * Divide a query into subject group
 * @param {Algebra.Operation} algebraQuery - the algebra of a query
 * @returns {Query} - A query divided into subject group where the predicate has to be an IRI
 * @todo add support for the bind operator
 * @todo add support for optional property path
 */
export function generateQuery(algebraQuery: Algebra.Operation): Query {
  const resp = new Map<string, ITripleArgs[]>();
  const paths: [any, { subject: string; object: Term }][] = [];
  // the binding value to the value
  const values = new Map<string, Term[]>();

  const addProperty = (quad: any): boolean => {
    const subject = quad.subject as Term;
    const predicate = quad.predicate as Term;
    const object = quad.object as Term;
    if (predicate.termType === 'NamedNode') {
      const subjectGroup = resp.get(subject.value);
      const propertyObject: ITripleArgs = {
        subject: subject.value,
        predicate: quad.predicate.value,
        object,
      };
      if (subjectGroup === undefined) {
        resp.set(subject.value, [propertyObject]);
      } else {
        subjectGroup.push(propertyObject);
      }
    }
    return true;
  };

  const addPaths = (element: any): boolean => {
    paths.push([element, {
      subject: element.subject.value,
      object: element.object,
    }]);
    return true;
  };

  const addValues = (element: any): boolean => {
    const bindings: Record<string, Term>[] = element.bindings;
    for (const binding of bindings) {
      for (const [key, term] of Object.entries(binding)) {
        const variableName = key.substring(1);
        const value = values.get(variableName);
        if (value !== undefined) {
          value.push(term);
        } else {
          values.set(variableName, [term]);
        }
      }
    }

    return true;
  }

  Util.recurseOperation(
    algebraQuery,
    {
      [Algebra.types.PATH]: addPaths,
      [Algebra.types.PATTERN]: addProperty,
      [Algebra.types.VALUES]: addValues,
    },
  );

  for (const [path, { subject, object }] of paths) {
    const addPropertyPath = (element: any): boolean => {
      const predicate = element.iri as Term;
      if (predicate.termType === 'NamedNode') {
        const subjectGroup = resp.get(subject);
        const propertyObject: ITripleArgs = {
          subject,
          predicate: predicate.value,
          object,
        };
        if (subjectGroup === undefined) {
          resp.set(subject, [propertyObject]);
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
  return joinTriplesWithProperties(resp, values);
}

function joinTriplesWithProperties(tripleArgs: Map<string, ITripleArgs[]>, values: Map<string, Term[]>) {
  const resp: Query = new Map();
  for (const [subjectGroupName, tripleArgArray] of tripleArgs) {
    for (const tripleArg of tripleArgArray) {
      if (!Array.isArray(tripleArg.object) && tripleArg?.object?.termType === "Variable") {
        const value = values.get(tripleArg.object.value);
        if (value !== undefined) {
          tripleArg.object = value;
        }
      }
      const subjectGroup = resp.get(subjectGroupName);
      if(subjectGroup!==undefined){
        subjectGroup.push(new Triple(tripleArg));
      }else{
        resp.set(subjectGroupName, [new Triple(tripleArg)]);
      }
    }
  }
  return resp;
}