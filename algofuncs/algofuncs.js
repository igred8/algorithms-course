// load csv into array
const fs = require('fs');
// const cheerio = require('cheerio');
const jcsv = require('jquery-csv');
// for timing functions
const { performance } = require('perf_hooks');


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


exports.removeEmpty = removeEmpty;


class Node {

    constructor(name) {
        this.name = name;
        this.explored = false;
        this.edges = []; // outgoing node names
    }



}

class Graph {

    constructor(graphtype) {
        this.graphtype = graphtype;
        this.graph = new Map(); // Map object is optimized for fast insert/delete. Object is slow.
        this.regions = [];
    }

    addNode(vertex) {
        this.graph.set( vertex, new Node(vertex) );
    }

    addEdge(edge_start, edge_end) {
        this.graph.get(edge_start).edges.push(edge_end);
        if (this.graphtype === 'undirected') {
            this.graph.get(edge_end).edges.push(edge_start);
        }
    }

    removeNode(vertex) {

        // go through adjacency list and remove edges
        // if undirected, have to remove both directions

        let node_adj_list = this.graph.get(vertex);

        for (let edge_end of node_adj_list) {
            this.removeEdge(vertex, edge_end);
            if (this.graphtype === 'undirected') {
                this.removeEdge(edge_end, vertex);
            }
        }
        // finally delete the node key
        this.graph.delete(vertex);
    }

    removeEdge(edge_start, edge_end) {
        // remove the edge from the adjacency list of the start node
        let indextemp = this.graph.get(edge_start).indexOf(edge_end);
        this.graph.get(edge_start).splice(indextemp, 1);
    }


    makeGraph(data, graphformat) {
        
        if (graphformat === 'edges') {
            // for each edge -> O(num edges)
            for (let row of data) {

                let edge_start = row[0];
                let edge_end = row[1];
                
                if (this.graph.has(edge_start) ) {
                    // console.log('key exists');
                    this.graph.get(edge_start).edges.push(edge_end);
                } else {
                    // console.log('key does not exist');
                    this.addNode(edge_start);
                    this.graph.get(edge_start).edges.push(edge_end);
                }
                
                // catch sink nodes
                if (!this.graph.has(edge_end)){
                    this.addNode(edge_end);
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

    bfs(node_start) {
        // breadth first search starting at node_start
        this.graph.get(node_start).explored = true;
        let nodelist = [ ...this.graph.get(node_start).edges ];
        let connected = new Set();
        connected.add(node_start);
        let nocycle = true; // catch cycles 
        while (nodelist.length > 0 && nocycle) {
            let nodei = nodelist.shift(); // removes the first element
            if (this.graph.get(nodei).explored) {
                if (!connected.has(nodei)) {
                    connected.add(nodei);
                }
                break;
            } else {
                this.graph.get(nodei).explored = true;
                connected.add(nodei);
                nodelist.push(...this.graph.get(nodei).edges);
            }
            
        }

        return connected;

    }

    bfsConnected() {
        // find the connected regions of the graph with BFS
         
        for (let node of this.graph.keys() ) {
            // do BFS starting with next unexplored node
            if (!this.graph.get(node).explored) {
                this.regions.push( this.bfs(node) );
            }
        }

    }
}

exports.Node = Node;
exports.Graph = Graph;