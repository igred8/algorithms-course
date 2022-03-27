// knapsack problem as described in Algorithms course 3
// dynamic programming, weighted interval scheduling is similar

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
    let ksize = parseInt(header[0]);
    let kitems = parseInt(header[1]);
    
    // console.log({ksize, kitems});

    // console.log(datastrarr[1]);
    // console.log({nnodes,nbits});

    // parse data string to array and time
    t1 = performance.now();
    let dataarray = [];
    for (let row of datastrarr.slice(1)) {
        if ( Object.is(row, '') ) {
            break;
        } else {

            let rowsplit = row.split(' ');
            let rtemp = []
            
            for (let r of rowsplit) { 
                rtemp.push(parseInt(r)) 
            }
            
            dataarray.push(rtemp);
        }

    }


    t2 = performance.now();
    // console.log(`nodelist took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

    return [dataarray, kitems, ksize];

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
    let [data, kitems, ksize] = readParseGraph(fp, elc);
    
    // console.log(data);
    // run algorithm
    // let optval = knapsack(data, kitems, ksize);
    let optval = knapsack_reduced(data, kitems, ksize);

    // read output
    fp = `${testcasespath}\\${outfn}`
    let output = fs.readFileSync(fp, 'utf8');
    // parse data string to array and time
    let outstr = output.split(elc);
    // console.log(outstr);
    let expectedoutput = parseInt(outstr[0]);
    // console.log({expectedoutput});
    
    // compare test results
    if (optval === expectedoutput){
        // console.log(`test ${fnnumber} PASS`);
        return 1;
    } else {
        console.log(`test ${fnnumber} FAIL`);

        console.log(`output = ${optval}`);
        console.log(`expected output: ${expectedoutput}`);
        // console.log({infn});
        // console.log({outfn});
        
        return 0;
    }
}

function knapsack( data, kitems, ksize ) {
    // knapsack problem solving function

    // let aa = Array.from( Array(ksize+1), _ => Array(kitems+1).fill(0) );
    
    let aa = Array.from( Array(kitems+1), _ => Array(ksize+1).fill(0) );

    // console.log(aa);

    for (let i=1; i<=kitems; i++) {
        for (let c=0; c<=ksize; c++){
            // console.log({i,c})
            let vi = data[i-1][0];
            let si = data[i-1][1];
            if (si > c) {
                aa[i][c] = aa[i-1][c];
                // aa[c][i] = aa[c][i-1];
            } else {
                aa[i][c] = Math.max( aa[i-1][c], aa[i-1][c-si] + vi );
                // aa[c][i] = Math.max( aa[c][i-1], aa[c-si][i-1] + vi );

            }

        }
    }
    // console.log(aa);
    // console.log( aa[kitems][ksize] );

    return aa[kitems][ksize];
}

function knapsack_reduced( data, kitems, ksize ) {
    // only keep track of the last column because we don't need reconstruction
    let aa = Array(ksize+1).fill(0);
    for (let i=1; i<=kitems; i++) {
        var aa1 = Array(ksize+1).fill(0);
        for (let c=0; c<=ksize; c++){
            // console.log({i,c})
            let vi = data[i-1][0];
            let si = data[i-1][1];
            if (si <= c) {
                
                aa1[c] = Math.max( aa[c], aa[c-si] + vi );
                
            } else {
                aa1[c] = aa[c];
            }
        }
        aa = aa1;
    }
    // console.log(aa);
    // console.log( aa[kitems][ksize] );

    return aa1[ksize];
}


//// Run tests ////

// let runtype = 'test-single';
let runtype = 'full-graph';
// let runtype = 'testcases';
// let runtype = 'skip';



if (runtype === 'test-single') {

    let fp = 'E:/Dropbox/algorithms-course/testCases/course3/assignment4Knapsack/input_random_10_100_10.txt';
    // let fp = 'E:/Dropbox/algorithms-course/course3/4knapsack/test01.txt';
    
    [data, kitems, ksize] = readParseGraph(fp, '\n');

    // console.log(data[data.length - 1]);
    
    // run algorithm    
    let opt = knapsack( data, kitems, ksize );
    // console.log({opt})
    
    let optr = knapsack_reduced( data, kitems, ksize );
    console.log({opt, optr})
    
} else if (runtype === 'full-graph') {
    
    // let fp = 'E:/Dropbox/algorithms-course/course3/4knapsack/knapsack-DATA-00.txt';
    let fp = 'E:/Dropbox/algorithms-course/course3/4knapsack/knapsack-DATA-01.txt';
    [data, kitems, ksize] = readParseGraph(fp, '\n');
    
    // run algorithm    
    // let opt = knapsack(data, kitems, ksize);
    let opt = knapsack_reduced( data, kitems, ksize );

    console.log({opt})

} else if (runtype === 'testcases') {
    
    var testcases_path = 'E:/Dropbox/algorithms-course/testCases/course3/assignment4Knapsack';
    var testfiles = fs.readdirSync(testcases_path);
    var infiles = testfiles.filter( fn => fn.includes('input') );
    var outfiles = testfiles.filter( fn => fn.includes('output') );
    
    // let ntests = infiles.length;
    let ntests = 35;
    let nfails = 0;
    
    for (let i=1;i<ntests; i++){
    
        let passtest = test_single_case(infiles,outfiles,'random', i, testcases_path);
        if (!passtest) { nfails++; }
    }
    console.log(`failed ${nfails} of ${ntests}`)
}

