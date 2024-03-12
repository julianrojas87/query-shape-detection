import type * as RDF from '@rdfjs/types';
import type { IShape } from './aligment';
import { ShapeWithPositivePredicate } from './aligment';
import {
  SHEX_PREDICATE,
  SHEX_EXPRESSION,
  IRI_FIRST_RDF_LIST,
  SHEX_EXPRESSIONS,
  IRI_REST_RDF_LIST,
} from './constant';

export function shapeFromQuadArray(quads: RDF.Quad[], shapeIri: string): IShape | Error {
  const mapIdPredicate: Map<string, string> = new Map();
  const mapPrevCurrentList: Map<string, string> = new Map();
  const mapLogicLinkIdExpressions: Map<string, string> = new Map();
  const mapShapeExpressionId: Map<string, string> = new Map();
  const mapPrevNextList: Map<string, string> = new Map();

  for (const quad of quads) {
    parseShapeQuads(
      quad,
      mapIdPredicate,
      mapPrevCurrentList,
      mapLogicLinkIdExpressions,
      mapShapeExpressionId,
      mapPrevNextList,
    );
  }

  const shape = concatShapeInfo(
    mapIdPredicate,
    mapPrevCurrentList,
    mapLogicLinkIdExpressions,
    mapShapeExpressionId,
    mapPrevNextList,
    shapeIri,
  );
  if (shape === undefined) {
    return new Error('the shape is not defined with those triples');
  }
  return shape;
}
export function shapeFromQuadStream(quadStream: RDF.Stream, shapeIri: string): Promise<IShape | Error> {
  const mapIdPredicate: Map<string, string> = new Map();
  const mapPrevCurrentList: Map<string, string> = new Map();
  const mapLogicLinkIdExpressions: Map<string, string> = new Map();
  const mapShapeExpressionId: Map<string, string> = new Map();
  const mapPrevNextList: Map<string, string> = new Map();

  return new Promise(resolve => {
    quadStream.on('data', (quad: RDF.Quad) => {
      parseShapeQuads(
        quad,
        mapIdPredicate,
        mapPrevCurrentList,
        mapLogicLinkIdExpressions,
        mapShapeExpressionId,
        mapPrevNextList,
      );
    });

    quadStream.on('error', error => {
      resolve(error);
    });
    quadStream.on('end', () => {
      const shape = concatShapeInfo(
        mapIdPredicate,
        mapPrevCurrentList,
        mapLogicLinkIdExpressions,
        mapShapeExpressionId,
        mapPrevNextList,
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

function concatShapeInfo(
  mapIdPredicate: Map<string, string>,
  mapPrevCurrentList: Map<string, string>,
  mapLogicLinkIdExpressions: Map<string, string>,
  mapShapeExpressionId: Map<string, string>,
  mapPrevNextList: Map<string, string>,
  shapeIri: string,
): IShape | undefined {
  const predicates: string[] = [];
  const expression = mapShapeExpressionId.get(shapeIri);
  if (expression === undefined) {
    return undefined;
  }
  const expressions = mapLogicLinkIdExpressions.get(expression);
  if (expressions === undefined) {
    return undefined;
  }
  let current = mapPrevCurrentList.get(expressions);

  while (current !== undefined) {
    const predicate = mapIdPredicate.get(current);
    if (predicate !== undefined) {
      predicates.push(predicate);
    }
    current = mapPrevNextList.get(current);
  }
  return new ShapeWithPositivePredicate(shapeIri, predicates);
}

function parseShapeQuads(
  quad: RDF.Quad,
  mapIdPredicate: Map<string, string>,
  mapPrevCurrentList: Map<string, string>,
  mapLogicLinkIdExpressions: Map<string, string>,
  mapShapeExpressionId: Map<string, string>,
  mapPrevNextList: Map<string, string>,
): void {
  if (quad.predicate.equals(SHEX_PREDICATE)) {
    mapIdPredicate.set(quad.subject.value, quad.object.value);
  }
  if (quad.predicate.equals(IRI_FIRST_RDF_LIST)) {
    mapPrevCurrentList.set(quad.object.value, quad.subject.value);
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
}
