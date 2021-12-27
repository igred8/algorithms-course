// load csv into array
const fs = require('fs');
// const cheerio = require('cheerio');
const jcsv = require('jquery-csv');
const { performance } = require('perf_hooks');

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

function choosePivot(arr, method) {
    
    let arrlen = arr.length;
    if (arrlen > 1) {

        if (method === 'first') {
            
            var pivot_index = 0;
            // var pivot = arr[pivot_index];
    
        } else if (method === 'last') {
            
            // console.log('last');
            var pivot_index = arrlen - 1;
            // var pivot = arr[pivot_index];
    
        } else if (method === 'median-3') {
            
            let p3ind = [ 0, Math.ceil(arrlen/2) - 1, arrlen-1 ];
            let p3 = [];
            for (const p of p3ind) {
                p3.push(arr[p]);
            }
            // sort with swaps <=3 swaps
            for (let i=0;i<2;i++){
                for (let j=i+1;j<3;j++){
                    if (p3[i] > p3[j]) {
                        [p3[i], p3[j]] = [p3[j], p3[i]];
                        [p3ind[i], p3ind[j]] = [p3ind[j], p3ind[i]];
                    }
                }
            }
            var pivot_index = p3ind[1];
            // var pivot = arr[pivot_index];
    
        } else {
            console.log('WARNING: method variable in choosePivot must be ["first", "last", "median-3"]')
            var pivot_index = -1;
            // var pivot = -1;
        }
    } else {
        var pivot_index = 0;
        // var pivot = arr[0];
    
    }

    return pivot_index;
}

function partition(arr, leftindex, rightindex) {
    
    //  
    // NOTE: arr will be changed in place with this function call
    //

    // assume that pivot is placed at leftindex of subarray
    let p = arr[leftindex];
    // i will be the index of the first element >= p
    let i = leftindex + 1;
    for (let j=leftindex+1; j<=rightindex; j++) {
        if (arr[j] < p) {
            // swap
            [arr[i], arr[j]] = [arr[j], arr[i]];
            
            i++;
        }

    }

    // place pivot in correct position
    [arr[leftindex], arr[i-1]] = [arr[i-1], arr[leftindex]];

    // return the final position of the pivot
    return i - 1 
}

function quickSort(arr, leftindex, rightindex, pivotmethod) {
    // performs recursive quicksort, returns sorted array and the number of comparisons made during sorting
    // console.log('---')
    // console.log(arr);
    // console.log(arr.slice(leftindex, rightindex));

    let ncompare = 0; // number of comparisons made by quickSort
    let arrlen = arr.slice(leftindex,rightindex).length;
    // console.log(`arr.slice(leftindex,rightindex).length = ${arrlen}`);

    if (arrlen > 1) {
        ncompare = arrlen - 1;
        // choose pivot
        var pivot_index = choosePivot(arr.slice(leftindex,rightindex), pivotmethod);

        // make pivot first element
        [arr[leftindex], arr[leftindex + pivot_index]] = [arr[leftindex + pivot_index], arr[leftindex]];
        
        // partition and update position of pivot
        pivot_index = partition(arr, leftindex, rightindex);

        // recursive call
        // console.log(`li = ${leftindex}\nri = ${rightindex}`);
        let ncompareleft = quickSort(arr, leftindex, pivot_index, pivotmethod);
        let ncompareright = quickSort(arr, pivot_index + 1, rightindex, pivotmethod);
        ncompare = ncompare + ncompareleft + ncompareright;
    }


    return ncompare;

}

// let testarray = [3,6,4,11,12,13,14,99,77,2,5,2,1];
// let testarray = [4,5,6,7];
let testarray = [5, 3, 8, 9, 1, 7, 0, 2, 6, 4];
let testarrlen = testarray.length;

mergeSortCountInv(testarray, debugmode=true);

// let pindex = choosePivot(testarray,'median-3');
// console.log(`p = ${testarray[pindex]}\np-index = ${pindex}`);

// console.log(testarray);
// partition(testarray, 0,testarray.length-1)
// console.log(testarray);
// console.log(testarray.slice(0,4).length);
// console.log(testarray.slice(98,99));

// let ncompare = quickSort(testarray,0,testarrlen,'first' );
// let ncompare = quickSort(testarray,0,testarrlen,'last' );
// let ncompare = quickSort(testarray,0,testarrlen,'median-3' );
// console.log(testarray);
// console.log(`# of comparisons = ${ncompare}`)




// // // LOAD DATA // // //
// use synchronous fileRead version
// let datastr = fs.readFileSync('D:/algorithms-course/course1/4quickSort/data-1e4.csv', 'utf8');
// // console.log(datastr);

// // parse data string to array
// let data = jcsv.toArray(datastr, { separator:'\n' });

// function removeEmpty(array) {
//     // remove empty elements
//     let posnull = array.indexOf('');
    
//     while ( posnull >= 0 ) {
//         array.splice(posnull,1);
//         posnull = array.indexOf('');
//         // console.log(posnull);
        
//     }
//     return array;
// }

// data = removeEmpty(data);

// // convert strings to numbers
// for (const [i, ele] of data.entries()) {
//     data[i] = parseInt(ele);
// }

// let nstart = 0;
// let nele = 10000;

// testarray = data.slice(nstart, nele);
// testarrlen = testarray.length;
// // console.log(testarray);

// // let pivot_method = 'first';
// // let pivot_method = 'last';
// let pivot_method = 'median-3';
// // ncompare = quickSort(testarray,0,testarrlen,'first' );
// // ncompare = quickSort(testarray,0,testarrlen,'last' );
// // ncompare = quickSort(testarray,0,testarrlen,'median-3' );
// ncompare = quickSort( testarray, 0, testarrlen, pivot_method );
// // console.log(testarray);
// console.log(`pivot choice method = ${pivot_method}\n# of comparisons = ${ncompare}`)



function perfLog(data,nstart, nele, verbose=true) {

    
    t1 = performance.now();
    quickSort(data, nstart, nstart+nele, 'median-3');
    t2 = performance.now();
    let timeqs = t2 - t1;
    
    t1 = performance.now();
    mergeSortCountInv(data.slice( nstart, nstart+nele));
    t2 = performance.now();
    let timems = t2 - t1;
    
    console.log(`quickSort took ${(timeqs).toFixed(3)} ms for n = ${nele} `)
    console.log(`mergeSort took ${(timems).toFixed(3)} ms for n = ${nele} `)
    
    return [ timeqs, timems ]
}


// let nelevec = [];
// for (let n = 0; n<5; n++) {
//     nelevec.push(10**n)
    
// }


// let timemsvec = [];
// let timeqsvec = [];
// for (const n of nelevec) {
    
//     let [tqs, tms] = perfLog(data, nstart, n);
    
//     timeqsvec.push(tqs);
//     timemsvec.push(tms);

// }

// 162085, 164123, 131226<-wrong