import { describe } from 'node:test';
import { createSimplePropertyObjectFromQuery } from '../lib/query';


describe('query', () => {

    describe('createSimplePropertyObjectFromQuery', () => {
        it('should return the property with an IRI given a query with one triple', () => {
            const query = "SELECT * WHERE { ?x <http://exemple.ca> ?z }";
            const resp = createSimplePropertyObjectFromQuery(query);
            expect(resp.length).toBe(1);
            expect(resp[0].property_iri).toBe("http://exemple.ca");
            expect(resp[0].object.termType).toBe("Variable");
            expect(resp[0].object.value).toBe("z");
        });

        it('should return no property given a query with one triple', () => {
            const query = "SELECT * WHERE { ?x ?o ?z }";
            const resp = createSimplePropertyObjectFromQuery(query);
            expect(resp.length).toBe(0);
        });

        it('should the properties with a query with multiple triples', () => {
            const query = `SELECT * WHERE { 
                ?x ?o ?z .
                ?x <http://exemple.ca> ?z .
                ?z <http://exemple.be> "abc" .
                ?w <http://exemple.be> <http://objet.fr> .
                <http://sujet.cm> <http://predicat.cm> "def" .
                <http://sujet.cm> ?m "def" .
            }`;
            const resp = createSimplePropertyObjectFromQuery(query);
            expect(resp.length).toBe(4);

            expect(resp[0].property_iri).toBe("http://exemple.ca");
            expect(resp[0].object.termType).toBe("Variable");
            expect(resp[0].object.value).toBe("z");

            expect(resp[1].property_iri).toBe("http://exemple.be");
            expect(resp[1].object.termType).toBe("Literal");
            expect(resp[1].object.value).toBe("abc");

            expect(resp[2].property_iri).toBe("http://exemple.be");
            expect(resp[2].object.termType).toBe("NamedNode");
            expect(resp[2].object.value).toBe("http://objet.fr");

            expect(resp[3].property_iri).toBe("http://predicat.cm");
            expect(resp[3].object.termType).toBe("Literal");
            expect(resp[3].object.value).toBe("def");
        });

        it('should return an error given a malformed query', () => {
            const query = 'what a valid query';
            expect(() => { createSimplePropertyObjectFromQuery(query); }).toThrow()
        });
    });
});