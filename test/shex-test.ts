import { describe } from 'node:test';
import { getAllShapes } from '../lib/shex';
import * as ShEx from 'shexj';

describe('shex', () => {
    describe('getAllShapes', () => {
        const shape_iri = "foo";
        it('should return undefined if there is no triples given', () => {
            const input_schema = "";
            const resp = getAllShapes(input_schema, shape_iri);
            expect(resp).toBeUndefined();
        });

        it('should return an error if none ShExC string given are not valid', () => {
            const input_schema = "<a> <b> <c>.I'm so valid!";
            const resp = getAllShapes(input_schema, shape_iri);
            expect(resp).toBeInstanceOf(Error);
        });

        it('should return the shapes given a ShExC string', () => {
            const input_schema = `PREFIX school: <http://school.example/#>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            PREFIX ex: <http://ex.example/#>
            PREFIX my: <http://my.example/#>
            PREFIX foaf: <http://foaf.example/#>
            
            my:IssueShape {
              ex:state [ex:unassigned ex:assigned];
              ex:reportedBy @my:UserShape
            }
            
            my:UserShape {
              foaf:name xsd:string;
              foaf:mbox IRI+
            }`;
            const schemaIds = new Set(["http://my.example/#IssueShape", "http://my.example/#UserShape"]);
            const resp = getAllShapes(input_schema, shape_iri);
            expect(resp).toBeDefined();
            expect(resp).not.toBeInstanceOf(Error);
            const map_shape: Map<string, ShEx.ShapeDecl> = resp as Map<string, ShEx.ShapeDecl>;
            expect(map_shape.size).toBe(2);
            for (const [key ,shape] of map_shape.entries()) {
                console.log(key);
                console.log(schemaIds);
                expect(schemaIds.has(key)).toBe(true);
                expect(shape).toBeInstanceOf(Object);
                expect(shape).not.toBeNull()
            }
        });

        it('should return the shapes given a ShExJ object', () => {
            const input_schema = `{
                "type" : "Schema",
                "@context" : "http://www.w3.org/ns/shex.jsonld",
                "shapes" : [
                  {
                    "type" : "Shape",
                    "id" : "http://my.example/#IssueShape",
                    "expression" : {
                      "type" : "EachOf",
                      "expressions" : [
                        {
                          "type" : "TripleConstraint",
                          "predicate" : "http://ex.example/#state",
                          "valueExpr" : {
                            "type" : "NodeConstraint",
                            "values" : [
                              "http://ex.example/#unassigned",
                              "http://ex.example/#assigned"
                            ]
                          }
                        },
                        {
                          "type" : "TripleConstraint",
                          "predicate" : "http://ex.example/#reportedBy",
                          "valueExpr" : "http://my.example/#UserShape"
                        }
                      ]
                    }
                  },
                  {
                    "type" : "Shape",
                    "id" : "http://my.example/#UserShape",
                    "expression" : {
                      "type" : "EachOf",
                      "expressions" : [
                        {
                          "type" : "TripleConstraint",
                          "predicate" : "http://foaf.example/#name",
                          "valueExpr" : {
                            "type" : "NodeConstraint",
                            "datatype" : "http://www.w3.org/2001/XMLSchema#string"
                          }
                        },
                        {
                          "predicate" : "http://foaf.example/#mbox",
                          "valueExpr" : {
                            "type" : "NodeConstraint",
                            "nodeKind" : "iri"
                          },
                          "min" : 1,
                          "max" : -1,
                          "type" : "TripleConstraint"
                        }
                      ]
                    }
                  }
                ]
              }`;
            const schemaIds = new Set(["http://my.example/#IssueShape", "http://my.example/#UserShape"]);
            const resp = getAllShapes(JSON.parse(input_schema), shape_iri);
            expect(resp).toBeDefined();
            expect(resp).not.toBeInstanceOf(Error);
            const map_shape: Map<string, ShEx.ShapeDecl> = resp as Map<string, ShEx.ShapeDecl>;
            expect(map_shape.size).toBe(2);
            for (const [key ,shape] of map_shape.entries()) {
                console.log(key);
                console.log(schemaIds);
                expect(schemaIds.has(key)).toBe(true);
                expect(shape).toBeInstanceOf(Object);
                expect(shape).not.toBeNull()
            }
        });

        // it might be not sound to test given that it has a typing
        it('should return undefined given a an object that is not ShExJ', () => {
            const input_schema = `{
                "type" : "ShExJ"
              }`;
            const schemaIds = new Set(["http://my.example/#IssueShape", "http://my.example/#UserShape"]);
            const resp = getAllShapes(JSON.parse(input_schema), shape_iri);
            expect(resp).toBeUndefined();
        });
    });
});