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

function readParseGraph(filepath, dataendrow = 1000, endlinechar = '\r\n') {
    // read a filepath, parse the csv, and make a graph class with graph
    
    // read file and time performance
    let t1 = performance.now();
    let datastr = fs.readFileSync(filepath, 'utf8');
    let t2 = performance.now();
    console.log(`fs.readFileSync took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
    // console.log(datastr);

    // parse data string to array and time
    t1 = performance.now();
    let config = {   delimiter: " "
                    ,newline: endlinechar // \r\n for windows created file
                    ,dynamicTyping: true
                    ,fastMode: true
                }
    let data = papa.parse(datastr, config);
    t2 = performance.now();
    // console.log(data);
    console.log(`csv parser took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

    for (let row of data.data) {
        af.removeEmpty(row, emptytype='');
    }

    // make graph and graph reversed
    t1 = performance.now();
    let g = new af.Graph('directed');

    g.makeGraph( Object.values(data.data.slice(0,dataendrow))
                , 'edges'
                , {'reverseGraph':false}
                );
    g.makeGraph( Object.values(data.data.slice(0,dataendrow))
                , 'edges'
                , {'reverseGraph':true}
                );

    t2 = performance.now();
    console.log(`makeGraph+Reverse took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

    return g;

}                



// let runtype = 'test-single';
// let runtype = 'full-graph';
let runtype = 'test-all';



if (runtype === 'test-single') {

    // let fp = 'D:/algorithms-course/course2/1strongConGraph/graph-simple-tree-directed.csv';
    // let fp = 'D:/algorithms-course/course2/1strongConGraph/scc-testcase-01.csv';
    let fp = 'D:/algorithms-course/course2/1strongConGraph/scc-testcase-02.csv';
    // let fp = 'D:/algorithms-course/course2/1strongConGraph/scc-testcase-03.csv';
    // let fp = 'D:/algorithms-course/course2/1strongConGraph/scc-testcase-04.csv';
    // let fp = 'D:/algorithms-course/course2/1strongConGraph/scc-testcase-05.csv';
    // let fp = 'D:/algorithms-course/course2/1strongConGraph/scc-testcase-06.csv';
    // let fp = 'D:/algorithms-course/course2/1strongConGraph/scc-simple.csv';
    
    g = readParseGraph(fp, 1e6, '\r\n');

} else if (runtype === 'full-graph') {
    // let fp = 'D:/algorithms-course/course2/1strongConGraph/scc-1-cut.csv';
    let fp = 'D:/algorithms-course/course2/1strongConGraph/scc-1.csv';
    g = readParseGraph(fp, 5.2e6, '\n');

}

// console.log(`number of nodes = ${g.graph.size}`);

// starting node for testing
let nodetest = 1;
let graphsearchOptions = {   'debugmsg' : false
                            ,'debugiter': 1e8 
                          };

// console.log(g.graph.get(nodetest));
// console.log(g.graph.get(4));



async function auxtopo(g) {
    console.log('///// topo sort /////');

    await af.timeFunc( async () => { await g.topoSort(g.graphReverse, graphsearchOptions) } );

    
    for (let n of g.toposortlist) {
        let node = g.graph.get(n);
        let noder = g.graphReverse.get(n);
        console.log([node.name, node.finishtime, noder.name, noder.finishtime]);
        
    }
    console.log(g.toposortlist)
}

// auxtopo(g);

async function auxkosaraju(g,i) {
    console.log('///// kosaraju SCC /////');

    await af.timeFunc( async () => { await g.kosarajuSCC( graphsearchOptions) } );

    // for (let n of g.toposortlist) {
    //     let node = g.graph.get(n);
    //     let noder = g.graphReverse.get(n);
    //     console.log([node.name, noder.finishtime, node.scclabel, node.explored]);
    // }
    // for (let n of g.graph.keys()) {
    //     let node = g.graph.get(n);
        
    //     console.log([node.name, node.finishtime, node.scclabel, node.explored]);
    // }
    console.log(`graph ${i} /// ${g.sccsizelist.sort((a, b) => b - a).slice(0,10)}`);
}

// auxkosaraju(g,1);


// console.log('///// BFS /////');
// t1 = performance.now();
// let bfstree = g.bfs(g.graph, nodetest, graphsearchOptions);
// t2 = performance.now();
// console.log(`BFS took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
// console.log(`BFS tree nodes: ${bfstree.size}`);


// g.resetExplored(g.graph);
// console.log('///// BFS OLD /////');
// t1 = performance.now();
// bfstree = g.bfs_old(g.graph, nodetest, graphsearchOptions);
// t2 = performance.now();
// console.log(`BFS took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
// console.log(`BFS tree nodes: ${bfstree.size}`);


// g.resetExplored(g.graph);
// let gDfsConn = new Set();
// console.log('///// DFS /////');
// t1 = performance.now();
// gDfsConn = g.dfs(g.graph, nodetest, graphsearchOptions);
// t2 = performance.now();
// console.log(`DFS took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
// // console.log(g.graph);
// console.log(`DFS tree nodes: ${gDfsConn.size}`);
// // console.log(gDfsConn);

// g.resetExplored(g.graph);
// console.log('///// DFS OLD /////');
// t1 = performance.now();
// gDfsConn = g.dfs_old(g.graph, nodetest, graphsearchOptions);
// t2 = performance.now();
// console.log(`DFS Old took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
// // console.log(g.graph);
// console.log(`DFS Old tree nodes: ${gDfsConn.size}`);
// // console.log(gDfsConn);


// g.resetExplored(g.graph);
// console.log('///// DFS Recursive/////');
// t1 = performance.now();
// let gDfsConnRec = g.dfsRecursive(g.graph, nodetest, graphsearchOptions);
// t2 = performance.now();
// console.log(`DFS Recursive took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
// // console.log(g.graph);
// console.log(`DFS tree nodes: ${gDfsConnRec.size}`);
// // console.log(gDfsConnRec);

// g.resetExplored(g.graph);
// console.log('///// DFS REC /////');
// // t1 = performance.now();
// // g.dfsRec(g.graph, nodetest, graphsearchOptions);


// // t2 = performance.now();
// // console.log(`DFS REC took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

// async function auxdfs() {

//     await af.timeFunc( async () => { await g.dfsRec(g.graph, nodetest, graphsearchOptions) } );
    
//     let gDfsConnRec = new Set();
//     // console.log(g.graph);
//     for (let n of g.graph.keys()) {
//         if (g.graph.get(n).explored) { gDfsConnRec.add(n); }
//     }
//     console.log(`DFS tree nodes: ${gDfsConnRec.size}`);
//     // console.log(gDfsConnRec);
    
//     let dfsConnDiff12 = new Set( Array.from(gDfsConn).filter( x => !gDfsConnRec.has(x)) );
//     let dfsConnDiff21 = new Set( Array.from(gDfsConnRec).filter( x => !gDfsConn.has(x)) );
//     console.log(`number of elements in difference: 1/2 =  ${dfsConnDiff12.size}`);
//     console.log(`number of elements in difference: 2/1 =  ${dfsConnDiff21.size}`);
// }

// auxdfs();









if (runtype === 'test-all') {
    // // // // // // // // // //
    // // // test graphs // // //
    // // // // // // // // // //

    function testBfsScc(g) {

        g.resetExplored(g.graph);
        console.log('///// BFS Strongly Connected Components /////');
        let graphSearchOptions = {   'debugmsg' : false
                                    ,'debugiter': 1e8 
                                    };
        t1 = performance.now();
        let gscctest = g.bfsStrongConnect(g.graph, g.graphReverse, graphSearchOptions);
        t2 = performance.now();
        console.log(`BFS-SCC took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
        // console.log(g.graph);
        // console.log(g.graphReverse);
        console.log(gscctest);

        let gsccsize = [];
        for (let scc of gscctest) {
            gsccsize.push(scc.size);
        }
        gsccsize.sort((a, b) => b - a);
        console.log(`===== ===== ===== ===== ===== ===== size of SCC ${gsccsize.slice(0,20)} `);

        return gsccsize;
    }

    for (let [i,fp] of filepathlist.entries()) {
        g = readParseGraph(fp, 1e8, '\r\n');
        // console.log(g);
        // g.bfs(g.graph, 1, {'debugmsg': false});
        // testBfsScc(g);
        auxkosaraju(g,i+1);
    }
}



