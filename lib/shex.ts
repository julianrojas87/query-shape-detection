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

/**
 * Parse a Shex shape from a set of quads
 * @param {RDF.Stream | RDF.Quad[]} quads - Quads representing a shape
 * @param {string} shapeIri - The iri of the desired shape
 * @returns {Promise<IShape | ShapeError>} The shape
 */
export function shapeFromQuads(quads: RDF.Stream | RDF.Quad[], shapeIri: string): Promise<IShape | ShapeError> {
  if (Array.isArray(quads)) {
    return new Promise(resolve => {
      resolve(shapeFromQuadArray(quads, shapeIri));
    });
  }
  return shapeFromQuadStream(quads, shapeIri);
}

/**
 * Parse a Shex shape from a quad stream
 * @param {RDF.Stream} quads - Quads representing a shape
 * @param {string} shapeIri - The iri of the desired shape
 * @returns {Promise<IShape | ShapeError>} The shape
 */
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

/**
 * Parse a Shex shape from an array of quad
 * @param {RDF.Quad[]} quads - Quads representing a shape
 * @param {string} shapeIri - The iri of the desired shape
 * @returns {Promise<IShape | ShapeError>} The shape
 */
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

/**
 * Transform an arranged set of triple into a Shape
 * @param {IMapTripleShex} mapTripleShex - Triple information to build a shape
 * @param {string} shapeIri - The iri of a shape
 * @returns {IShape | ShapeError} - The resulting shape
 */
function concatShapeInfo(
  mapTripleShex: IMapTripleShex,
  shapeIri: string,
): IShape | ShapeError {
  const positivePredicates: IPredicate[] = [];
  const negativePredicates: string[] = [];
  const argsFunctionPredicate: IAppendPredicateArgs = {
    mapIdPredicate: mapTripleShex.mapIdPredicate,
    mapIriCardinalityMin: mapTripleShex.mapIriCardinalityMin,
    mapIriCardinalityMax: mapTripleShex.mapIriCardinalityMax,
    mapIriConstraint: mapTripleShex.mapIriConstraint,
    mapIriDatatype: mapTripleShex.mapIriDatatype,
    positivePredicates,
    negativePredicates,
  };
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
    argsFunctionPredicate.current = expression;
    const predicateAdded = appendPredicates(<Required<IAppendPredicateArgs>> argsFunctionPredicate);
    if (!predicateAdded) {
      return new ShapePoorlyFormatedError('there are no predicates in the shape');
    }
  } else {
    current = mapTripleShex.mapPrevCurrentList.get(expressions);
    next = mapTripleShex.mapPrevNextList.get(expressions);
  }

  // Traverse the RDF list
  while (current !== undefined) {
    argsFunctionPredicate.current = current;
    appendPredicates(<Required<IAppendPredicateArgs>> argsFunctionPredicate);
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

/**
 * Interpret an RDF term of a constraint into an object
 * @param {RDF.Term | undefined} constraint - The constraint RDF term
 * @param {Map<string, string>} mapIriDatatype - A map of IRI and data type
 * @returns {IContraint | undefined} - The constraint or undefined if the constraint is not supported
 */
function interpretConstraint(
  constraint: RDF.Term | undefined,
  mapIriDatatype: Map<string, string>,
): IContraint | undefined {
  if (constraint === undefined) {
    return undefined;
  }

  if (constraint.termType === 'NamedNode') {
    return {
      value: new Set([ constraint.value ]),
      type: ContraintType.SHAPE,
    };
  }

  if (constraint.termType === 'BlankNode') {
    const dataType = mapIriDatatype.get(constraint.value);
    if (dataType !== undefined) {
      return {
        value: new Set([ dataType ]),
        type: ContraintType.TYPE,
      };
    }
  }

  return undefined;
}

/**
 * Add the predicate to the predicat lists
 * @param {Required<IAppendPredicateArgs>} args - Argument to build a predicate
 * @returns {boolean} - return true if the predicate was added
 */
function appendPredicates(
  args: Required<IAppendPredicateArgs>,
): boolean {
  const predicate = args.mapIdPredicate.get(args.current);
  if (predicate !== undefined) {
    const min = args.mapIriCardinalityMin.get(args.current);
    const max = args.mapIriCardinalityMax.get(args.current);
    if (min === max && min === 0) {
      args.negativePredicates.push(predicate);
    } else {
      const constraintIri = args.mapIriConstraint.get(args.current);
      const constraint = interpretConstraint(constraintIri, args.mapIriDatatype);
      args.positivePredicates.push({
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
/**
 * Parse the quad into the ShEx map object
 * @param {RDF.Quad} quad - A quad
 * @param {IMapTripleShex} mapTripleShex - A map of ShEx shape information
 */
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
/**
 * An error to indicate that the shape is poorly formated
 */
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

interface IAppendPredicateArgs {
  mapIdPredicate: Map<string, string>;
  mapIriCardinalityMin: Map<string, number>;
  mapIriCardinalityMax: Map<string, number>;
  mapIriConstraint: Map<string, RDF.Term>;
  mapIriDatatype: Map<string, string>;
  positivePredicates: IPredicate[];
  negativePredicates: string[];
  current?: string;
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
