import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { Shape } from '../lib/Shape';
import { Triple } from '../lib/Triple';

const DF = new DataFactory<RDF.BaseQuad>();

const AN_OBJECT = DF.namedNode('an object');

describe('Triple', () => {
  describe('toObject', () => {
    it('should return the object triple', () => {
      const objectTriple: any = {
        subject: 'a',
        predicate: 'b',
        object: 'c',
      };
      const triple = new Triple(objectTriple);

      expect(triple.toObject()).toStrictEqual(objectTriple);
    });
  });

  describe('isWeaklyAlign', () => {
    it('should align with an open shape', () => {
      const triple = new Triple({
        subject: 'a',
        predicate: 'b',
        object: AN_OBJECT,
      });
      const shape = new Shape({ closed: false, positivePredicates: [ 'b' ], name: 'foo' });

      expect(triple.isWeaklyAlign(shape)).toBe(true);
    });

    it('should align with a close shape given a shared predicate', () => {
      const triple = new Triple({
        subject: 'a',
        predicate: 'b',
        object: AN_OBJECT,
      });
      const shape = new Shape({
        closed: true,
        positivePredicates: [ 'd', 'e', 'b' ],
        negativePredicates: [ '1', '2' ],
        name: 'foo',
      });

      expect(triple.isWeaklyAlign(shape)).toBe(true);
    });

    it('should not align with a close shape with no shared predicate', () => {
      const triple = new Triple({
        subject: 'a',
        predicate: 'b',
        object: AN_OBJECT,
      });
      const shape = new Shape({
        closed: true,
        positivePredicates: [ 'd', 'e', 'a' ],
        negativePredicates: [ '1', '2', 'b' ],
        name: 'foo',
      });

      expect(triple.isWeaklyAlign(shape)).toBe(false);
    });
  });
});
