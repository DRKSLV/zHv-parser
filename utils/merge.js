const landkreise = require("../wikidata/landkreise.json");
const bundesländer = require("../wikidata/bundesländer.json");

for (let i in landkreise) {
    let k = landkreise[i];
    console.log(i.substr(0, 2));
    let bundesland = bundesländer[i.substr(0, 2)];

    bundesland.k = {...(bundesland.k || {}), [i.substr(2)]: k };
}

console.log(JSON.stringify(bundesländer));