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

  describe('discriminantShape', () => {
    it('should return the same shape given no other shapes', () => {
      const positivePredicates = ['a', 'b', 'c'];
      const negativePredicates = ['d', 'e', 'f'];
      const others: any = [];
      const expectedShape = {
        name: 'foo',
        positivePredicates: positivePredicates,
        negativePredicates: negativePredicates,
        closed: true
      };
      const shape = new Shape({ name: 'foo', positivePredicates, negativePredicates, closed: true });

      const resp = shape.discriminantShape(others);

      expect(resp).toBeDefined();
      expect(resp?.toObject()).toStrictEqual(expectedShape);
    });

    it('should return undefined given an open shape', () => {
      const positivePredicates = ['a', 'b', 'c'];
      const negativePredicates = ['d', 'e', 'f'];
      const others: any = [
        new Shape({ name: 'foo1', positivePredicates: ['1', 'a' ,'2'], negativePredicates, closed: true }),
        new Shape({ name: 'foo2', positivePredicates: ['3', '4' ,'b'], negativePredicates, closed: true }),
        new Shape({ name: 'foo3', positivePredicates: ['5', '6' ,'7'], negativePredicates, closed: true })
      ];

      const shape = new Shape({ name: 'foo', positivePredicates, negativePredicates, closed: false });

      const resp = shape.discriminantShape(others);
      expect(resp).toBeUndefined();
    });

    it('should return the initial shape given one of the other shape is open', () => {
      const positivePredicates = ['a', 'b', 'c'];
      const negativePredicates = ['d', 'e', 'f'];
      const others: any = [
        new Shape({ name: 'foo1', positivePredicates: ['1', 'a' ,'2'], negativePredicates, closed: true }),
        new Shape({ name: 'foo2', positivePredicates: ['3', '4' ,'b'], negativePredicates, closed: true }),
        new Shape({ name: 'foo3', positivePredicates: ['5', '6' ,'7'], negativePredicates, closed: false })
      ];
      const expectedShape = {
        name: 'foo',
        positivePredicates: positivePredicates,
        negativePredicates: negativePredicates,
        closed: true
      };

      const shape = new Shape({ name: 'foo', positivePredicates, negativePredicates, closed: true });

      const resp = shape.discriminantShape(others);
      expect(resp).toBeDefined();
      expect(resp?.toObject()).toStrictEqual(expectedShape);
    });
    
    it('should return discriminant shape', () => {
      const positivePredicates = ['a', 'b', 'g', 'c', 'h' ];
      const negativePredicates = ['d', 'e', 'f'];
      const others: any = [
        new Shape({ name: 'foo1', positivePredicates: ['1', 'a' ,'2'], negativePredicates, closed: true }),
        new Shape({ name: 'foo2', positivePredicates: ['3', '4' ,'b'], negativePredicates, closed: true }),
        new Shape({ name: 'foo3', positivePredicates: ['5', '6' ,'7'], negativePredicates, closed: true })
      ];
      const expectedShape = {
        name: 'foo',
        positivePredicates: ['g','c', 'h'],
        negativePredicates: negativePredicates,
        closed: true
      };

      const shape = new Shape({ name: 'foo', positivePredicates, negativePredicates, closed: true });

      const resp = shape.discriminantShape(others);
      expect(resp).toBeDefined();
      expect(resp?.toObject()).toStrictEqual(expectedShape);
    });

    it('should return discriminant shape if there are no unique shape', () => {
      const positivePredicates = ['a', 'b', 'c' ];
      const negativePredicates = ['d', 'e', 'f'];
      const others: any = [
        new Shape({ name: 'foo1', positivePredicates: ['1', 'a' ,'2'], negativePredicates, closed: true }),
        new Shape({ name: 'foo2', positivePredicates: ['3', '4' ,'b'], negativePredicates, closed: true }),
        new Shape({ name: 'foo3', positivePredicates: ['c', '6' ,'7'], negativePredicates, closed: true })
      ];
      const expectedShape = {
        name: 'foo',
        positivePredicates: [],
        negativePredicates: negativePredicates,
        closed: true
      };

      const shape = new Shape({ name: 'foo', positivePredicates, negativePredicates, closed: true });

      const resp = shape.discriminantShape(others);
      expect(resp).toBeDefined();
      expect(resp?.toObject()).toStrictEqual(expectedShape);
    });

  });
});