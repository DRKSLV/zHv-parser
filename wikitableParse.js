const data = require("./ttest.json");

var res = {};

data.forEach((row) => {
    res[row[0]] = {n: row[1]};
});

console.log(JSON.stringify(res));