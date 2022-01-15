// load csv into array
const fs = require('fs');
const papa = require('papaparse');
// for timing functions
const { performance } = require('perf_hooks');

// helper function for the algorithms course
const af = require('../../algofuncs/algofuncs.js');


let heapOptions = {  'debugmsg' : false
                    ,'debugiter': 1e8 
                    };

let h = new af.Heap('max');

h.add(9, heapOptions);
console.log(h.array);
h.add(7, heapOptions);
console.log(h.array);
h.add(5,heapOptions);
console.log(h.array);
h.extract();
console.log(h.array);

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }
  
// let tarr = [];
// for (let i=0; i<9; i++) {
//     // tarr.push(getRandomInt(1,100));
//     tarr.push(i);
// }

// h.heapify(tarr, heapOptions);

// console.log(h.array);

// for (let i=0;i<3;i++) {

//     let minval = h.extract();
//     console.log({minval});
//     console.log(h.array);
//     h.add(9);
//     console.log(h.array);
//     console.log(h.array.length);
//     // console.log(h.rootval());
// }


