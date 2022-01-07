let ct = 0;
const MAX = 1_000_000;

const recurse = (cb) => {
  if (++ct > MAX) {
    return cb(ct)
  }
  process.nextTick(() => recurse(cb))
}
try {
  const then = process.hrtime.bigint();
  recurse((ct) => {
    const now = process.hrtime.bigint();
    const nanos = now - then
    const runtime = Number(nanos) / 1_000_000_000
    ct--
    console.log({ ct, runtime });
  })
} catch (e) {
  console.error({ ct, e })
}



// function computeMaxCallStackSize() {
//     try {
//         return setImmediate(1 + computeMaxCallStackSize());
//     } catch (e) {
//         // Call stack overflow
//         console.log('max call stack reached');
//         return 1;
//     }
// }

// let maxcallstack = computeMaxCallStackSize();
// console.log(maxcallstack);

// let icounter = 0;

// function testrec(callbackfunc) {
//     if (++icounter > 1e6) {
//         return callbackfunc(icounter);
//     }
//     process.nextTick( () => testrec(callbackfunc) );
// }



// try {

//     const t1 = process.hrtime.bigint();
//     function printEndTime(icounter) {
//         const t2 = process.hrtime.bigint();
//         const tnanos = t2-t1;
//         const runtime = Number(tnanos) / 1_000_000_000;
        
//         console.log({icounter, runtime});
    
//     }

//     testrec(printEndTime);
    
// } catch (e) {
//     console.log({icounter, e});
    
// }


function testrec(arr) {
    arr.pop();
    if (arr.length < 1) {
        console.log('arr.len < 1');
        return 0;
    }

    process.nextTick( () => {testrec(arr)} );

}

let a = [];
for (let i=0;i<1e1;i++) {
    a.push(1);
}
console.log(a.length);

const t1 = process.hrtime.bigint();
testrec(a);
const t2 = process.hrtime.bigint();
const tnanos = t2-t1;
const runtime = Number(tnanos) / 1_000_000_000;
console.log({runtime});