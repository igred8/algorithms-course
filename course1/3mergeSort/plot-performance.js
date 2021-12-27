const buttonRunTests = document.getElementById('runtests');
buttonRunTests.addEventListener('click', async event => {

    console.log('i have been clicked');
    
    // get performance from countInversions.js

    
    var trace1 = {
        x: nelevec,
        y: timeslowvec,
        type: 'scatter',
        name: 'N^2'
    };
      
    var trace2 = {
        x: nelevec,
        y: timemsvec,
        type: 'scatter',
        name: 'NlogN'
    };
    
    
    var data = [trace1
                , trace2
                // , trace3
                // , trace4
                // , trace5
            ];
      
    Plotly.newPlot('myDiv', data);
});
