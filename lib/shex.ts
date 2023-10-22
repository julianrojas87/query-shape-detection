import { SimpleShapeConstraint } from './types';
import * as ShEx from 'shexj';

const shexParser = require('@shexjs/parser');
const shexVisitor = require('@shexjs/visitor').Visitor;

const visitor = shexVisitor();

/**
 * 
 * @param quads 
 * @param shape_iri 
 * @returns 
 */
export function getAllShapes(quads: string, shape_iri: string): Map<string, ShEx.ShapeDecl> | Error | undefined {
    const parser = shexParser.construct(shape_iri);
    let schema: ShEx.Schema;
    try {
        schema =parser.parse(quads);
    } catch (error:any) {
        return <Error> error
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

export function createSimpleShape(shapes: Map<string, ShEx.ShapeDecl>): Map<string, SimpleShapeConstraint> {
    const simple_shapes: Map<string, SimpleShapeConstraint> = new Map();
    for (const [key, shape] of shapes.entries()) {
        const shape_predicates: string[] = [];
        visitor.visitTripleConstraint = (tripleConstraint: ShEx.TripleConstraint): void => {
            shape_predicates.push(tripleConstraint.predicate);
        };
        visitor.visitShapeDecl(shape);

        simple_shapes.set(key, { name: key, predicates: shape_predicates });
    }
    return simple_shapes;
}