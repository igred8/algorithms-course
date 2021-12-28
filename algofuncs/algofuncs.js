// load csv into array
const fs = require('fs');
// const cheerio = require('cheerio');
const jcsv = require('jquery-csv');
// for timing functions
const { performance } = require('perf_hooks');


function removeEmpty(array) {
    // remove empty elements
    let posnull = array.indexOf('');
    
    while ( posnull >= 0 ) {
        array.splice(posnull,1);
        posnull = array.indexOf('');
        // console.log(posnull);
        
    }
    return array;
}

function makeGraph(data, graphformat) {

    
    if (graphformat === 'node-nodes') {
        var graph = {};
        for (let row of data) {
            row = row.split('\t');
            // console.log(row);
            let vertex = parseInt(row[0]);
            let edges = row.slice(1);
            edges = removeEmpty(edges);
            for (let [i,e] of edges.entries()) {
        
                edges[i] = parseInt(e);
        
            }
            // console.log(`vertex = ${vertex}`);
            // console.log(`edges = ${edges}`);
            // console.log(edges);
            graph[vertex] = edges;
        }
    } else if (graphformat === 'edges') {
        var graph = new Map();

        for (let row of data) {
            row = row.split(' ');
            let vertex = row[0];
            let edge = row[1];
            // console.log(Object.keys(graph));

            // object keys are strings always
            if (graph.has(vertex) ) {
                // console.log('key exists');
                graph.get(vertex).push(edge);
            } else {
                // console.log('key does not exist');
                graph.set(vertex, [edge]);
            }
            
        }
    }

    return graph;
}

exports.removeEmpty = removeEmpty;
exports.makeGraph = makeGraph;

class Graph {

    constructor(graphtype) {
        this.graphtype = graphtype;
        this.nodes = new Map(); // Map object is optimized for fast insert/delete. Object is slow.
    }

    addNode(vertex) {
        this.nodes.set(vertex, []);
    }

    addEdge(edge_start, edge_end) {
        this.nodes.get(edge_start).push(edge_end);
        if (this.graphtype === 'undirected') {
            this.nodes.get(edge_end).push(edge_start);
        }
    }

    removeNode(vertex) {

        // go through adjacency list and remove edges
        // if undirected, have to remove both directions

        let node_adj_list = this.nodes.get(vertex);

        for (let edge_end of node_adj_list) {
            this.removeEdge(vertex, edge_end);
            if (this.graphtype === 'undirected') {
                this.removeEdge(edge_end, vertex);
            }
        }
        // finally delete the node key
        this.nodes.delete(vertex);
    }

    removeEdge(edge_start, edge_end) {
        // remove the edge from the adjacency list of the start node
        let indextemp = this.nodes.get(edge_start).indexOf(edge_end);
        this.nodes.get(edge_start).splice(indextemp, 1);
    }


    makeGraph(data, graphformat, separator=' ') {
        
        if (graphformat === 'edges') {
            // for each edge -> O(num edges)
            for (let row of data) {

                row = row.split(separator);
                let edge_start = row[0];
                let edge_end = row[1];
                
                if (this.nodes.has(edge_start) ) {
                    // console.log('key exists');
                    this.nodes.get(edge_start).push(edge_end);
                } else {
                    // console.log('key does not exist');
                    this.nodes.set(edge_start, [edge_end]);
                }
                
            }
        } else if (graphformat === 'node-nodes') {

            for (let row of data) {
                row = row.split(separator);
                row = removeEmpty(row);
                let edge_start = row[0];
                let edges = row.slice(1);
                this.nodes.set(edge_start, edges);
            }
        }

    }


}

exports.Graph = Graph;