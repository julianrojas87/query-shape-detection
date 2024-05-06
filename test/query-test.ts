import type { BaseQuad } from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { translate } from 'sparqlalgebrajs';
import { TYPE_DEFINITION } from '../lib/constant';
import { generateQuery } from '../lib/query';
import { Triple } from '../lib/Triple';

const DF = new DataFactory<BaseQuad>();

const RDF_STRING = DF.namedNode('http://www.w3.org/2001/XMLSchema#string');
const SNVOC_PREFIX = 'http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/';
const RDF_TYPE = TYPE_DEFINITION.value;

describe('query', () => {
  describe('generateQuery', () => {
    it('should return the triple given a query with one triple', () => {
      const query = 'SELECT * WHERE { ?x <http://exemple.ca> ?z }';
      const resp = generateQuery(translate(query));
      expect(resp.starPatterns.size).toBe(1);
      const x = resp.starPatterns.get('x')?.starPattern!;
      expect(x).toBeDefined();
      const element = x.get('http://exemple.ca')!;
      element.triple
      expect(element.triple.predicate).toBe('http://exemple.ca');
      expect((element.triple.object as any).termType).toBe('Variable');
      expect((element.triple.object as any).value).toBe('z');
    });

    it('should return the triple given a query with two triples where one triple have a dependence', () => {
      const query = `SELECT * WHERE { 
        ?x <http://exemple.ca> ?z .
        ?y <http://exemple.be> ?x .
      }`;
      const expectedStarPattern = new Map<string, any>([
        ['x',
          {
            starPattern: new Map([
              [
                'http://exemple.ca',
                {
                  triple: new Triple({
                    subject: 'x',
                    predicate: 'http://exemple.ca',
                    object: DF.variable('z')
                  }),
                  dependencies: []
                }
              ]
            ])
          }

        ],
        ['y',
          {
            starPattern: new Map(
              [
                ['http://exemple.be',
                  {
                    triple: new Triple({
                      subject: 'y',
                      predicate: 'http://exemple.be',
                      object: DF.variable('x')
                    }),
                    dependencies: [new Triple({
                      subject: 'x',
                      predicate: 'http://exemple.ca',
                      object: DF.variable('z')
                    })]
                  }
                ]
              ]
            )
          }
        ],
      ]);

      const resp = generateQuery(translate(query));

      expect(resp.starPatterns.size).toBe(expectedStarPattern.size);
      expect(resp.filterExpression).toBe('');
      for (const [subject, starPatterns] of resp.starPatterns) {
        expect(starPatterns).toStrictEqual(expectedStarPattern.get(subject));
      }

    });

    it('should return no triple given a query with a bgp with only variable', () => {
      const query = 'SELECT * WHERE { ?x ?o ?z }';
      const resp = generateQuery(translate(query));
      expect(resp.starPatterns.size).toBe(0);
    });

    it('should returns the triples given a query with multiple triples', () => {
      const query = `SELECT * WHERE { 
                ?x ?o ?z .
                ?x <http://exemple.ca> ?z .
                ?z <http://exemple.be> "abc" .
                ?z <http://exemple.qc.ca> "abc" .
                ?w <http://exemple.be> <http://objet.fr> .
                <http://sujet.cm> <http://predicat.cm> "def" .
                <http://sujet.cm> ?m "def" .
            }`;
      const expectedStarPattern = new Map<string, any>([
        [
          'x',
          {
            starPattern: new Map([
              ['http://exemple.ca',
                {
                  triple: new Triple({
                    subject: 'x',
                    predicate: 'http://exemple.ca',
                    object: DF.variable('z')
                  }),
                  dependencies: [
                    new Triple({
                      subject: 'z',
                      predicate: 'http://exemple.be',
                      object: DF.literal('abc', RDF_STRING)
                    }),
                    new Triple({
                      subject: 'z',
                      predicate: 'http://exemple.qc.ca',
                      object: DF.literal('abc', RDF_STRING)
                    })
                  ]
                }
              ]
            ]),

          }
        ],
        [
          'z',
          {
            starPattern: new Map([
              [
                'http://exemple.be',
                {
                  triple: new Triple({ subject: 'z', predicate: 'http://exemple.be', object: DF.literal('abc', RDF_STRING) }),
                  dependencies: []
                }
              ],
              [
                'http://exemple.qc.ca',
                {
                  triple: new Triple({ subject: 'z', predicate: 'http://exemple.qc.ca', object: DF.literal('abc', RDF_STRING) }),
                  dependencies: []
                }
              ]
            ])
          }
        ],
        [
          'w',
          {
            starPattern: new Map([
              [
                'http://exemple.be',
                {
                  triple: new Triple({ subject: 'w', predicate: 'http://exemple.be', object: DF.namedNode('http://objet.fr') }),
                  dependencies: []
                }
              ]
            ])
          }
        ],
        [
          'http://sujet.cm',
          {
            starPattern: new Map([
              ['http://predicat.cm',
                {
                  triple: new Triple({
                    subject: 'http://sujet.cm',
                    predicate: 'http://predicat.cm',
                    object: DF.literal('def', RDF_STRING),
                  }),
                  dependencies: []
                }
              ]
            ])
          }
        ]
      ]);

      const resp = generateQuery(translate(query));

      expect(resp.starPatterns.size).toBe(expectedStarPattern.size);
      expect(resp.filterExpression).toBe('');
      for (const [subject, starPatterns] of resp.starPatterns) {
        expect(starPatterns).toStrictEqual(expectedStarPattern.get(subject));
      }
    });
    /** 
    it(`should returns the triples 
    given a query with a bgp where a subject group start in a predicate path`, () => {
      const query = `SELECT * WHERE { 
                ?x ?o ?z .
                ?x <http://exemple.ca> ?z .
                ?z <http://exemple.be> "abc" .
                ?w <http://exemple.be> <http://objet.fr> .
                <http://sujet.cm> <http://predicat.cm> "def" .
                ?a <http://exemple.be>|<http://exemple.qc.ca> <http://sujet.cm> .
                <http://sujet.cm> ?m "def" .
            }`;
      const expectedStarPattern = new Map<string, any>([
        [
          'x',
          {
            starPattern: new Map(
              [
                [
                  'http://exemple.ca',
                  {
                    triple: new Triple({
                      subject: 'x',
                      predicate: 'http://exemple.ca',
                      object: DF.variable('z')
                    }),
                    dependencies: [new Triple({
                      subject: 'z',
                      predicate: 'http://exemple.be',
                      object: DF.literal('abc', RDF_STRING)
                    })]
                  }
                ]
              ]
            )
          }
        ],
        [
          'z',
          {
            starPattern: new Map(
              [
                [
                  'http://exemple.be',
                  {
                    triple: new Triple({
                      subject: 'z',
                      predicate: 'http://exemple.be',
                      object: DF.literal('abc', RDF_STRING)
                    }),
                    dependencies: []
                  }
                ]
              ]
            )
          }
        ],
        [
          'w',
          {
            starPattern: new Map(
              [
                [
                  'http://exemple.be',
                  {
                    triple: new Triple({
                      subject: 'w',
                      predicate: 'http://exemple.be',
                      object: DF.namedNode('http://objet.fr')
                    }),
                    dependencies: []
                  }
                ]
              ]
            )
          }
        ],
        [
          'http://sujet.cm',
          {
            starPattern: new Map(
              [
                [
                  'http://exemple.be',
                  {
                    triple: new Triple({
                      subject: 'http://sujet.cm',
                      predicate: 'http://predicat.cm',
                      object: DF.literal('def', RDF_STRING),
                    }),
                    dependencies: []
                  }
                ]
              ]
            )
          }
        ],



        ['a', [
          { subject: 'a', predicate: 'http://exemple.be', object: DF.namedNode('http://objet.fr') },
          { subject: 'a', predicate: 'http://exemple.qc.ca', object: DF.namedNode('http://objet.fr') },
        ]],
        ['http://sujet.cm', [
          {
            subject: 'http://sujet.cm',
            predicate: 'http://predicat.cm',
            object: DF.literal('def', RDF_STRING),
          }],
        ],
      ]);

      const resp = generateQuery(translate(query));

      expect(resp.starPatterns.size).toBe(expectedStarPattern.size);
      expect(resp.filterExpression).toBe('');
      for (const [subject, starPatterns] of resp.starPatterns) {
        expect(starPatterns).toStrictEqual(expectedStarPattern.get(subject));
      }
    });
    */

    it('should return the subject group with a VALUES clause', () => {
      const query = `
      SELECT * WHERE
      {
          VALUES (?type ?person) {(UNDEF <http://exemple.be/Person>) (<http://exemple.be/Post> <http://exemple.be/Persoon>)}

          ?x a ?person .
          ?y <http://exemple.be> ?type .
      }
      `;
      const expectedStarPattern = new Map<string, any>([
        [
          'x',
          {
            starPattern: new Map([
              [
                RDF_TYPE,
                {
                  triple: new Triple({
                    subject: 'x', predicate: RDF_TYPE, object: [
                      DF.namedNode('http://exemple.be/Person'),
                      DF.namedNode('http://exemple.be/Persoon')
                    ]
                  }),
                  dependencies: []
                }
              ],
            ])
          }
        ],
        [
          'y',
          {
            starPattern: new Map([
              [
                'http://exemple.be',
                {
                  triple: new Triple({
                    subject: 'y',
                    predicate: 'http://exemple.be',
                    object: [DF.namedNode('http://exemple.be/Post')]
                  }),
                  dependencies: []
                }
              ],
            ])
          }
        ],
      ]);

      const resp = generateQuery(translate(query));

      expect(resp.starPatterns.size).toBe(expectedStarPattern.size);
      expect(resp.filterExpression).toBe('');
      for (const [subject, starPatterns] of resp.starPatterns) {
        expect(starPatterns).toStrictEqual(expectedStarPattern.get(subject));
      }
    });
    /** 
    it('should returns the subject groups with a complex query 1', () => {
      const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX snvoc: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
      SELECT * WHERE {
        ?s snvoc:id ?messageId;
          snvoc:hasCreator ?messageCreator.
        ?messageCreator snvoc:id ?messageCreatorId.
        ?comment snvoc:replyOf <http://localhost:3000/pods/00000002199023256081/comments/Philippines#274878069404>;
          rdf:type snvoc:Comment.
        ?replyAuthor snvoc:id ?replyAuthorId;
          snvoc:firstName ?replyAuthorFirstName;
        OPTIONAL {
          ?messageCreator ((snvoc:knows/snvoc:hasPerson)|^(snvoc:knows/snvoc:hasPerson)) ?replyAuthor.
          BIND("true"^^xsd:boolean AS ?replyAuthorKnowsOriginalMessageAuthorInner)
        }
        BIND(COALESCE(?replyAuthor, "false"^^xsd:boolean) AS ?replyAuthorKnowsOriginalMessageAuthorInner)
      }`;
      const comment_philippines = 'http://localhost:3000/pods/00000002199023256081/comments/Philippines#274878069404';
      const expectedResp = new Map([
        ['s',
          [
            { subject: 's', predicate: `${SNVOC_PREFIX}id`, object: DF.variable('messageId') },
            { subject: 's', predicate: `${SNVOC_PREFIX}hasCreator`, object: DF.variable('messageCreator') },
          ],
        ],
        [
          'messageCreator',
          [
            { subject: 'messageCreator', predicate: `${SNVOC_PREFIX}id`, object: DF.variable('messageCreatorId') },
          ],
        ],
        [
          'comment',
          [
            { subject: 'comment', predicate: `${SNVOC_PREFIX}replyOf`, object: DF.namedNode(comment_philippines) },
            { subject: 'comment', predicate: `${RDF_TYPE}`, object: DF.namedNode(`${SNVOC_PREFIX}Comment`) },
          ],
        ],
        [
          'replyAuthor',
          [
            { subject: 'replyAuthor', predicate: `${SNVOC_PREFIX}id`, object: DF.variable('replyAuthorId') },
            { subject: 'replyAuthor', predicate: `${SNVOC_PREFIX}firstName`, object: DF.variable('replyAuthorFirstName') },
          ],
        ],
        [
          'messageCreator',
          [
            { subject: 'messageCreator', predicate: `${SNVOC_PREFIX}id`, object: DF.variable('messageCreatorId') },
            { subject: 'messageCreator', predicate: `${SNVOC_PREFIX}knows`, object: DF.variable('replyAuthor') },
            { subject: 'messageCreator', predicate: `${SNVOC_PREFIX}hasPerson`, object: DF.variable('replyAuthor') },
            { subject: 'messageCreator', predicate: `${SNVOC_PREFIX}knows`, object: DF.variable('replyAuthor') },
            { subject: 'messageCreator', predicate: `${SNVOC_PREFIX}hasPerson`, object: DF.variable('replyAuthor') },
          ],
        ],
      ]);

      const resp = generateQuery(translate(query));

      expect(resp.size).toBe(expectedResp.size);
      for (const [subject, triples] of resp) {
        for (const [i, triple] of triples.entries()) {
          expect(triple.toObject()).toStrictEqual(expectedResp.get(subject)![i]);
        }
      }
    });

    it('should returns the subject groups with a complex query 2', () => {
      const query = `# Recent messages of a person
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX sn: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/data/>
      PREFIX snvoc: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
      PREFIX sntag: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/tag/>
      PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX dbpedia: <http://localhost:3000/dbpedia.org/resource/>
      PREFIX dbpedia-owl: <http://localhost:3000/dbpedia.org/ontology/>
      
      SELECT *
      WHERE {
          ?person a snvoc:Person .
          ?person snvoc:id ?personId .
          ?message snvoc:id ?messageId .
          OPTIONAL {
              ?message snvoc:replyOf* ?originalPostInner .
              ?message !(snvoc:shouldNotExist) ?originalPostInner .
              ?originalPostInner a snvoc:Post .
          } .
          BIND( COALESCE(?originalPostInner, ?message) AS ?originalPost ) .
          ?creator snvoc:id ?originalPostAuthorId .
      }
      LIMIT 10
      `;
      const expectedResp = new Map([
        [
          'person',
          [
            { subject: 'person', predicate: `${RDF_TYPE}`, object: DF.namedNode(`${SNVOC_PREFIX}Person`) },
            { subject: 'person', predicate: `${SNVOC_PREFIX}id`, object: DF.variable('personId') },
          ],
        ],
        [
          'message',
          [
            { subject: 'message', predicate: `${SNVOC_PREFIX}id`, object: DF.variable('messageId') },
            { subject: 'message', predicate: `${SNVOC_PREFIX}replyOf`, object: DF.variable('originalPostInner') },
          ],
        ],
        [
          'originalPostInner',
          [
            { subject: 'originalPostInner', predicate: `${RDF_TYPE}`, object: DF.namedNode(`${SNVOC_PREFIX}Post`) },
          ],
        ],
        [
          'creator',
          [
            { subject: 'creator', predicate: `${SNVOC_PREFIX}id`, object: DF.variable('originalPostAuthorId') },
          ],
        ],
      ]);

      const resp = generateQuery(translate(query));

      expect(resp.size).toBe(expectedResp.size);
      for (const [subject, triples] of resp) {
        for (const [i, triple] of triples.entries()) {
          expect(triple.toObject()).toStrictEqual(expectedResp.get(subject)![i]);
        }
      }
    });
    */
  });
});
