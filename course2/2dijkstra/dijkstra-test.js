// load csv into array
const { reverse } = require('dns');
const fs = require('fs');
// const cheerio = require('cheerio');
// const jcsv = require('jquery-csv');
const papa = require('papaparse');
// for timing functions
const { performance } = require('perf_hooks');

// helper function for the algorithms course
const af = require('../../algofuncs/algofuncs.js');

// // // compute max call stack // // //

// let maxcallstack = af.computeMaxCallStackSize();
// console.log(maxcallstack);



// // // LOAD GRAPH // // //
// use synchronous fileRead version

let filepathlist = [ 'D:/algorithms-course/course2/1strongConGraph/scc-testcase-01.csv'
                    , 'D:/algorithms-course/course2/1strongConGraph/scc-testcase-02.csv'
                    , 'D:/algorithms-course/course2/1strongConGraph/scc-testcase-03.csv'
                    , 'D:/algorithms-course/course2/1strongConGraph/scc-testcase-04.csv'
                    , 'D:/algorithms-course/course2/1strongConGraph/scc-testcase-05.csv'
                    , 'D:/algorithms-course/course2/1strongConGraph/scc-testcase-06.csv'
                ];

function readParseGraph(filepath, dataendrow = 1000, endlinechar = '\r\n', delim='\t') {
    // read a filepath, parse the csv, and make a graph class with graph
    
    // read file and time performance
    let t1 = performance.now();
    let datastr = fs.readFileSync(filepath, 'utf8');
    let t2 = performance.now();
    console.log(`fs.readFileSync took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
    // console.log(datastr);

    // parse data string to array and time
    t1 = performance.now();
    let config = {   delimiter: delim
                    ,newline: endlinechar // \r\n for windows created file
                    ,dynamicTyping: true
                    ,fastMode: true
                }
    let data = papa.parse(datastr, config);
    t2 = performance.now();
    console.log(`csv parser took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
    
    for (let row of data.data) {
        af.removeEmpty(row, emptytype=null);
    }

    // console.log(data);

    // make graph and graph reversed
    t1 = performance.now();
    let g = new af.Graph('directed');

    g.makeGraph( Object.values(data.data.slice(0,dataendrow))
                , 'edge-length'
                , {'reverseGraph':false}
                );

    t2 = performance.now();
    console.log(`makeGraph took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

    return g;

}                



// let runtype = 'test-single';
let runtype = 'full-graph';
// let runtype = 'test-all';



if (runtype === 'test-single') {

    // let fp = 'D:/algorithms-course/course2/2dijkstra/dijkstraData-01.csv';
    // let fp = 'D:/algorithms-course/course2/2dijkstra/dijkstraData-02.csv';
    let fp = 'D:/algorithms-course/course2/2dijkstra/dijkstraData-03.csv';
    
    g = readParseGraph(fp, 1e3, '\r\n');
    var node_start = 1;
    // var node_target = [2,4];
    var node_target = [2,3,4,5,6,7,8];


} else if (runtype === 'full-graph') {
    let fp = 'D:/algorithms-course/course2/2dijkstra/dijkstraData.csv';
    g = readParseGraph(fp, 240, '\r\n');

    var node_start = 1;
    var node_target = [7,37,59,82,99,115,133,165,188,197];

}

console.log(`number of nodes = ${g.graph.size}`);

// starting node for testing
let nstart = 1;
let ntarget = 7;
let graphsearchOptions = {   'debugmsg' : false
                            ,'debugiter': 1e8 
                            };

// console.log(g.graph.get(nstart));

// console.log(g.graph.get(nstart).dscore)
;

// for (let [edge,len] of g.graph.get(nstart).edgelen) {
//     console.log(edge,len);
// }
// console.log(g.graph.get(nstart));

// console.log(g.graph.get(4));

let exploredlist = g.dijkstra(g.graph, nstart, ntarget, graphsearchOptions);
// console.log(exploredlist);

console.log(`start: ${nstart}, target: ${ntarget}, num edges: ${exploredlist.length} d-score: ${g.graph.get(ntarget).dscore}`);


if (true){

    let npathlist = [];
    let npathdist = [];
    for (let t of node_target) {
        g.resetExplored(g.graph);
        let npatht = g.dijkstra(g.graph, node_start, t, graphsearchOptions);
        // npathlist.push(npatht);
        npathdist.push(g.graph.get(t).dscore);
        
        console.log({'start':node_start,'target':t, 'nedges':npatht.length, 'dscore':g.graph.get(t).dscore});
        // console.log(npatht);
    }
    
    // console.log(npathlist);
    console.log(`d-score: ${npathdist}`);
    // console.log(g.graph);
};