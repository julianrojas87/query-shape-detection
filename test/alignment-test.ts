import { IShapeArgs, IShape, Shape } from '../lib/Shape';
import { AlignmentType, ITriple, Triple } from '../lib/Triple';
import { subjectGroupIsWeaklyAligned, calculateAligments } from '../lib/aligment';
import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';

const DF = new DataFactory<RDF.BaseQuad>();

const AN_OBJECT = DF.namedNode('an object');


describe('subjectGroupIsWeaklyAligned', () => {
  it('should return not be aligned if the subject group is empty', () => {
    const argShape: any = { name: 'foo', closed: true, positivePredicates: ['a', 'b', 'c'] };
    const shapes = new Shape(argShape);

    expect(subjectGroupIsWeaklyAligned([], shapes)).toBe(AlignmentType.None);
  });

  it('should be weakly aligned given the shape is open', () => {
    const argShape: any = { name: 'foo', closed: false, positivePredicates: ['a', 'b', 'c'] };
    const shapes = new Shape(argShape);
    const triples: ITriple[] = [
      new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT })
    ];

    expect(subjectGroupIsWeaklyAligned(triples, shapes)).toBe(AlignmentType.WEAK);
  });

  it('should be weakly aligned given one triple is aligned with the shape', () => {
    const argShape: any = { name: 'foo', closed: true, positivePredicates: ['bar'] };
    const shapes = new Shape(argShape);
    const triples: ITriple[] = [
      new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT })
    ];

    expect(subjectGroupIsWeaklyAligned(triples, shapes)).toBe(AlignmentType.WEAK);
  });

  it('should not be aligned given one triple is not aligned with the shape', () => {
    const argShape: any = { name: 'foo', closed: true, positivePredicates: ['bar'] };
    const shapes = new Shape(argShape);
    const triples: ITriple[] = [
      new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT })
    ];

    expect(subjectGroupIsWeaklyAligned(triples, shapes)).toBe(AlignmentType.None);
  });

  it('should be weakly aligned given multiple triples are aligned with the shape', () => {
    const argShape: any = { name: 'foo', closed: true, positivePredicates: ['bar', 'bar0', 'bar1'] };
    const shapes = new Shape(argShape);
    const triples: ITriple[] = [
      new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
      new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT }),
      new Triple({ subject: 'foo', predicate: 'too2', object: AN_OBJECT }),
      new Triple({ subject: 'foo', predicate: 'bar1', object: AN_OBJECT })
    ];

    expect(subjectGroupIsWeaklyAligned(triples, shapes)).toBe(AlignmentType.WEAK);
  });

  it('should not be aligned given no triple are aligned with the sahpe', () => {
    const argShape: any = { name: 'foo', closed: true, positivePredicates: ['bar', 'bar0', 'bar1'] };
    const shapes = new Shape(argShape);
    const triples: ITriple[] = [
      new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
      new Triple({ subject: 'foo', predicate: 'bar55', object: AN_OBJECT }),
      new Triple({ subject: 'foo', predicate: 'too2', object: AN_OBJECT }),
      new Triple({ subject: 'foo', predicate: 'bar11', object: AN_OBJECT })
    ];

    expect(subjectGroupIsWeaklyAligned(triples, shapes)).toBe(AlignmentType.None);
  });
});

describe('calculateAligments', () => {

  describe('weak alignment', () => {
    it('given an empty query it should return the default result', () => {
      const query: any = new Map();
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: ['bar', 'bar0', 'bar1'] }),
        new Shape({ name: 'foo', closed: true, positivePredicates: ['foo', 'foo0', 'foo1'] }),
        new Shape({ name: 'foo', closed: true, positivePredicates: ['bar', 'foo', 'too'] }),
      ];
      const option = {};
      const arg: any = { query, option, shapes };

      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map(),
        unAlignedShapes: new Set()
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

    it('given an no shape it should return the default result', () => {
      const query: any = new Map([
        ['x', [{ subject: 'x', predicate: 'foo', object: AN_OBJECT }]],
        ['z', [{ subject: 'z', predicate: 'foo1', object: AN_OBJECT }]],
        ['w', [{ subject: 'w', predicate: 'bar', object: AN_OBJECT }]],
        ['a', [
          { subject: 'a', predicate: 'foo', object: AN_OBJECT },
          { subject: 'a', predicate: 'bar', object: AN_OBJECT },
        ]],
        ['v', [
          {
            subject: 'v',
            predicate: 'bar2',
            object: AN_OBJECT,
          }],
        ],
      ]);
      const shapes: any = [];
      const option = {};
      const arg: any = { query, option, shapes };

      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map(),
        unAlignedShapes: new Set()
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

    it('given an empty query and no shapes it should return the default result', () => {
      const query: any = new Map();
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: ['bar', 'bar0', 'bar1'] }),
        new Shape({ name: 'foo1', closed: true, positivePredicates: ['foo', 'foo0', 'foo1'] }),
        new Shape({ name: 'foo2', closed: true, positivePredicates: ['bar', 'foo', 'too'] }),
      ];
      const option = {};
      const arg: any = { query, option, shapes };

      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map(),
        unAlignedShapes: new Set()
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

    it('given one subject group aligned with one shape should return the valid result', () => {
      const query: any = new Map([
        ['x', [new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT })]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: ['bar', 'bar0', 'bar1'] }),
        new Shape({ name: 'foo1', closed: true, positivePredicates: ['foo', 'foo0', 'foo1'] }),
        new Shape({ name: 'foo2', closed: true, positivePredicates: ['bar', 'foo2', 'too'] }),
      ];
      const option = {};
      const arg: any = { query, option, shapes };
      const xResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.WEAK], ['foo2', AlignmentType.None]]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map([['x', xResults]]),
        unAlignedShapes: new Set(['foo2', 'foo'])
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

    it('given one subject group aligned with multiple shapes should return the valid result', () => {
      const query: any = new Map([
        ['x', [new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT })]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: ['foo', 'bar0', 'bar1'] }),
        new Shape({ name: 'foo1', closed: true, positivePredicates: ['foo2', 'foo0', 'foo1'] }),
        new Shape({ name: 'foo2', closed: true, positivePredicates: ['bar', 'foo2', 'foo'] }),
      ];
      const option = {};
      const arg: any = { query, option, shapes };
      const xResults = new Map([['foo', AlignmentType.WEAK], ['foo1', AlignmentType.None], ['foo2', AlignmentType.WEAK]]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map([['x', xResults]]),
        unAlignedShapes: new Set(['foo1',])
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

    it('given one subject group aligned no shapes should return the valid result', () => {
      const query: any = new Map([
        ['x', [new Triple({ subject: 'x', predicate: 'no', object: AN_OBJECT })]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: ['foo', 'bar0', 'bar1'] }),
        new Shape({ name: 'foo1', closed: true, positivePredicates: ['foo2', 'foo0', 'foo1'] }),
        new Shape({ name: 'foo2', closed: true, positivePredicates: ['bar', 'foo2', 'foo'] }),
      ];
      const option = {};
      const arg: any = { query, option, shapes };
      const xResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.None], ['foo2', AlignmentType.None]]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map([['x', xResults]]),
        unAlignedShapes: new Set(['foo1', 'foo', 'foo2'])
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

    it('given multiple subject groups aligned shapes should return the valid result', () => {
      const query: any = new Map(
        [
          ['x', [new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT })]],

          ['y',
            [
              new Triple({ subject: 'y', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'bar', object: AN_OBJECT }),
            ],
          ],
          ['z',
            [
              new Triple({ subject: 'z', predicate: 'no2', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no234', object: AN_OBJECT }),
            ]
          ]
        ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: ['bar', 'bar0', 'bar1'] }),
        new Shape({ name: 'foo1', closed: true, positivePredicates: ['foo2', 'foo', 'foo1'] }),
        new Shape({ name: 'foo2', closed: true, positivePredicates: ['bar', 'foo2', 'foo'] }),
        new Shape({ name: 'foo3', closed: true, positivePredicates: ['too1', 'too', 'too2'] }),
      ];
      const option = {};
      const arg: any = { query, option, shapes };
      const xResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.WEAK], ['foo2', AlignmentType.WEAK], ['foo3', AlignmentType.None]]);
      const yResults = new Map([['foo', AlignmentType.WEAK], ['foo1', AlignmentType.WEAK], ['foo2', AlignmentType.WEAK], ['foo3', AlignmentType.None]]);
      const zResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.None], ['foo2', AlignmentType.None], ['foo3', AlignmentType.None]]);

      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map([['x', xResults], ['y', yResults], ['z', zResults]]),
        unAlignedShapes: new Set(['foo3',])
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

  });

  describe('with shape intersection', () => {
    it('should not modify the result if the subject group is aligned with one shape', () => {
      const query: any = new Map([
        ['x', [new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT })]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: ['bar', 'bar0', 'bar1'] }),
        new Shape({ name: 'foo1', closed: true, positivePredicates: ['foo', 'foo0', 'foo1'] }),
        new Shape({ name: 'foo2', closed: true, positivePredicates: ['bar', 'foo2', 'too'] }),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.WEAK], ['foo2', AlignmentType.None]]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map([['x', xResults]]),
        unAlignedShapes: new Set(['foo2', 'foo'])
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

    it('should not modify the result if the subject group is aligned with no shape', () => {
      const query: any = new Map([
        ['x', [new Triple({ subject: 'x', predicate: 'no', object: AN_OBJECT })]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: ['bar', 'bar0', 'bar1'] }),
        new Shape({ name: 'foo1', closed: true, positivePredicates: ['foo', 'foo0', 'foo1'] }),
        new Shape({ name: 'foo2', closed: true, positivePredicates: ['bar', 'foo2', 'too'] }),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.None], ['foo2', AlignmentType.None]]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map([['x', xResults]]),
        unAlignedShapes: new Set(['foo2', 'foo', 'foo1'])
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

    it('should not modify the result if there is only one shape', () => {
      const query: any = new Map([
        ['x', [new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT })]],
      ]);
      const shapes = [
        new Shape({ name: 'foo1', closed: true, positivePredicates: ['foo', 'foo0', 'foo1'] }),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([['foo1', AlignmentType.WEAK]]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map([['x', xResults]]),
        unAlignedShapes: new Set([])
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

    it('should accept consider all the shapes aligned given they all have the same predicate', () => {
      const query: any = new Map([
        ['x', [new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT })]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: ['foo', 'foo0', 'foo1'] }),
        new Shape({ name: 'foo1', closed: true, positivePredicates: ['foo', 'foo0', 'foo1'] }),
        new Shape({ name: 'foo2', closed: true, positivePredicates: ['foo', 'foo0', 'foo1'] }),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([['foo', AlignmentType.WEAK], ['foo1', AlignmentType.WEAK], ['foo2', AlignmentType.WEAK]]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map([['x', xResults]]),
        unAlignedShapes: new Set([])
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

    it('should accept some shapes aligned given the predicate from the triple target an unique attribute', () => {
      const query: any = new Map(
        [
          ['x', [
            new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }),
            new Triple({ subject: 'x', predicate: 'unique', object: AN_OBJECT })
          ]
          ],
        ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: ['foo', 'unique', 'foo1'] }),
        new Shape({ name: 'foo1', closed: true, positivePredicates: ['foo', 'bar', 'foo1'] }),
        new Shape({ name: 'foo2', closed: true, positivePredicates: ['foo', 'bar', 'unique2'] }),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([['foo', AlignmentType.WEAK], ['foo1', AlignmentType.None], ['foo2', AlignmentType.None]]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map([['x', xResults]]),
        unAlignedShapes: new Set(['foo1', 'foo2'])
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

    it('should give the result value given multiple subject group', () => {
      const query: any = new Map(
        [
          ['x', [new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT })]],

          ['y',
            [
              new Triple({ subject: 'y', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'foo2', object: AN_OBJECT }),
            ],
          ],
          ['z',
            [
              new Triple({ subject: 'z', predicate: 'no2', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no234', object: AN_OBJECT }),
            ]
          ],
           
          ['w',
            [
              new Triple({ subject: 'w', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'w', predicate: 'bar', object: AN_OBJECT }),
              new Triple({ subject: 'w', predicate: 'foo2', object: AN_OBJECT }),
            ]
          ]
          
        ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: ['bar', 'bar0', 'bar1'] }),
        new Shape({ name: 'foo1', closed: true, positivePredicates: ['foo2', 'foo', 'foo1', 'def'] }),
        new Shape({ name: 'foo2', closed: true, positivePredicates: ['bar', 'foo2', 'foo', 'too', 'abc'] }),
        new Shape({ name: 'foo3', closed: true, positivePredicates: ['too1', 'too', 'too2'] }),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.WEAK], ['foo2', AlignmentType.WEAK], ['foo3', AlignmentType.None]]);
      const yResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.WEAK], ['foo2', AlignmentType.WEAK], ['foo3', AlignmentType.None]]);
      const zResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.None], ['foo2', AlignmentType.None], ['foo3', AlignmentType.None]]);
      const wResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.None], ['foo2', AlignmentType.WEAK], ['foo3', AlignmentType.None]]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map([['x', xResults], ['y', yResults], ['z', zResults], ['w', wResults]]),
        unAlignedShapes: new Set(['foo3','foo'])
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });

    it('should give the result value given multiple subject group and open shape', () => {
      const query: any = new Map(
        [
          ['x', [new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT })]],

          ['y',
            [
              new Triple({ subject: 'y', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'foo2', object: AN_OBJECT }),
            ],
          ],
          ['z',
            [
              new Triple({ subject: 'z', predicate: 'no2', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no234', object: AN_OBJECT }),
            ]
          ],
           
          ['w',
            [
              new Triple({ subject: 'w', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'w', predicate: 'bar', object: AN_OBJECT }),
              new Triple({ subject: 'w', predicate: 'foo2', object: AN_OBJECT }),
            ]
          ]
          
        ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: ['bar', 'bar0', 'bar1'] }),
        new Shape({ name: 'foo1', closed: true, positivePredicates: ['foo2', 'foo', 'foo1', 'def'] }),
        new Shape({ name: 'foo2', closed: true, positivePredicates: ['bar', 'foo2', 'foo', 'too', 'abc'] }),
        new Shape({ name: 'foo3', closed: false, positivePredicates: ['too1', 'too', 'too2'] }),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.WEAK], ['foo2', AlignmentType.WEAK], ['foo3', AlignmentType.WEAK]]);
      const yResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.WEAK], ['foo2', AlignmentType.WEAK], ['foo3', AlignmentType.WEAK]]);
      const zResults = new Map([['foo', AlignmentType.None], ['foo1', AlignmentType.None], ['foo2', AlignmentType.None], ['foo3', AlignmentType.WEAK]]);
      const wResults = new Map([['foo', AlignmentType.WEAK], ['foo1', AlignmentType.WEAK], ['foo2', AlignmentType.WEAK], ['foo3', AlignmentType.WEAK]]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAligment: false,
        alignedTable: new Map([['x', xResults], ['y', yResults], ['z', zResults], ['w', wResults]]),
        unAlignedShapes: new Set([])
      };

      expect(calculateAligments(arg)).toStrictEqual(expectedResult);
    });
  });
});