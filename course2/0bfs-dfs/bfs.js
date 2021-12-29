// load csv into array
const fs = require('fs');
// const cheerio = require('cheerio');
// const jcsv = require('jquery-csv');
const papa = require('papaparse');
// for timing functions
const { performance } = require('perf_hooks');
// helper function for the algorithms course
const af = require('../../algofuncs/algofuncs.js');


// // // LOAD GRAPH // // //
// use synchronous fileRead version
let t1 = performance.now();
// let datastr = fs.readFileSync('D:/algorithms-course/course1/5MinCut/graph1.csv', 'utf8');
// let datastr = fs.readFileSync('D:/algorithms-course/course2/0bfs-dfs/graph-simple.csv', 'utf8');
// let datastr = fs.readFileSync('D:/algorithms-course/course2/1strongConGraph/graph-simple2.csv', 'utf8');
let datastr = fs.readFileSync('D:/algorithms-course/course2/1strongConGraph/scc-1.csv', 'utf8');
let t2 = performance.now();
console.log(`fs.readFileSync took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

// console.log(datastr);

// parse data string to array
t1 = performance.now();
let config = {   delimiter: " "
                ,newline: "\n" // \r\n for windows created file
                ,dynamicTyping: false
                ,fastMode: true
            }
let data = papa.parse(datastr, config);
t2 = performance.now();
// console.log(data);
console.log(`csv parser took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

for (let row of data.data) {
    af.removeEmpty(row, emptytype='');
}

console.log(typeof(data.data));
console.log(Object.values(data.data)[0]);

t1 = performance.now();
let g = new af.Graph('directed');
// console.log(g.graphtype)
// g.makeGraph(data, 'node-nodes', separator='\t');
g.makeGraph(Object.values(data.data), 'edges');
t2 = performance.now();
console.log(`makeGraph took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
console.log(g.graph.size);
// console.log(g.graph.keys());


t1 = performance.now();
g.bfsConnected();
t2 = performance.now();
console.log(`BFS-connected took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

// console.log(g.regions);
let gregionsize = [];
for (let r of g.regions) {
    gregionsize.push(r.size);
}
gregionsize.sort((a, b) => b - a);
console.log(gregionsize.slice(0,20));