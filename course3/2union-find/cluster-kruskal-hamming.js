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
    // console.log(`fs.readFileSync took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
    // console.log(datastr);

    // parse data string to array and time
    let datastrarr = datastr.split(endlinechar);
    // console.log(datastrarr);
    let header = datastrarr[0].split(" ");
    let nnodes = parseInt(header[0]);
    let nbits = parseInt(header[1]);
    // console.log(datastrarr[0]);
    // console.log({nnodes,nbits});

    // parse data string to array and time
    t1 = performance.now();
    let dataarray = [];
    for (let row of datastrarr.slice(1)) {
        let rtemp = row.replaceAll(' ','');
        // console.log(typeof(rtemp));
        // console.log(rtemp === '');
        // console.log(typeof(rtemp));
        // catch empty rows
        if (rtemp !== '') {
            rtemp = parseInt(rtemp,2);
            dataarray.push(rtemp);
        }

    }

    
    t2 = performance.now();
    // console.log(data);
    // console.log(`csv parser took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

    // for (let row of dataarray) {
    //     console.log(row);
    //     // af.removeEmpty(row, '');
    //     // af.removeEmpty(row, ' ');
    //     af.removeEmpty(row, NaN);
    // }

    // console.log(dataarray.slice(0));
    
    // make graph and graph reversed
    t1 = performance.now();
    // let g = new af.Graph('undirected');

    // g.makeGraph( Object.values(dataarray.slice(0,dataendrow))
    //             , 'node-undir'
    //             );
    let nodelist = [];
    for (let [i,b] of dataarray.entries()) {
        let n = new af.Node(i);
        n.bitname = b;
        nodelist.push( n );
    }

    t2 = performance.now();
    // console.log(`nodelist took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

    return [nodelist, dataarray];

}


// let runtype = 'test-single';
// let runtype = 'full-graph';
let runtype = 'testcases';
// let runtype = 'skip';



if (runtype === 'test-single') {

    // let fp = 'E:/Dropbox/algorithms-course/course3/2union-find/clusteringDATA2-test01.txt';
    let fp = 'E:/Dropbox/algorithms-course/course3/2union-find/clusteringDATA2-test02.txt';
    
    [nodelist, data] = readParseGraph(fp, 1e6, '\r\n');

} else if (runtype === 'full-graph') {
    let fp = 'E:/Dropbox/algorithms-course/course3/2union-find/clusteringDATA2.txt';
    [nodelist, data] = readParseGraph(fp, 5.2e6, '\n');

} else if (runtype === 'testcases') {
    var testcases_path = 'E:/Dropbox/algorithms-course/testCases/course3/assignment2Clustering/question2';
    var testfiles = fs.readdirSync(testcases_path);
    var infiles = testfiles.filter( fn => fn.includes('input') );
    var outfiles = testfiles.filter( fn => fn.includes('output') );
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

// console.log(data);
// let a = data[0];
// let b = data[1];
// console.log(a.toString(2));
// console.log(b.toString(2));
// let hd = hamming_distance(a, b);
// console.log(hd);

// console.log(nodelist);


function cluster_hamming(nodelist, spacing, debugmsg, timemsg) {
    // what is the maximum number of clusters that the spacing between clusters > spacing?
    if (debugmsg) {
        console.log('nodelist:')
        console.log(nodelist);
    }

    // sort by bitname
    nodelist.sort( (a,b) => {
            hamming_distance(0,a.bitname) - hamming_distance(0,b.bitname) 
        } 
    );

    // make a UnionFind of nodes
    let nodeuf = new af.UnionFind();
    nodeuf.make(nodelist, 'name');
    
    if (debugmsg) {
        console.log(nodelist);
        console.log(nodeuf);
    }
    let ti = performance.now();
    for (let [i, nodei] of nodelist.entries()) {
        
        let t1 = performance.now();
        for (let nodej of nodelist.slice(i)) {
            if (hamming_distance(nodei.bitname, nodej.bitname) < spacing) {
                let unionmade = nodeuf.union(nodei.name, nodej.name);
                // if (unionmade) {
                //     break;
                // }
            }
            
        }
        let t2 = performance.now();
        if (timemsg){
            if (i%1e4 === 0) {
                console.log(`nodei = ${i}`);
                console.log(`j for loop took: ${(1e-3 * (t2-t1)).toFixed(3)} sec`);
                console.log(`total time elapsed: ${(1e-3 * (t2-ti)).toFixed(3)} sec`);
            }
        }

    }

    if (debugmsg) {
        console.log(nodeuf);
    }
    return nodeuf;
}


function test_single_case(infiles, outfiles, fncontains, fnnumber, testcasespath, elc='\n') {
    // fncontains is a string to which the fnnumber is attached to identify the file
    let infn = infiles.filter( fn => fn.includes(`${fncontains}_${fnnumber}_`) )[0];
    let outfn = outfiles.filter( fn => fn.includes(`${fncontains}_${fnnumber}_`) )[0];
    // console.log({infn});
    // console.log({outfn});
    // read input file
    let fp = `${testcasespath}\\${infn}`
    let [nodelist, data] = readParseGraph(fp, 5.2e6, elc);
    
    // run algorithm
    let nodeuf = cluster_hamming(nodelist, 3, false, false);
    
    let kclusters = nodeuf.parents.size;
    // console.log(nodeuf);
    
    // read output
    fp = `${testcasespath}\\${outfn}`
    let output = fs.readFileSync(fp, 'utf8');
    // parse data string to array and time
    let outstr = output.split(elc);
    let expectedoutput = parseInt(outstr[0]);
    
    if (kclusters === expectedoutput){
        // console.log(`test ${fnnumber} PASS`);
        return 1;
    } else {
        console.log(`test ${fnnumber} FAIL`);

        console.log(`number of clusters = ${kclusters}`);
        console.log(`expected output: ${expectedoutput}`);
        // console.log({infn});
        // console.log({outfn});
        
        return 0;
    }
}

// test_single_case(infiles,outfiles,'random', 80, testcases_path);

if (runtype === 'testcases') {
    let ntests = 70
    let nfails = 0;

    for (let i=1;i<ntests; i++){
        let passtest = test_single_case(infiles,outfiles,'random', i, testcases_path);
        if (!passtest) { nfails++; }
    }
    console.log(`failed ${nfails} of ${ntests}`)
} else if (runtype === 'full-graph') {
    let nodeuf = cluster_hamming(nodelist, 3, false,true);
    // console.log(nodeuf.parents);
    console.log(`number of clusters = ${nodeuf.parents.size}`);
}