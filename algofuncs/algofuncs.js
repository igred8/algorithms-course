// load csv into array
const fs = require('fs');
const { get } = require('http');
// for timing functions
const { performance } = require('perf_hooks');
const { getHeapSpaceStatistics } = require('v8');

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
        return 1;
    }
}

exports.checkDefaultOptions = checkDefaultOptions;
exports.removeEmpty = removeEmpty;
exports.computeMaxCallStackSize = computeMaxCallStackSize;


class Node {

    constructor(name) {
        this.name = name;
        this.explored = false;
        this.distance = -1;
        this.order = -1;
        this.edges = []; // outgoing node names
    }

}

class Graph {

    constructor(graphtype) {
        this.graphtype = graphtype;
        this.graph = new Map(); // Map object is optimized for fast insert/delete. Object is slow.
        this.graphReverse = new Map(); // Map object is optimized for fast insert/delete. Object is slow.
        this.regions = [];
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

    removeNode(graph, vertex) {

        // go through adjacency list and remove edges
        // if undirected, have to remove both directions

        let node_adj_list = graph.get(vertex);

        for (let edge_end of node_adj_list) {
            this.removeEdge(vertex, edge_end);
            if (this.graphtype === 'undirected') {
                this.removeEdge(edge_end, vertex);
            }
        }
        // finally delete the node key
        graph.delete(vertex);
    }

    removeEdge(graph, edge_start, edge_end) {
        // remove the edge from the adjacency list of the start node
        let indextemp = graph.get(edge_start).indexOf(edge_end);
        graph.get(edge_start).splice(indextemp, 1);
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

    bfs_old(graph, node_start, options) {
        // breadth first search starting at node_start
        graph.get(node_start).distance = 0;
        let nodelist = [node_start]; // FIFO structure
        let connected = new Set(); // set structure for the connected region
        let i = 0;
        while (nodelist.length > 0 && i < options.debugiter) {
            if (options.debugmsg) {
                console.log('=== new while iter ===')
                console.log(nodelist);
                console.log(connected);
            }
            
            let n = nodelist.shift(); // removes the first element
            
            if (options.debugmsg) {
                console.log(`exploring node: ${n}`);
                
            }
            
            if (connected.has(n)) {
                if (options.debugmsg) { 
                    console.log('reached explored node');
                }
                continue;
            } else {
                graph.get(n).explored = true;
                connected.add(n);
                // graph.get(n).distance = 0;
                for (let e of graph.get(n).edges) {
                    // console.log(e);
                    // graph.get(e).explored = true;
                    if (connected.has(e) || nodelist.includes(e)) {
                        if (options.debugmsg) {
                            console.log('connected set already has edge')
                        }
                        continue;
                    } else {
                        graph.get(e).distance = graph.get(n).distance + 1;
                        if (options.debugmsg) {
                            console.log(`node = (${e}) --- distance = ${this.graph.get(e).distance}`);
                        }
                        nodelist.push(e);
                    }
                }
            }
            // console.log(nodelist);
            i++;
        }

        return connected;

    }

    bfs(graph, node_start, options) {
        // BFS

        options = checkDefaultOptions(options, this.defaultOptions);
        
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


    dfs_old(graph, node_start, options) {
        // depth first search starting at node_start
        options = checkDefaultOptions(options, this.defaultOptions);

        graph.get(node_start).distance = 0;
        let nodelist = [node_start]; // LIFO/stack structure
        let connected = new Set(); // set structure for the connected region

        while (nodelist.length > 0) {
            if (options.debugmsg) {
                console.log(nodelist);
                console.log(connected);
            }
            
            let n = nodelist.pop(); // removes the last element
            
            if (options.debugmsg) {
                console.log(n);
                console.log(graph.get(n).distance);
                console.log('---');
            }
            
            if (connected.has(n)) {
                if (options.debugmsg) { console.log('reached explored node');}
                continue;
            } else {
                
                graph.get(n).explored = true;
                connected.add(n);

                for (let e of graph.get(n).edges) {
                    // console.log(e);
                    // graph.get(e).explored = true;
                    if (nodelist.includes(e) || connected.has(e)) {
                        if (options.debugmsg) {
                            console.log('connected set already has edge')
                        }
                        continue;
                    } else {
                        graph.get(e).distance = graph.get(n).distance + 1;
                        nodelist.push(e);
                        // connected.add(e);
                        if (options.debugmsg) { 

                            console.log(`node ${n}\ndistance: = ${graph.get(n).distance}`);
                            console.log(`edge ${e}\ndistance: = ${graph.get(e).distance}`);
                        }
                    }
                }

            }
            // console.log(nodelist);

        }

        return connected;
    }

    dfs(graph, node_start, options) {
        // depth first search starting at node_start
        options = checkDefaultOptions(options, this.defaultOptions);

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

    dfsRec(graph, node_start, options) {
        // DFS implemented recursively
        options = checkDefaultOptions(options, this.defaultOptions);

        let connected = new Set(); // DFS connected component
        graph.get(node_start).explored = true;
        connected.add(node_start);
        for (let e of graph.get(node_start).edges) {
            if (!graph.get(e).explored) {
                
                // RECURSIVE CALL
                let connRec = this.dfsRec(graph, e, options);
                // add elements to outer call connected
                for (let c of connRec) {
                    connected.add(c);
                }

                if (options.debugmsg) {
                    console.log(`node: ${node_start}\nedge: ${e}`)
                    console.log('connRec');
                    console.log(connRec);
                    console.log('connected');
                    console.log(connected);
                }

            }
        }


        return connected;

    }

    dfsRecursive(graph, node_start, options) {
        // DFS implemented recursively
        options = checkDefaultOptions(options, this.defaultOptions);

        let connected = new Set(); // DFS connected component
        // console.log(connected);

        if (!graph.get(node_start).explored) {
            graph.get(node_start).explored = true;
            connected.add(node_start);
            for (let edge of graph.get(node_start).edges) {
                let connectedRec = this.dfsRecursive(graph, edge);
                if (connectedRec.size > 0) {
                    for (let e of connectedRec) {
                        connected.add(e);
                    } 
                }
                if (options.debugmsg) {
                    console.log(`node: ${node_start}\nedge: ${edge}`)
                    console.log('connectedRec');
                    console.log(connectedRec);
                    console.log('connected');
                    console.log(connected);
                }
            }
        }

        return connected;
    }

    topoSort(node_start) {
        // topological sort using DFS

    }
}



exports.Node = Node;
exports.Graph = Graph;
