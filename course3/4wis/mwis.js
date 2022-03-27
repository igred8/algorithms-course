// Maximum weight independent set of a path graph


// load csv into array
const fs = require('fs');
const path = require('path');
// for timing functions
const { performance } = require('perf_hooks');

// helper function for the algorithms course
const af = require('../../algofuncs/algofuncs.js');


// // // LOAD GRAPH // // //
// use synchronous fileRead version

function readParseGraph(filepath, endlinechar = '\r\n', delimiter=" ") {
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
            rtemp = parseInt(rtemp);
            dataarray.push(rtemp);
        }
    }

    
    let pathgraph = new Map();
    for (let [i,b] of dataarray.entries()) {
        pathgraph.set(i+1, b);
    }

    t2 = performance.now();
    // console.log(`nodelist took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

    return [pathgraph, dataarray];

}


// let runtype = 'test-single';
let runtype = 'full-graph';
// let runtype = 'testcases';
// let runtype = 'skip';



if (runtype === 'test-single') {

    let fp = 'E:/Dropbox/algorithms-course/testCases/course3/assignment3HuffmanAndMWIS/question3/input_random_1_10.txt';
    
    [pathgraph, data] = readParseGraph(fp, '\n');

} else if (runtype === 'full-graph') {
    let fp = 'E:/Dropbox/algorithms-course/course3/4wis/mwis-DATA-00.txt';
    [pathgraph, data] = readParseGraph(fp, '\n');

} else if (runtype === 'testcases') {
    var testcases_path = 'E:/Dropbox/algorithms-course/testCases/course3/assignment3HuffmanAndMWIS/question3';
    var testfiles = fs.readdirSync(testcases_path);
    var infiles = testfiles.filter( fn => fn.includes('input') );
    var outfiles = testfiles.filter( fn => fn.includes('output') );
}

// console.log(infiles);

function test_single_case(infiles, outfiles, fncontains, fnnumber, testcasespath, elc='\n') {
    // fncontains is a string to which the fnnumber is attached to identify the file
    let infn = infiles.filter( fn => fn.includes(`${fncontains}_${fnnumber}_`) )[0];
    let outfn = outfiles.filter( fn => fn.includes(`${fncontains}_${fnnumber}_`) )[0];
    // console.log({infn});
    // console.log({outfn});
    // read input file
    let fp = `${testcasespath}/${infn}`
    let [pathgraph, data] = readParseGraph(fp, elc);
    
    // console.log(pathgraph.get(1));
    // run algorithm
    
    let mwisnodes = mwis( pathgraph );

    let nlist = [1, 2, 3, 4, 17, 117, 517, 997];
    let bitstring = check_nodes( mwisnodes, nlist );
    // console.log(bitstring);
    
    // read output
    fp = `${testcasespath}\\${outfn}`
    let output = fs.readFileSync(fp, 'utf8');
    // parse data string to array and time
    let outstr = output.split(elc);
    // console.log(outstr);
    let expectedoutput = outstr[0];
    // console.log({expectedoutput});
    
    // compare test results
    if (bitstring === expectedoutput){
        // console.log(`test ${fnnumber} PASS`);
        return 1;
    } else {
        console.log(`test ${fnnumber} FAIL`);

        console.log(`output bits = ${bitstring}`);
        console.log(`expected output: ${expectedoutput}`);
        // console.log({infn});
        // console.log({outfn});
        
        return 0;
    }
}


function mwis( pathgraph ) {
    // initial conditions
    let maxweightarr = [];
    maxweightarr.push(0);
    maxweightarr.push(pathgraph.get(1));
    // console.log(maxweightarr);
    for (let i=2; i<=pathgraph.size; i++) {
        // console.log(i);
        // console.log(pathgraph.get(i));
        let maxi = Math.max( maxweightarr[i-1], maxweightarr[i-2] + pathgraph.get(i) );
        // console.log(maxi);
        maxweightarr.push(maxi);
        // console.log(maxweightarr);
    }

    // reconstruct the sequence of nodes included in the maximum weight independent set
    let mwis_set = new Set();
    let i = pathgraph.size;

    while (i > 1) {
        if ( maxweightarr[i-1] >= maxweightarr[i-2] + pathgraph.get(i)) {
            i--;
        } else {
            mwis_set.add(i);
            i -= 2;
        }    
    }
    // if i ended up being 1, then add it to the set
    if (i === 1) {
        mwis_set.add(i)
    }

    // console.log(mwis_set);

    return mwis_set;

}

function check_nodes( mwis_set, nodelist ) {
    let bitstr = '';
    for (let n of nodelist) {
        bitstr += `${+mwis_set.has(n)}`;

    }
    return bitstr;
}



// let passtest = test_single_case(infiles,outfiles,'random', 1, testcases_path, '\n');

if (runtype === 'testcases') {
    let ntests = infiles.length;
    // let ntests = 2;
    let nfails = 0;

    for (let i=1;i<ntests; i++){
        let passtest = test_single_case(infiles,outfiles,'random', i, testcases_path);
        if (!passtest) { nfails++; }
    }
    console.log(`failed ${nfails} of ${ntests}`)

} else if (runtype === 'full-graph') {
    
    // run algorithm    
    let mwisnodes = mwis( pathgraph );

    let nlist = [1, 2, 3, 4, 17, 117, 517, 997];
    let bitstring = check_nodes( mwisnodes, nlist );
    console.log(bitstring);
}