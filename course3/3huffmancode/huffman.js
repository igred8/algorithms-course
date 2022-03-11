// load csv into array
const fs = require('fs');
// for timing functions
const { performance } = require('perf_hooks');
const { createSecureContext } = require('tls');

// helper function for the algorithms course
const af = require('../../algofuncs/algofuncs.js');


class BinaryNode {
    constructor(name, freq) {
        this.name = name;
        this.freq = freq;
        this.encoding = null;
        this.left = null;
        this.right = null;
        this.reached = false;

    }
}

class BinaryTree {
    constructor(node) {
        this.root = node;
        this.nodes = new Set([node]);
        this.leaves = new Set([node]);
    }
}


// // // LOAD GRAPH // // //
// use synchronous fileRead version

function readParseGraph(filepath, endlinechar = '\r\n', delimiter=" ") {
    // read a filepath, parse the csv, and make a graph class with graph
    
    // read file and time performance
    let t1 = performance.now();
    let datastr = fs.readFileSync(filepath, 'utf8');
    let t2 = performance.now();
    // console.log(`fs.readFileSync took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);
    // console.log(datastr);

    // parse data string to array and time
    let datastrarr = datastr.split(endlinechar);
    // console.log(datastrarr);
    let header = datastrarr[0].split(" ");
    let nletters = parseInt(header[0]);
    
    // console.log(datastrarr[0]);
    // console.log({nnodes,nbits});

    // parse data string to array and time
    t1 = performance.now();
    let dataarray = [];
    for (let row of datastrarr.slice(1)) {
        let rtemp = row.replaceAll(' ','');
        // console.log(typeof(rtemp));
        // console.log(rtemp === '');
        // console.log(typeof(rtemp));
        // catch empty rows
        if (rtemp !== '') {
            rtemp = parseInt(rtemp);
            dataarray.push(rtemp);
        }
    }

    
    let alphabet = [];
    for (let [i,b] of dataarray.entries()) {
        let n = new BinaryNode();
        n.name = `${i}`;
        n.freq = b;
        alphabet.push( n );
    }

    t2 = performance.now();
    // console.log(`nodelist took: ${(1e-3 * (t2-t1)).toFixed(3)} s`);

    return [alphabet, dataarray];

}


// let runtype = 'test-single';
let runtype = 'full-graph';
// let runtype = 'testcases';
// let runtype = 'skip';



if (runtype === 'test-single') {

    let fp = 'E:/Dropbox/algorithms-course/testCases/course3/assignment3HuffmanAndMWIS/question1And2/input_random_1_10.txt';
    
    [alphabet, data] = readParseGraph(fp, '\n');

} else if (runtype === 'full-graph') {
    let fp = 'E:/Dropbox/algorithms-course/course3/3huffmancode/huffman-DATA-01.txt';
    [alphabet, data] = readParseGraph(fp, '\n');

} else if (runtype === 'testcases') {
    var testcases_path = 'E:/Dropbox/algorithms-course/testCases/course3/assignment3HuffmanAndMWIS/question1And2';
    var testfiles = fs.readdirSync(testcases_path);
    var infiles = testfiles.filter( fn => fn.includes('input') );
    var outfiles = testfiles.filter( fn => fn.includes('output') );
}

// console.log(infiles);

function test_single_case(infiles, outfiles, fncontains, fnnumber, testcasespath, elc='\n') {
    // fncontains is a string to which the fnnumber is attached to identify the file
    let infn = infiles.filter( fn => fn.includes(`${fncontains}_${fnnumber}_`) )[0];
    let outfn = outfiles.filter( fn => fn.includes(`${fncontains}_${fnnumber}_`) )[0];
    // console.log({infn});
    // console.log({outfn});
    // read input file
    let fp = `${testcasespath}/${infn}`
    let [alphabet, data] = readParseGraph(fp, elc);
    
    // run algorithm
    let huffmantree = huffman_tree(alphabet);

    // console.log(huffmantree.nodes);

    // console.log(alphabet);
    
    let alphabetmap = huffman_code( huffmantree, alphabet );

    let encodinglengths = encoding_maxmin( alphabetmap );
    // console.log(encodinglengths);
    
    // read output
    fp = `${testcasespath}\\${outfn}`
    let output = fs.readFileSync(fp, 'utf8');
    // parse data string to array and time
    let outstr = output.split(elc);
    // console.log(outstr);
    let expectedoutput = [parseInt(outstr[0]), parseInt(outstr[1])];
    // console.log(expectedoutput);
    
    // compare test results
    if (encodinglengths[0] === expectedoutput[0] && encodinglengths[1] === expectedoutput[1]){
        // console.log(`test ${fnnumber} PASS`);
        return 1;
    } else {
        console.log(`test ${fnnumber} FAIL`);

        console.log(`max,min encodings = ${encodinglengths}`);
        console.log(`expected output: ${expectedoutput}`);
        // console.log({infn});
        // console.log({outfn});
        
        return 0;
    }
}



function merge_trees(tree1, tree2) {
    let newrootname = tree1.root.name + '-' +  tree2.root.name // roots assumed to be strings
    let rootnode = new BinaryNode(newrootname, tree1.root.freq + tree2.root.freq);
    rootnode.left = tree1.root;
    rootnode.right = tree2.root;
    let newtree = new BinaryTree(rootnode);
    for (let n of tree1.nodes) {
        tree2.nodes.add(n);
    }
    for (let n of tree1.leaves) {
        tree2.leaves.add(n);
    }
    newtree.nodes = tree2.nodes;
    newtree.nodes.add(rootnode)
    newtree.leaves = tree2.leaves;

    return newtree;

}

function huffman_tree(alphabet) {
    // creates a Huffman code based on creating a full binary tree
    
    // make a heap-min based on frequency of symbols
    let alphabetheap = new af.HeapPriority('freq');
    alphabetheap.heapify(alphabet);
    // console.log(alphabet);
    // console.log(alphabetheap);

    // make a set of trees rooted at each symbol in alphabet
    let treeset = new Map();
    for (let n of alphabet) {
        let treen = new BinaryTree(n);
        treeset.set(n.name, treen);
    }

    // console.log(treeset);
    // console.log(treeset.has(alphabet[0].name))

    while (treeset.size > 1) {

        // extract the two lowest freq symbols and merge
        let tree1name = alphabetheap.extract().name;
        let tree2name = alphabetheap.extract().name;
        let tree1 = treeset.get(tree1name);
        let tree2 = treeset.get(tree2name);
        let treemerge = merge_trees(tree1, tree2); 
        // add new root node to heap
        alphabetheap.add(treemerge.root);
        // add new tree to tree set
        treeset.set(treemerge.root.name, treemerge);
        // delete merged trees from set
        treeset.delete(tree1.root.name);
        treeset.delete(tree2.root.name);
        
    }
    
    // console.log(tree1);
    // console.log(tree2);
    
    // let tree12 = merge_trees(tree1, tree2);
    
    // console.log(treeset);
    // console.log(alphabetheap);
    
    let huffmantreename = treeset.keys().next().value;

    return treeset.get(huffmantreename);
}

function huffman_code( tree, alphabet ) {
    // let leavesiter = tree.leaves.entries();
    // current = leavesiter.next().value[0];
    // let current = tree.root;
    // console.log(current.name);

    let alphabetmap = new Map();
    for (let a of alphabet.values()) {
        alphabetmap.set( a.name, a );
    }
    // console.log(alphabetmap);
    let leavesreached = 0;
    while (leavesreached < alphabetmap.size) {

        let current = tree.root;
        let acode = '';

        while (true) {
            if (current.left === null && current.right === null) {
                // console.log(current);
                alphabetmap.get(current.name).encoding = acode;
                // console.log(alphabetmap.get(current.name));
                current.reached = true;
                
                leavesreached++;
                break;

            } else {

                if (current.left !== null && !current.left.reached ) {
                    current = current.left;
                    acode += '1';
                    // console.log('1');
                } else if (current.right !== null && !current.right.reached ) {
                    current = current.right;
                    acode += '0';
                    // console.log('0');
                } else if ( current.left.reached && current.right.reached ) {
                    current.reached = true;
                    // console.log('reached');
                    break;
                } else {
                    // console.log('else');
                    break;
                }
                

            }
        }
    }
    // console.log(tree.nodes);
    // console.log(alphabetmap);
    // console.log(acode);
    return alphabetmap;
}

function encoding_maxmin( amap ) {
    let encodinglen = [];
    for ( let a of amap.values()) {
        encodinglen.push(a.encoding.length);
    }
    return [ Math.max(...encodinglen), Math.min(...encodinglen) ]  ;
    
    // return encodinglen;
}


// let passtest = test_single_case(infiles,outfiles,'random', 1, testcases_path, '\n');

if (runtype === 'testcases') {
    let ntests = infiles.length;
    let nfails = 0;

    for (let i=1;i<ntests; i++){
        let passtest = test_single_case(infiles,outfiles,'random', i, testcases_path);
        if (!passtest) { nfails++; }
    }
    console.log(`failed ${nfails} of ${ntests}`)
} else if (runtype === 'full-graph') {
    
    // run algorithm
    let huffmantree = huffman_tree(alphabet);

    // console.log(huffmantree.nodes);

    // console.log(alphabet);
    
    let alphabetmap = huffman_code( huffmantree, alphabet );

    let encodinglengths = encoding_maxmin( alphabetmap );
    console.log(encodinglengths);
}