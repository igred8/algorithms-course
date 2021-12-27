const range = (start, stop, step) => Array.from(
    { length: (stop - start) / step + 1}
    , (_, i) => start + (i * step)
    );


let xvec = range(1,100,1);
let yvec = Array.from(xvec, x=> 2**Math.log(x));

var trace1 = {
    x: xvec,
    y: yvec,
    type: 'scatter',
    name: '2**logN'
  };
  
  yvec = Array.from( xvec, x => 2**(2**Math.log(x)) );
  var trace2 = {
    x: xvec,
    y: yvec,
    type: 'scatter',
    name: '2**2**logN'
  };

  yvec = Array.from( xvec, x => x**(5/2) );
  var trace3 = {
    x: xvec,
    y: yvec,
    type: 'scatter',
    name: 'N**(5/2)'
  };

  yvec = Array.from( xvec, x => 2**(x**2) );
  var trace4 = {
    x: xvec,
    y: yvec,
    type: 'scatter',
    name: '2**N**2'
  };
  yvec = Array.from( xvec, x => (x**2)*Math.log(x) );
  var trace5 = {
    x: xvec,
    y: yvec,
    type: 'scatter',
    name: '(N**2)*logN'
  };
  
  var data = [trace1
            // , trace2
            , trace3
            // , trace4
            , trace5
        ];
  
  Plotly.newPlot('myDiv', data);
  