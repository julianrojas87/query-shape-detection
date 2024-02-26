import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';

const DF = new DataFactory<RDF.BaseQuad>();

export const SHEX_PREDICATE = DF.namedNode('http://www.w3.org/ns/shex#predicate');
export const SHEX_SHAPE_EXPRESSION = DF.namedNode('http://www.w3.org/ns/shex#shapeExpr');
export const SHEX_EXPRESSION = DF.namedNode('http://www.w3.org/ns/shex#expression');
export const SHEX_SHAPE = DF.namedNode('http://www.w3.org/ns/shex#Shape');
export const TYPE_DEFINITION = DF.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');