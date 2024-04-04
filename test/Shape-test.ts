import { Shape, InconsistentPositiveAndNegativePredicateError, ContraintType } from '../lib/Shape';

describe('Shape', () => {
  describe('constructor', () => {
    it('should throw an error given a shape with inconsistent positive and negative properties', () => {
      expect(() =>
        new Shape({ name: 'foo', positivePredicates: [ 'a', 'b' ], negativePredicates: [ 'c', 'a' ]}))
        .toThrow(InconsistentPositiveAndNegativePredicateError);
    });
  });

  describe('toObject', () => {
    it('should return a shape with no predicate', () => {
      const shape = new Shape({ name: '', positivePredicates: []});
      const expectedShape = {
        name: '',
        positivePredicates: [],
        negativePredicates: [],
        closed: false,
      };

      expect(shape.toObject()).toStrictEqual(expectedShape);
    });

    it('should return a shape with positive predicates', () => {
      const predicates = [ 'a', 'b', 'c' ];
      const shape = new Shape({ name: 'foo', positivePredicates: predicates, closed: true });
      const expectedShape = {
        name: 'foo',
        positivePredicates: predicates,
        negativePredicates: [],
        closed: true,
      };

      expect(shape.toObject()).toStrictEqual(expectedShape);
    });

    it('should return a shape with negative predicates', () => {
      const predicates = [ 'a', 'b', 'c' ];
      const shape = new Shape({ name: 'foo', positivePredicates: [], negativePredicates: predicates, closed: true });
      const expectedShape = {
        name: 'foo',
        positivePredicates: [],
        negativePredicates: predicates,
        closed: true,
      };

      expect(shape.toObject()).toStrictEqual(expectedShape);
    });

    it('should return a shape with positive and negative predicates', () => {
      const positivePredicates = [ 'a', 'b', 'c' ];
      const negativePredicates = [ 'd', 'e', 'f' ];

      const shape = new Shape({ name: 'foo', positivePredicates, negativePredicates });
      const expectedShape = {
        name: 'foo',
        positivePredicates,
        negativePredicates,
        closed: false,
      };

      expect(shape.toObject()).toStrictEqual(expectedShape);
    });

    it('should throw an error if a the negative and positive predicate are shared', () => {
      const positivePredicates = [ 'a', 'b', 'c' ];
      const negativePredicates = [ 'd', 'a', 'f' ];

      expect(() => new Shape({ name: 'foo', positivePredicates, negativePredicates }))
        .toThrow('the predicate a is defined in the positive and the negative property');
    });
  });

  describe('get', () => {
    const positivePredicates: any = [
      'a',
      {
        name: 'b',
        cardinality: { min: 0, max: 33 },
        constraint: {
          value: 'a',
          type: ContraintType.SHAPE,
        },
      },
      'c',
    ];
    const negativePredicates = [{ name: 'd' }, 'e', 'f' ];

    const shape = new Shape({ name: 'foo', positivePredicates, negativePredicates });

    it('should get a predicate with no extra information', () => {
      expect(shape.get('a')).toStrictEqual({
        name: 'a',
      });
    });

    it('should not get a non existent predicate', () => {
      expect(shape.get('no')).toBeUndefined();
    });

    it('should get a negative predicate', () => {
      expect(shape.get('d')).toStrictEqual({
        name: 'd',
        negative: true,
      });
    });

    it('should get a predicate with extra information', () => {
      expect(shape.get('b')).toStrictEqual({
        name: 'b',
        cardinality: { min: 0, max: 33 },
        constraint: {
          value: 'a',
          type: ContraintType.SHAPE,
        },
        optional: true,
      });
    });
  });

  describe('getAll', () => {
    const positivePredicates: any = [
      'a',
      {
        name: 'b',
        cardinality: { min: 0, max: 33 },
        constraint: {
          value: 'a',
          type: ContraintType.SHAPE,
        },
      },
      'c',
    ];
    const negativePredicates = [ 'd', 'e', 'f' ];

    const shape = new Shape({ name: 'foo', positivePredicates, negativePredicates });

    it('should get all predicates', () => {
      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      const expectedPredicates = [
        { name: 'a' },
        {
          name: 'b',
          cardinality: { min: 0, max: 33 },
          constraint: {
            value: 'a',
            type: ContraintType.SHAPE,
          },
          optional: true,
        },
        { name: 'c' },
        { name: 'd', negative: true },
        { name: 'e', negative: true },
        { name: 'f', negative: true },
      ].sort();

      // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
      expect(shape.getAll().sort()).toStrictEqual(expectedPredicates);
    });

    it('should get all predicates with a shape with no predicates', () => {
      const shapeWithNoProperties = new Shape({ name: 'foo', positivePredicates: []});

      expect(shapeWithNoProperties.getAll()).toStrictEqual([]);
    });
  });
});
