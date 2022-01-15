// load csv into array
const fs = require('fs');
const papa = require('papaparse');
// for timing functions
const { performance } = require('perf_hooks');

// helper function for the algorithms course
const af = require('../../algofuncs/algofuncs.js');


let filepath = 'D:/algorithms-course/course2/3medianHeap/medianData.csv';
function readParse(filepath, dataendrow = 1e6, endlinechar = '\r\n', delim='\t') {
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
    
    let dataarray = [];
    for (let row of data.data) {
        af.removeEmpty(row, emptytype=null);
        dataarray.push(row[0]);
    }

    // console.log(dataarray);

    return dataarray;

}                

let numstream = readParse(filepath);
// console.log(numstream);



function medianInsert( val, heapMax, heapMin, options) {
    // inserts val in heapMax or heapMin to maintain median property
    // val - integer or float
    // heapMax - heap type with extractMax
    // heapMin - heap type with extractMin
        
    if (val < heapMax.rootval()) {
        // add to heapMax
        heapMax.add(val);
        
        // re-balance heaps. only heapMax could have grown
        if (heapMax.size - heapMin.size > 1) {
            // extract from larger and add to smaller
            heapMin.add(heapMax.extract());
        }
    } else if (val > heapMin.rootval()) {
        // add to heapMin
        heapMin.add(val);
        
        // re-balance heaps. only heapMin could have grown. keep heapMax the larger in case odd.
        if (heapMin.size - heapMax.size > 0) {
            // extract from larger and add to smaller
            heapMax.add(heapMin.extract());
        }
    } else {
        // always add to heapMax
        heapMax.add(val);
        
        if (heapMax.size - heapMin.size > 1) {
            // extract from larger and add to smaller
            heapMin.add(heapMax.extract());
        }   
    }
    return heapMax.rootval();
}

function calcMedianHash(valarray, debugmsg=false) {

    let hmax = new af.Heap('max');
    let hmin = new af.Heap('min');
    
    let mediansum = null;
    let mediantemp = null;

    for (let val of valarray) {
        mediantemp = medianInsert(val, hmax, hmin);
        mediansum = mediansum + mediantemp;
        if (debugmsg) {
            console.log({'hmax':hmax.array, 'hmin':hmin.array});
            console.log({mediantemp, mediansum})
        }
    }
    return mediansum % 10_000;
}

let heapOptions = {  'debugmsg' : true
                    ,'debugiter': 1e8 
                    };

let arrtest = [9,1,2,3,8,7];
let medtest = null;

// for (let val of arrtest) {

//     medtest = medianInsert(val, hmax, hmin, heapOptions);
//     // console.log(hmax.array)
//     // console.log(hmin.array)
//     console.log({'median':medtest, 'hmax':hmax.array, 'hmin':hmin.array});
//     }

let medhashtest = calcMedianHash(arrtest);
console.log(medhashtest);


// let medhash = calcMedianHash(numstream.slice(0,5), true);
let medhash = calcMedianHash(numstream, false);
console.log({medhash});