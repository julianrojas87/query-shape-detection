import { describe } from 'node:test';
import {getAllShapes} from '../lib/shex';

describe('shex', ()=>{
    describe('getAllShapes', ()=>{
        const shape_iri = "foo"; 
        it('should return undefined if there is no triples given', ()=>{
            const quads = "";
            const resp = getAllShapes(quads,shape_iri);
            expect(resp).toBeUndefined();
        });

        it('should return an error if the triples given are not valid', ()=>{
            const quads = "<a> <b> <c>.I'm so valid!";
            const resp = getAllShapes(quads,shape_iri);
            expect(resp).toBeInstanceOf(Error);
        });

        it('should return error if there is no shape in the triples', ()=>{
            const quads = '<http://sujet.cm> <http://predicat.cm> "def" .';
            const resp = getAllShapes(quads,shape_iri);
            expect(resp).toBeInstanceOf(Error);
        });
    });
});