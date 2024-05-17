import type { BaseQuad } from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { translate } from 'sparqlalgebrajs';
import { TYPE_DEFINITION } from '../lib/constant';
import { generateQuery } from '../lib/query';
import { IStarPatternWithDependencies, Triple } from '../lib/Triple';

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
      const x = resp.starPatterns.get('x')!.starPattern;
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

      const xStarPattern: [string, IStarPatternWithDependencies] = ['x',
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
                dependencies: undefined
              }
            ]
          ]),
          name: "x"
        }
      ];
      const yStarPattern: [string, IStarPatternWithDependencies] = ['y',
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
                  dependencies: xStarPattern[1]
                }
              ]
            ]
          ),
          name: "y"
        }
      ];
      const expectedStarPattern = new Map<string, IStarPatternWithDependencies>([
        xStarPattern,
        yStarPattern,
      ]);

      const resp = generateQuery(translate(query));

      expect(resp.starPatterns.size).toBe(expectedStarPattern.size);
      expect(resp.filterExpression).toBe('');
      for (const [subject, starPatterns] of resp.starPatterns) {
        expect(starPatterns).toStrictEqual(expectedStarPattern.get(subject));
      }

    });

    it('should return the triple given a query with nested dependence', () => {
      const query = `SELECT * WHERE { 
        ?x <http://exemple.be> ?y .
        ?x <http://exemple.ca> ?w .
        ?y <http://exemple.be> ?z .
        ?z <http://exemple.be> ?w .
      }`;

      const zStarPattern: [string, IStarPatternWithDependencies] = ['z',
        {
          starPattern: new Map([
            [
              'http://exemple.be',
              {
                triple: new Triple({
                  subject: 'z',
                  predicate: 'http://exemple.be',
                  object: DF.variable('w')
                }),
                dependencies: undefined
              }
            ]
          ]),
          name: "z"
        }
      ];

      const yStarPattern: [string, IStarPatternWithDependencies] = ['y',
        {
          starPattern: new Map([
            [
              'http://exemple.be',
              {
                triple: new Triple({
                  subject: 'y',
                  predicate: 'http://exemple.be',
                  object: DF.variable('z')
                }),
                dependencies: zStarPattern[1]
              }
            ]
          ]),
          name: "y"
        }
      ];

      const xStarPattern: [string, IStarPatternWithDependencies] = ['x',
        {
          starPattern: new Map([
            [
              'http://exemple.be',
              {
                triple: new Triple({
                  subject: 'x',
                  predicate: 'http://exemple.be',
                  object: DF.variable('y')
                }),
                dependencies: yStarPattern[1]
              }
            ],
            [
              'http://exemple.ca',
              {
                triple: new Triple({
                  subject: 'x',
                  predicate: 'http://exemple.ca',
                  object: DF.variable('w')
                }),
                dependencies: undefined
              }
            ]
          ]),
          name: "x"
        }
      ];

      const expectedStarPattern = new Map<string, IStarPatternWithDependencies>([
        xStarPattern,
        yStarPattern,
        zStarPattern,
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



      const zStarPattern: [string, IStarPatternWithDependencies] = [
        'z',
        {
          starPattern: new Map([
            [
              'http://exemple.be',
              {
                triple: new Triple({ subject: 'z', predicate: 'http://exemple.be', object: DF.literal('abc', RDF_STRING) }),
                dependencies: undefined
              }
            ],
            [
              'http://exemple.qc.ca',
              {
                triple: new Triple({ subject: 'z', predicate: 'http://exemple.qc.ca', object: DF.literal('abc', RDF_STRING) }),
                dependencies: undefined
              }
            ]
          ]),
          name: "z"
        }
      ];

      const xStarPattern: [string, IStarPatternWithDependencies] = [
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
                dependencies: zStarPattern[1]
              }
            ]
          ]),
          name: "x"
        }
      ];

      const wStarPattern: [string, IStarPatternWithDependencies] = [
        'w',
        {
          starPattern: new Map([
            [
              'http://exemple.be',
              {
                triple: new Triple({ subject: 'w', predicate: 'http://exemple.be', object: DF.namedNode('http://objet.fr') }),
                dependencies: undefined
              }
            ]
          ]),
          name: "w"
        }
      ];
      const sujetStarPattern: [string, IStarPatternWithDependencies] = [
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
                dependencies: undefined
              }
            ]
          ]),
          name: "http://sujet.cm"
        }
      ];
      const expectedStarPattern = new Map<string, IStarPatternWithDependencies>([
        xStarPattern,
        zStarPattern,
        wStarPattern,
        sujetStarPattern
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

      const xStarPattern: [string, IStarPatternWithDependencies] = [
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
                dependencies: undefined
              }
            ],
          ]),
          name: "x"
        }
      ];
      const yStarPattern: [string, IStarPatternWithDependencies] = [
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
                dependencies: undefined
              }
            ],
          ]),
          name: "y"
        }
      ];

      const expectedStarPattern = new Map<string, any>([
        xStarPattern,
        yStarPattern
      ]);

      const resp = generateQuery(translate(query));

      expect(resp.starPatterns.size).toBe(expectedStarPattern.size);
      expect(resp.filterExpression).toBe('');
      for (const [subject, starPatterns] of resp.starPatterns) {
        expect(starPatterns).toStrictEqual(expectedStarPattern.get(subject));
      }
    });

    it('interactive-complex-8', () => {
      const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX snvoc: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
      SELECT ?personId ?personFirstName ?personLastName ?commentCreationDate ?commentId ?commentContent WHERE {
        VALUES ?type {
          snvoc:Comment
          snvoc:Post
        }
        <http://localhost:3000/pods/00000002199023256816/profile/card#me> rdf:type snvoc:Person.
        ?message snvoc:hasCreator <http://localhost:3000/pods/00000002199023256816/profile/card#me>;
          rdf:type ?type.
        ?comment rdf:type snvoc:Comment;
          snvoc:replyOf ?message;
          snvoc:creationDate ?commentCreationDate;
          snvoc:id ?commentId;
          snvoc:content ?commentContent;
          snvoc:hasCreator ?person.
        ?person snvoc:id ?personId;
          snvoc:firstName ?personFirstName;
          snvoc:lastName ?personLastName.
      }
      ORDER BY DESC (?commentCreationDate) (?commentId)
      LIMIT 20`;

      const meStarPattern: [string, IStarPatternWithDependencies] = [
        'http://localhost:3000/pods/00000002199023256816/profile/card#me',
        {
          starPattern: new Map([
            [
              RDF_TYPE,
              {
                triple: new Triple({
                  subject: 'http://localhost:3000/pods/00000002199023256816/profile/card#me',
                  predicate: RDF_TYPE,
                  object: DF.namedNode(`${SNVOC_PREFIX}Person`)
                }),
                dependencies: undefined
              }
            ],
          ]),
          name: 'http://localhost:3000/pods/00000002199023256816/profile/card#me'
        }
      ];
      const messageStarPattern: [string, IStarPatternWithDependencies] = [
        'message',
        {
          starPattern: new Map([
            [
              `${SNVOC_PREFIX}hasCreator`,
              {
                triple: new Triple({
                  subject: 'message',
                  predicate: `${SNVOC_PREFIX}hasCreator`,
                  object: DF.namedNode("http://localhost:3000/pods/00000002199023256816/profile/card#me"),
                }),
                dependencies: meStarPattern[1]
              }
            ],
            [
              RDF_TYPE,
              {
                triple: new Triple({
                  subject: 'message',
                  predicate: RDF_TYPE,
                  object: [DF.namedNode(`${SNVOC_PREFIX}Comment`), DF.namedNode(`${SNVOC_PREFIX}Post`)]
                }),
                dependencies: undefined
              }
            ],
          ]),
          name: "message"
        }
      ];
      const personStarPattern: [string, IStarPatternWithDependencies] = [
        'person',
        {
          starPattern: new Map([
            [
              `${SNVOC_PREFIX}id`,
              {
                triple: new Triple({
                  subject: 'person',
                  predicate: `${SNVOC_PREFIX}id`,
                  object: DF.variable("personId"),
                }),
                dependencies: undefined
              }
            ],
            [
              `${SNVOC_PREFIX}firstName`,
              {
                triple: new Triple({
                  subject: 'person',
                  predicate: `${SNVOC_PREFIX}firstName`,
                  object: DF.variable("personFirstName"),
                }),
                dependencies: undefined
              }
            ],
            [
              `${SNVOC_PREFIX}lastName`,
              {
                triple: new Triple({
                  subject: 'person',
                  predicate: `${SNVOC_PREFIX}lastName`,
                  object: DF.variable("personLastName"),
                }),
                dependencies: undefined
              }
            ]
          ]),
          name: "person"
        }
      ];
      const commentStarPattern: [string, IStarPatternWithDependencies] = [
        'comment',
        {
          starPattern: new Map([
            [
              RDF_TYPE,
              {
                triple: new Triple({
                  subject: 'comment',
                  predicate: RDF_TYPE,
                  object: DF.namedNode(`${SNVOC_PREFIX}Comment`),
                }),
                dependencies: undefined
              }
            ],
            [
              `${SNVOC_PREFIX}replyOf`,
              {
                triple: new Triple({
                  subject: 'comment',
                  predicate: `${SNVOC_PREFIX}replyOf`,
                  object: DF.variable("message"),
                }),
                dependencies: messageStarPattern[1]
              }
            ],
            [
              `${SNVOC_PREFIX}creationDate`,
              {
                triple: new Triple({
                  subject: 'comment',
                  predicate: `${SNVOC_PREFIX}creationDate`,
                  object: DF.variable("commentCreationDate"),
                }),
                dependencies: undefined
              }
            ],
            [
              `${SNVOC_PREFIX}id`,
              {
                triple: new Triple({
                  subject: 'comment',
                  predicate: `${SNVOC_PREFIX}id`,
                  object: DF.variable("commentId"),
                }),
                dependencies: undefined
              }
            ],
            [
              `${SNVOC_PREFIX}content`,
              {
                triple: new Triple({
                  subject: 'comment',
                  predicate: `${SNVOC_PREFIX}content`,
                  object: DF.variable("commentContent"),
                }),
                dependencies: undefined
              }
            ],
            [
              `${SNVOC_PREFIX}hasCreator`,
              {
                triple: new Triple({
                  subject: 'comment',
                  predicate: `${SNVOC_PREFIX}hasCreator`,
                  object: DF.variable("person"),
                }),
                dependencies: personStarPattern[1]
              }
            ]
          ]),
          name: "comment"
        }
      ];

      const expectedStarPattern = new Map<string, IStarPatternWithDependencies>([
        meStarPattern,
        messageStarPattern,
        commentStarPattern,
        personStarPattern
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
