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
        this.distance = -1;
        this.finishtime = -1;
        this.scclabel = -1;
        this.edges = []; // outgoing node names
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

    addEdge(graph, edge_start, edge_end) {
        graph.get(edge_start).edges.push(edge_end);
        if (this.graphtype === 'undirected') {
            if (!this.graph.get(edge_end).edges.includes(edge_start)) {
                graph.get(edge_end).edges.push(edge_start);
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
        }

    }

    resetExplored(graph) {
        // reset the graph to unexplored
        for (let node of graph.keys() ) {
            graph.get(node).explored = false;
            graph.get(node).distance = -1;

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


}

class Heap {
    // heap structure 
    constructor() {
        this.array = [];
        
    }
}

exports.Node = Node;
exports.Graph = Graph;
