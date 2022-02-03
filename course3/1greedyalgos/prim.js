// load csv into array
const fs = require('fs');
const papa = require('papaparse');
const { delimiter } = require('path');
// for timing functions
const { performance } = require('perf_hooks');

// helper function for the algorithms course
const af = require('../../algofuncs/algofuncs.js');

// // // LOAD GRAPH // // //
// use synchronous fileRead version

function readParseGraph(filepath, dataendrow = 1000, endlinechar = '\r\n', delimiter=" ") {
    // read a filepath, parse the csv, and make a graph class with graph
    
    // read file and time performance
    let t1 = performance.now();
    let datastr = fs.readFileSync(filepath, 'utf8');
    let t2 = performance.now();
    console.log(`fs.readFileSync took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
    // console.log(datastr);

    // parse data string to array and time
    let datastrarr = datastr.split(endlinechar);
    // console.log(datastrarr);
    let header = datastrarr[0].split(" ");
    let nnodes = parseInt(header[0]);
    let nedges = parseInt(header[1]);
    // console.log(datastrarr[0]);
    console.log({nnodes,nedges});

    // parse data string to array and time
    t1 = performance.now();
    let dataarray = [];
    for (let row of datastrarr.slice(1)) {
        let rowsplit = row.split(' ');
        let rtemp = []
        for (let r of rowsplit) { rtemp.push(parseInt(r)) }
        dataarray.push(rtemp);
    }
    // t1 = performance.now();
    // let config = {   delimiter: delimiter
    //                 ,newline: endlinechar // \r\n for windows created file
    //                 ,dynamicTyping: true
    //                 ,fastMode: true
    //             }
    // let data = papa.parse(datastr, config);
    t2 = performance.now();
    // console.log(data);
    console.log(`csv parser took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

    for (let row of dataarray) {
        af.removeEmpty(row, emptytype='');
    }

    // console.log(dataarray.slice(0,11));

    // make graph and graph reversed
    t1 = performance.now();
    let g = new af.Graph('undirected');

    g.makeGraph( Object.values(dataarray.slice(0,dataendrow))
                , 'edge-len-undir'
                );
    

    t2 = performance.now();
    console.log(`makeGraph took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

    return g;

}                



// let runtype = 'test-single';
let runtype = 'full-graph';
// let runtype = 'test-all';



if (runtype === 'test-single') {

    // let fp = 'D:/Dropbox/algorithms-course/course3/1greedyalgos/graphDATA-test01.csv';
    let fp = 'D:/Dropbox/algorithms-course/course3/1greedyalgos/graphDATA-test02.csv';
    
    g = readParseGraph(fp, 1e6, '\r\n');

} else if (runtype === 'full-graph') {
    // let fp = 'D:/algorithms-course/course2/1strongConGraph/scc-1-cut.csv';
    let fp = 'D:/Dropbox/algorithms-course/course3/1greedyalgos/graphDATA.csv';
    g = readParseGraph(fp, 5.2e6, '\n');

}

// console.log(`number of nodes = ${g.graph.size}`);

// starting node for testing
let nodetest = 1;
let graphsearchOptions = {   'debugmsg' : false
                            ,'debugiter': 1e8 
                          };

// console.log(g.graph);
// console.log(g.graph.get(nodetest));
// console.log(g.graph.get(4));

function prim(graph, node0, debugmsg) {
    // compute a minimum spanning tree using Prim's algorithm

    // init
    let mstcost = 0;
    graph.get(node0).explored = true;
    let outedges_pq = new af.HeapPriority('cost', 'min');
    for (let [e,l] of graph.get(node0).edgelen) {
        // console.log({e,l});
        outedges_pq.add(new af.Edge(node0, e, l));
    }
    // console.log(outedges_pq);
    while (outedges_pq.size > 0) {
        let outedge = outedges_pq.extract();
        if (debugmsg) {
            console.log({outedge, mstcost});
            console.log({'outedge explored':graph.get(outedge.end).explored})
        }
        if (graph.get(outedge.end).explored) {
            continue;
        } else {
            mstcost = mstcost + outedge.cost;
            graph.get(outedge.end).explored = true;
            for (let [e,l] of graph.get(outedge.end).edgelen) {
                outedges_pq.add(new af.Edge(outedge.end, e, l));
            }
        }
    }

    return mstcost;
    
}

let mstcostprim = prim(g.graph, nodetest, false);
console.log(`MST cost = ${mstcostprim}`);



// let node1 = new af.Node(4);
// let node2 = new af.Node(3);
// node2['dscore'] = 9;
// let node3 = new af.Node(22);
// node3['dscore'] = 1;
// let node4 = new af.Node(33);
// node4['dscore'] = 1;
// let heaptest = new af.HeapPriority('dscore', 'min');
// heaptest.heapify([node1, node2, node3, node4]);
// console.log(heaptest.extract(graphsearchOptions));
// // console.log(heaptest.array[1]);
// console.log(heaptest.extract(graphsearchOptions));
// console.log(heaptest.extract(graphsearchOptions));
// console.log(heaptest.extract(graphsearchOptions));
// console.log(heaptest.size);
// console.log(heaptest.array);
// console.log(heaptest.extract(graphsearchOptions));
// console.log(heaptest.extract(graphsearchOptions));