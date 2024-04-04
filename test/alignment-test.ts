import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { subjectGroupIsWeaklyAligned, reportAlignment, subjectGroupIsAligned } from '../lib/alignment';
import { TYPE_DEFINITION } from '../lib/constant';
import { ContraintType, Shape } from '../lib/Shape';
import type { ITriple } from '../lib/Triple';
import { AlignmentType, Triple } from '../lib/Triple';

const DF = new DataFactory<RDF.BaseQuad>();

const AN_OBJECT = DF.namedNode('an object');

describe('subjectGroupIsWeaklyAligned', () => {
  it('should return not be aligned if the subject group is empty', () => {
    const argShape: any = { name: 'foo', closed: true, positivePredicates: [ 'a', 'b', 'c' ]};
    const shapes = new Shape(argShape);

    expect(subjectGroupIsWeaklyAligned([], shapes)).toBe(AlignmentType.None);
  });

  it('should be weakly aligned given the shape is open', () => {
    const argShape: any = { name: 'foo', closed: false, positivePredicates: [ 'a', 'b', 'c' ]};
    const shapes = new Shape(argShape);
    const triples: ITriple[] = [
      new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT }),
    ];

    expect(subjectGroupIsWeaklyAligned(triples, shapes)).toBe(AlignmentType.WEAK);
  });

  it('should be weakly aligned given one triple is aligned with the shape', () => {
    const argShape: any = { name: 'foo', closed: true, positivePredicates: [ 'bar' ]};
    const shapes = new Shape(argShape);
    const triples: ITriple[] = [
      new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT }),
    ];

    expect(subjectGroupIsWeaklyAligned(triples, shapes)).toBe(AlignmentType.WEAK);
  });

  it('should not be aligned given the triple is not aligned with the shape', () => {
    const argShape: any = { name: 'foo', closed: true, positivePredicates: [ 'bar' ]};
    const shapes = new Shape(argShape);
    const triples: ITriple[] = [
      new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
    ];

    expect(subjectGroupIsWeaklyAligned(triples, shapes)).toBe(AlignmentType.None);
  });

  it('should be weakly aligned given multiple triples are aligned with the shape', () => {
    const argShape: any = { name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]};
    const shapes = new Shape(argShape);
    const triples: ITriple[] = [
      new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
      new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT }),
      new Triple({ subject: 'foo', predicate: 'too2', object: AN_OBJECT }),
      new Triple({ subject: 'foo', predicate: 'bar1', object: AN_OBJECT }),
    ];

    expect(subjectGroupIsWeaklyAligned(triples, shapes)).toBe(AlignmentType.WEAK);
  });

  it('should not be aligned given no triple are aligned with the shape', () => {
    const argShape: any = { name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]};
    const shapes = new Shape(argShape);
    const triples: ITriple[] = [
      new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
      new Triple({ subject: 'foo', predicate: 'bar55', object: AN_OBJECT }),
      new Triple({ subject: 'foo', predicate: 'too2', object: AN_OBJECT }),
      new Triple({ subject: 'foo', predicate: 'bar11', object: AN_OBJECT }),
    ];

    expect(subjectGroupIsWeaklyAligned(triples, shapes)).toBe(AlignmentType.None);
  });
});

describe('subjectGroupIsAligned', () => {
  describe('weak alignment', () => {
    it('should return not be aligned if the subject group is empty', () => {
      const argShape: any = { name: 'foo', closed: true, positivePredicates: [ 'a', 'b', 'c' ]};
      const shapes = new Shape(argShape);

      expect(subjectGroupIsAligned([], shapes)).toBe(AlignmentType.None);
    });

    it('should be weakly aligned given the shape is open', () => {
      const argShape: any = { name: 'foo', closed: false, positivePredicates: [ 'a', 'b', 'c' ]};
      const shapes = new Shape(argShape);
      const triples: ITriple[] = [
        new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT }),
      ];

      expect(subjectGroupIsAligned(triples, shapes)).toBe(AlignmentType.WEAK);
    });

    it('should be weakly aligned given one triple is aligned with the shape', () => {
      const argShape: any = { name: 'foo', closed: true, positivePredicates: [ 'bar' ]};
      const shapes = new Shape(argShape);
      const triples: ITriple[] = [
        new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'bar1', object: AN_OBJECT }),
      ];

      expect(subjectGroupIsAligned(triples, shapes)).toBe(AlignmentType.WEAK);
    });

    it('should not be aligned given one triple is not aligned with the shape', () => {
      const argShape: any = { name: 'foo', closed: true, positivePredicates: [ 'bar' ]};
      const shapes = new Shape(argShape);
      const triples: ITriple[] = [
        new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
      ];

      expect(subjectGroupIsAligned(triples, shapes)).toBe(AlignmentType.None);
    });

    it('should be weakly aligned given multiple triples are aligned with the shape', () => {
      const argShape: any = { name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]};
      const shapes = new Shape(argShape);
      const triples: ITriple[] = [
        new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'too2', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'bar1', object: AN_OBJECT }),
      ];

      expect(subjectGroupIsAligned(triples, shapes)).toBe(AlignmentType.WEAK);
    });

    it('should not be aligned given no triple are aligned with the shape', () => {
      const argShape: any = { name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]};
      const shapes = new Shape(argShape);
      const triples: ITriple[] = [
        new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'bar55', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'too2', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'bar11', object: AN_OBJECT }),
      ];

      expect(subjectGroupIsAligned(triples, shapes)).toBe(AlignmentType.None);
    });
  });

  describe('strong alignment', () => {
    it('should strongly aligned given a matching RDF type', () => {
      const argShape: any = {
        name: 'foo',
        closed: true,
        positivePredicates:
          [
            'bar',
            'bar0',
            {
              name: TYPE_DEFINITION.value,
              constraint:
              {
                value: new Set([ 'foo' ]),
                type: ContraintType.TYPE,
              },
            },
          ],
      };
      const shapes = new Shape(argShape);
      const triples: ITriple[] = [
        new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'too2', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: TYPE_DEFINITION.value, object: DF.namedNode('foo') }),
      ];

      expect(subjectGroupIsAligned(triples, shapes)).toBe(AlignmentType.STRONG);
    });

    it('should not be strongly aligned given a non-matching RDF type', () => {
      const argShape: any = {
        name: 'foo',
        closed: true,
        positivePredicates:
          [
            'bar',
            'bar0',
            {
              name: TYPE_DEFINITION.value,
              constraint:
              {
                value: new Set([ 'too' ]),
                type: ContraintType.TYPE,
              },
            },
          ],
      };
      const shapes = new Shape(argShape);
      const triples: ITriple[] = [
        new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'too2', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: TYPE_DEFINITION.value, object: DF.namedNode('foo') }),
      ];

      expect(subjectGroupIsAligned(triples, shapes)).toBe(AlignmentType.WEAK);
    });

    it(`should be weakly aligned 
    given a subject group with the same number of predicate than the shape but not matching`, () => {
      const argShape: any = {
        name: 'foo',
        closed: true,
        positivePredicates:
          [
            'bar1',
            'too2',
            'bar',
            'too',
          ],
      };
      const shapes = new Shape(argShape);
      const triples: ITriple[] = [
        new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'too2', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'no', object: AN_OBJECT }),
      ];

      expect(subjectGroupIsAligned(triples, shapes)).toBe(AlignmentType.WEAK);
    });

    it('should be strongly aligned given a subject group with all the properties', () => {
      const argShape: any = {
        name: 'foo',
        closed: true,
        positivePredicates:
          [
            'bar1',
            'too2',
            'bar',
            'too',
          ],
      };
      const shapes = new Shape(argShape);
      const triples: ITriple[] = [
        new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'too2', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'bar1', object: AN_OBJECT }),
      ];

      expect(subjectGroupIsAligned(triples, shapes)).toBe(AlignmentType.STRONG);
    });

    it(`should be strongly aligned 
    given a subject group with all the properties considering optionals and negatives shape properties`, () => {
      const argShape: any = {
        name: 'foo',
        closed: true,
        positivePredicates:
          [
            'bar1',
            'too2',
            'bar',
            'too',
            {
              name: 'option',
              cardinality: {
                min: 0,
                max: 100,
              },
            },
          ],
        negativePredicates: [
          '1',
          '2',
          '3',
        ],
      };
      const shapes = new Shape(argShape);
      const triples: ITriple[] = [
        new Triple({ subject: 'foo', predicate: 'too', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'bar', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'too2', object: AN_OBJECT }),
        new Triple({ subject: 'foo', predicate: 'bar1', object: AN_OBJECT }),
      ];

      expect(subjectGroupIsAligned(triples, shapes)).toBe(AlignmentType.STRONG);
    });
  });
});

describe('reportAlignment', () => {
  describe('weak alignment', () => {
    it('given an empty query it should return the default result', () => {
      const query: any = new Map();
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'foo', 'too' ]}),
      ];
      const option = {};
      const arg: any = { query, option, shapes };

      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map(),
        unAlignedShapes: new Set(),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given no shape it should return the default result', () => {
      const query: any = new Map([
        [ 'x', [{ subject: 'x', predicate: 'foo', object: AN_OBJECT }]],
        [ 'z', [{ subject: 'z', predicate: 'foo1', object: AN_OBJECT }]],
        [ 'w', [{ subject: 'w', predicate: 'bar', object: AN_OBJECT }]],
        [ 'a', [
          { subject: 'a', predicate: 'foo', object: AN_OBJECT },
          { subject: 'a', predicate: 'bar', object: AN_OBJECT },
        ]],
        [ 'v', [
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
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map(),
        unAlignedShapes: new Set(),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given an empty query and no shapes it should return the default result', () => {
      const query: any = new Map();
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo', 'too' ]}),
      ];
      const option = {};
      const arg: any = { query, option, shapes };

      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map(),
        unAlignedShapes: new Set(),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given one subject group aligned with one shape should return the valid result', () => {
      const query: any = new Map([
        [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'too' ]}),
      ];
      const option = {};
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.None ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ]]),
        unAlignedShapes: new Set([ 'foo2', 'foo' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given one subject group aligned with multiple shapes should return the valid result', () => {
      const query: any = new Map([
        [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'foo', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo2', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'foo' ]}),
      ];
      const option = {};
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.WEAK ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.WEAK ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ]]),
        unAlignedShapes: new Set([ 'foo1' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given one subject group aligned with no shapes should return the valid result', () => {
      const query: any = new Map([
        [ 'x', [ new Triple({ subject: 'x', predicate: 'no', object: AN_OBJECT }) ]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'foo', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo2', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'foo' ]}),
      ];
      const option = {};
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.None ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ]]),
        unAlignedShapes: new Set([ 'foo1', 'foo', 'foo2' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given multiple subject groups aligned with some shapes should return the valid result', () => {
      const query: any = new Map(
        [
          [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],

          [ 'y',
            [
              new Triple({ subject: 'y', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'bar', object: AN_OBJECT }),
            ],
          ],
          [ 'z',
            [
              new Triple({ subject: 'z', predicate: 'no2', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no234', object: AN_OBJECT }),
            ],
          ],
        ],
      );
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo2', 'foo', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'foo' ]}),
        new Shape({ name: 'foo3', closed: true, positivePredicates: [ 'too1', 'too', 'too2' ]}),
      ];
      const option = {};
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.WEAK ],
        [ 'foo3', AlignmentType.None ],
      ]);
      const yResults = new Map([
        [ 'foo', AlignmentType.WEAK ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.WEAK ],
        [ 'foo3', AlignmentType.None ],
      ]);
      const zResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.None ],
        [ 'foo3', AlignmentType.None ],
      ]);

      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ], [ 'y', yResults ], [ 'z', zResults ]]),
        unAlignedShapes: new Set([ 'foo3' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });
  });

  describe('with shape intersection', () => {
    it('should not modify the result if the subject group is aligned with one shape', () => {
      const query: any = new Map([
        [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'too' ]}),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.None ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ]]),
        unAlignedShapes: new Set([ 'foo2', 'foo' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('should not modify the result if the subject group is aligned with no shape', () => {
      const query: any = new Map([
        [ 'x', [ new Triple({ subject: 'x', predicate: 'no', object: AN_OBJECT }) ]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'too' ]}),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.None ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ]]),
        unAlignedShapes: new Set([ 'foo2', 'foo', 'foo1' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('should not modify the result if there is only one shape', () => {
      const query: any = new Map([
        [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],
      ]);
      const shapes = [
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([[ 'foo1', AlignmentType.WEAK ]]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ]]),
        unAlignedShapes: new Set([]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('should not change the result given the shapes  have the same predicates', () => {
      const query: any = new Map([
        [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.WEAK ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.WEAK ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ]]),
        unAlignedShapes: new Set([]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('should reject the intersecting shapes given the query target an unique predicate', () => {
      const query: any = new Map(
        [
          [ 'x', [
            new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }),
            new Triple({ subject: 'x', predicate: 'unique', object: AN_OBJECT }),
          ],
          ],
        ],
      );
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'foo', 'unique', 'foo1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo', 'bar', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'foo', 'bar', 'unique2' ]}),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.WEAK ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.None ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ]]),
        unAlignedShapes: new Set([ 'foo1', 'foo2' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('should handle a complex case', () => {
      const query: any = new Map(
        [
          [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],

          [ 'y',
            [
              new Triple({ subject: 'y', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'foo2', object: AN_OBJECT }),
            ],
          ],
          [ 'z',
            [
              new Triple({ subject: 'z', predicate: 'no2', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no234', object: AN_OBJECT }),
            ],
          ],

          [ 'w',
            [
              new Triple({ subject: 'w', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'w', predicate: 'bar', object: AN_OBJECT }),
              new Triple({ subject: 'w', predicate: 'foo2', object: AN_OBJECT }),
            ],
          ],

        ],
      );
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo2', 'foo', 'foo1', 'def' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'foo', 'too', 'abc' ]}),
        new Shape({ name: 'foo3', closed: true, positivePredicates: [ 'too1', 'too', 'too2' ]}),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.WEAK ],
        [ 'foo3', AlignmentType.None ],
      ]);
      const yResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.WEAK ],
        [ 'foo3', AlignmentType.None ],
      ]);
      const zResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.None ],
        [ 'foo3', AlignmentType.None ],
      ]);
      const wResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.WEAK ],
        [ 'foo3', AlignmentType.None ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ], [ 'y', yResults ], [ 'z', zResults ], [ 'w', wResults ]]),
        unAlignedShapes: new Set([ 'foo3', 'foo' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('should handle a complex case with an open shape', () => {
      const query: any = new Map(
        [
          [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],

          [ 'y',
            [
              new Triple({ subject: 'y', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'foo2', object: AN_OBJECT }),
            ],
          ],
          [ 'z',
            [
              new Triple({ subject: 'z', predicate: 'no2', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no234', object: AN_OBJECT }),
            ],
          ],

          [ 'w',
            [
              new Triple({ subject: 'w', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'w', predicate: 'bar', object: AN_OBJECT }),
              new Triple({ subject: 'w', predicate: 'foo2', object: AN_OBJECT }),
            ],
          ],

        ],
      );
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo2', 'foo', 'foo1', 'def' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'foo', 'too', 'abc' ]}),
        new Shape({ name: 'foo3', closed: false, positivePredicates: [ 'too1', 'too', 'too2' ]}),
      ];
      const option = { shapeIntersection: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.WEAK ],
        [ 'foo3', AlignmentType.WEAK ],
      ]);
      const yResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.WEAK ],
        [ 'foo3', AlignmentType.WEAK ],
      ]);
      const zResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.None ],
        [ 'foo3', AlignmentType.WEAK ],
      ]);
      const wResults = new Map([
        [ 'foo', AlignmentType.WEAK ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.WEAK ],
        [ 'foo3', AlignmentType.WEAK ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ], [ 'y', yResults ], [ 'z', zResults ], [ 'w', wResults ]]),
        unAlignedShapes: new Set([]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('should handle a complex case with a strong alignment', () => {
      const query: any = new Map(
        [
          [ 'x',
            [
              new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'x', predicate: 'foo2', object: AN_OBJECT }),
              new Triple({ subject: 'x', predicate: 'foo1', object: AN_OBJECT }),
              new Triple({ subject: 'x', predicate: 'def', object: AN_OBJECT }),
            ],
          ],

          [ 'y',
            [
              new Triple({ subject: 'y', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'foo2', object: AN_OBJECT }),
            ],
          ],
          [ 'z',
            [
              new Triple({ subject: 'z', predicate: 'no2', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no234', object: AN_OBJECT }),
            ],
          ],

          [ 'w',
            [
              new Triple({ subject: 'w', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'w', predicate: 'bar', object: AN_OBJECT }),
              new Triple({ subject: 'w', predicate: 'foo2', object: AN_OBJECT }),
            ],
          ],

        ],
      );
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo2', 'foo', 'foo1', 'def' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'foo', 'too', 'abc' ]}),
        new Shape({ name: 'foo3', closed: true, positivePredicates: [ 'too1', 'too', 'too2' ]}),
      ];
      const option = { shapeIntersection: true, strongAlignment: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.STRONG ],
        [ 'foo2', AlignmentType.None ],
        [ 'foo3', AlignmentType.None ],
      ]);
      const yResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.WEAK ],
        [ 'foo3', AlignmentType.None ],
      ]);
      const zResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.None ],
        [ 'foo3', AlignmentType.None ],
      ]);
      const wResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.WEAK ],
        [ 'foo3', AlignmentType.None ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ], [ 'y', yResults ], [ 'z', zResults ], [ 'w', wResults ]]),
        unAlignedShapes: new Set([ 'foo3', 'foo' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });
  });

  describe('strong alignment', () => {
    it('given an empty query it should return the default result', () => {
      const query: any = new Map();
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'foo', 'too' ]}),
      ];
      const option = { strongAlignment: true };
      const arg: any = { query, option, shapes };

      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map(),
        unAlignedShapes: new Set(),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given no shape it should return the default result', () => {
      const query: any = new Map([
        [ 'x', [{ subject: 'x', predicate: 'foo', object: AN_OBJECT }]],
        [ 'z', [{ subject: 'z', predicate: 'foo1', object: AN_OBJECT }]],
        [ 'w', [{ subject: 'w', predicate: 'bar', object: AN_OBJECT }]],
        [ 'a', [
          { subject: 'a', predicate: 'foo', object: AN_OBJECT },
          { subject: 'a', predicate: 'bar', object: AN_OBJECT },
        ]],
        [ 'v', [
          {
            subject: 'v',
            predicate: 'bar2',
            object: AN_OBJECT,
          }],
        ],
      ]);
      const shapes: any = [];
      const option = { strongAlignment: true };
      const arg: any = { query, option, shapes };

      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map(),
        unAlignedShapes: new Set(),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given an empty query and no shapes it should return the default result', () => {
      const query: any = new Map();
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo', 'too' ]}),
      ];
      const option = { strongAlignment: true };
      const arg: any = { query, option, shapes };

      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map(),
        unAlignedShapes: new Set(),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given one subject group aligned with one shape should return the valid result', () => {
      const query: any = new Map([
        [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'too' ]}),
      ];
      const option = { strongAlignment: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.None ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ]]),
        unAlignedShapes: new Set([ 'foo2', 'foo' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given one subject group aligned with multiple shapes should return the valid result', () => {
      const query: any = new Map([
        [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'foo', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo2', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'foo' ]}),
      ];
      const option = { strongAlignment: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.WEAK ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.WEAK ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ]]),
        unAlignedShapes: new Set([ 'foo1' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given one subject group aligned with no shapes should return the valid result', () => {
      const query: any = new Map([
        [ 'x', [ new Triple({ subject: 'x', predicate: 'no', object: AN_OBJECT }) ]],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'foo', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo2', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'foo' ]}),
      ];
      const option = { strongAlignment: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.None ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ]]),
        unAlignedShapes: new Set([ 'foo1', 'foo', 'foo2' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given multiple subject groups aligned with multiple shapes should return the valid result', () => {
      const query: any = new Map(
        [
          [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],

          [ 'y',
            [
              new Triple({ subject: 'y', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'bar', object: AN_OBJECT }),
            ],
          ],
          [ 'z',
            [
              new Triple({ subject: 'z', predicate: 'no2', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'no234', object: AN_OBJECT }),
            ],
          ],
        ],
      );
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo2', 'foo', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'foo' ]}),
        new Shape({ name: 'foo3', closed: true, positivePredicates: [ 'too1', 'too', 'too2' ]}),
      ];
      const option = { strongAlignment: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.WEAK ],
        [ 'foo3', AlignmentType.None ],
      ]);
      const yResults = new Map([
        [ 'foo', AlignmentType.WEAK ],
        [ 'foo1', AlignmentType.WEAK ],
        [ 'foo2', AlignmentType.WEAK ],
        [ 'foo3', AlignmentType.None ],
      ]);
      const zResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.None ],
        [ 'foo3', AlignmentType.None ],
      ]);

      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: false,
        alignedTable: new Map([[ 'x', xResults ], [ 'y', yResults ], [ 'z', zResults ]]),
        unAlignedShapes: new Set([ 'foo3' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given one subject group strongly aligned because of the RDF type should return the valid result', () => {
      const query: any = new Map([
        [ 'x',
          [
            new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }),
            new Triple({ subject: 'x', predicate: TYPE_DEFINITION.value, object: DF.namedNode('CoolType') }),
          ],
        ],
      ]);
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
        new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'too' ]}),
        new Shape({
          name: 'foo3',
          closed: true,
          positivePredicates:
            [
              'unique',
              {
                name: TYPE_DEFINITION.value,
                constraint: {
                  type: ContraintType.TYPE,
                  value: new Set([ 'CoolType' ]),
                },
              },
            ],
        }),
      ];
      const option = { strongAlignment: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.None ],
        [ 'foo3', AlignmentType.STRONG ],
      ]);
      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: true,
        alignedTable: new Map([[ 'x', xResults ]]),
        unAlignedShapes: new Set([ 'foo2', 'foo1', 'foo' ]),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });

    it('given one subject group strongly ligned because of all the predicate match should return the valid result'
      , () => {
        const query: any = new Map([
          [ 'x',
            [
              new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'x', predicate: 'bar', object: AN_OBJECT }),
            ],
          ],
        ]);
        const shapes = [
          new Shape({ name: 'foo', closed: true, positivePredicates: [ 'bar', 'bar0', 'bar1' ]}),
          new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo', 'foo0', 'foo1' ]}),
          new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'too' ]}),
          new Shape({ name: 'foo3', closed: true, positivePredicates: [ 'foo', 'bar' ]}),
        ];
        const option = { strongAlignment: true };
        const arg: any = { query, option, shapes };
        const xResults = new Map([
          [ 'foo', AlignmentType.None ],
          [ 'foo1', AlignmentType.None ],
          [ 'foo2', AlignmentType.None ],
          [ 'foo3', AlignmentType.STRONG ],
        ]);
        const expectedResult = {
          allSubjectGroupsHaveStrongAlignment: true,
          alignedTable: new Map([[ 'x', xResults ]]),
          unAlignedShapes: new Set([ 'foo2', 'foo1', 'foo' ]),
        };

        expect(reportAlignment(arg)).toStrictEqual(expectedResult);
      });

    it('given multiple subject groups aligned strongly and weakly with the shapes should return the valid result',
      () => {
        const query: any = new Map(
          [
            [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],

            [ 'y',
              [
                new Triple({ subject: 'y', predicate: 'foo', object: AN_OBJECT }),
                new Triple({ subject: 'y', predicate: 'no', object: AN_OBJECT }),
                new Triple({ subject: 'y', predicate: 'bar', object: AN_OBJECT }),
              ],
            ],
            [ 'z',
              [
                new Triple({ subject: 'z', predicate: 'no2', object: AN_OBJECT }),
                new Triple({ subject: 'z', predicate: 'no', object: AN_OBJECT }),
                new Triple({ subject: 'z', predicate: 'no234', object: AN_OBJECT }),
              ],
            ],
            [ 'w',
              [
                new Triple({ subject: 'w', predicate: 'bar', object: AN_OBJECT }),
                new Triple({ subject: 'w', predicate: 'foo2', object: AN_OBJECT }),
                new Triple({ subject: 'w', predicate: 'foo', object: AN_OBJECT }),
              ],
            ],
            [ 'i',
              [
                new Triple({ subject: 'i', predicate: 'bar', object: AN_OBJECT }),
                new Triple({ subject: 'i', predicate: TYPE_DEFINITION.value, object: DF.namedNode('CoolClass') }),
                new Triple({ subject: 'i', predicate: 'bar1', object: AN_OBJECT }),
              ],
            ],
          ],
        );
        const shapes = [
          new Shape({
            name: 'foo',
            closed: true,
            positivePredicates: [
              'bar',
              {
                name: TYPE_DEFINITION.value,
                constraint:
                {
                  type: ContraintType.TYPE,
                  value: new Set([ 'CoolClass' ]),
                },
              },
              'bar1' ],
          }),
          new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo2', 'foo', 'foo1' ]}),
          new Shape({ name: 'foo2', closed: true, positivePredicates: [ 'bar', 'foo2', 'foo' ]}),
          new Shape({ name: 'foo3', closed: true, positivePredicates: [ 'too1', 'too', 'too2' ]}),
        ];
        const option = { strongAlignment: true };
        const arg: any = { query, option, shapes };
        const xResults = new Map([
          [ 'foo', AlignmentType.None ],
          [ 'foo1', AlignmentType.WEAK ],
          [ 'foo2', AlignmentType.WEAK ],
          [ 'foo3', AlignmentType.None ],
        ]);
        const yResults = new Map([
          [ 'foo', AlignmentType.WEAK ],
          [ 'foo1', AlignmentType.WEAK ],
          [ 'foo2', AlignmentType.WEAK ],
          [ 'foo3', AlignmentType.None ],
        ]);
        const zResults = new Map([
          [ 'foo', AlignmentType.None ],
          [ 'foo1', AlignmentType.None ],
          [ 'foo2', AlignmentType.None ],
          [ 'foo3', AlignmentType.None ],
        ]);
        const wResults = new Map([
          [ 'foo', AlignmentType.None ],
          [ 'foo1', AlignmentType.None ],
          [ 'foo2', AlignmentType.STRONG ],
          [ 'foo3', AlignmentType.None ],
        ]);
        const iResults = new Map([
          [ 'foo', AlignmentType.STRONG ],
          [ 'foo1', AlignmentType.None ],
          [ 'foo2', AlignmentType.None ],
          [ 'foo3', AlignmentType.None ],
        ]);

        const expectedResult = {
          allSubjectGroupsHaveStrongAlignment: false,
          alignedTable: new Map([
            [ 'x', xResults ],
            [ 'y', yResults ],
            [ 'z', zResults ],
            [ 'w', wResults ],
            [ 'i', iResults ],
          ]),
          unAlignedShapes: new Set([ 'foo3' ]),
        };

        expect(reportAlignment(arg)).toStrictEqual(expectedResult);
      });

    it(`given multiple subject groups aligned weakly and strongly with multiple shapes 
    should return the valid result`, () => {
      const query: any = new Map(
        [
          [ 'x', [ new Triple({ subject: 'x', predicate: 'foo', object: AN_OBJECT }) ]],

          [ 'y',
            [
              new Triple({ subject: 'y', predicate: 'foo', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'yes', object: AN_OBJECT }),
              new Triple({ subject: 'y', predicate: 'bar', object: AN_OBJECT }),
            ],
          ],
          [ 'z',
            [
              new Triple({ subject: 'z', predicate: TYPE_DEFINITION.value, object: DF.namedNode('CoolClass') }),
              new Triple({ subject: 'z', predicate: 'b', object: AN_OBJECT }),
              new Triple({ subject: 'z', predicate: 'a', object: AN_OBJECT }),
            ],
          ],
        ],
      );
      const shapes = [
        new Shape({ name: 'foo', closed: true, positivePredicates: [ 'foo' ]}),
        new Shape({ name: 'foo1', closed: true, positivePredicates: [ 'foo', 'yes', 'bar' ]}),
        new Shape({
          name: 'foo2',
          closed: true,
          positivePredicates: [
            {
              name: TYPE_DEFINITION.value,
              constraint: {
                value: new Set([ 'CoolClass' ]),
                type: ContraintType.TYPE,
              },
            },
            'foo2',
            'foo' ],
        }),
      ];
      const option = { strongAlignment: true };
      const arg: any = { query, option, shapes };
      const xResults = new Map([
        [ 'foo', AlignmentType.STRONG ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.None ],
      ]);
      const yResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.STRONG ],
        [ 'foo2', AlignmentType.None ],
      ]);
      const zResults = new Map([
        [ 'foo', AlignmentType.None ],
        [ 'foo1', AlignmentType.None ],
        [ 'foo2', AlignmentType.STRONG ],
      ]);

      const expectedResult = {
        allSubjectGroupsHaveStrongAlignment: true,
        alignedTable: new Map([[ 'x', xResults ], [ 'y', yResults ], [ 'z', zResults ]]),
        unAlignedShapes: new Set(),
      };

      expect(reportAlignment(arg)).toStrictEqual(expectedResult);
    });
  });
});
