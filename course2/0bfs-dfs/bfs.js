// load csv into array
const fs = require('fs');
// const cheerio = require('cheerio');
const jcsv = require('jquery-csv');
// for timing functions
const { performance } = require('perf_hooks');
// helper function for the algorithms course
const af = require('../../algofuncs/algofuncs.js');
// csv
const ncsv = require('csv');




// BFS

function bfs(graph, v0) {
    // graph - adjacency list
    // v0 starting node



}

// UCC
function ucc(graph) {
    
}


// // // LOAD GRAPH // // //
// use synchronous fileRead version
let t1 = performance.now();
// let datastr = fs.readFileSync('D:/algorithms-course/course1/5MinCut/graph1.csv', 'utf8');
let datastr = fs.readFileSync('D:/algorithms-course/course2/0bfs-dfs/graph-simple.csv', 'utf8');
// let datastr = fs.readFileSync('D:/algorithms-course/course2/1strongConGraph/scc-1.csv', 'utf8');
let t2 = performance.now();
console.log(`fs.readFileSync took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

// console.log(datastr);

// parse data string to array
t1 = performance.now();
let data = jcsv.toArray(datastr, { separator: '\n' });
t2 = performance.now();
data = af.removeEmpty(data);
console.log(`csv parser took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

// console.log(data[0]);
// let graph = af.makeGraph(data, 'edges');

// console.log(Object.keys(graph));

// console.log(graph.get('1'));
// console.log(graph[1]);


t1 = performance.now();
let g1 = new af.Graph('undirected');
// console.log(g1.graphtype)
// g1.makeGraph(data, 'node-nodes', separator='\t');
g1.makeGraph(data, 'edges', separator=' ');
t2 = performance.now();
console.log(`makeGraph took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

// console.log(g1.nodes.get('1'));
for (let node of g1.nodes) {
    console.log(node);
}
