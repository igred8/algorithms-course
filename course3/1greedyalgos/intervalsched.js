// load csv into array
const fs = require('fs');
const papa = require('papaparse');
// for timing functions
const { performance } = require('perf_hooks');

// helper function for the algorithms course
const af = require('../../algofuncs/algofuncs.js');


function readParse(filepath, dataendrow = 1e6, endlinechar = '\n', delim='\s') {
    // read a filepath, parse the csv, and make a graph class with graph
    
    // read file and time performance
    let t1 = performance.now();
    let datastr = fs.readFileSync(filepath, 'utf8');
    let t2 = performance.now();
    console.log(`fs.readFileSync took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
    
    let datastrarr = datastr.split(endlinechar);
    let nreqs = parseInt(datastrarr[0]);
    // console.log(datastrarr[0]);
    console.log({nreqs});

    // parse data string to array and time
    t1 = performance.now();
    let dataarray = [];
    for (let row of datastrarr.slice(1)) {
        let rowsplit = row.split(' ');
        let rtemp = []
        for (let r of rowsplit) { rtemp.push(parseInt(r)) }
        dataarray.push(rtemp);
    }
    // let config = {   delimiter: delim
    //                 ,newline: endlinechar // \r\n for windows created file
    //                 ,header:false
    //                 ,comments:'#'
    //                 ,dynamicTyping: true
    //                 ,fastMode: true
                    
    //             }
    // let data = papa.parse(datastr, config);
    t2 = performance.now();
    console.log(`csv parser took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
    // console.log(data);
    // let dataarray = [];
    // for (let row of data.data) {
    //     af.removeEmpty(row, emptytype=null);
    //     dataarray.push(row[0]);
    // }

    // console.log(dataarray);

    return [nreqs, dataarray];

}

function intervalSchedule_difference(nreqs, reqs) {

    // schedule the requests in reqs with lowest (weight-length) going first
    
    for (let r of reqs) {
        r.push(r[0] - r[1]);
    }
    function comparefunc(a,b) {
        if (a[2] === b[2]) {
            return b[0] - a[0];
        }
        return b[2] - a[2];
    }
    reqs.sort( comparefunc );
    console.log(reqs.slice(0,11));

    let finishtime = 0;
    let sumweighttime = 0;
    for (let r of reqs) {
        finishtime = finishtime + r[1];
        sumweighttime = sumweighttime + r[0]*finishtime;
    }
    return sumweighttime;
}

function intervalSchedule_ratio(nreqs, reqs) {
    // schedule the requests in reqs with lowest (weight-length) going first
    

    for (let r of reqs) {
        r.push(r[0] / r[1]);
    }
    function comparefunc(a,b) {
        if (a[2] === b[2]) {
            return b[0] - a[0];
        }
        return b[2] - a[2];
    }
    reqs.sort( comparefunc );
    console.log(reqs.slice(0,11));

    let finishtime = 0;
    let sumweighttime = 0;
    for (let r of reqs) {
        finishtime = finishtime + r[1];
        sumweighttime = sumweighttime + r[0]*finishtime;
    }
    return sumweighttime;
}

// load data
let filepath = 'D:/Dropbox/algorithms-course/course3/1greedyalgos/requestsDATA.csv';
let [nreqs, reqdata] = readParse(filepath);
console.log(`number of requests: ${nreqs}`);
console.log(reqdata.slice(0,9));

// difference
let swtd = intervalSchedule_difference(nreqs, reqdata);
console.log(`Difference: sum(weight*finishtime) = ${swtd}`);

// reload because reqs was mutated
[nreqs, reqdata] = readParse(filepath);
let swtr = intervalSchedule_ratio(nreqs, reqdata);
console.log(`Ratio: sum(weight*finishtime) = ${swtr}`);