// helper function for the algorithms course
const af = require('../../algofuncs/algofuncs.js');

function test(a, options) {

    let defaultOptions = {  'debugmsg': false,
                            'debugiter':1e8
                         };

    options = af.checkDefaultOptions(options, defaultOptions);

    console.log(options);
}

test(8);

// let t = new Set([1,2,4]);
// [33,333,3333].forEach(x => t.add(x));
// console.log(t);

// for (let e of new Set([55,555,5555])) {
//     t.add(e);
// }

// console.log(t);

let t = [3,33,333];

for (let [i,ele] of t.entries()) {
    console.log(i);
    console.log(ele);
}