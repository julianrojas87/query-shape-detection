import type * as RDF from 'rdf-js';
import { SHEX_PREDICATE, SHEX_SHAPE_EXPRESSION, SHEX_EXPRESSION, SHEX_SHAPE, TYPE_DEFINITION } from "./constant";
import { SimpleShape } from './types';

function findPredicate(quad: RDF.Quad): Description | undefined {
    if (quad.predicate.equals(SHEX_PREDICATE)) {
        return {
            information: quad.object, // the predicate
            descriptor: Descriptor.PREDICATE,
            context: quad.subject // a container
        }
    }
}


function findShapeExpression(quad: RDF.Quad): Description | undefined {
    if (quad.predicate.equals(SHEX_SHAPE_EXPRESSION)) {
        return {
            information: quad.subject,
            descriptor: Descriptor.NAME,
            context: quad.object
        }
    }
}

function findExpression(quad: RDF.Quad): Description | undefined {
    if (quad.predicate.equals(SHEX_EXPRESSION)) {
        return {
            information: quad.subject, // the name of the shape
            descriptor: Descriptor.EXPRESSION,
            context: quad.object // the expression
        }
    }
}

function validateExpressionIsFromShape(quad: RDF.Quad): Description | undefined {
    if (quad.predicate.equals(TYPE_DEFINITION) && quad.object.equals(SHEX_SHAPE)) {
        return {
            information: quad.subject, // the name of the shape 
            descriptor: Descriptor.IS_SHAPE,
            context: quad.object // the class of shex shape
        }
    }
    return undefined
}

function createSimpleShape(descriptions: Description[]): Map<String, SimpleShape> {
    const resp: Map<String, any> = new Map();
    let current_descriptions: Description[] = [...descriptions];
    // I associate the context to a shape
    let current_context: Map<RDF.Term, string> = new Map();

    // we get the name of all the shape we have
    current_descriptions.filter((description) => {
        if (description.descriptor === Descriptor.NAME) {
            resp.set(description.information.value, { name: description.information.value });
            current_context.set(description.context, description.information.value);
            return false;
        }
        return true;
    });

    // we find the shape that are shapes
    const shapeThatHaveTheClass: Set<string> = new Set();
    current_descriptions.filter((description) => {
        const shape = current_context.get(description.information);
        if (description.descriptor === Descriptor.IS_SHAPE && shape !== undefined) {
            shapeThatHaveTheClass.add(shape);
        }
        return true;
    });

    // we prune the shape that are not shape actually
    for (const key of resp.keys()) {
        if (!shapeThatHaveTheClass.has(key as string)) {
            resp.delete(key);
        }
    }

    // we are finding the node that describe the expression
    current_descriptions.filter((description) => {
        if (description.descriptor === Descriptor.EXPRESSION) {
            current_context.set(description.context, description.information.value);
            return false;
        }
        return true;
    });
    return resp;
}
/**
 * Find the name of the shape associated with the predicate of a shape schema 
 * but do not validate if the shape is valid
 * @param {Description} predicate -  the description of the predicate, the function search its shape name
 * @param {Description[]} descriptions - the description of the triples related to the shape schema 
 * @returns {string | undefined} the name of the shape or undefined if the function was not able to find it
 */
function findShapeAssociatedWithPredicate(predicate: Description, descriptions: Description[]): string | undefined {
    let resp: string | undefined = undefined;
    let current_context = predicate.context.value;
    const descriptionMapByContext: Map<string, Description> = new Map();

    for (const description of descriptions) {
        descriptionMapByContext.set(description.context.value, description);
    }
    let i = 0;
    while (resp === undefined && i < descriptions.length) {
        const description = descriptionMapByContext.get(current_context);
        if (description === undefined) {
            break;
        }

        if (description.descriptor === Descriptor.NAME) {
            resp = description.information.value;
        } else {
            current_context = description.context.value;
        }
        i++;
    }
    return resp;
}

/**
function createSimpleShape(descriptions: Description[]): SimpleShape | Error {
    let name: string | undefined = undefined;
    let predicates: string[] | undefined = undefined;

    for (const description of descriptions) {
        if (description.descriptor === Descriptor.NAME && name === undefined) {
            name = description.information.value;
        } else if (description.descriptor === Descriptor.NAME && name !== undefined) {
            return new Error('two names are defined');
        }
    }

    if (name !== undefined && predicates !== undefined) {
        return {
            name,
            predicates
        };
    }

    return new Error('the name or/and predicates are not defined');
}
*/

interface Description {
    context: RDF.Term,
    descriptor: Descriptor
    information: RDF.Term
}

enum Descriptor {
    PREDICATE,
    NAME,
    EXPRESSION,
    SHAPE_EXPRESSION,
    IS_SHAPE
}