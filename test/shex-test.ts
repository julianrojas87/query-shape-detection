import { describe } from 'node:test';
import { getAllShapes, createSimpleShapes } from '../lib/shex';
import * as ShEx from 'shexj';
import { SimpleShape } from '../lib/types';

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
      for (const [key, shape] of map_shape.entries()) {
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
      for (const [key, shape] of map_shape.entries()) {
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

  describe('createSimpleShapes', () => {
    const shape_iri = "bar";

    it('should return no shape given an empty map of shape declaration', () => {
      const shapes_declarations = new Map();
      expect(createSimpleShapes(shapes_declarations).size).toBe(0);
    });

    it('should return a valid simple shape given shape declaration', () => {
      const predicates = ['foo', 'bar', 'boo'];
      const id = "id";
      const shape_declaration = createDummySimpleShapeDecl("id", predicates);
      const shape_declaration_map = new Map([[id, shape_declaration]]);
      const resp = createSimpleShapes(shape_declaration_map);

      expect(resp.size).toBe(1);
      const shape = resp.get(id) as SimpleShape;
      expect(shape).toBeDefined();
      expect(shape.name).toBe(id);
      expect(new Set(shape.predicates)).toStrictEqual(new Set(predicates))
    });

    it('should return a valid simple shape given shape declaration with no predicate', () => {
      const id = "id";
      const shape_declaration = createDummySimpleShapeDecl("id", []);
      const shape_declaration_map = new Map([[id, shape_declaration]]);
      const resp = createSimpleShapes(shape_declaration_map);

      expect(resp.size).toBe(1);
      const shape = resp.get(id) as SimpleShape;
      expect(shape).toBeDefined();
      expect(shape.name).toBe(id);
      expect(shape.predicates.length).toBe(0);
    });

    it('should return a valid simple shape given multiple shape declaration', () => {
      const predicates_matrix = [['foo', 'bar', 'boo'], [], ['too'], ["foo", "barr"], ["a"]];
      const shape_declaration_map = new Map();
      let i = 0;
      for (const predicates of predicates_matrix) {
        const shape_declaration = createDummySimpleShapeDecl(String(i), predicates);
        shape_declaration_map.set(i, shape_declaration);
        i++;
      }
      const resp = createSimpleShapes(shape_declaration_map);

      expect(resp.size).toBe(predicates_matrix.length);
      i = 0;
      for (const [id, shape] of resp.entries()) {
        expect(shape).toBeDefined();
        expect(shape.name).toBe(id);
        expect(new Set(shape.predicates)).toStrictEqual(new Set(predicates_matrix[i]));
        i++;
      }
    });

  });
});

// in the aligment use case each of and on of means the same thing
function createDummySimpleShapeDecl(id: string, predicates: string[]): ShEx.ShapeDecl {
  const each_of: ShEx.EachOf = {
    type: "EachOf",
    expressions: [],
  };

  for (const predicate of predicates) {
    const expression = createSimpleTripleConstraint(predicate);
    each_of.expressions.push(expression);
  }

  const shape_expr: ShEx.Shape = {
    type: "Shape",
    closed: true,
    expression: each_of
  };
  return {
    type: "ShapeDecl",
    id,
    shapeExpr: shape_expr
  }
}

function createSimpleTripleConstraint(predicate: string): ShEx.TripleConstraint {
  return {
    type: "TripleConstraint",
    predicate: predicate
  };
}