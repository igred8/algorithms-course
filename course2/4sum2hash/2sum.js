// load csv into array
const fs = require('fs');
const papa = require('papaparse');
// for timing functions
const { performance } = require('perf_hooks');

// helper function for the algorithms course
const af = require('../../algofuncs/algofuncs.js');


function readParse(filepath, dataendrow = 1e6, endlinechar = '\n', delim='\t') {
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
    // console.log(data);
    let dataarray = [];
    for (let row of data.data) {
        af.removeEmpty(row, emptytype=null);
        dataarray.push(row[0]);
    }

    // console.log(dataarray);

    return dataarray;

}                

function targetSumBrute(intarray, targets) {
    // will use Map() as hash table in JS

    // make a target map
    let tmap = new Map();
    for (let t of targets) {
        tmap.set(t, false);
    }
    console.log(`number of targets = ${tmap.size}`);

    // make a hash table of array values
    let amap = new Map();
    for (let a of intarray) {
        // console.log(`a = ${a}`);
        amap.set(a);
    }
    console.log(`compliment space size = ${amap.size}`);
    // console.log(amap);

    let ttot = 0;
    
    for (let [t, _] of tmap) {
        for (let [a,_] of amap) {
            // let y = t - a;
            let y = t - a;

            if (amap.has(y) && y !== a) {
                tmap.set(t, true);
                ttot++;
                break;
            }
        }
    }
    
    // console.log(tmap);

    return ttot;

}

function modoffset(a,n,d) {
    return a - n * Math.floor( (a - d) / n );
}

function targetSum(intarray, targets, tR) {
    // will use Map() as hash table in JS
    let n = 2*tR+1;
    let d = -tR;

    // make a target map
    let tmap = new Map();
    for (let t of targets) {
        tmap.set( t, false );
    }
    console.log(`number of targets = ${tmap.size}`);
    // make a hash table of array values
    let amap_pos = new Map();
    let amap_neg = new Map();
    for (let a of intarray) {
        // amap.set( (a + targetRangeRadius)%(2*targetRangeRadius) ); 
        if (a > -tR) {
            amap_pos.set( a ); 
        }
    }
    for (let a of intarray) {
        if (a < tR) {
            amap_neg.set( a );
        }
    }
    
    console.log(`amap_pos size = ${amap_pos.size}`);
    console.log(`amap_neg size = ${amap_neg.size}`);

    let ttot = 0;
    for (let [t, treached] of tmap) {
        if (t%100 === 0) {
            console.log('100 targets checked');
        }
        if (treached) {
            continue;
        } else {
            for (let [a,_] of amap_neg) {
                let b = t - a;
                if (amap_pos.has(b) && b !== a) {
                    tmap.set(t, true);
                    ttot++;
                    break;
                }
            }
        }
    }

    return ttot;

}



let tarr = [];
// for (let i=-10_000;i<=10_000;i++) { tarr.push(i); }
for (let i=-10000;i<10001;i++) { tarr.push(i); }
// for (let i=3;i<9;i++) { tarr.push(i); }
// for (let i=0;i<40;i++) { tarr.push(i); }
// console.log(tarr);


let filepath = 'D:/algorithms-course/course2/4sum2hash/sum2DATA.csv';
// let filepath = 'D:/algorithms-course/course2/4sum2hash/sum2DATA-test01.csv';
// let filepath = 'D:/algorithms-course/course2/4sum2hash/sum2DATA-test02.csv';
let intarr = readParse(filepath);
console.log(`integer array length = ${intarr.length}`);
// for (let i=0;i<10;i++) {
//     console.log(intarr[i]);
// }




function auxTargetSum() {
    let ttot = targetSum(intarr, tarr, 10);
    console.log(`----- tagets reached: ${ttot}`);

    // let ttotbrute = targetSumBrute(intarr, tarr);
    // console.log(`----- tagets reached: ${ttotbrute}`);
    
}
af.timeFunc(auxTargetSum);
// console.log(tmap.get(2));