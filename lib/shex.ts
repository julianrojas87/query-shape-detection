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
  const mapIdPredicate: Map<string, string> = new Map();
  const mapPrevCurrentList: Map<string, string> = new Map();
  const mapLogicLinkIdExpressions: Map<string, string> = new Map();
  const mapShapeExpressionId: Map<string, string> = new Map();
  const mapPrevNextList: Map<string, string> = new Map();
  const mapShapeExpressionClosedShape: Map<string, boolean> = new Map();
  const mapIriShapeExpression: Map<string, string> = new Map();
  const mapIriCardinalityMax: Map<string, number> = new Map();
  const mapIriCardinalityMin: Map<string, number> = new Map();
  const mapIriConstraint: Map<string, RDF.Term> = new Map();

  return new Promise(resolve => {
    quadSteam.on('data', (quad: RDF.Quad) => {
      parseShapeQuads(
        quad,
        mapIdPredicate,
        mapPrevCurrentList,
        mapLogicLinkIdExpressions,
        mapShapeExpressionId,
        mapPrevNextList,
        mapShapeExpressionClosedShape,
        mapIriShapeExpression,
        mapIriCardinalityMax,
        mapIriCardinalityMin,
        mapIriConstraint,
      );
    });

    quadSteam.on('error', error => {
      resolve(error);
    });
    quadSteam.on('end', () => {
      const shape = concatShapeInfo(
        mapIdPredicate,
        mapPrevCurrentList,
        mapLogicLinkIdExpressions,
        mapShapeExpressionId,
        mapPrevNextList,
        mapShapeExpressionClosedShape,
        mapIriShapeExpression,
        mapIriCardinalityMax,
        mapIriCardinalityMin,
        mapIriConstraint,
        shapeIri,
      );
      resolve(shape);
    });
  });
}

function shapeFromQuadArray(quads: RDF.Quad[], shapeIri: string): IShape | ShapeError {
  const mapIdPredicate: Map<string, string> = new Map();
  const mapPrevCurrentList: Map<string, string> = new Map();
  const mapLogicLinkIdExpressions: Map<string, string> = new Map();
  const mapShapeExpressionId: Map<string, string> = new Map();
  const mapPrevNextList: Map<string, string> = new Map();
  const mapShapeExpressionClosedShape: Map<string, boolean> = new Map();
  const mapIriShapeExpression: Map<string, string> = new Map();
  const mapIriCardinalityMax: Map<string, number> = new Map();
  const mapIriCardinalityMin: Map<string, number> = new Map();
  const mapIriConstraint: Map<string, RDF.Term> = new Map();

  for (const quad of quads) {
    parseShapeQuads(
      quad,
      mapIdPredicate,
      mapPrevCurrentList,
      mapLogicLinkIdExpressions,
      mapShapeExpressionId,
      mapPrevNextList,
      mapShapeExpressionClosedShape,
      mapIriShapeExpression,
      mapIriCardinalityMax,
      mapIriCardinalityMin,
      mapIriConstraint,
    );
  }

  const shape = concatShapeInfo(
    mapIdPredicate,
    mapPrevCurrentList,
    mapLogicLinkIdExpressions,
    mapShapeExpressionId,
    mapPrevNextList,
    mapShapeExpressionClosedShape,
    mapIriShapeExpression,
    mapIriCardinalityMax,
    mapIriCardinalityMin,
    mapIriConstraint,
    shapeIri,
  );
  return shape;
}

function concatShapeInfo(
  mapIdPredicate: Map<string, string>,
  mapPrevCurrentList: Map<string, string>,
  mapLogicLinkIdExpressions: Map<string, string>,
  mapShapeExpressionId: Map<string, string>,
  mapPrevNextList: Map<string, string>,
  mapShapeExpressionClosedShape: Map<string, boolean>,
  mapIriShapeExpression: Map<string, string>,
  mapIriCardinalityMax: Map<string, number>,
  mapIriCardinalityMin: Map<string, number>,
  mapIriConstraint: Map<string, RDF.Term>,
  shapeIri: string,
): IShape | ShapeError {
  const positivePredicates: IPredicate[] = [];
  const negativePredicates: string[] = [];
  const shapeExpr = mapIriShapeExpression.get(shapeIri);
  let expression;
  if (shapeExpr === undefined) {
    expression = mapShapeExpressionId.get(shapeIri);
  } else {
    expression = mapShapeExpressionId.get(shapeExpr);
  }
  if (expression === undefined) {
    return new ShapePoorlyFormatedError('there are no expressions in the shape');
  }
  const expressions = mapLogicLinkIdExpressions.get(expression);
  let current;
  let next;
  // If there is only one expression
  if (expressions === undefined) {
    const predicateAdded = appendPredicates(
      mapIdPredicate,
      mapIriCardinalityMin,
      mapIriCardinalityMax,
      mapIriConstraint,
      positivePredicates,
      negativePredicates,
      expression,
    );
    if (!predicateAdded) {
      return new ShapePoorlyFormatedError('there are no predicates in the shape');
    }
  } else {
    current = mapPrevCurrentList.get(expressions);
    next = mapPrevNextList.get(expressions);
  }

  // Traverse the RDF list
  while (current !== undefined) {
    appendPredicates(
      mapIdPredicate,
      mapIriCardinalityMin,
      mapIriCardinalityMax,
      mapIriConstraint,
      positivePredicates,
      negativePredicates,
      current,
    );
    if (next === undefined) {
      return new ShapePoorlyFormatedError('An RDF list is poorly defined');
    }
    current = mapPrevCurrentList.get(next);
    next = mapPrevNextList.get(next);
  }
  let isClosed;
  if (shapeExpr === undefined) {
    isClosed = mapShapeExpressionClosedShape.get(shapeIri);
  } else {
    isClosed = mapShapeExpressionClosedShape.get(shapeExpr);
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
function interpreteConstraint(constraint: RDF.Term | undefined): IContraint | undefined {
  if (constraint === undefined) {
    return undefined;
  }

  if (constraint.termType === 'NamedNode') {
    return {
      value: [ constraint.value ],
      type: ContraintType.SHAPE,
    };
  }
  return undefined;
}

function appendPredicates(
  mapIdPredicate: Map<string, string>,
  mapIriCardinalityMin: Map<string, number>,
  mapIriCardinalityMax: Map<string, number>,
  mapIriConstraint: Map<string, RDF.Term>,
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
      const constraint = interpreteConstraint(constraintIri);
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
  mapIdPredicate: Map<string, string>,
  mapPrevCurrentList: Map<string, string>,
  mapLogicLinkIdExpressions: Map<string, string>,
  mapShapeExpressionId: Map<string, string>,
  mapPrevNextList: Map<string, string>,
  mapShapeExpressionClosedShape: Map<string, boolean>,
  mapIriShapeExpression: Map<string, string>,
  mapIriCardinalityMax: Map<string, number>,
  mapIriCardinalityMin: Map<string, number>,
  mapIriConstraint: Map<string, RDF.Term>,
): void {
  if (quad.predicate.equals(SHEX_PREDICATE)) {
    mapIdPredicate.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(IRI_FIRST_RDF_LIST)) {
    mapPrevCurrentList.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(IRI_REST_RDF_LIST)) {
    mapPrevNextList.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(SHEX_EXPRESSIONS)) {
    mapLogicLinkIdExpressions.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(SHEX_EXPRESSION)) {
    mapShapeExpressionId.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(SHEX_CLOSED_SHAPE)) {
    mapShapeExpressionClosedShape.set(quad.subject.value, quad.object.equals(RDF_TRUE));
  }
  if (quad.predicate.equals(SHEX_SHAPE_EXPRESSION)) {
    mapIriShapeExpression.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(SHEX_MAX)) {
    mapIriCardinalityMax.set(quad.subject.value, Number(quad.object.value));
  }
  if (quad.predicate.equals(SHEX_MIN)) {
    mapIriCardinalityMin.set(quad.subject.value, Number(quad.object.value));
  }
  if (quad.predicate.equals(SHEX_VALUE_EXPR)) {
    mapIriConstraint.set(quad.subject.value, quad.object);
  }
}

export class ShapePoorlyFormatedError extends Error {
  public constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, ShapePoorlyFormatedError.prototype);
  }
}

type ShapeError = ShapePoorlyFormatedError | InconsistentPositiveAndNegativePredicateError;
