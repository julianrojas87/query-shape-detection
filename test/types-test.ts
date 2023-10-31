import { SimplePropertyObject, SimpleShape } from '../lib/types';
import { Term } from "@rdfjs/types";
import { DataFactory } from 'rdf-data-factory';
import type * as RDF from 'rdf-js';

const DF = new DataFactory<RDF.BaseQuad>();

const AN_OBJECT = DF.namedNode('an object');
describe('SimplePropertyObject', () => {
    describe('isAlignedWithShape', () => {
        it('should be align with a SimpleShape with the right predicate', () => {
            const predicate = 'foo';
            const object: Term = AN_OBJECT;
            const property_object = new SimplePropertyObject(predicate, object);
            const shape: SimpleShape = {
                name: "foo",
                predicates: [predicate]
            };
            expect(property_object.isAlignedWithShape(shape)).toBe(true);
        });

        it('should not be align with a SimpleShape with the wrong predicate', () => {
            const predicate = 'foo';
            const object: Term = AN_OBJECT;
            const property_object = new SimplePropertyObject(predicate, object);
            const shape: SimpleShape = {
                name: "foo",
                predicates: ["wrong predicate"]
            };
            expect(property_object.isAlignedWithShape(shape)).toBe(false);
        });

        it('should not be align with a SimpleShape with no predicate', ()=>{
            const predicate = 'foo';
            const object: Term = AN_OBJECT;
            const property_object = new SimplePropertyObject(predicate, object);
            const shape: SimpleShape = {
                name: "foo",
                predicates: []
            };
            expect(property_object.isAlignedWithShape(shape)).toBe(false);
        });

        it('should not be align with a SimpleShape with multiple wrong predicate', ()=>{
            const predicate = 'foo';
            const object: Term = AN_OBJECT;
            const property_object = new SimplePropertyObject(predicate, object);
            const shape: SimpleShape = {
                name: "foo",
                predicates: ['1', '2', '3', '4']
            };
            expect(property_object.isAlignedWithShape(shape)).toBe(false);
        });

        it('should be align with a SimpleShape with multiple right predicates', () => {
            const predicate = 'foo';
            const object: Term = AN_OBJECT;
            const property_object = new SimplePropertyObject(predicate, object);
            const shape: SimpleShape = {
                name: "foo",
                predicates: [predicate, predicate, predicate]
            };
            expect(property_object.isAlignedWithShape(shape)).toBe(true);
        });

        it('should be align with a SimpleShape with the right predicates and wrong predicate starting with the right predicate', () => {
            const predicate = 'foo';
            const object: Term = AN_OBJECT;
            const property_object = new SimplePropertyObject(predicate, object);
            const shape: SimpleShape = {
                name: "foo",
                predicates: [predicate, '1', '2']
            };
            expect(property_object.isAlignedWithShape(shape)).toBe(true);
        });

        it('should be align with a SimpleShape with the right predicates and wrong predicate starting with the wrong predicate', () => {
            const predicate = 'foo';
            const object: Term = AN_OBJECT;
            const property_object = new SimplePropertyObject(predicate, object);
            const shape: SimpleShape = {
                name: "foo",
                predicates: ['1', predicate, '2']
            };
            expect(property_object.isAlignedWithShape(shape)).toBe(true);
        });
    });
});