import { Shape, InconsistentPositiveAndNegativePredicateError } from '../lib/Shape';

describe('Shape', () => {
  describe('constructor', () => {
    it('should throw an error given a shape with inconsistent positive and negative properties', () => {
      expect(() =>
        new Shape({ name: 'foo', positivePredicates: ['a', 'b'], negativePredicates: ['c', 'a'] }))
        .toThrow(InconsistentPositiveAndNegativePredicateError)
    });
  });

  describe('toObject', () => {
    it('should return a shape with no predicate', () => {
      const shape = new Shape({ name: '', positivePredicates: [] });
      const expectedShape = {
        name: '',
        positivePredicates: [],
        negativePredicates: [],
        closed: false
      };

      expect(shape.toObject()).toStrictEqual(expectedShape);
    });

    it('should return a shape with positive predicates', () => {
      const predicates = ['a', 'b', 'c'];
      const shape = new Shape({ name: 'foo', positivePredicates: predicates, closed: true });
      const expectedShape = {
        name: 'foo',
        positivePredicates: predicates,
        negativePredicates: [],
        closed: true
      };

      expect(shape.toObject()).toStrictEqual(expectedShape);
    });

    it('should return a shape with negative predicates', () => {
      const predicates = ['a', 'b', 'c'];
      const shape = new Shape({ name: 'foo', positivePredicates: [], negativePredicates: predicates, closed: true });
      const expectedShape = {
        name: 'foo',
        positivePredicates: [],
        negativePredicates: predicates,
        closed: true
      };

      expect(shape.toObject()).toStrictEqual(expectedShape);
    });

    it('should return a shape with positive and negative predicates', () => {
      const positivePredicates = ['a', 'b', 'c'];
      const negativePredicates = ['d', 'e', 'f'];

      const shape = new Shape({ name: 'foo', positivePredicates, negativePredicates });
      const expectedShape = {
        name: 'foo',
        positivePredicates: positivePredicates,
        negativePredicates: negativePredicates,
        closed: false
      };

      expect(shape.toObject()).toStrictEqual(expectedShape);
    });

    it('should throw an error if a the negative and positive predicate are shared', () => {
      const positivePredicates = ['a', 'b', 'c'];
      const negativePredicates = ['d', 'a', 'f'];

      expect(() => new Shape({ name: 'foo', positivePredicates, negativePredicates }))
        .toThrow('the predicate a is defined in the positive and the negative property');
    });
  });

});