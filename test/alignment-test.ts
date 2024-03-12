import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { PropertyObject, hasOneAlign, ShapeWithPositivePredicate } from '../lib/aligment';
import type { IShape } from '../lib/aligment';

const DF = new DataFactory<RDF.BaseQuad>();

const AN_OBJECT = DF.namedNode('an object');

describe('SimplePropertyObject', () => {
  describe('isAlignedWithShape', () => {
    it('should be align with a shape with the right predicate', () => {
      const predicate = 'foo';
      const object: RDF.Term = AN_OBJECT;
      const property_object = new PropertyObject(predicate, object);

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
      const property_object = new PropertyObject(predicate, object);
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
      const property_object = new PropertyObject(predicate, object);
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
      const property_object = new PropertyObject(predicate, object);
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
      const property_object = new PropertyObject(predicate, object);
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
      const property_object = new PropertyObject(predicate, object);
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
      const property_object = new PropertyObject(predicate, object);
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
      const property_object = new PropertyObject(predicate, object);
      const shape: IShape = {
        name: 'foo',
        expectedPredicate: () => [ '1', predicate, '2' ],
        rejectedPredicate: () => [ '3', '75', predicate, '21' ],
      };
      expect(property_object.isAlignedWithShape(shape)).toBe(false);
    });
  });
});

describe('hasOneAlign', () => {
  it('should return undefined given an empty queryProperties array', () => {
    const predicate = 'foo';
    const queryProperties: PropertyObject[] = [];
    const shape: IShape = {
      name: 'foo',
      expectedPredicate: () => [ predicate, '1', '2' ],
      rejectedPredicate: () => [],
    };
    expect(hasOneAlign(queryProperties, shape))
      .toBeUndefined();
  });

  it('should return true given an array of properties with on align property', () => {
    const predicate = 'foo';
    const queryProperties: PropertyObject[] = [ new PropertyObject(predicate, AN_OBJECT) ];
    const shape: IShape = {
      name: 'foo',
      expectedPredicate: () => [ predicate, '1', '2' ],
      rejectedPredicate: () => [],
    };
    expect(hasOneAlign(queryProperties, shape))
      .toBe(true);
  });

  it('should return true given an array of properties with all the properties aligned', () => {
    const predicates = [ 'foo', 'bar', 'boo' ];
    const queryProperties: PropertyObject[] =
            predicates.map(predicate => new PropertyObject(predicate, AN_OBJECT));
    const shape: IShape = {
      name: 'foo',
      expectedPredicate: () => [ ...predicates, '1', '2' ],
      rejectedPredicate: () => [],
    };
    expect(hasOneAlign(queryProperties, shape))
      .toBe(true);
  });

  it('should return true given an array of properties with some properties aligned', () => {
    const predicates = [ 'foo', 'bar', 'boo' ];
    const queryProperties: PropertyObject[] =
            [ ...predicates, 'a', 'b', 'c' ].map(predicate => new PropertyObject(predicate, AN_OBJECT));
    const shape: IShape = {
      name: 'foo',
      expectedPredicate: () => [ ...predicates, '1', '2' ],
      rejectedPredicate: () => [],
    };
    expect(hasOneAlign(queryProperties, shape))
      .toBe(true);
  });

  it('should return false given an array of properties with no properties aligned', () => {
    const predicates = [ 'foo', 'bar', 'boo' ];
    const queryProperties: PropertyObject[] =
            [ 'a', 'b', 'c' ].map(predicate => new PropertyObject(predicate, AN_OBJECT));

    const shape: IShape = {
      name: 'foo',
      expectedPredicate: () => [ ...predicates, '1', '2' ],
      rejectedPredicate: () => [],
    };
    expect(hasOneAlign(queryProperties, shape))
      .toBe(false);
  });

  it('should return false given an array of properties with no align properties and a rejected predicate', () => {
    const predicates = [ 'foo', 'bar', 'boo' ];
    const queryProperties: PropertyObject[] =
            predicates.map(predicate => new PropertyObject(predicate, AN_OBJECT));
    const shape: IShape = {
      name: 'foo',
      expectedPredicate: () => [ '1', '2' ],
      rejectedPredicate: () => [ 'abc', 'def', predicates[0] ],
    };
    expect(hasOneAlign(queryProperties, shape))
      .toBe(false);
  });
});

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

