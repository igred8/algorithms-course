// multiply two numbers by the Karatsuba method
function karatsuba(num1, num2) {
    
    // assuming both numbers are positive
    // ssuming num1 and num2 are int or bigint types

    // work with strings
    let num1str = num1.toString();
    let num1digits = num1str.length;
    let num2str = num2.toString();
    let num2digits = num2str.length;

    // pad to the next power of 2
    let ndigitsmax = Math.max(num1digits, num2digits);
    let nextpwr2 = Math.ceil(Math.log2(ndigitsmax));
    
    num1digits = 2**nextpwr2;
    num2digits = 2**nextpwr2;

    num1str = num1str.padStart(num1digits, '0');
    num2str = num2str.padStart(num2digits, '0');
    // console.log([num1str, num2str]);
    // console.log([num1digits, num2digits]);
    
    let multiplynum = 0n;

    if (num1digits === 1 || num2digits === 1) {
        // console.log('num1digits === 1');
        // const num1n = BigInt(num1str);
        // const num2n = BigInt(num2str);
        multiplynum = num1 * num2;
    } else {
        
        // split string of digits
        let astr = num1str.slice(0,num1digits/2);
        let bstr = num1str.slice(num1digits/2);
        
        let cstr = num2str.slice(0,num2digits/2);
        let dstr = num2str.slice(num2digits/2);
        
        // recursively multiply a*c, b*d, (a+b)*(c+d)
        let [a,b,c,d] = [BigInt(astr), BigInt(bstr), BigInt(cstr), BigInt(dstr)];
        let ac = karatsuba(a, c);
        let bd = karatsuba(b, d);
        let abcd = karatsuba(a+b, c+d);
        
        // compute Guass' sum
        let ad_bc = abcd - ac - bd;

        multiplynum = (10n**BigInt(num1digits))*ac + (10n**(BigInt(num1digits/2)))*ad_bc + bd; 
        // multiplynum = 1;
    }

    return multiplynum;
}


function test01(n1,n2) {
    console.log(`n1 length = ${n1.toString().length}`)
    console.log(`n2 length = ${n2.toString().length}`)
    let n12 = BigInt(n1) * BigInt(n2);
    console.log(`${n12} bigint*bigint`);

    let n12k = karatsuba(n1,n2);
    console.log(`${n12k} karatsuba`);

    console.log(`${n12 - n12k} diff`);
    return 0;
}


let t1 = 110n;
let t2 = 999n;
test01(t1,t2);

let pi64 = '3141592653589793238462643383279502884197169399375105820974944592';
let e64  = '2718281828459045235360287471352662497757247093699959574966967627';
test01(pi64, e64);


