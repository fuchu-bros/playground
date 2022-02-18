const json = require('./log/램 8기가_2022021625009.json');

let result = [];

json.forEach(v => {
    v.details.forEach(([k]) => {
        if ( k && result.indexOf(k) === -1 ) {
            result.push(k);
        }
    });
});

console.log(result);
