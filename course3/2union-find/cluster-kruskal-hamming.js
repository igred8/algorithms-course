// load csv into array
const fs = require('fs');
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
    let nbits = parseInt(header[1]);
    // console.log(datastrarr[0]);
    console.log({nnodes,nbits});

    // parse data string to array and time
    t1 = performance.now();
    let dataarray = [];
    for (let row of datastrarr.slice(1)) {
        let rtemp = row.replaceAll(' ','');
        dataarray.push(parseInt(rtemp,2));
    }
    
    t2 = performance.now();
    // console.log(data);
    console.log(`csv parser took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

    // for (let row of dataarray) {
    //     af.removeEmpty(row, '');
    //     af.removeEmpty(row, ' ');
    // }

    // console.log(dataarray.slice(0,11));
    
    // make graph and graph reversed
    t1 = performance.now();
    let g = new af.Graph('undirected');

    g.makeGraph( Object.values(dataarray.slice(0,dataendrow))
                , 'node-undir'
                );
    

    t2 = performance.now();
    console.log(`makeGraph took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

    return [g, dataarray];

}


let runtype = 'test-single';
// let runtype = 'full-graph';
// let runtype = 'skip';



if (runtype === 'test-single') {

    let fp = 'E:/Dropbox/algorithms-course/course3/2union-find/clusteringDATA2-test02.txt';
    
    [g,data] = readParseGraph(fp, 1e6, '\r\n');

} else if (runtype === 'full-graph') {
    let fp = 'E:/Dropbox/algorithms-course/course3/2union-find/clusteringDATA2.txt';
    [g,data] = readParseGraph(fp, 5.2e6, '\n');

}



function hamming_distance(a, b) {
    let d = 0;
    let h = a ^ b;
    while (h > 0) {
        d ++;
        h &= h - 1;
    }
    return d;
}

function hamming_distance0(a, b) {
    let a0 = hamming_distance(0,a);
    let b0 = hamming_distance(0,b);
    return a0 - b0;
}

// console.log(data);
let a = data[0];
let b = data[1];
console.log(a.toString(2));
console.log(b.toString(2));
let hd = hamming_distance(a, b);
console.log(hd);

console.log(g);


function cluster_hamming(data, spacing, debugmsg) {
    // what is the maximum number of clusters that the spacing between clusters > spacing?
    if (debugmsg) {
        console.log('data:')
        console.log(data);
    }
    // make a UnionFind of nodes
    let nodeuf = new af.UnionFind();
    let nodelist = [];
    for (let n of data) {
        nodelist.push(n[1]);
    }
    nodeuf.make(nodelist, 'name');
    
    if (debugmsg) {
        console.log(nodeuf);
    }
    for (let [i,bini] of nodelist.entries()) {

    }
}