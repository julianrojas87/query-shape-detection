import { ISimpleShape } from './aligment';
import * as ShEx from 'shexj';
import * as RDF from '@rdfjs/types';
import { SHEX_PREDICATE, SHEX_EXPRESSION } from './constant';

const shexParser = require('@shexjs/parser');
const shexVisitor = require('@shexjs/visitor').Visitor;

const visitor = shexVisitor();

/**
 * get all the shapes from a schema
 * @param {string|ShEx.Schema} input_schema 
 * @param {string} shape_iri 
 * @returns {Map<string, ShEx.ShapeDecl> | Error | undefined} a map of shapes, an error if it was not able to be parsed or undefined if there is no shapes
 */
export function getAllShapes(input_schema: string | ShEx.Schema, shape_iri: string): Map<string, ShEx.ShapeDecl> | Error | undefined {
    let schema: ShEx.Schema;
    if (typeof input_schema === 'string') {
        try {
            const parser = shexParser.construct(shape_iri);
            schema = parser.parse(input_schema);
        } catch (error: any) {
            return <Error>error
        }
    } else {
        schema = input_schema;
    }


    const shapes: ShEx.ShapeDecl[] | undefined = schema.shapes;
    if (shapes === undefined || shapes.length === 0) {
        return undefined;
    }


    const shape_map: Map<string, ShEx.ShapeDecl> = new Map();
    for (const shape of shapes) {
        shape_map.set(shape.id, shape)
    }

    return shape_map;
}
export function hackCreateSimpleShapesFromQuadStream(streamingQuads: RDF.Stream<RDF.Quad>): Promise<ISimpleShape> {
    const predicates: string[] = [];
    let name: string | undefined;
    let multipleShapes = false;
    return new Promise((resolve, reject) => {
        streamingQuads.on('data', (quad: RDF.Quad) => {
            if (quad.predicate.equals(SHEX_PREDICATE)) {
                predicates.push(quad.object.value);
            }
            if (quad.predicate.equals(SHEX_EXPRESSION)) {
                if (name !== undefined) {
                    multipleShapes = true;
                }
                name = quad.subject.value;
            }
        });

        streamingQuads.on('error', (error) => {
            reject(error);
        })
        streamingQuads.on('end', () => {
            if (multipleShapes === true) {
                reject(new Error("there is multiple shapes"));
                return;
            }
            if (name === undefined) {
                reject(new Error("there is no shex expression defined"));
                return;
            }
            resolve({
                name,
                predicates
            }
            )
        });
    });
}

/**
 * create a map of simple shapes
 * @param {Map<string, ShEx.ShapeDecl>} shapes - ShEx shapes
 * @returns {Map<string, ISimpleShape>} map of simple shapes
 */
export function createSimpleShapes(shapes: Map<string, ShEx.ShapeDecl>): Map<string, ISimpleShape> {
    const simple_shapes: Map<string, ISimpleShape> = new Map();
    for (const [key, shape] of shapes.entries()) {
        const shape_predicates: string[] = [];
        visitor.visitTripleConstraint = (tripleConstraint: ShEx.TripleConstraint, ...args: any[]): void => {
            shape_predicates.push(tripleConstraint.predicate);
        };
        visitor.visitShapeDecl(shape);

        simple_shapes.set(key, { name: key, predicates: shape_predicates });
    }
    return simple_shapes;
}