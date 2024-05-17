import { DataFactory } from 'rdf-data-factory';
import { Bindings } from '../lib/Binding';
import { ContraintType, IShape, Shape } from '../lib/Shape';
import { IStarPatternWithDependencies, ITriple, Triple } from '../lib/Triple';
import { BaseQuad } from '@rdfjs/types';
import { translate } from 'sparqlalgebrajs';
import { IQuery, generateQuery } from '../lib/query';

const DF = new DataFactory<BaseQuad>();

describe('Bindings', () => {
    describe('empty values', () => {
        it('should have no binding given an empty star pattern', () => {
            const shape: Shape = new Shape({ name: 'foo', positivePredicates: ['prop1'], closed: true });
            const linkedShape = new Map<string, IShape>();
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map(),
                name: ""
            };

            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(false);
            expect(bindings.shouldVisitShape()).toBe(false);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(new Map());
            expect(bindings.getBoundTriple()).toStrictEqual([]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should have no binding given a shape with no properties', () => {
            const shape: Shape = new Shape({ name: 'foo', positivePredicates: [], closed: true });
            const linkedShape = new Map<string, IShape>();

            const triple: Triple = new Triple({
                subject: 'y',
                predicate: 'http://exemple.be',
                object: [DF.namedNode('http://exemple.be/Post')]
            });
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'http://exemple.be',
                        {
                            triple,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([[triple.predicate, undefined]]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(false);
            expect(bindings.shouldVisitShape()).toBe(false);
            expect(bindings.getUnboundedTriple()).toStrictEqual([triple]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });
    });

    describe('no constraint', () => {
        it('should have one binding', () => {
            const shape: Shape = new Shape({ name: 'foo', positivePredicates: ["p0"], closed: true });
            const linkedShape = new Map<string, IShape>();

            const triple: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p0',
                        {
                            triple,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([[triple.predicate, triple]]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should have one binding with an open shape', () => {
            const shape: Shape = new Shape({ name: 'foo', positivePredicates: ["p_0"], closed: false });
            const linkedShape = new Map<string, IShape>();

            const triple: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p0',
                        {
                            triple,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([[triple.predicate, triple]]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should not binding', () => {
            const shape: Shape = new Shape({ name: 'foo', positivePredicates: ["p"], closed: true });
            const linkedShape = new Map<string, IShape>();

            const triple: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p0',
                        {
                            triple,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([[triple.predicate, undefined]]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(false);
            expect(bindings.shouldVisitShape()).toBe(false);
            expect(bindings.getUnboundedTriple()).toStrictEqual([triple]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should have multiple bindings', () => {
            const shape: Shape = new Shape({ name: 'foo', positivePredicates: ["p0", "p1", "p2"], closed: true });
            const linkedShape = new Map<string, IShape>();

            const triple1: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });
            const triple2: Triple = new Triple({
                subject: 'y',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });
            const triple3: Triple = new Triple({
                subject: 'y',
                predicate: 'p2',
                object: [DF.namedNode('o0')]
            });
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        triple1.predicate,
                        {
                            triple: triple1,
                            dependencies: undefined
                        }
                    ],
                    [
                        triple2.predicate,
                        {
                            triple: triple2,
                            dependencies: undefined
                        }
                    ],
                    [
                        triple3.predicate,
                        {
                            triple: triple3,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([
                [triple1.predicate, triple1],
                [triple2.predicate, triple2],
                [triple3.predicate, triple3]
            ]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple1, triple2, triple3]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should not bind multiple triple', () => {
            const shape: Shape = new Shape({ name: 'foo', positivePredicates: ["p_", "p1_", "p2_"], closed: true });
            const linkedShape = new Map<string, IShape>();

            const triple1: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });
            const triple2: Triple = new Triple({
                subject: 'y',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });
            const triple3: Triple = new Triple({
                subject: 'y',
                predicate: 'p2',
                object: [DF.namedNode('o0')]
            });
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        triple1.predicate,
                        {
                            triple: triple1,
                            dependencies: undefined
                        }
                    ],
                    [
                        triple2.predicate,
                        {
                            triple: triple2,
                            dependencies: undefined
                        }
                    ],
                    [
                        triple3.predicate,
                        {
                            triple: triple3,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([
                [triple1.predicate, undefined],
                [triple2.predicate, undefined],
                [triple3.predicate, undefined]
            ]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(false);
            expect(bindings.shouldVisitShape()).toBe(false);
            expect(bindings.getUnboundedTriple()).toStrictEqual([triple1, triple2, triple3]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should have one binding and unbounded triples', () => {
            const shape: Shape = new Shape({ name: 'foo', positivePredicates: ["p0"], closed: true });
            const linkedShape = new Map<string, IShape>();

            const triple0: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });
            const triple1: Triple = new Triple({
                subject: 'y',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });
            const triple2: Triple = new Triple({
                subject: 'y',
                predicate: 'p2',
                object: [DF.namedNode('o0')]
            });
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        triple0.predicate,
                        {
                            triple: triple0,
                            dependencies: undefined
                        }
                    ],
                    [
                        triple1.predicate,
                        {
                            triple: triple1,
                            dependencies: undefined
                        }
                    ],
                    [
                        triple2.predicate,
                        {
                            triple: triple2,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([
                [triple0.predicate, triple0],
                [triple1.predicate, undefined],
                [triple2.predicate, undefined]
            ]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(false);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([triple1, triple2]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple0]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });
    });

    describe('shape constraint', () => {
        it('should have one binding with shape constraint', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            value: new Set(['foo1']),
                            type: ContraintType.SHAPE
                        }
                    }
                ], closed: true
            });

            const shapeP1: Shape = new Shape({
                name: 'foo1', positivePredicates: [
                    "p1"
                ], closed: true
            });


            const linkedShape = new Map<string, IShape>([['foo1', shapeP1]]);

            const triple: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple: Triple = new Triple({
                subject: 'z',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentStarPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p1',
                        {
                            triple: dependentTriple,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "z"
            };

            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p0',
                        {
                            triple,
                            dependencies: dependentStarPattern
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([[triple.predicate, triple]]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual(["z"]);
        });

        it('should have one binding with shape constraint with no linked shape', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            value: new Set(['foo1']),
                            type: ContraintType.SHAPE
                        }
                    }
                ], closed: true
            });


            const linkedShape = new Map<string, IShape>();

            const triple: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple: Triple = new Triple({
                subject: 'z',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentStarPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p1',
                        {
                            triple: dependentTriple,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "z"
            };

            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p0',
                        {
                            triple,
                            dependencies: dependentStarPattern
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([[triple.predicate, triple]]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual(["z"]);
        });

        it('should have one binding with shape constraint with multiple triples', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            value: new Set(['foo1']),
                            type: ContraintType.SHAPE
                        }
                    },
                    "p1",
                    "p2"
                ], closed: true
            });


            const shapeP1: Shape = new Shape({
                name: 'foo1', positivePredicates: [
                    "p1"
                ], closed: true
            });


            const linkedShape = new Map<string, IShape>([['foo1', shapeP1]]);

            const triple1: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });

            const triple2: Triple = new Triple({
                subject: 'y',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const triple3: Triple = new Triple({
                subject: 'y',
                predicate: 'p2',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple: Triple = new Triple({
                subject: 'z',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentStarPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p1',
                        {
                            triple: dependentTriple,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "z"
            };

            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        triple1.predicate,
                        {
                            triple: triple1,
                            dependencies: dependentStarPattern
                        }
                    ],
                    [
                        triple2.predicate,
                        {
                            triple: triple2,
                            dependencies: undefined
                        }
                    ],
                    [
                        triple3.predicate,
                        {
                            triple: triple3,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([
                [triple1.predicate, triple1],
                [triple2.predicate, triple2],
                [triple3.predicate, triple3],
            ]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple1, triple2, triple3]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual(["z"]);
        });

        it('should have one binding with shape constraint with no dependencies', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            value: new Set(['foo1']),
                            type: ContraintType.SHAPE
                        }
                    }
                ], closed: true
            });

            const shapeP1: Shape = new Shape({
                name: 'foo1', positivePredicates: [
                    "p1"
                ], closed: true
            });


            const linkedShape = new Map<string, IShape>([['foo1', shapeP1]]);

            const triple: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });

            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p0',
                        {
                            triple,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([[triple.predicate, triple]]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should have not bind with shape constraint not respected', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            value: new Set(['foo1']),
                            type: ContraintType.SHAPE
                        }
                    }
                ], closed: true
            });

            const shapeP1: Shape = new Shape({
                name: 'foo1', positivePredicates: [
                    "p1"
                ], closed: true
            });


            const linkedShape = new Map<string, IShape>([['foo1', shapeP1]]);

            const triple: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple: Triple = new Triple({
                subject: 'z',
                predicate: 'p2',
                object: [DF.namedNode('o0')]
            });

            const dependentStarPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p1',
                        {
                            triple: dependentTriple,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "z"
            };

            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p0',
                        {
                            triple,
                            dependencies: dependentStarPattern
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([[triple.predicate, undefined]]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(false);
            expect(bindings.shouldVisitShape()).toBe(false);
            expect(bindings.getUnboundedTriple()).toStrictEqual([triple]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([]);
        });

        it('should handle a complex case', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            value: new Set(['foo1']),
                            type: ContraintType.SHAPE
                        }
                    },
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo2']),
                            type: ContraintType.SHAPE
                        }
                    },
                    {
                        name: "p2",
                        constraint: {
                            value: new Set(['foo3']),
                            type: ContraintType.SHAPE
                        }
                    },
                ], closed: true
            });


            const shapeP1: Shape = new Shape({
                name: 'foo1', positivePredicates: [
                    "p1"
                ], closed: true
            });

            const shapeP2: Shape = new Shape({
                name: 'foo2', positivePredicates: [
                    "p1",
                    "p2"
                ], closed: true
            });

            const shapeP3: Shape = new Shape({
                name: 'foo3', positivePredicates: [
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo4']),
                            type: ContraintType.SHAPE
                        }
                    }
                ], closed: true
            });

            const shapeP4: Shape = new Shape({
                name: 'foo4', positivePredicates: [
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo5']),
                            type: ContraintType.SHAPE
                        }
                    },
                    "p2"
                ], closed: true
            });

            const shapeP5: Shape = new Shape({
                name: 'foo5', positivePredicates: [
                    "p1"
                ], closed: true
            });


            const linkedShape = new Map<string, IShape>([
                [shapeP1.name, shapeP1],
                [shapeP2.name, shapeP2],
                [shapeP3.name, shapeP3],
                [shapeP4.name, shapeP4],
                [shapeP5.name, shapeP5]
            ]);

            const triple1: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });

            const triple2: Triple = new Triple({
                subject: 'y',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const triple3: Triple = new Triple({
                subject: 'y',
                predicate: 'p2',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple1: Triple = new Triple({
                subject: 'z',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple2: Triple = new Triple({
                subject: 'zz',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple22: Triple = new Triple({
                subject: 'zz',
                predicate: 'p2',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple3: Triple = new Triple({
                subject: 'zzz',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple4: Triple = new Triple({
                subject: 'zzzz',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple5: Triple = new Triple({
                subject: 'zzzzz',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentStarPattern5: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple5.predicate,
                        {
                            triple: dependentTriple5,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "zzzzz"
            };

            const dependentStarPattern4: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple4.predicate,
                        {
                            triple: dependentTriple4,
                            dependencies: dependentStarPattern5
                        }
                    ],
                ]),
                name: "zzzz"
            };

            const dependentStarPattern3: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple3.predicate,
                        {
                            triple: dependentTriple3,
                            dependencies: dependentStarPattern4
                        }
                    ],
                ]),
                name: "zzz"
            };

            const dependentStarPattern2: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple2.predicate,
                        {
                            triple: dependentTriple2,
                            dependencies: undefined
                        }
                    ],
                    [
                        dependentTriple22.predicate,
                        {
                            triple: dependentTriple22,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "zz"
            };


            const dependentStarPattern1: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple1.predicate,
                        {
                            triple: dependentTriple1,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "z"
            };


            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        triple1.predicate,
                        {
                            triple: triple1,
                            dependencies: dependentStarPattern1
                        }
                    ],
                    [
                        triple2.predicate,
                        {
                            triple: triple2,
                            dependencies: dependentStarPattern2
                        }
                    ],
                    [
                        triple3.predicate,
                        {
                            triple: triple3,
                            dependencies: dependentStarPattern3
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([
                [triple1.predicate, triple1],
                [triple2.predicate, triple2],
                [triple3.predicate, triple3],
            ]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple1, triple2, triple3]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual(["z", "zz", "zzz", "zzzz", "zzzzz"]);
        });

        it('should handle a not fully binding complex case', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            value: new Set(['foo1']),
                            type: ContraintType.SHAPE
                        }
                    },
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo2']),
                            type: ContraintType.SHAPE
                        }
                    },
                    {
                        name: "p2",
                        constraint: {
                            value: new Set(['foo3']),
                            type: ContraintType.SHAPE
                        }
                    },
                ], closed: true
            });


            const shapeP1: Shape = new Shape({
                name: 'foo1', positivePredicates: [
                    "p1"
                ], closed: true
            });

            const shapeP2: Shape = new Shape({
                name: 'foo2', positivePredicates: [
                    "p1",
                    "p2"
                ], closed: true
            });

            const shapeP3: Shape = new Shape({
                name: 'foo3', positivePredicates: [
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo4']),
                            type: ContraintType.SHAPE
                        }
                    }
                ], closed: true
            });

            const shapeP4: Shape = new Shape({
                name: 'foo4', positivePredicates: [
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo5']),
                            type: ContraintType.SHAPE
                        }
                    },
                    "p2"
                ], closed: true
            });

            const shapeP5: Shape = new Shape({
                name: 'foo5', positivePredicates: [
                    "p1"
                ], closed: true
            });


            const linkedShape = new Map<string, IShape>([
                [shapeP1.name, shapeP1],
                [shapeP2.name, shapeP2],
                [shapeP3.name, shapeP3],
                [shapeP4.name, shapeP4],
                [shapeP5.name, shapeP5]
            ]);

            const triple1: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });

            const triple2: Triple = new Triple({
                subject: 'y',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const triple3: Triple = new Triple({
                subject: 'y',
                predicate: 'p2',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple1: Triple = new Triple({
                subject: 'z',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple2: Triple = new Triple({
                subject: 'zz',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple22: Triple = new Triple({
                subject: 'zz',
                predicate: 'p2',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple3: Triple = new Triple({
                subject: 'zzz',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple4: Triple = new Triple({
                subject: 'zzzz',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple5: Triple = new Triple({
                subject: 'zzzzz',
                predicate: 'p_1',
                object: [DF.namedNode('o0')]
            });

            const dependentStarPattern5: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple5.predicate,
                        {
                            triple: dependentTriple5,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "zzzzz"
            };

            const dependentStarPattern4: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple4.predicate,
                        {
                            triple: dependentTriple4,
                            dependencies: dependentStarPattern5
                        }
                    ],
                ]),
                name: "zzzz"
            };

            const dependentStarPattern3: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple3.predicate,
                        {
                            triple: dependentTriple3,
                            dependencies: dependentStarPattern4
                        }
                    ],
                ]),
                name: "zzz"
            };

            const dependentStarPattern2: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple2.predicate,
                        {
                            triple: dependentTriple2,
                            dependencies: undefined
                        }
                    ],
                    [
                        dependentTriple22.predicate,
                        {
                            triple: dependentTriple22,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "zz"
            };


            const dependentStarPattern1: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple1.predicate,
                        {
                            triple: dependentTriple1,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "z"
            };


            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        triple1.predicate,
                        {
                            triple: triple1,
                            dependencies: dependentStarPattern1
                        }
                    ],
                    [
                        triple2.predicate,
                        {
                            triple: triple2,
                            dependencies: dependentStarPattern2
                        }
                    ],
                    [
                        triple3.predicate,
                        {
                            triple: triple3,
                            dependencies: dependentStarPattern3
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([
                [triple1.predicate, triple1],
                [triple2.predicate, triple2],
                [triple3.predicate, undefined],
            ]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(false);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([triple3]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple1, triple2]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);

        });

        it('should handle a non binding complex case', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            value: new Set(['foo1']),
                            type: ContraintType.SHAPE
                        }
                    },
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo2']),
                            type: ContraintType.SHAPE
                        }
                    },
                    {
                        name: "p2",
                        constraint: {
                            value: new Set(['foo3']),
                            type: ContraintType.SHAPE
                        }
                    },
                ], closed: true
            });


            const shapeP1: Shape = new Shape({
                name: 'foo1', positivePredicates: [
                    "p1"
                ], closed: true
            });

            const shapeP2: Shape = new Shape({
                name: 'foo2', positivePredicates: [
                    "p1",
                    "p2"
                ], closed: true
            });

            const shapeP3: Shape = new Shape({
                name: 'foo3', positivePredicates: [
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo4']),
                            type: ContraintType.SHAPE
                        }
                    }
                ], closed: true
            });

            const shapeP4: Shape = new Shape({
                name: 'foo4', positivePredicates: [
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo5']),
                            type: ContraintType.SHAPE
                        }
                    },
                    "p2"
                ], closed: true
            });

            const shapeP5: Shape = new Shape({
                name: 'foo5', positivePredicates: [
                    "p1"
                ], closed: true
            });


            const linkedShape = new Map<string, IShape>([
                [shapeP1.name, shapeP1],
                [shapeP2.name, shapeP2],
                [shapeP3.name, shapeP3],
                [shapeP4.name, shapeP4],
                [shapeP5.name, shapeP5]
            ]);

            const triple1: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.namedNode('o0')]
            });

            const triple2: Triple = new Triple({
                subject: 'y',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const triple3: Triple = new Triple({
                subject: 'y',
                predicate: 'p2',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple1: Triple = new Triple({
                subject: 'z',
                predicate: 'p_1',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple2: Triple = new Triple({
                subject: 'zz',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple22: Triple = new Triple({
                subject: 'zz',
                predicate: 'p_2',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple3: Triple = new Triple({
                subject: 'zzz',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple4: Triple = new Triple({
                subject: 'zzzz',
                predicate: 'p1',
                object: [DF.namedNode('o0')]
            });

            const dependentTriple5: Triple = new Triple({
                subject: 'zzzzz',
                predicate: 'p_1',
                object: [DF.namedNode('o0')]
            });

            const dependentStarPattern5: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple5.predicate,
                        {
                            triple: dependentTriple5,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "zzzzz"
            };

            const dependentStarPattern4: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple4.predicate,
                        {
                            triple: dependentTriple4,
                            dependencies: dependentStarPattern5
                        }
                    ],
                ]),
                name: "zzzz"
            };

            const dependentStarPattern3: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple3.predicate,
                        {
                            triple: dependentTriple3,
                            dependencies: dependentStarPattern4
                        }
                    ],
                ]),
                name: "zzz"
            };

            const dependentStarPattern2: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple2.predicate,
                        {
                            triple: dependentTriple2,
                            dependencies: undefined
                        }
                    ],
                    [
                        dependentTriple22.predicate,
                        {
                            triple: dependentTriple22,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "zz"
            };


            const dependentStarPattern1: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple1.predicate,
                        {
                            triple: dependentTriple1,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "z"
            };


            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        triple1.predicate,
                        {
                            triple: triple1,
                            dependencies: dependentStarPattern1
                        }
                    ],
                    [
                        triple2.predicate,
                        {
                            triple: triple2,
                            dependencies: dependentStarPattern2
                        }
                    ],
                    [
                        triple3.predicate,
                        {
                            triple: triple3,
                            dependencies: dependentStarPattern3
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([
                [triple1.predicate, undefined],
                [triple2.predicate, undefined],
                [triple3.predicate, undefined],
            ]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(false);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.shouldVisitShape()).toBe(false);
            expect(bindings.getUnboundedTriple()).toStrictEqual([triple1, triple2, triple3]);
            expect(bindings.getBoundTriple()).toStrictEqual([]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });
    });

    describe('type constraint', () => {
        it('should have one binding', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            type: ContraintType.TYPE,
                            value: new Set(["t0"])
                        }
                    }
                ], closed: true
            });
            const linkedShape = new Map<string, IShape>();

            const triple: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: DF.literal('o0', DF.namedNode('t0'))
            });
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p0',
                        {
                            triple,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([[triple.predicate, triple]]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should have one binding with a named node', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            type: ContraintType.TYPE,
                            value: new Set(["t0"])
                        }
                    }
                ], closed: true
            });
            const linkedShape = new Map<string, IShape>();

            const triple: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: DF.namedNode('t0')
            });
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p0',
                        {
                            triple,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([[triple.predicate, triple]]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should not bind', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            type: ContraintType.TYPE,
                            value: new Set(["t_0"])
                        }
                    }
                ], closed: true
            });
            const linkedShape = new Map<string, IShape>();

            const triple: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: DF.literal('o0', DF.namedNode('t0'))
            });
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        'p0',
                        {
                            triple,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([[triple.predicate, undefined]]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(false);
            expect(bindings.shouldVisitShape()).toBe(false);
            expect(bindings.getUnboundedTriple()).toStrictEqual([triple]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should have multiple bindings', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            type: ContraintType.TYPE,
                            value: new Set(["t0"])
                        }
                    },
                    {
                        name: "p1",
                        constraint: {
                            type: ContraintType.TYPE,
                            value: new Set(["t1"])
                        }
                    },
                    {
                        name: "p2",
                        constraint: {
                            type: ContraintType.TYPE,
                            value: new Set(["t2"])
                        }
                    }
                ], closed: true
            });
            const linkedShape = new Map<string, IShape>();

            const triple1: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: [DF.literal('o0', DF.namedNode('t0'))]
            });
            const triple2: Triple = new Triple({
                subject: 'y',
                predicate: 'p1',
                object: [DF.literal('o0', DF.namedNode('t1'))]
            });
            const triple3: Triple = new Triple({
                subject: 'y',
                predicate: 'p2',
                object: [DF.literal('o0', DF.namedNode('t2'))]
            });
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        triple1.predicate,
                        {
                            triple: triple1,
                            dependencies: undefined
                        }
                    ],
                    [
                        triple2.predicate,
                        {
                            triple: triple2,
                            dependencies: undefined
                        }
                    ],
                    [
                        triple3.predicate,
                        {
                            triple: triple3,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([
                [triple1.predicate, triple1],
                [triple2.predicate, triple2],
                [triple3.predicate, triple3]
            ]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple1, triple2, triple3]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should have multiple triples with unbound tiples', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            type: ContraintType.TYPE,
                            value: new Set(["t0"])
                        }
                    },
                    {
                        name: "p1",
                        constraint: {
                            type: ContraintType.TYPE,
                            value: new Set(["t1"])
                        }
                    },
                    {
                        name: "p2",
                        constraint: {
                            type: ContraintType.TYPE,
                            value: new Set(["t_2"])
                        }
                    }
                ], closed: true
            });
            const linkedShape = new Map<string, IShape>();

            const triple1: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: DF.literal('o0', DF.namedNode('t0'))
            });
            const triple2: Triple = new Triple({
                subject: 'y',
                predicate: 'p1',
                object: DF.literal('o0', DF.namedNode('t1'))
            });
            const triple3: Triple = new Triple({
                subject: 'y',
                predicate: 'p2',
                object: DF.literal('o0', DF.namedNode('t2'))
            });
            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        triple1.predicate,
                        {
                            triple: triple1,
                            dependencies: undefined
                        }
                    ],
                    [
                        triple2.predicate,
                        {
                            triple: triple2,
                            dependencies: undefined
                        }
                    ],
                    [
                        triple3.predicate,
                        {
                            triple: triple3,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([
                [triple1.predicate, triple1],
                [triple2.predicate, triple2],
                [triple3.predicate, undefined]
            ]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(false);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([triple3]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple1, triple2]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });
    });

    describe('complex case', () => {
        it('should handle shape constraint and type constraint', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            value: new Set(['foo1']),
                            type: ContraintType.SHAPE
                        }
                    },
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo2']),
                            type: ContraintType.SHAPE
                        }
                    },
                    {
                        name: "p2",
                        constraint: {
                            value: new Set(['foo3']),
                            type: ContraintType.SHAPE
                        }
                    },
                ], closed: true
            });


            const shapeP1: Shape = new Shape({
                name: 'foo1', positivePredicates: [
                    {
                        name: "p1",
                        constraint: {
                            type: ContraintType.TYPE,
                            value: new Set(["t0"])
                        }
                    }
                ], closed: true
            });

            const shapeP2: Shape = new Shape({
                name: 'foo2', positivePredicates: [
                    "p1",
                    "p2"
                ], closed: true
            });

            const shapeP3: Shape = new Shape({
                name: 'foo3', positivePredicates: [
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo4']),
                            type: ContraintType.SHAPE
                        }
                    }
                ], closed: true
            });

            const shapeP4: Shape = new Shape({
                name: 'foo4', positivePredicates: [
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo5']),
                            type: ContraintType.SHAPE
                        }
                    },
                    "p2"
                ], closed: true
            });

            const shapeP5: Shape = new Shape({
                name: 'foo5', positivePredicates: [
                    "p1"
                ], closed: true
            });


            const linkedShape = new Map<string, IShape>([
                [shapeP1.name, shapeP1],
                [shapeP2.name, shapeP2],
                [shapeP3.name, shapeP3],
                [shapeP4.name, shapeP4],
                [shapeP5.name, shapeP5]
            ]);

            const triple1: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: DF.literal('o0', DF.namedNode("t0"))
            });

            const triple2: Triple = new Triple({
                subject: 'y',
                predicate: 'p1',
                object: DF.literal('o0', DF.namedNode("t0"))
            });

            const triple3: Triple = new Triple({
                subject: 'y',
                predicate: 'p2',
                object: DF.namedNode('o0')
            });

            const dependentTriple1: Triple = new Triple({
                subject: 'z',
                predicate: 'p1',
                object: DF.literal('o0', DF.namedNode("t0"))
            });

            const dependentTriple2: Triple = new Triple({
                subject: 'zz',
                predicate: 'p1',
                object: DF.namedNode('o0')
            });

            const dependentTriple22: Triple = new Triple({
                subject: 'zz',
                predicate: 'p2',
                object: DF.namedNode('o0')
            });

            const dependentTriple3: Triple = new Triple({
                subject: 'zzz',
                predicate: 'p1',
                object: DF.namedNode('o0')
            });

            const dependentTriple4: Triple = new Triple({
                subject: 'zzzz',
                predicate: 'p1',
                object: DF.namedNode('o0')
            });

            const dependentTriple5: Triple = new Triple({
                subject: 'zzzzz',
                predicate: 'p1',
                object: DF.namedNode('o0')
            });

            const dependentStarPattern5: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple5.predicate,
                        {
                            triple: dependentTriple5,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "zzzzz"
            };

            const dependentStarPattern4: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple4.predicate,
                        {
                            triple: dependentTriple4,
                            dependencies: dependentStarPattern5
                        }
                    ],
                ]),
                name: "zzzz"
            };

            const dependentStarPattern3: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple3.predicate,
                        {
                            triple: dependentTriple3,
                            dependencies: dependentStarPattern4
                        }
                    ],
                ]),
                name: "zzz"
            };

            const dependentStarPattern2: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple2.predicate,
                        {
                            triple: dependentTriple2,
                            dependencies: undefined
                        }
                    ],
                    [
                        dependentTriple22.predicate,
                        {
                            triple: dependentTriple22,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "zz"
            };


            const dependentStarPattern1: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple1.predicate,
                        {
                            triple: dependentTriple1,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "z"
            };


            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        triple1.predicate,
                        {
                            triple: triple1,
                            dependencies: dependentStarPattern1
                        }
                    ],
                    [
                        triple2.predicate,
                        {
                            triple: triple2,
                            dependencies: dependentStarPattern2
                        }
                    ],
                    [
                        triple3.predicate,
                        {
                            triple: triple3,
                            dependencies: dependentStarPattern3
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([
                [triple1.predicate, triple1],
                [triple2.predicate, triple2],
                [triple3.predicate, triple3],
            ]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple1, triple2, triple3]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual(["z", "zz", "zzz", "zzzz", "zzzzz"]);
        });

        it('should handle shape constraint and type constraint where a type constraint is not valid', () => {
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates: [
                    {
                        name: "p0",
                        constraint: {
                            value: new Set(['foo1']),
                            type: ContraintType.SHAPE
                        }
                    },
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo2']),
                            type: ContraintType.SHAPE
                        }
                    },
                    {
                        name: "p2",
                        constraint: {
                            value: new Set(['foo3']),
                            type: ContraintType.SHAPE
                        }
                    },
                ], closed: true
            });


            const shapeP1: Shape = new Shape({
                name: 'foo1', positivePredicates: [
                    {
                        name: "p1",
                        constraint: {
                            type: ContraintType.TYPE,
                            value: new Set(["t_0"])
                        }
                    }
                ], closed: true
            });

            const shapeP2: Shape = new Shape({
                name: 'foo2', positivePredicates: [
                    "p1",
                    "p2"
                ], closed: true
            });

            const shapeP3: Shape = new Shape({
                name: 'foo3', positivePredicates: [
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo4']),
                            type: ContraintType.SHAPE
                        }
                    }
                ], closed: true
            });

            const shapeP4: Shape = new Shape({
                name: 'foo4', positivePredicates: [
                    {
                        name: "p1",
                        constraint: {
                            value: new Set(['foo5']),
                            type: ContraintType.SHAPE
                        }
                    },
                    "p2"
                ], closed: true
            });

            const shapeP5: Shape = new Shape({
                name: 'foo5', positivePredicates: [
                    "p1"
                ], closed: true
            });


            const linkedShape = new Map<string, IShape>([
                [shapeP1.name, shapeP1],
                [shapeP2.name, shapeP2],
                [shapeP3.name, shapeP3],
                [shapeP4.name, shapeP4],
                [shapeP5.name, shapeP5]
            ]);

            const triple1: Triple = new Triple({
                subject: 'y',
                predicate: 'p0',
                object: DF.literal('o0', DF.namedNode("t0"))
            });

            const triple2: Triple = new Triple({
                subject: 'y',
                predicate: 'p1',
                object: DF.literal('o0', DF.namedNode("t0"))
            });

            const triple3: Triple = new Triple({
                subject: 'y',
                predicate: 'p2',
                object: DF.namedNode('o0')
            });

            const dependentTriple1: Triple = new Triple({
                subject: 'z',
                predicate: 'p1',
                object: DF.literal('o0', DF.namedNode("t0"))
            });

            const dependentTriple2: Triple = new Triple({
                subject: 'zz',
                predicate: 'p1',
                object: DF.namedNode('o0')
            });

            const dependentTriple22: Triple = new Triple({
                subject: 'zz',
                predicate: 'p2',
                object: DF.namedNode('o0')
            });

            const dependentTriple3: Triple = new Triple({
                subject: 'zzz',
                predicate: 'p1',
                object: DF.namedNode('o0')
            });

            const dependentTriple4: Triple = new Triple({
                subject: 'zzzz',
                predicate: 'p1',
                object: DF.namedNode('o0')
            });

            const dependentTriple5: Triple = new Triple({
                subject: 'zzzzz',
                predicate: 'p1',
                object: DF.namedNode('o0')
            });

            const dependentStarPattern5: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple5.predicate,
                        {
                            triple: dependentTriple5,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "zzzzz"
            };

            const dependentStarPattern4: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple4.predicate,
                        {
                            triple: dependentTriple4,
                            dependencies: dependentStarPattern5
                        }
                    ],
                ]),
                name: "zzzz"
            };

            const dependentStarPattern3: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple3.predicate,
                        {
                            triple: dependentTriple3,
                            dependencies: dependentStarPattern4
                        }
                    ],
                ]),
                name: "zzz"
            };

            const dependentStarPattern2: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple2.predicate,
                        {
                            triple: dependentTriple2,
                            dependencies: undefined
                        }
                    ],
                    [
                        dependentTriple22.predicate,
                        {
                            triple: dependentTriple22,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "zz"
            };


            const dependentStarPattern1: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        dependentTriple1.predicate,
                        {
                            triple: dependentTriple1,
                            dependencies: undefined
                        }
                    ],
                ]),
                name: "z"
            };


            const starPattern: IStarPatternWithDependencies = {
                starPattern: new Map([
                    [
                        triple1.predicate,
                        {
                            triple: triple1,
                            dependencies: dependentStarPattern1
                        }
                    ],
                    [
                        triple2.predicate,
                        {
                            triple: triple2,
                            dependencies: dependentStarPattern2
                        }
                    ],
                    [
                        triple3.predicate,
                        {
                            triple: triple3,
                            dependencies: dependentStarPattern3
                        }
                    ],
                ]),
                name: "y"
            };

            const expectedBindings = new Map([
                [triple1.predicate, undefined],
                [triple2.predicate, triple2],
                [triple3.predicate, triple3],
            ]);


            const bindings = new Bindings(shape, starPattern, linkedShape);

            expect(bindings.isFullyBounded()).toBe(false);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([triple1]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple2, triple3]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });
    });

    describe('cycles', () => {
        it('should handle a simple cycle', () => {
            const stringQuery = `
            SELECT * WHERE {
                ?x <http://www.example.ca> ?y .
                ?y <http://www.example.ca> ?x .
            }
            `;
            const query = generateQuery(translate(stringQuery));
            const xStarPattern = query.starPatterns.get("x")!;
            const shape: Shape = new Shape({ name: 'foo', positivePredicates: ["http://www.example.ca"], closed: true });
            const triple: ITriple = xStarPattern.starPattern.get("http://www.example.ca")?.triple!;

            const expectedBindings = new Map([[triple.predicate, triple]]);

            const bindings = new Bindings(shape, xStarPattern, new Map());

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should handle a cycle', () => {
            const stringQuery = `
            SELECT * WHERE {
                ?x <http://www.example.ca> ?y .
                ?y <http://www.example.ca> ?x .
                ?y <http://www.example.be> ?z .
                ?y <http://www.example.qc.ca> ?p .
                ?p <http://www.example.qc.ca> ?v .
                ?v <http://www.example.uk> "abc" .
            }
            `;
            const query = generateQuery(translate(stringQuery));
            const xStarPattern = query.starPatterns.get("x")!;
            const shape: Shape = new Shape({ name: 'foo', positivePredicates: ["http://www.example.ca"], closed: true });
            const triple: ITriple = xStarPattern.starPattern.get("http://www.example.ca")?.triple!;

            const expectedBindings = new Map([[triple.predicate, triple]]);

            const bindings = new Bindings(shape, xStarPattern, new Map());

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual(["v"]);
        });

        it('should handle multiple cycles', () => {
            const stringQuery = `
            SELECT * WHERE {
                ?x <http://www.example.ca> ?y .
                ?x <http://www.example.be> ?z .

                ?y <http://www.example.ca> ?x .

                ?z <http://www.example.be> ?x
            }
            `;
            const query = generateQuery(translate(stringQuery));
            const xStarPattern = query.starPatterns.get("x")!;
            const shape: Shape = new Shape({
                name: 'foo', positivePredicates:
                    [
                        "http://www.example.ca",
                        "http://www.example.be"
                    ], closed: true
            });
            const tripleCa: ITriple = xStarPattern.starPattern.get("http://www.example.ca")?.triple!;
            const tripleBe: ITriple = xStarPattern.starPattern.get("http://www.example.be")?.triple!;

            const expectedBindings = new Map([
                [tripleCa.predicate, tripleCa],
                [tripleBe.predicate, tripleBe],
            ]);

            const bindings = new Bindings(shape, xStarPattern, new Map());

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([tripleCa, tripleBe]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual([]);
        });

        it('should handle no cycle with deep dependencies', () => {
            const stringQuery = `
            SELECT * WHERE {
                ?x <http://www.example.ca> ?y .
                ?y <http://www.example.ca> ?z .
                ?z <http://www.example.ca> ?y .
            }
            `;
            const query = generateQuery(translate(stringQuery));
            const xStarPattern = query.starPatterns.get("x")!;
            const shape: Shape = new Shape({ name: 'foo', positivePredicates: ["http://www.example.ca"], closed: true });
            const triple: ITriple = xStarPattern.starPattern.get("http://www.example.ca")?.triple!;

            const expectedBindings = new Map([[triple.predicate, triple]]);

            const bindings = new Bindings(shape, xStarPattern, new Map());

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([triple]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual(["y", "z"]);
        });

        it('should handle no cycle', () => {
            const queryString = `
            SELECT * WHERE { 
                ?x <https://www.example.ca/p0> ?y .
                ?x <https://www.example.ca/p1> ?z .
                ?x <https://www.example.ca/p2> ?w .
        
                ?y <https://www.example.ca/p1> "foo"^^<https://www.example.ca/t0> .
        
                ?z <https://www.example.ca/p1> "abc" .
                
                ?w <https://www.example.ca/p1> ?w1 .
                
                ?w1 <https://www.example.ca/p1> ?w2 .
        
                ?w2 <https://www.example.ca/p1> "bar"
              }
            `;
            const querySparql = translate(queryString);
            const query = generateQuery(querySparql);

            const xStarPattern = query.starPatterns.get("x")!;
            const shape: Shape = new Shape({ name: 'foo', positivePredicates: ["https://www.example.ca/p0", "https://www.example.ca/p1", "https://www.example.ca/p2"], closed: true });
            const tripleP0: ITriple = xStarPattern.starPattern.get("https://www.example.ca/p0")?.triple!;
            const tripleP1: ITriple = xStarPattern.starPattern.get("https://www.example.ca/p1")?.triple!;
            const tripleP2: ITriple = xStarPattern.starPattern.get("https://www.example.ca/p2")?.triple!;

            const expectedBindings = new Map([
                [tripleP0.predicate, tripleP0],
                [tripleP1.predicate, tripleP1],
                [tripleP2.predicate, tripleP2],
            ]);

            const bindings = new Bindings(shape, xStarPattern, new Map());

            expect(bindings.isFullyBounded()).toBe(true);
            expect(bindings.shouldVisitShape()).toBe(true);
            expect(bindings.getUnboundedTriple()).toStrictEqual([]);
            expect(bindings.getBindings()).toStrictEqual(expectedBindings);
            expect(bindings.getBoundTriple()).toStrictEqual([tripleP0,tripleP1,tripleP2]);
            expect(bindings.getNestedContainedStarPatternName()).toStrictEqual(["y","z","w","w1","w2"]);
        });
    });
});