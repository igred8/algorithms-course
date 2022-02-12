// load csv into array
const fs = require('fs');
const { get, globalAgent } = require('http');
// for timing functions
const { performance } = require('perf_hooks');
const { getHeapSpaceStatistics } = require('v8');

async function timeFunc(callback) {

    let t1 = performance.now();
    await callback();
    let t2 = performance.now();

    // let delt = 1e-6 * Math.round((t2 - t1) * 1e3);
    let delt = 1e-3 * (t2 - t1);
    console.log(`execution time: ${delt.toFixed(3)} s`);
}

function checkDefaultOptions(options, defaultOptions) {
    // set to default options if undefined or missing
    if (options === undefined) {
        var options = defaultOptions;
    } else {
        
        for (let opt of Object.keys(defaultOptions)) {
            if (!options.hasOwnProperty(opt)) {
                options[opt] = defaultOptions[opt];
            }
        }
    }
    return options;
}

function removeEmpty(array, emptytype='') {
    // remove empty elements
    let posnull = array.indexOf(emptytype);
    
    while ( posnull >= 0 ) {
        array.splice(posnull,1);
        posnull = array.indexOf(emptytype);
        // console.log(posnull);
        
    }
    return array;
}

function computeMaxCallStackSize() {
    try {
        return 1 + computeMaxCallStackSize();
    } catch (e) {
        // Call stack overflow
        console.log('max call stack reached');
        return 1;
    }
}

exports.timeFunc = timeFunc;
exports.checkDefaultOptions = checkDefaultOptions;
exports.removeEmpty = removeEmpty;
exports.computeMaxCallStackSize = computeMaxCallStackSize;


class Node {

    constructor(name) {
        this.name = name;
        this.explored = false;
        this.finishtime = -1; // finish time for topological sort
        this.scclabel = -1; // label for strongly connected component
        this.edges = []; // outgoing node names
        this.edgelen = new Map(); // lengths of outgoing edges
        this.dscore = 1e9; // dijkstra score
        this.bitname = null;
    }

}

class Edge {
    constructor(start, end, cost, name='none') {
        this.name = name;
        this.start = start;
        this.end = end;
        this.cost = cost;
    }
}

class Graph {

    constructor(graphtype) {
        this.graphtype = graphtype;
        this.graph = new Map(); // Map object is optimized for fast insert/delete. Object is slow.
        this.graphReverse = new Map(); // Map object is optimized for fast insert/delete. Object is slow.
        this.toposortlist = [];
        this.sccsizelist = [];
        this.defaultOptions = {  'debugmsg': false
                                ,'debugiter': 1e8
                                };
    }

    addNode(graph, vertex) {
        graph.set( vertex, new Node(vertex) );
    }

    addEdge(graph, edge_start, edge_end, edge_length) {
        graph.get(edge_start).edges.push(edge_end);
        graph.get(edge_start).edgelen.set(edge_end, edge_length);
        if (this.graphtype === 'undirected') {
            if (!this.graph.get(edge_end).edges.includes(edge_start)) {
                graph.get(edge_end).edges.push(edge_start);
                graph.get(edge_end).edgelen.set(edge_start, edge_length);
            }
        }
    }

    removeEdge(graph, edge_start, edge_end) {
        // remove the edge from the adjacency list of the start node
        let indextemp = graph.get(edge_start).indexOf(edge_end);
        graph.get(edge_start).splice(indextemp, 1);
    }

    removeNode(graph, vertex) {

        // O(n+m)

        for (let node of graph.keys()) {
            let vertexindex = graph.get(node).edges.indexOf(vertex);
            if ( vertexindex >= 0) {
                graph.get(node).edges.splice(vertexindex, 1);
            }
        }

        // remove vertex key
        graph.delete(vertex);
        
    }

    makeGraph(data, graphformat, options) {
        
        if (graphformat === 'edges') {
            // for each edge -> O(num edges)
            for (let row of data) {

                if (options.reverseGraph) {
                    let edge_start = row[1];
                    let edge_end = row[0];

                    if (this.graphReverse.has(edge_start) ) {
                        // console.log('key exists');
                        this.graphReverse.get(edge_start).edges.push(edge_end);
                    } else {
                        // console.log('key does not exist');
                        this.addNode(this.graphReverse, edge_start);
                        this.graphReverse.get(edge_start).edges.push(edge_end);
                    }
                    
                    // catch sink nodes
                    if (!this.graphReverse.has(edge_end)){
                        this.addNode(this.graphReverse, edge_end);
                    }
                    
                } else {
                    let edge_start = row[0];
                    let edge_end = row[1];
                    
                    if (this.graph.has(edge_start) ) {
                        // console.log('key exists');
                        this.graph.get(edge_start).edges.push(edge_end);
                    } else {
                        // console.log('key does not exist');
                        this.addNode(this.graph, edge_start);
                        this.graph.get(edge_start).edges.push(edge_end);
                    }
                    
                    // catch sink nodes
                    if (!this.graph.has(edge_end)){
                        this.addNode(this.graph, edge_end);
                    }
                
                }    
            }

        } else if (graphformat === 'node-nodes') {

            for (let row of data) {

                row = removeEmpty(row);
                let edge_start = row[0];
                let edges = row.slice(1);
                this.addNode(edge_start);
                this.graph.get(edge_start).edges = edges;
            }
        } else if (graphformat === 'edge-length') {
            for (let row of data) {

                let node = row[0];
                this.addNode(this.graph, node);

                for (let tupstr of row.slice(1)) {
                    let el = tupstr.split(',');
                    let e = parseInt(el[0]);
                    let l = parseInt(el[1]);
                    this.graph.get(node).edgelen.set(e, l);
                    
                    // catch sink nodes
                    if (!this.graph.has(e)){
                        this.addNode(this.graph, e);
                    }
                }
            }
        } else if (graphformat === 'edge-len-undir') {
            // this.graphtype = 'undirected';
            for (let row of data) {
                let [node_start, node_end, edge_len] = row;
                // console.log({node_start, node_end, edge_len});
                if (!this.graph.has(node_start)) {
                    this.addNode(this.graph, node_start);
                }
                if (!this.graph.has(node_end)) {
                    this.addNode(this.graph, node_end);
                }
                this.addEdge(this.graph, node_start, node_end, edge_len);

            }
        } else if (graphformat === 'node-undir') {
            for (let [i,row] of data.entries()) {
                let node = new Node(i);
                node.bitname = row;
                // this.addNode(this.graph, node);
                this.graph.set( i, node );

            }
        }

    }

    resetExplored(graph) {
        // reset the graph to unexplored
        for (let node of graph.keys() ) {
            graph.get(node).explored = false;
            graph.get(node).finishtime = -1; // finish time for topological sort
            graph.get(node).scclabel = -1; // label for strongly connected component
            graph.get(node).dscore = 1e9; // dijkstra score

        }
    }

    bfs(graph, node_start, options) {
        // BFS

        options = checkDefaultOptions(options, this.defaultOptions);
        
        this.resetExplored(graph); // reset explored property to false

        // breadth first search starting at node_start
        graph.get(node_start).distance = 0;
        let nodelist = [node_start]; // FIFO structure
        let bfstree = new Set(); // set structure for the bfs-tree 
        let i = 0;
        while (nodelist.length > 0 && i<options.debugiter) {

            let n = nodelist.shift(); // removes the first element
            graph.get(n).explored = true;
            bfstree.add(n); // add to BFS tree
            
            if (options.debugmsg) {
                console.log('=== new while iter ===')
                console.log(`node: ${n}`);
                console.log(nodelist);
                console.log(bfstree);
            }
            
            for (let e of graph.get(n).edges) {
                if (!bfstree.has(e)) {
                    
                    graph.get(e).distance = graph.get(n).distance + 1;
                    nodelist.push(e);

                    if (options.debugmsg) {
                        console.log(`node = (${e}) --- distance = ${this.graph.get(e).distance}`);
                    }

                }
                
                
            }
            i++;            
        }
        return bfstree;
    }

    bfsStrongConnect(graph, graphRev, options) {
        // for a starting node, s, perform a BFS on G followed by a BFS on G-rev to determine strongly connected set for s. 
        options = checkDefaultOptions(options, this.defaultOptions);
        
        // track strongly connected components (SCC)
        let gscc = [new Set()]; // array of graph's scc sets

        for (let node of graph.keys() ) {
            // do BFS starting with next unexplored node
            let nodeinscc = false;
            for (let scc of gscc) {
                
                if (scc.has(node)) { nodeinscc = true; }
            }

            if (!nodeinscc) {
                if (options.debugmsg) {console.log(node);}

                let conngfwd = this.bfs(graph, node); // forward BFS connected to node
                let conngrev = this.bfs(graphRev, node); // reverse BFS connected to node
                // intersection of both sets
                let nodescc = new Set( [...conngfwd].filter( x => conngrev.has(x) ) );
                // add to graph scc array
                gscc.push(nodescc);
            }
        }

        return gscc;

    }

    dfs(graph, node_start, options) {
        // depth first search starting at node_start
        options = checkDefaultOptions(options, this.defaultOptions);

        this.resetExplored(graph); // reset explored property to false

        graph.get(node_start).distance = 0;
        let nodelist = [node_start]; // LIFO/stack structure
        let dfstree = new Set(); // set structure for the connected region
        let i = 0;

        while (nodelist.length > 0 && i<options.debugiter) {
            let n = nodelist.pop(); // pop last node
            graph.get(n).explored = true;
            dfstree.add(n); // add n to DFS tree

            if (options.debugmsg) {
                console.log('=== new while iter ===')
                console.log(`node: ${n}`);
                console.log(nodelist);
                console.log(dfstree);
            }

            for (let [j, e] of graph.get(n).edges.entries()) {
                if (!dfstree.has(e)) {

                    graph.get(e).distance = graph.get(n).distance + 1 ;
                    nodelist.push(e);

                    if (options.debugmsg) {
                        console.log(`node = (${e}) --- distance = ${this.graph.get(e).distance}`);
                    }
                }
            }

            i++;

        }

        return dfstree;
    }

    async dfsRecTopo(graph, node, finishtime, toposortlist, options) {
        // DFS implemented recursively
        // needs async/await, otherwise runs over the max call stack for large graphs

        options = checkDefaultOptions(options, this.defaultOptions);

        graph.get(node).explored = true;
        graph.get(node).finishtime = finishtime;
        toposortlist.push(node);

        for (let edge of graph.get(node).edges) {
            if (!graph.get(edge).explored) {
                // RECURSIVE CALL
                await this.dfsRecTopo(graph, edge, finishtime, toposortlist, options);

                if (options.debugmsg) {
                    console.log(`node: ${node}\nedge: ${edge}`)
                }
            }            
        }
    }

    async dfsRecSCC(graph, node, sccnumber, options) {
        // DFS implemented recursively
        // needs async/await, otherwise runs over the max call stack for large graphs

        options = checkDefaultOptions(options, this.defaultOptions);

        // let connected = new Set(); // DFS connected component
        graph.get(node).explored = true;
        // connected.add(node);
        graph.get(node).scclabel = sccnumber;
        
        for (let edge of graph.get(node).edges) {
            if (!graph.get(edge).explored) {
                
                // RECURSIVE CALL
                await this.dfsRecSCC(graph, edge, sccnumber, options);

                if (options.debugmsg) {
                    console.log(`node: ${node}\nedge: ${edge}`)
                }
            }            
        }
    }

    async topoSort(graph, options) {
        // topological sort using DFS

        options = checkDefaultOptions(options, this.defaultOptions);

        if (options.debugmsg) {
            console.log(`hi, this is topoSort()`)
        }

        this.resetExplored(graph); // reset explored property to false

        let finishtime = graph.size + 1;
        let toposortlist = [];

        async function dfs(node, options) {
            // local scope DFS that can use finishtime and toposortlist local variables

            graph.get(node).explored = true;
            
            
            for (let edge of graph.get(node).edges) {
                if (!graph.get(edge).explored) {
                    // RECURSIVE CALL
                    await dfs(edge, options);
    
                    if (options.debugmsg) {
                        console.log(`node: ${node} // edge: ${edge} // finishtime ${finishtime-1}`)
                    }
                }            
            }
            // assignment of finish time has to be after the recursive call
            graph.get(node).finishtime = --finishtime;
            toposortlist.push(node);

        }

        for (let node of graph.keys()) {
            if (!graph.get(node).explored) {
                if (options.debugmsg) {
                    console.log(`finish time = ${finishtime}`);
                    console.log(toposortlist);
                }
                
                await dfs(node, options);
                // await this.dfsRecTopo(graph, node, finishtime, toposortlist, options);

            }
        }
        this.toposortlist = toposortlist.reverse();
    }

    async kosarajuSCC(options) {
        // find the strongly connected components using DFS and topological sort
        // assumes this.graph and this.graphReverse are valid directed graphs

        options = checkDefaultOptions(options, this.defaultOptions);

        if (options.debugmsg) {
            console.log(`hi, this is kosarajuSCC()`)
        }

        // sort topologically on the reversed graph
        await this.topoSort(this.graphReverse, options);
        
        if (options.debugmsg) {
            console.log(this.toposortlist);
            console.log(this.graph.get(4));

        }

        let sccnumber = 0;
        let sccsize = 0;
        let sccsizelist = [];

        async function dfs(graph, node, options) {
            // local scope DFS that can use local variables

            graph.get(node).explored = true;
            graph.get(node).scclabel = sccnumber;
            ++sccsize;
            
            for (let edge of graph.get(node).edges) {
                if (!graph.get(edge).explored) {
                    // RECURSIVE CALL
                    await dfs(graph, edge, options);
    
                    if (options.debugmsg) {
                        console.log(`node: ${node} // edge: ${edge}`)
                    }
                }            
            }
        } 

        for (let node of this.toposortlist) {
            sccsize = 0;
            if (options.debugmsg) {console.log(`node = ${node}`)}
            if (!this.graph.get(node).explored) {

                ++sccnumber;
                // ++sccsize;
                if (options.debugmsg) {
                    console.log('not explored');
                    console.log(`sccnumber = ${sccnumber}`)
                }
                
                await dfs(this.graph, node, options);
                // await this.dfsRecSCC(this.graph, node, sccnumber, options);

                sccsizelist.push(sccsize);
            }
        }
        this.sccsizelist = sccsizelist;
    }

    dijkstra(graph, node_start, node_end, options) {
        // naive implementation of Dijkstra's algorithm (no heaps)

        options = checkDefaultOptions(options, this.defaultOptions);

        function dScore(nodecurrent, nodenext) {
            return graph.get(nodecurrent).dscore + graph.get(nodecurrent).edgelen.get(nodenext);
        }

        // let nodepath = new Set([node_start]); // init explored set
        let explorednodes = [node_start]; // init explored set
        graph.get(node_start).dscore = 0; // set dscore for start node
        

        // keep track of edges in explored
        let outedges = [];
        
        let nodecurrent = node_start;
        
        let witer = 0;

        let mindscore = 1e9;
        let minedge = null;

        while (true) {
            
            
            if (options.debugmsg){
                console.log(`=====\nwhile loop at node: ${nodecurrent}`);
            }
            
            // for each edge of nodecurrent check dscore and selct min as next node
            for (let [edge,len] of graph.get(nodecurrent).edgelen) {
                
                let dscoretemp = dScore(nodecurrent, edge);
                if (dscoretemp < graph.get(edge).dscore) {
                    graph.get(edge).dscore = dscoretemp; // update dscore for reachable nodes
                    outedges.push([nodecurrent, edge]);
                }
                
                if (options.debugmsg){
                    console.log(`for loop at edge: ${edge}`);
                }

                
            }
            
            mindscore = 1e9; // needs reset on every while iteration
            let minnode = null;
            for (let [n,e] of outedges) {

                if ( graph.get(e).dscore < mindscore && !explorednodes.includes(e) ) {
                    mindscore = graph.get(e).dscore;
                    minedge = e;
                    minnode = n;

                    if (options.debugmsg) {
                        console.log({minnode, minedge, mindscore});
                    }
                }
            }

            // add min dscore edge to explored
            explorednodes.push(minedge);
            
            // let i = outedges.findIndex( (x) => { x.edge === minedge } );
            if ( options.debugmsg ) {
                // console.log(`min d-score = ${mindscore}`);
                console.log('outward edges:');
                console.log(outedges);
            }

            let mini = outedges.findIndex( (x) => {return (x[0] === minnode && x[1] === minedge)});
            
            outedges.splice(mini, 1); // remove the edge with min dscore from outward edges list
            
            // make minedge the current node
            nodecurrent = minedge;

            if (options.debugmsg) {
                
                console.log(`mini = ${mini}`);
                console.log({minedge, mindscore});
                // console.log('explored nodes:');
                // console.log(explorednodes);
                console.log('outward edges:');
                console.log(outedges);

            }
            witer++
            // end while loop
            if (nodecurrent === node_end) { break };
            if (outedges.size >= graph.size) { break };
            if (mindscore === 1e9) { break };

            // if (witer === 3) { break };


        }
        return explorednodes;
    }

}




class Heap {
    // heap structure 
    constructor(method='min') {
        this.array = [];
        this.size = 0; // length of the heap array
        this.method = method;
        this.defaultOptions = {  'debugmsg': false
                                ,'debugiter': 1e8
                                };
    }

    add(val, options) {

        options = checkDefaultOptions(options, this.defaultOptions);

        // push value
        this.array.push(val);
        this.size = this.array.length;
        let childindex = this.size - 1;
        
        let valcheck = null; // init valcheck to switch min/max method
        
        // heapify up
        while (childindex > 0) {
            
            let parentindex = Math.floor((childindex - 1) / 2);
            let parentval = this.array[parentindex];
            
            if (options.debugmsg) {
                console.log({parentindex, childindex});
                console.log({parentval, val});
            }
            
            if (this.method === 'min') {
                valcheck = (parentval > val);
            } else if (this.method === 'max') {
                valcheck = (parentval < val);
            } else {
                console.log('ERROR! Invalid heap method. Must be one of: ["min", "max"]. ');
                break;
            }

            if (valcheck) {
                // swap
                this.array[parentindex] = val;
                this.array[childindex] = parentval;
                // update childindex
                childindex = parentindex;
            } else {
                break;
            }
        }
    }

    heapify(array, options) {
        // make a heap out of an array 
        options = checkDefaultOptions(options, this.defaultOptions);

        for (let val of array) {
            this.add(val, options);
        }
    }

    extract(options) {
        // extract the root (min or max) and redistribute tree/array to maintain heap
        let extractval = this.array[0];
        let endval = this.array.pop();
        this.size = this.array.length;
        this.array[0] = endval;
        let parentindex = 0;

        let childindex = null;
        let childval = null;

        // heapify down
        while (true) {
            // compare the children values
            let c1index = 2*parentindex + 1;
            let c2index = 2*(parentindex + 1);
            // console.log({c1index, c2index});
            if (c1index >= this.size) {
                // only one key in heap. nothing to do.
                break;
            } 

            if (this.method === 'min') {
                // decide which child to compare to 
                if (this.array[c1index] < this.array[c2index] || c2index >= this.size) {
                    childindex = c1index;
                    childval = this.array[c1index];
                } else {
                    childindex = c2index;
                    childval = this.array[c2index];
                }

                if (childval < endval) {
                    // swap 
                    this.array[childindex] = endval;
                    this.array[parentindex] = childval;
                    parentindex = childindex;
                    
                } else {
                    break;
                }

            } else if (this.method === 'max') {
                // max child bubble up
                // decide which child to compare to 
                if (this.array[c1index] > this.array[c2index] || c2index >= this.size) {
                    
                    childindex = c1index;
                    childval = this.array[c1index];
                } else {
                    childindex = c2index;
                    childval = this.array[c2index];
                }

                if (childval > endval) {
                    // swap 
                    this.array[childindex] = endval;
                    this.array[parentindex] = childval;
                    parentindex = childindex;
                    
                } else {
                    break;
                }
            }


        }
        return extractval;
    }

    rootval() {
        return this.array[0];
    }
}

class HeapPriority {
    // heap structure using a given property as comparison
    constructor(compareprop, method='min') {
        this.array = [];
        this.size = 0; // length of the heap array
        this.compareprop = compareprop; // the property of the objects to use for comparison
        this.method = method;
        this.defaultOptions = {  'debugmsg': false
                                ,'debugiter': 1e8
                                };
    }

    add(obj, options) {

        options = checkDefaultOptions(options, this.defaultOptions);

        // push value
        this.array.push(obj);
        this.size = this.array.length;
        let childindex = this.size - 1;
        
        let valcheck = null; // init valcheck to switch min/max method
        
        // heapify up
        while (childindex > 0) {
            
            let parentindex = Math.floor((childindex - 1) / 2);
            let parentobj = this.array[parentindex];
            
            if (options.debugmsg) {
                console.log({parentindex, childindex});
                console.log({parentobj, obj});
            }
            
            if (this.method === 'min') {
                valcheck = (parentobj[this.compareprop] > obj[this.compareprop]);
            } else if (this.method === 'max') {
                valcheck = (parentobj[this.compareprop] < obj[this.compareprop]);
            } else {
                console.log('ERROR! Invalid heap method. Must be one of: ["min", "max"]. ');
                break;
            }

            if (valcheck) {
                // swap
                this.array[parentindex] = obj;
                this.array[childindex] = parentobj;
                // update childindex
                childindex = parentindex;
            } else {
                break;
            }
        }
    }

    heapify(array, options) {
        // make a heap out of an array 
        options = checkDefaultOptions(options, this.defaultOptions);

        for (let obj of array) {
            this.add(obj, options);
        }
    }

    extract(options) {
        options = checkDefaultOptions(options, this.defaultOptions);

        // extract the root (min or max) and redistribute tree/array to maintain heap
        let extractobj = this.array[0];
        let endobj = this.array.pop();
        this.size = this.array.length;
        if (this.size === 0) { 
            return extractobj;
        }
        this.array[0] = endobj;
        let parentindex = 0;

        let childindex = null;
        let childobj = null;

        // heapify down
        while (true) {
            // compare the children values
            let c1index = 2*parentindex + 1;
            let c2index = 2*(parentindex + 1);
            // console.log({c1index, c2index});
            if (c1index >= this.size) {
                // only one key in heap. nothing to do.
                break;
            } 

            let c1obj = this.array[c1index];
            let c2obj = this.array[c2index];
            if (options.debugmsg) {
                console.log(this.size);
                console.log({c1index, c2index});
                console.log({c1obj, c2obj});
            }

            if (this.method === 'min') {
                // decide which child to compare to 
                // note order of truth statements otherwise errors since c2obj can be undef
                if ( c2index >= this.size || c1obj[this.compareprop] < c2obj[this.compareprop]) {
                    childindex = c1index;
                    childobj = c1obj;
                } else {
                    childindex = c2index;
                    childobj = c2obj;
                }

                if (childobj[this.compareprop] < endobj[this.compareprop]) {
                    // swap 
                    this.array[childindex] = endobj;
                    this.array[parentindex] = childobj;
                    parentindex = childindex;
                    
                } else {
                    break;
                }

            } else if (this.method === 'max') {
                // max child bubble up
                // decide which child to compare to 
                // note order of truth statements otherwise errors since c2obj can be undef
                if ( c2index >= this.size || c1obj[this.compareprop] > c2obj[this.compareprop] ) {
                    childindex = c1index;
                    childobj = c1obj;
                } else {
                    childindex = c2index;
                    childobj = c2obj;
                }

                if (childobj[this.compareprop] > endobj[this.compareprop]) {
                    // swap 
                    this.array[childindex] = endobj;
                    this.array[parentindex] = childobj;
                    parentindex = childindex;
                    
                } else {
                    break;
                }
            }


        }
        return extractobj;
    }

    rootobj() {
        return this.array[0];
    }
}

class _NodeUF {
    // private class to be used with UnionFind
    constructor(name, parent, obj) {
        this.name = name;
        this.parent = parent;
        this.size = 1; // how many nodes connect to this node including itself
        this.object = obj;
    }
}

class UnionFind {

    constructor() {
        this.objmap = new Map(); // hashtable of objects
        this.parents = new Set(); // all parents, updated in find and union

    }

    make(objarray, nameprop='none') {

        try {
            // try to infer the name property of the objects in the array
            if (nameprop === 'none'){
                nameprop = Object.getOwnPropertyNames(objarray[0])[0];
            }
        } catch (err) {
            console.error(err);
        }

        for (let obj of objarray) {
            this.objmap.set(obj[nameprop], new _NodeUF(obj[nameprop], obj[nameprop], obj ));
            this.parents.add(obj[nameprop]);
        }
    }

    find(name) {
        // find the group to which name belongs to
        let groupname = null;
        let nodescontract = new Set();
        let stopwhile = 0;
        while (true && (stopwhile < this.objmap.size)) {

            if (this.objmap.get(name).name === this.objmap.get(name).parent) {
                groupname = this.objmap.get(name).name;
                // console.log('reached self-referential parent')
                break;
            } else {
                // nodes to be contracted
                nodescontract.add(name);

            }
            name = this.objmap.get(name).parent;
            stopwhile++;
        }

        // path contraction
        for (let leaf of nodescontract) {
            this.objmap.get(leaf).parent = groupname;
            this.parents.delete(leaf); // delete this leaf from parents set
        }
        
        return groupname;
    }

    union(name1, name2) {
        // unify the groups containing name1 and name2
        let gsmall = this.find(name1);
        let gbig = this.find(name2);

        if (gsmall !== gbig) {
            if (this.objmap.get(gsmall).size > this.objmap.get(gbig).size) {
                // rename
                gsmall = this.find(name2);
                gbig = this.find(name1);              
            }
            // make smaller size group be child to bigger
            this.objmap.get(gsmall).parent = gbig;
            // update size of bigger group
            this.objmap.get(gbig).size += this.objmap.get(gsmall).size;
            // delete gsmall from parents list
            this.parents.delete(gsmall);
            return 1;
        }

        return 0;
    }

}

exports.Node = Node;
exports.Edge = Edge;
exports.Graph = Graph;
exports.Heap = Heap;
exports.HeapPriority = HeapPriority;
exports.UnionFind = UnionFind;