// load csv into array
const fs = require('fs');
// const cheerio = require('cheerio');
const jcsv = require('jquery-csv');
const { performance } = require('perf_hooks');





function countInvSlow(data) {
    let datalen = data.length;
    let numinv = 0;
    for (let i = 0; i < datalen; i++) {
        for (let j=i+1; j<datalen; j++) {
            if (data[i] > data[j]) {
                numinv++;
            }
        }
    }

    return numinv;
}

function mergeSort(arr) {

    // arr is an array of numeric values to be sorted
    let arrlen = arr.length;
    // console.log(arr);

    if (arrlen > 1) {
        // split arrays and call mergeSort
        let arr1 = mergeSort(arr.slice(0,arrlen/2));
        let arr1len = arr1.length;
        let arr2 = mergeSort(arr.slice(arrlen/2));
        let arr2len = arr2.length;

        // console.log(`arr1 = ${arr1}`);
        // console.log(`arr2 = ${arr2}`);

        // merge sorted arrays
        let i = 0;
        let j = 0;
        for (let k = 0; k < arrlen; k++) {
            // console.log([i,j,k]);
            if (i >= arr1len && j < arr2len) {
                // the rest of the elements are from arr2
                for (let kk = k; kk < arrlen; kk++) {
                    arr[kk] = arr2[j];
                    j++;
                }
                break; // don't need to cycle through anymore

            } else if (i < arr1len && j >= arr2len) {
                // the rest of the elements are from arr1    
                for (let kk = k; kk < arrlen; kk++) {
                    arr[kk] = arr1[i];
                    i++;
                }
                break; // don't need to cycle through anymore

            } else {
                // comparison
                if (arr1[i] < arr2[j]) {
                    arr[k] = arr1[i];
                    i++;
                } else {
                    arr[k] = arr2[j];
                    j++;
                }
            }
        }
        
    }

    return arr;
}


// attempt to write a MergeSort algorithm
function mergeSortCountInv(arr, debugmode=false) {

    // arr is an array of numeric values to be sorted
    let arrlen = arr.length;
    // console.log(arr);
    let numinv = 0;
    let numinvsplit = 0; // init inversion counter

    if (arrlen > 1) {
        // split arrays and call mergeSort recursively
        let arr1 = arr.slice(0,arrlen/2);
        let numinv1 = mergeSortCountInv(arr1);
        let arr1len = arr1.length;
        
        let arr2 = arr.slice(arrlen/2);
        let numinv2 = mergeSortCountInv(arr2);
        let arr2len = arr2.length;
        if (debugmode) {

            console.log(`arr1 = ${arr1}`);
            console.log(`n-inv-1 = ${numinv1} --- arr1len = ${arr1len}`);
            console.log(`arr2 = ${arr2}`);
            console.log(`n-inv-2 = ${numinv2} --- arr2len = ${arr2len}`);
        }

        // console.log(`arr1 = ${arr1}`);
        // console.log(`arr2 = ${arr2}`);

        // merge sorted arrays
        let i = 0;
        let j = 0;
        for (let k = 0; k < arrlen; k++) {
            // console.log([i,j,k]);
            if (i >= arr1len && j < arr2len) {
                // the rest of the elements are from arr2
                for (let kk = k; kk < arrlen; kk++) {
                    arr[kk] = arr2[j];
                    j++;
                }
                break; // don't need to cycle through anymore

            } else if (i < arr1len && j >= arr2len) {
                // the rest of the elements are from arr1
                // numinvsplit = numinvsplit + arr2len*(arr1len - i ) ;
                for (let kk = k; kk < arrlen; kk++) {
                    arr[kk] = arr1[i];
                    if (debugmode) {
                        console.log(`i = ${i}, j = ${j}`);
                    }
                    // numinvsplit = numinvsplit + arr2len;
                    i++;
                }
                break; // don't need to cycle through anymore

            } else {
                // comparison
                if (arr1[i] < arr2[j]) {
                    arr[k] = arr1[i];
                    i++;
                } else if (arr1[i] > arr2[j]) {
                    arr[k] = arr2[j];
                    numinvsplit  = numinvsplit + (arr1len - i );
                    j++;

                } 
            }
            // console.log(numinvsplit);
        }
        
        numinv = numinv1 + numinv2 + numinvsplit;
    }
    return numinv;
}

// // // LOAD DATA // // //
// use synchronous fileRead version
let datastr = fs.readFileSync('D:/algorithms-course/course1/chapter3/data-1e5.csv', 'utf8');
// console.log(datastr);

// parse data string to array
let data = jcsv.toArray(datastr, { separator:'\n' });

function removeEmpty(array) {
    // remove empty elements
    let posnull = array.indexOf('');
    
    while ( posnull >= 0 ) {
        array.splice(posnull,1);
        posnull = array.indexOf('');
        // console.log(posnull);
        
    }
    return array;
}

data = removeEmpty(data);

for (const [i, ele] of data.entries()) {
    data[i] = parseInt(ele);
}

let nstart = 0;
let nele = 100000;

function perfLog(data,nstart, nele, verbose=true) {

    let t1 = performance.now();
    let datasub = data.slice(nstart,nstart+nele);
    let ninv_slow = countInvSlow(datasub);
    let t2 = performance.now();
    let time_slow = t2 - t1;
    if (verbose) {

        console.log(`countInvSlow took ${(time_slow).toFixed(3)} ms for n = ${nele} `)
    }
    
    t1 = performance.now();
    let datasorted = data.slice(nstart,nstart+nele);
    // console.log(datasorted);
    let ninv_ms = mergeSortCountInv(datasorted);
    t2 = performance.now();
    let time_ms = t2 - t1;
    
    // console.log(datasorted);
    
    
    console.log(`mergeSortCountInv took ${(time_ms).toFixed(3)} ms for n = ${nele} `)
    
    console.log(`N_inv slow = ${ninv_slow}\nN_inv mergeSort = ${ninv_ms}`)
    console.log(`N-inversions diff = ${ninv_slow - ninv_ms}`)

    return [time_slow, time_ms]
}


let nelevec = [];
for (let n = 0; n<6; n++) {
    nelevec.push(10**n)
    
}

let timeslowvec = [];
let timemsvec = [];
for (const n of nelevec) {
    
    [tslow, tms] = perfLog(data, nstart, n);
    timeslowvec.push(tslow);
    timemsvec.push(tms);
}




  
// console.log(nelevec);
// console.log(timeslowvec);
// console.log(timemsvec);

// datasorted = data.slice(nstart,nstart+nele);
// mergeSort(datasorted);
// console.log(datasorted);