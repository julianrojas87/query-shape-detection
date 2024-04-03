import type * as RDF from '@rdfjs/types';
import {
  SHEX_PREDICATE,
  SHEX_EXPRESSION,
  IRI_FIRST_RDF_LIST,
  SHEX_EXPRESSIONS,
  IRI_REST_RDF_LIST,
  SHEX_CLOSED_SHAPE,
  RDF_TRUE,
  SHEX_SHAPE_EXPRESSION,
  SHEX_MAX,
  SHEX_MIN,
  SHEX_VALUE_EXPR,
  SHEX_DATA_TYPE,
} from './constant';
import type { IContraint, InconsistentPositiveAndNegativePredicateError } from './Shape';
import { type IShape, Shape, type IPredicate, ContraintType } from './Shape';

export function shapeFromQuads(quads: RDF.Stream | RDF.Quad[], shapeIri: string): Promise<IShape | ShapeError> {
  if (Array.isArray(quads)) {
    return new Promise(resolve => {
      resolve(shapeFromQuadArray(quads, shapeIri));
    });
  }
  return shapeFromQuadStream(quads, shapeIri);
}

function shapeFromQuadStream(quadSteam: RDF.Stream, shapeIri: string): Promise<IShape | ShapeError> {
  const mapTripleShex: IMapTripleShex = defaultMapTripleShex();

  return new Promise(resolve => {
    quadSteam.on('data', (quad: RDF.Quad) => {
      parseShapeQuads(
        quad,
        mapTripleShex,
      );
    });

    quadSteam.on('error', error => {
      resolve(error);
    });
    quadSteam.on('end', () => {
      const shape = concatShapeInfo(
        mapTripleShex,
        shapeIri,
      );
      resolve(shape);
    });
  });
}

function shapeFromQuadArray(quads: RDF.Quad[], shapeIri: string): IShape | ShapeError {
  const mapTripleShex: IMapTripleShex = defaultMapTripleShex();

  for (const quad of quads) {
    parseShapeQuads(
      quad,
      mapTripleShex,
    );
  }

  const shape = concatShapeInfo(
    mapTripleShex,
    shapeIri,
  );
  return shape;
}

function concatShapeInfo(
  mapTripleShex: IMapTripleShex,
  shapeIri: string,
): IShape | ShapeError {
  const positivePredicates: IPredicate[] = [];
  const negativePredicates: string[] = [];
  const shapeExpr = mapTripleShex.mapIriShapeExpression.get(shapeIri);
  let expression;
  if (shapeExpr === undefined) {
    expression = mapTripleShex.mapShapeExpressionId.get(shapeIri);
  } else {
    expression = mapTripleShex.mapShapeExpressionId.get(shapeExpr);
  }
  if (expression === undefined) {
    return new ShapePoorlyFormatedError('there are no expressions in the shape');
  }
  const expressions = mapTripleShex.mapLogicLinkIdExpressions.get(expression);
  let current;
  let next;
  // If there is only one expression
  if (expressions === undefined) {
    const predicateAdded = appendPredicates(
      mapTripleShex.mapIdPredicate,
      mapTripleShex.mapIriCardinalityMin,
      mapTripleShex.mapIriCardinalityMax,
      mapTripleShex.mapIriConstraint,
      mapTripleShex.mapIriDatatype,
      positivePredicates,
      negativePredicates,
      expression,
    );
    if (!predicateAdded) {
      return new ShapePoorlyFormatedError('there are no predicates in the shape');
    }
  } else {
    current = mapTripleShex.mapPrevCurrentList.get(expressions);
    next = mapTripleShex.mapPrevNextList.get(expressions);
  }

  // Traverse the RDF list
  while (current !== undefined) {
    appendPredicates(
      mapTripleShex.mapIdPredicate,
      mapTripleShex.mapIriCardinalityMin,
      mapTripleShex.mapIriCardinalityMax,
      mapTripleShex.mapIriConstraint,
      mapTripleShex.mapIriDatatype,
      positivePredicates,
      negativePredicates,
      current,
    );
    if (next === undefined) {
      return new ShapePoorlyFormatedError('An RDF list is poorly defined');
    }
    current = mapTripleShex.mapPrevCurrentList.get(next);
    next = mapTripleShex.mapPrevNextList.get(next);
  }
  let isClosed;
  if (shapeExpr === undefined) {
    isClosed = mapTripleShex.mapShapeExpressionClosedShape.get(shapeIri);
  } else {
    isClosed = mapTripleShex.mapShapeExpressionClosedShape.get(shapeExpr);
  }
  try {
    return new Shape({
      name: shapeIri,
      positivePredicates,
      negativePredicates,
      closed: isClosed,
    });
  } catch (error: unknown) {
    return <ShapeError>error;
  }
}

function interpreteConstraint(
  constraint: RDF.Term | undefined,
  mapIriDatatype: Map<string, string>,
): IContraint | undefined {
  if (constraint === undefined) {
    return undefined;
  }

  if (constraint.termType === 'NamedNode') {
    return {
      value: [ constraint.value ],
      type: ContraintType.SHAPE,
    };
  }

  if (constraint.termType === 'BlankNode') {
    const dataType = mapIriDatatype.get(constraint.value);
    if (dataType !== undefined) {
      return {
        value: [ dataType ],
        type: ContraintType.TYPE,
      };
    }
  }

  return undefined;
}

function appendPredicates(
  mapIdPredicate: Map<string, string>,
  mapIriCardinalityMin: Map<string, number>,
  mapIriCardinalityMax: Map<string, number>,
  mapIriConstraint: Map<string, RDF.Term>,
  mapIriDatatype: Map<string, string>,
  positivePredicates: IPredicate[],
  negativePredicates: string[],
  current: string,
): boolean {
  const predicate = mapIdPredicate.get(current);
  if (predicate !== undefined) {
    const min = mapIriCardinalityMin.get(current);
    const max = mapIriCardinalityMax.get(current);
    if (min === max && min === 0) {
      negativePredicates.push(predicate);
    } else {
      const constraintIri = mapIriConstraint.get(current);
      const constraint = interpreteConstraint(constraintIri, mapIriDatatype);
      positivePredicates.push({
        name: predicate,
        cardinality: {
          min: min ?? 1,
          max: max ?? 1,
        },
        constraint,
      });
    }
    return true;
  }
  return false;
}
function parseShapeQuads(
  quad: RDF.Quad,
  mapTripleShex: IMapTripleShex,
): void {
  if (quad.predicate.equals(SHEX_PREDICATE)) {
    mapTripleShex.mapIdPredicate.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(IRI_FIRST_RDF_LIST)) {
    mapTripleShex.mapPrevCurrentList.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(IRI_REST_RDF_LIST)) {
    mapTripleShex.mapPrevNextList.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(SHEX_EXPRESSIONS)) {
    mapTripleShex.mapLogicLinkIdExpressions.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(SHEX_EXPRESSION)) {
    mapTripleShex.mapShapeExpressionId.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(SHEX_CLOSED_SHAPE)) {
    mapTripleShex.mapShapeExpressionClosedShape.set(quad.subject.value, quad.object.equals(RDF_TRUE));
  }
  if (quad.predicate.equals(SHEX_SHAPE_EXPRESSION)) {
    mapTripleShex.mapIriShapeExpression.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(SHEX_MAX)) {
    mapTripleShex.mapIriCardinalityMax.set(quad.subject.value, Number(quad.object.value));
  }
  if (quad.predicate.equals(SHEX_MIN)) {
    mapTripleShex.mapIriCardinalityMin.set(quad.subject.value, Number(quad.object.value));
  }
  if (quad.predicate.equals(SHEX_VALUE_EXPR)) {
    mapTripleShex.mapIriConstraint.set(quad.subject.value, quad.object);
  }
  if (quad.predicate.equals(SHEX_DATA_TYPE)) {
    mapTripleShex.mapIriDatatype.set(quad.subject.value, quad.object.value);
  }
}

export class ShapePoorlyFormatedError extends Error {
  public constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, ShapePoorlyFormatedError.prototype);
  }
}

type ShapeError = ShapePoorlyFormatedError | InconsistentPositiveAndNegativePredicateError;

interface IMapTripleShex {
  mapIdPredicate: Map<string, string>;
  mapPrevCurrentList: Map<string, string>;
  mapLogicLinkIdExpressions: Map<string, string>;
  mapShapeExpressionId: Map<string, string>;
  mapPrevNextList: Map<string, string>;
  mapShapeExpressionClosedShape: Map<string, boolean>;
  mapIriShapeExpression: Map<string, string>;
  mapIriCardinalityMax: Map<string, number>;
  mapIriCardinalityMin: Map<string, number>;
  mapIriConstraint: Map<string, RDF.Term>;
  mapIriDatatype: Map<string, string>;
}

function defaultMapTripleShex(): IMapTripleShex {
  return {
    mapIdPredicate: new Map(),
    mapPrevCurrentList: new Map(),
    mapLogicLinkIdExpressions: new Map(),
    mapShapeExpressionId: new Map(),
    mapPrevNextList: new Map(),
    mapShapeExpressionClosedShape: new Map(),
    mapIriShapeExpression: new Map(),
    mapIriCardinalityMax: new Map(),
    mapIriCardinalityMin: new Map(),
    mapIriConstraint: new Map(),
    mapIriDatatype: new Map(),
  };
}
