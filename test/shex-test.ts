import { readFileSync } from 'fs';
import type * as RDF from '@rdfjs/types';
import * as N3 from 'n3';
import { DataFactory } from 'rdf-data-factory';
import streamifyArray from 'streamify-array';
import type { IShape } from '../lib/aligment';
import { SHEX_SHAPE, TYPE_DEFINITION, SHEX_PREDICATE } from '../lib/constant';
import { shapeFromQuads } from '../lib/shex';

const DF = new DataFactory<RDF.BaseQuad>();
const n3Parser = new N3.Parser();

describe('shapeFromQuads', () => {
  const shapeIri = 'http:exemple.ca/foo';

  const emptyQuad: any = [];
  const unRelatedQuads: any = [
    DF.quad(
      DF.namedNode('foo'),
      DF.namedNode(shapeIri),
      DF.blankNode(),
    ),
    DF.quad(
      DF.blankNode(),
      DF.namedNode('bar'),
      DF.blankNode(),
    ),
    DF.quad(
      DF.namedNode('a'),
      TYPE_DEFINITION,
      SHEX_SHAPE,
    ),
    DF.quad(
      DF.namedNode('a'),
      SHEX_PREDICATE,
      DF.blankNode(),
    ),
  ];
  const shapeWithOneProperty: any = n3Parser.parse(readFileSync('./test/shape/shex_shape_one_property.ttl').toString());
  const closedShapeWithMultipleProperties = n3Parser.parse(
    readFileSync('./test/shape/shex_shape_closed_multiple_properties.ttl').toString(),
  );
  const twoShapes = n3Parser.parse(readFileSync('./test/shape/shex_two_shapes.ttl').toString());
  const shapeWithShapeExpression = n3Parser.parse(
    readFileSync('./test/shape/shex_with_shape_expression.ttl').toString(),
  );

  const shapeNoPredicate = n3Parser.parse(readFileSync('./test/shape/shex_invalid_shape_no_predicate.ttl').toString());
  const shapeIncompleteRdfList = n3Parser.parse(
    readFileSync('./test/shape/shex_invalid_shape_incomplete_rdf_list.ttl').toString(),
  );

  describe('quad array', () => {
    it('should return an error given an empty quad array', async() => {
      expect(await shapeFromQuads(emptyQuad, shapeIri)).toBeInstanceOf(Error);
    });

    it('should return an error given unrelated quads', async() => {
      expect(await shapeFromQuads(unRelatedQuads, shapeIri)).toBeInstanceOf(Error);
    });

    it('should return a Shape with one property given some quads', async() => {
      const shape = await shapeFromQuads(shapeWithOneProperty, shapeIri);

      expect(shape).not.toBeInstanceOf(Error);
      expect((<IShape>shape).expectedPredicate()).toStrictEqual([ 'http://example.org/state' ]);
      expect((<IShape>shape).closed).toBe(false);
      expect((<IShape>shape).name).toBe(shapeIri);
    });

    it('should return a closed Shape with multiple properties given some quads', async() => {
      const shape = await shapeFromQuads(closedShapeWithMultipleProperties, shapeIri);
      const expectedPredicates: string[] = [
        'http://foaf.example/#me',
        'http://ex.example/#state',
        'http://foaf.example/#name',
        'http://foaf.example/#mbox',
        'http://foaf.example/#hunter',
      ];
      expect(shape).not.toBeInstanceOf(Error);
      expect((<IShape>shape).closed).toBe(true);
      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      expect((<IShape>shape).expectedPredicate().sort()).toStrictEqual(expectedPredicates.sort());
      expect((<IShape>shape).name).toBe(shapeIri);
    });

    it('should return a  Shape with multiple properties  given some quads representing two shapes', async() => {
      const shape = await shapeFromQuads(twoShapes, shapeIri);
      const expectedPredicates: string[] = [
        'http://foaf.example/#name',
        'http://foaf.example/#mbox',
      ];
      expect(shape).not.toBeInstanceOf(Error);
      expect((<IShape>shape).closed).toBe(false);
      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      expect((<IShape>shape).expectedPredicate().sort()).toStrictEqual(expectedPredicates.sort());
      expect((<IShape>shape).name).toBe(shapeIri);
    });

    it('should return an error given quads representing a shape with no predicate', async() => {
      expect(await shapeFromQuads(shapeNoPredicate, shapeIri)).toBeInstanceOf(Error);
    });

    it('should return an error given quads representing a shape with an incomplete RDF list', async() => {
      expect(await shapeFromQuads(shapeIncompleteRdfList, shapeIri)).toBeInstanceOf(Error);
    });

    it(`should return a closed Shape with multiple properties  
    given some quads representing a shape with a shape expression`, async() => {
      const shape = await shapeFromQuads(shapeWithShapeExpression, shapeIri);
      const prefix = 'http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary';
      const expectedPredicates: string[] = [
        'http://www.w3.org/ns/pim/space#storage',
        `${prefix}/id`,
        `${prefix}/firstName`,
        `${prefix}/lastName`,
        `${prefix}/gender`,
        `${prefix}/birthday`,
        `${prefix}/locationIP`,
        `${prefix}/browserUsed`,
        `${prefix}/creationDate`,
        `${prefix}/isLocatedIn`,
        `${prefix}/speaks`,
        `${prefix}/email`,
        `${prefix}/hasInterest`,
        `${prefix}/studyAt`,
      ];
      expect(shape).not.toBeInstanceOf(Error);
      expect((<IShape>shape).closed).toBe(true);
      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      expect((<IShape>shape).expectedPredicate().sort()).toStrictEqual(expectedPredicates.sort());
      expect((<IShape>shape).name).toBe(shapeIri);
    });
  });

  describe('quad stream', () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let emptyQuad: any;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let unRelatedQuads: any;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let shapeWithOneProperty: any;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let closedShapeWithMultipleProperties: any;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let twoShapes: any;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let shapeWithShapeExpression: any;

    // eslint-disable-next-line @typescript-eslint/no-shadow
    let shapeNoPredicate: any;
    // eslint-disable-next-line @typescript-eslint/no-shadow
    let shapeIncompleteRdfList: any;

    const unRelatedQuadsArray: any = [
      DF.quad(
        DF.namedNode('foo'),
        DF.namedNode(shapeIri),
        DF.blankNode(),
      ),
      DF.quad(
        DF.blankNode(),
        DF.namedNode('bar'),
        DF.blankNode(),
      ),
      DF.quad(
        DF.namedNode('a'),
        TYPE_DEFINITION,
        SHEX_SHAPE,
      ),
      DF.quad(
        DF.namedNode('a'),
        SHEX_PREDICATE,
        DF.blankNode(),
      ),
    ];
    beforeEach(() => {
      emptyQuad = populateStream([]);
      unRelatedQuads = populateStream(unRelatedQuadsArray);
      shapeWithOneProperty = populateStream('./test/shape/shex_shape_one_property.ttl');
      closedShapeWithMultipleProperties = populateStream('./test/shape/shex_shape_closed_multiple_properties.ttl');
      twoShapes = populateStream('./test/shape/shex_two_shapes.ttl');

      shapeNoPredicate = populateStream('./test/shape/shex_invalid_shape_no_predicate.ttl');
      shapeIncompleteRdfList = populateStream('./test/shape/shex_invalid_shape_incomplete_rdf_list.ttl');
      shapeWithShapeExpression = populateStream('./test/shape/shex_with_shape_expression.ttl');
    });

    it('should return an error given an empty stream', async() => {
      expect(await shapeFromQuads(emptyQuad, shapeIri)).toBeInstanceOf(Error);
    });

    it('should return an error given unrelated quads', async() => {
      expect(await shapeFromQuads(unRelatedQuads, shapeIri)).toBeInstanceOf(Error);
    });

    it('should return a Shape with one property given some quads', async() => {
      const shape = await shapeFromQuads(shapeWithOneProperty, shapeIri);

      expect(shape).not.toBeInstanceOf(Error);
      expect((<IShape>shape).expectedPredicate()).toStrictEqual([ 'http://example.org/state' ]);
      expect((<IShape>shape).closed).toBe(false);
      expect((<IShape>shape).name).toBe(shapeIri);
    });

    it('should return a closed Shape with multiple properties  given some quads', async() => {
      const shape = await shapeFromQuads(closedShapeWithMultipleProperties, shapeIri);
      const expectedPredicates: string[] = [
        'http://foaf.example/#me',
        'http://ex.example/#state',
        'http://foaf.example/#name',
        'http://foaf.example/#mbox',
        'http://foaf.example/#hunter',
      ];
      expect(shape).not.toBeInstanceOf(Error);
      expect((<IShape>shape).closed).toBe(true);
      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      expect((<IShape>shape).expectedPredicate().sort()).toStrictEqual(expectedPredicates.sort());
      expect((<IShape>shape).name).toBe(shapeIri);
    });

    it('should return a  Shape with multiple properties  given some quads representing two shapes', async() => {
      const shape = await shapeFromQuads(twoShapes, shapeIri);
      const expectedPredicates: string[] = [
        'http://foaf.example/#name',
        'http://foaf.example/#mbox',
      ];
      expect(shape).not.toBeInstanceOf(Error);
      expect((<IShape>shape).closed).toBe(false);
      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      expect((<IShape>shape).expectedPredicate().sort()).toStrictEqual(expectedPredicates.sort());
      expect((<IShape>shape).name).toBe(shapeIri);
    });

    it('should return an error given quads representing a shape with no predicate', async() => {
      expect(await shapeFromQuads(shapeNoPredicate, shapeIri)).toBeInstanceOf(Error);
    });

    it('should return an error given quads representing a shape with an incomplete RDF list', async() => {
      expect(await shapeFromQuads(shapeIncompleteRdfList, shapeIri)).toBeInstanceOf(Error);
    });

    it(`should return a closed Shape with multiple properties  
    given some quads representing a shape with a shape expression`, async() => {
      const shape = await shapeFromQuads(shapeWithShapeExpression, shapeIri);
      const prefix = 'http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary';
      const expectedPredicates: string[] = [
        'http://www.w3.org/ns/pim/space#storage',
        `${prefix}/id`,
        `${prefix}/firstName`,
        `${prefix}/lastName`,
        `${prefix}/gender`,
        `${prefix}/birthday`,
        `${prefix}/locationIP`,
        `${prefix}/browserUsed`,
        `${prefix}/creationDate`,
        `${prefix}/isLocatedIn`,
        `${prefix}/speaks`,
        `${prefix}/email`,
        `${prefix}/hasInterest`,
        `${prefix}/studyAt`,
      ];
      expect(shape).not.toBeInstanceOf(Error);
      expect((<IShape>shape).closed).toBe(true);
      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      expect((<IShape>shape).expectedPredicate().sort()).toStrictEqual(expectedPredicates.sort());
      expect((<IShape>shape).name).toBe(shapeIri);
    });

    it('should return an error given the stream return an error', async() => {
      const stream: any =
            {
              on(event: string, callback: any) {
                if (event === 'error') { return callback(new Error('foo')); }
              },
            };
      const err = await shapeFromQuads(stream, shapeIri);
      expect(err).toBeInstanceOf(Error);
      expect((<Error>err).message).toBe('foo');
    });
  });
});

function populateStream(source: string | RDF.Quad[]) {
  let quads;
  if (Array.isArray(source)) {
    quads = source;
  } else {
    quads = n3Parser.parse(readFileSync(source).toString());
  }
  return streamifyArray(quads);
}
