// load csv into array
const fs = require('fs');
const papa = require('papaparse');
// for timing functions
const { performance } = require('perf_hooks');

// helper function for the algorithms course
const af = require('../../algofuncs/algofuncs.js');

let h = new af.Heap();

h.add(9);
console.log(h.array);
h.add(7);
console.log(h.array);
h.add(9);
console.log(h.array);