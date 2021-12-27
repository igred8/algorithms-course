// implements the Karger Minimum Cut algorithm

// load csv into array
const fs = require('fs');
const { globalAgent } = require('http');
// const cheerio = require('cheerio');
const jcsv = require('jquery-csv');
// for timing functions
const { performance } = require('perf_hooks');


function removeEmpty(array) {
    // remove empty elements
    let posnull = array.indexOf('');
    
    while ( posnull >= 0 ) {
        array.splice(posnull,1);
        posnull = array.indexOf('');
        // console.log(posnull);
        
    }
    return array;
}

function makeGraph(data) {

    let graph = {};
    
    for (let row of data) {
        row = row.split('\t');
        // console.log(row);
        let vertex = parseInt(row[0]);
        let edges = row.slice(1);
        edges = removeEmpty(edges);
        for (let [i,e] of edges.entries()) {
    
            edges[i] = parseInt(e);
    
        }
        // console.log(`vertex = ${vertex}`);
        // console.log(`edges = ${edges}`);
        // console.log(edges);
        graph[vertex] = edges;
    }

    return graph;
}

function replaceElementAll(array, elem, elemnew) {
    // remove elements
    let posnull = array.indexOf(elem);
    
    while ( posnull  > -1 ) {
        if (elemnew === 'delete'){
            // remove elem
            array.splice(posnull,1);
        } else {
            // replace elem with elemnew
            array.splice(posnull, 1, elemnew);

        }
        posnull = array.indexOf(elem);        
    }
    return array;
}

function chooseEdge(graph) {

    // number of nodes
    let numnodes = Object.keys(graph).length;
    // console.log(`choseEdge -> number of nodes = ${numnodes}`);
    // pick a random node
    let random_index = Math.trunc(Math.random()*numnodes);
    // convert to int
    let node1 = parseInt(Object.keys(graph)[random_index]);
    // console.log(`random index = ${random_index}`);
    // console.log(`typeof(node1) = ${typeof(node1)}`);
    
    // pick a random adjacent node
    let numnodesadj = graph[node1].length;
    let random_index_adj = Math.trunc(Math.random()*numnodesadj);
    let node2 = graph[node1][random_index_adj];
    // console.log(`random index adj = ${random_index_adj}`);
    // console.log(`typeof(node2) = ${typeof(node2)}`);

    return [node1, node2];
}


function nodeContract(graph, node1, node2) {
    // graph is an adjacency list 
    
    // node1 and node2 are assumed to be adjacent
    // console.log(`node1 = ${node1}`);
    // console.log(`node2 = ${node2}`);
    // i.e. node1adj.includes(node1) and node2adj.includes(node2)
    let node1adj = graph[node1];
    let node2adj = graph[node2];
    // console.log(node1adj);
    // console.log(node2adj);

    // remove nodes
    replaceElementAll(node1adj, node2, 'delete');
    replaceElementAll(node2adj, node1, 'delete');

    // console.log(node1adj);
    // console.log(node2adj);

    // merge and replace node2 with node1 in rest of graph
    let n2itemp = -1;
    for (let n of node2adj) {
        // merge (allow duplicates to keep track edge counts)
        node1adj.push(n);

        // replace node2 with node1 in the rest of graph
        replaceElementAll(graph[n], node2, node1);
         
    }
    
    // remove node2 from graph
    delete graph[node2];
    return graph;
}


function kargerCut(graph) {
    
    // returns the number of edges in a graph cut following Karger's algorithm
    
    // number of graph nodes
    let numnodes = Object.keys(graph).length;
    
    while (numnodes > 2 ) {
        // console.log(graph);
        let [node1, node2] = chooseEdge(graph);
        // console.log(`node1 = ${node1}\nnode2 = ${node2}`);
        nodeContract(graph, node1, node2);
        numnodes = Object.keys(graph).length;
        // console.log(`number of nodes = ${numnodes}`);
        // console.log(graph);
        
    }
    // return the number of adjacent nodes in final graph
    return graph[ Object.keys(graph)[0] ].length; 
    
}





// // // LOAD GRAPH // // //
// use synchronous fileRead version
let datastr = fs.readFileSync('D:/algorithms-course/course1/5MinCut/kargerMinCut.csv', 'utf8');
// let datastr = fs.readFileSync('D:/algorithms-course/course1/5MinCut/graph1.csv', 'utf8');
// console.log(datastr);

// parse data string to array
let data = jcsv.toArray(datastr, { separator:'\n' });
data = removeEmpty(data);
let graph = makeGraph(data);

// // // // // // 
// let [n1, n2] = chooseEdge(graph);
// console.log(`n1 = ${n1}\nn2 = ${n2}`);

// console.log(`n1 adj = `);
// console.log(graph[n1]);
// console.log(`n2 adj = `);
// console.log(graph[n2]); 

// nodeContract(graph, 123, 199);

// console.log(graph);

// while nodes > 2 keep contracting 
    // select an edge
    // contraction of nodes
// log final number of edges
// repeat with new random seed
// kargerCut(graph);
// console.log(graph);

let glen = Object.keys(graph).length;
let kcutlog = [];
for (let i=0; i<glen-1; i++) {
    graph = makeGraph(data);
    // console.log(graph);
    kcutlog.push( kargerCut(graph) );
}

console.log(`all Karger cuts: ${kcutlog}`);
console.log(`min Karger cut: ${Math.min(...kcutlog)}`);

// let testarray = [1,2,2,2,2,4];
// console.log(testarray);
// replaceElementAll(testarray, 2, 3);
// console.log(testarray);
