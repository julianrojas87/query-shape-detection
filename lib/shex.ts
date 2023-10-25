import { SimpleShape } from './types';
import * as ShEx from 'shexj';

const shexParser = require('@shexjs/parser');
const shexVisitor = require('@shexjs/visitor').Visitor;

const visitor = shexVisitor();

/**
 * 
 * @param input_schema 
 * @param shape_iri 
 * @returns 
 */
export function getAllShapes(input_schema: string|ShEx.Schema, shape_iri: string): Map<string, ShEx.ShapeDecl> | Error | undefined {
    const parser = shexParser.construct(shape_iri);
    let schema: ShEx.Schema;
    if (typeof input_schema  === 'string'){
        try {
            schema = parser.parse(input_schema);
        } catch (error:any) {
            return <Error> error
        }
    }else{
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

export function createSimpleShapes(shapes: Map<string, ShEx.ShapeDecl>): Map<string, SimpleShape> {
    const simple_shapes: Map<string, SimpleShape> = new Map();
    for (const [key, shape] of shapes.entries()) {
        const shape_predicates: string[] = [];
        visitor.visitTripleConstraint = (tripleConstraint: ShEx.TripleConstraint, ...args: any[]): void => {
            shape_predicates.push(tripleConstraint.predicate);
        };
        visitor.visitShapeDecl(shape);

        simple_shapes.set(key, { name: key, predicates: shape_predicates, predicates_not:[]});
    }
    return simple_shapes;
}