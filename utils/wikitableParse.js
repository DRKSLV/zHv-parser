const data = require("./ttest.json");
// after fetching data with https://www.wikitable2json.com/ and trimming to just the relevant array
// then manual editing

var res = {};

data.forEach((row) => {
    res[row[0]] = {n: row[1]};
});

console.log(JSON.stringify(res));