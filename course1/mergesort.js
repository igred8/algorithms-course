// attempt to write a MergeSort algorithm
function mergeSort(arr) {
    // arr is an array of numeric values to be sorted
    let arrlen = arr.length;
    console.log(arr);

    if (arrlen > 1) {
        // split arrays and call mergeSort
        let arr1 = mergeSort(arr.slice(0,arrlen/2));
        let arr1len = arr1.length;
        let arr2 = mergeSort(arr.slice(arrlen/2));
        let arr2len = arr2.length;

        console.log(`arr1 = ${arr1}`);
        console.log(`arr2 = ${arr2}`);
        // merge sorted arrays
        let i = 0;
        let j = 0;
        for (let k = 0; k < arrlen; k++) {
            console.log([i,j,k]);
            if (i >= arr1len && j < arr2len) {
                // the rest of the elements are from arr2
                for (let kk = k; kk < arrlen; kk++) {
                    console.log(arr2[j]);
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


let testarray = [5,-6,7,8,8,8,8.3,8,9,1,2,3,4,9];
let sortedarray = mergeSort(testarray);

console.log(testarray);
console.log(sortedarray);