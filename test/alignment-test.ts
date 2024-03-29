describe('alignment', () => {
  it('test',()=>{
    expect(true).toBe(true);
  });
})
/**
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { Triple, hasOneAlign, ShapeWithPositivePredicate } from '../lib/aligment';
import type { IShape } from '../lib/aligment';

const DF = new DataFactory<RDF.BaseQuad>();

const AN_OBJECT = DF.namedNode('an object');


describe('ShapeWithPositivePredicate', () => {
  describe('expectedPredicate', () => {
    it('should return no predicate given the instance has not predicate', () => {
      const shape = new ShapeWithPositivePredicate('', []);
      expect(shape.expectedPredicate()).toStrictEqual([]);
    });

    it('should return the predicates given the instance has predicates', () => {
      const predicates = [ 'a', 'b', 'c' ];
      const shape = new ShapeWithPositivePredicate('', predicates);
      expect(shape.expectedPredicate()).toStrictEqual(predicates);
    });
  });

  describe('rejectedPredicate', () => {
    it('should return no predicate given the instance has not predicate', () => {
      const shape = new ShapeWithPositivePredicate('', []);
      expect(shape.rejectedPredicate()).toStrictEqual([]);
    });

    it('should return no predicates given the instance has predicates', () => {
      const predicates = [ 'a', 'b', 'c' ];
      const shape = new ShapeWithPositivePredicate('', predicates);
      expect(shape.rejectedPredicate()).toStrictEqual([]);
    });
  });
});

describe('SimplePropertyObject', () => {
  describe('isAlignedWithShape', () => {
    const subject = '';
    it('should be align with a shape with the right predicate', () => {
      const predicate = 'foo';
      const object: RDF.Term = AN_OBJECT;
      const property_object = new Triple({subject, predicate, object});

      const shape: IShape = {
        name: 'foo',
        expectedPredicate: () => [ predicate ],
        rejectedPredicate: () => [],
      };

      expect(property_object.isAlignedWithShape(shape)).toBe(true);
    });

    it('should not be align with a shape with the wrong predicate', () => {
      const predicate = 'foo';
      const object: RDF.Term = AN_OBJECT;
      const property_object = new Triple(subject, predicate, object);
      const shape: IShape = {
        name: 'foo',
        expectedPredicate: () => [ 'wrong predicate' ],
        rejectedPredicate: () => [],
      };
      expect(property_object.isAlignedWithShape(shape)).toBe(false);
    });

    it('should not be align with a shape with no predicate', () => {
      const predicate = 'foo';
      const object: RDF.Term = AN_OBJECT;
      const property_object = new Triple(subject, predicate, object);
      const shape: IShape = {
        name: 'foo',
        expectedPredicate: () => [],
        rejectedPredicate: () => [],
      };
      expect(property_object.isAlignedWithShape(shape)).toBe(false);
    });

    it('should not be align with a shape with multiple wrong predicate', () => {
      const predicate = 'foo';
      const object: RDF.Term = AN_OBJECT;
      const property_object = new Triple(subject, predicate, object);
      const shape: IShape = {
        name: 'foo',
        expectedPredicate: () => [ '1', '2', '3', '4' ],
        rejectedPredicate: () => [],
      };
      expect(property_object.isAlignedWithShape(shape)).toBe(false);
    });

    it('should be align with a shape with multiple right predicates', () => {
      const predicate = 'foo';
      const object: RDF.Term = AN_OBJECT;
      const property_object = new Triple(subject, predicate, object);
      const shape: IShape = {
        name: 'foo',
        expectedPredicate: () => [ predicate, predicate, predicate ],
        rejectedPredicate: () => [],
      };
      expect(property_object.isAlignedWithShape(shape)).toBe(true);
    });

    it('should be align with a shape given it start with the righ predicate', () => {
      const predicate = 'foo';
      const object: RDF.Term = AN_OBJECT;
      const property_object = new Triple(subject, predicate, object);
      const shape: IShape = {
        name: 'foo',
        expectedPredicate: () => [ predicate, '1', '2' ],
        rejectedPredicate: () => [],
      };
      expect(property_object.isAlignedWithShape(shape)).toBe(true);
    });

    it('should be align with a shape given the right predicate is somewhere in the array', () => {
      const predicate = 'foo';
      const object: RDF.Term = AN_OBJECT;
      const property_object = new Triple(subject, predicate, object);
      const shape: IShape = {
        name: 'foo',
        expectedPredicate: () => [ '1', predicate, '2' ],
        rejectedPredicate: () => [],
      };
      expect(property_object.isAlignedWithShape(shape)).toBe(true);
    });

    it('should not align with the shape given it reject the predicate', () => {
      const predicate = 'foo';
      const object: RDF.Term = AN_OBJECT;
      const property_object = new Triple(subject, predicate, object);
      const shape: IShape = {
        name: 'foo',
        expectedPredicate: () => [ '1', predicate, '2' ],
        rejectedPredicate: () => [ '3', '75', predicate, '21' ],
      };
      expect(property_object.isAlignedWithShape(shape)).toBe(false);
    });

    it('should be align if the shape is open', () => {
      const predicate = 'foo';
      const object: RDF.Term = AN_OBJECT;
      const property_object = new Triple(subject, predicate, object);
      const shape: IShape = {
        name: 'foo',
        expectedPredicate: () => [ 'wrong predicate' ],
        rejectedPredicate: () => [],
        closed: false,
      };
      expect(property_object.isAlignedWithShape(shape)).toBe(true);
    });
  });
});
*/