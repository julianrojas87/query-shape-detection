import type * as RDF from '@rdfjs/types';
import type { IShape } from './aligment';
import { ShapeWithPositivePredicate } from './aligment';
import {
  SHEX_PREDICATE,
  SHEX_EXPRESSION,
  IRI_FIRST_RDF_LIST,
  SHEX_EXPRESSIONS,
  IRI_REST_RDF_LIST,
  SHEX_CLOSED_SHAPE,
  RDF_TRUE,
} from './constant';

export function shapeFromQuads(quads: RDF.Stream | RDF.Quad[], shapeIri: string): Promise<IShape | Error> {
  if (Array.isArray(quads)) {
    return new Promise(resolve => {
      resolve(shapeFromQuadArray(quads, shapeIri));
    });
  }
  return shapeFromQuadStream(quads, shapeIri);
}

function shapeFromQuadStream(quadSteam: RDF.Stream, shapeIri: string): Promise<IShape | Error> {
  const mapIdPredicate: Map<string, string> = new Map();
  const mapPrevCurrentList: Map<string, string> = new Map();
  const mapLogicLinkIdExpressions: Map<string, string> = new Map();
  const mapShapeExpressionId: Map<string, string> = new Map();
  const mapPrevNextList: Map<string, string> = new Map();
  const mapShapeExpressionClosedShape: Map<string, boolean> = new Map();

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
        shapeIri,
      );
      if (shape === undefined) {
        resolve(new Error('the shape is not defined with those triples'));
        return;
      }
      resolve(shape);
    });
  });
}

function shapeFromQuadArray(quads: RDF.Quad[], shapeIri: string): IShape | Error {
  const mapIdPredicate: Map<string, string> = new Map();
  const mapPrevCurrentList: Map<string, string> = new Map();
  const mapLogicLinkIdExpressions: Map<string, string> = new Map();
  const mapShapeExpressionId: Map<string, string> = new Map();
  const mapPrevNextList: Map<string, string> = new Map();
  const mapShapeExpressionClosedShape: Map<string, boolean> = new Map();

  for (const quad of quads) {
    parseShapeQuads(
      quad,
      mapIdPredicate,
      mapPrevCurrentList,
      mapLogicLinkIdExpressions,
      mapShapeExpressionId,
      mapPrevNextList,
      mapShapeExpressionClosedShape,
    );
  }

  const shape = concatShapeInfo(
    mapIdPredicate,
    mapPrevCurrentList,
    mapLogicLinkIdExpressions,
    mapShapeExpressionId,
    mapPrevNextList,
    mapShapeExpressionClosedShape,
    shapeIri,
  );
  if (shape === undefined) {
    return new Error('the shape is not defined with those triples');
  }
  return shape;
}

function concatShapeInfo(
  mapIdPredicate: Map<string, string>,
  mapPrevCurrentList: Map<string, string>,
  mapLogicLinkIdExpressions: Map<string, string>,
  mapShapeExpressionId: Map<string, string>,
  mapPrevNextList: Map<string, string>,
  mapShapeExpressionClosedShape: Map<string, boolean>,
  shapeIri: string,
): IShape | undefined {
  const predicates: string[] = [];
  const expression = mapShapeExpressionId.get(shapeIri);

  if (expression === undefined) {
    return undefined;
  }
  const expressions = mapLogicLinkIdExpressions.get(expression);
  let current;
  let next;
  // If there is only one expression
  if (expressions === undefined) {
    const predicate = mapIdPredicate.get(expression);
    if (predicate !== undefined) {
      predicates.push(predicate);
    } else {
      return undefined;
    }
  } else {
    current = mapPrevCurrentList.get(expressions);
    next = mapPrevNextList.get(expressions);
  }

  // Traverse the RDF list
  while (current !== undefined) {
    const predicate = mapIdPredicate.get(current);
    if (predicate !== undefined) {
      predicates.push(predicate);
    }
    if (next === undefined) {
      return undefined;
    }
    current = mapPrevCurrentList.get(next);
    next = mapPrevNextList.get(next);
  }
  const isClosed = mapShapeExpressionClosedShape.get(shapeIri);
  return new ShapeWithPositivePredicate(shapeIri, predicates, isClosed);
}

function parseShapeQuads(
  quad: RDF.Quad,
  mapIdPredicate: Map<string, string>,
  mapPrevCurrentList: Map<string, string>,
  mapLogicLinkIdExpressions: Map<string, string>,
  mapShapeExpressionId: Map<string, string>,
  mapPrevNextList: Map<string, string>,
  mapShapeExpressionClosedShape: Map<string, boolean>,
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
}
