import { Algebra, translate, Util } from 'sparqlalgebrajs';

const query = `
SELECT * WHERE { 
    ?x ?o ?z .
    ?x <http://exemple.ca> ?z .
    ?z <http://exemple.be> "abc" .
    ?w <http://exemple.be> <http://objet.fr> .
    <http://sujet.cm> <http://predicat.cm> "def" .
    ?a <http://exemple.be>/<http://exemple.qc.ca> <http://objet.fr> .
    <http://sujet.cm> ?m "def" .
}
`
console.log(JSON.stringify(translate(query)))