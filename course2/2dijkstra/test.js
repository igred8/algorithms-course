let t = [];
for (let i=0; i<10; i++) {
    t.push({'x':i-2, 'y':i**2});
    // t.push([i, i**3]);
}

console.log(t.findIndex( (obj) => {return obj.x === 3; } ) );
