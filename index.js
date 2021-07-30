const fs = require("fs");
const data = fs.readFileSync( "./rawdata/"+process.argv[2] ).toString("utf8");

// command: node . zHV_aktuell_csv.2021-07-29.csv

/**
 * Alle Haltestellen 
 * @type {Object.<string, Haltestelle>}
 */
const Stations = {};

/**
 * Alle Gemeinden
 * @type {Object.<number, Municipality>}
 */
const Municipalities = {};

/** @type {Array.<String>} */
const Authorities = [];

// 7, 8
var anzStationen = 0, anzMasten = 0, anzBereiche = 0;

/**
 * @typedef Haltestelle
 * @property {String} n name
 * @property {String} i haltestellen id (der letzte teil der dhid, erster teil ist "de", zweiter landkreisschlüssel (property m) )
 * @property {[number, number]} c coords [latitude, longitude]
 * @property {number} m Municipality id:  bbkkksss  [b=bundesland, k=kreisid, s=stadtid] ( https://de.wikipedia.org/wiki/Amtlicher_Gemeindeschl%C3%BCssel)
 * @property {Number} d District id
 * @property {String} a authority (avv, etc)
 * @property {String} des description
 * @property {Boolean} s is serviced? (if not defined, read as true)
 * @property {Object.<string, Bereich>} b Bereiche (Quasi wie DateiOrdner für gleise und masten)
 */

/**
 * @typedef Bereich 
*  @property {String} n name
 * @property {[number, number]} c coords [latitude, longitude]
 * @property {String} des description
 * @property {Boolean} s is serviced? (if not defined, read as true)
 * @property {Object.<string, Gleis>} g Gleise/Masten 
 */

/**
 * @typedef Gleis 
*  @property {String} n name
 * @property {[number, number]} c coords [latitude, longitude]
 * @property {String} des description
 * @property {Boolean} s is serviced? (if not defined, read as true)
 */

/**
 * @typedef Municipality
 * @property {String} n name
 * @property {Object.<Number, String>} d districts
 * @property {Array.<String>} a authorities reporting stops for this Municipality
 */



// ROWS
var rows = data.split("\n");
console.log("Rows: ", rows.length);

// KEYS
var keys = [];

rows.forEach( (row, rowNum) => {
    row = row.replace("\r", "") ;

    /** @type {Haltestelle} */
    var entryObject = {
        c: [0, 0] // to be able to assign without error
    };
    var entryType;
    var entryParent;
    var entryId;
    var municipality = {};
    var district = {};

    row.slice(1, row.length-1).split('";"')
    .forEach((field, fieldNum) => {
        //KEYS: find  
        if(rowNum===0) {
            keys.push(field);
            return;
        }

        // ATTRIBUTES
        // current key
        const key = keys[fieldNum];
        // filter non-values
        if (field === "") field = undefined;
        if (field==="-") field= undefined;

        // assign field to current object
        switch (key) {
            case "DHID":
                entryObject.i = field.split(":").slice(2).reduce((p, c, i, a) => i>0?p+":"+c:c, "")
                return entryId = field;
            case "Name":
                return entryObject.n = field;
            case "Longitude":
                return entryObject.c[1] = Number.parseFloat(field.replace(",", "."));
            case "Latitude":
                return entryObject.c[0] = Number.parseFloat(field.replace(",", "."));
            case "Authority":
                var idx = Authorities.indexOf(field);
                if(idx === -1){
                    idx = Authorities.length;
                    Authorities.push(field);
                }
                return entryObject.a = idx;
            case "Description":
                return entryObject.des = field;
            case "Condition":
                return entryObject.s = field==="Served" ? undefined : false;
            case "MunicipalityCode":
                municipality.key = Number.parseInt(field);
                return entryObject.m = Number.parseInt(field);
            case "DistrictCode":
                district.key = Number.parseInt(field);
                return entryObject.d = Number.parseInt(field) || undefined;
            case "Municipality":
                return municipality.val = field;
            case "District":
                return district.val = field;
            case "Type":
                return entryType= field;
            case "Parent":
                return entryParent= field;
        }
    });

    //KEYS: found
    if(rowNum===0) {
        console.log("Keys: ", keys);
        return;
    }

    //ENTRY: (type?)
    
    if(entryType==="A" || entryType==="Q") { // remove duplicate info 
        delete entryObject.i;
        delete entryObject.a;
        delete entryObject.d;
        delete entryObject.m;
    }


    switch(entryType) {
        case "S": // HAltestelle
            Stations[entryId] = entryObject;
            anzStationen++;
            break;
        case "A": // bereich
            var splitt = entryId.split(":");
            var myid = splitt[splitt.length-1];
            var parent = Stations[entryParent] || {};

            Stations[entryParent] = {
                ...parent,
                b: { ...parent.b , [myid]: entryObject}
            }

            anzBereiche++;
            break;
        case "Q": // mast/steig
            var splitt = entryId.split(":");
            var superParentId = splitt.slice(0, 3).reduce((p, c, i, a) => i>0?p+":"+c:c, "") ;
            var parentId = splitt[splitt.length-2] || 0;
            var myid = splitt[splitt.length-1];
            //console.log(`id: ${entryId}; my: ${myid}; parent: ${parentId}; superParent: ${superParentId}` )

            var superParent = Stations[superParentId] || {};
            var parent = (superParent.b || {})[parentId] || {}

            Stations[superParentId] = {
                ...superParent,
                b: {
                    ...superParent.b || {},
                    [parentId]: {
                        ...parent,
                        g: {
                            ...parent.g || {},
                            [myid]: entryObject
                        }
                    }
                }
            };
            anzMasten++;
            break;
    }

    // assign extracted municipality
    if(municipality.val){
        var bef = Municipalities[municipality.key] || {};
        var befD = bef.d || {};
    
        if(district.val)
            befD[district.key] = district.val;

        var befA =(bef.a || []);
        if(!befA.includes(entryObject.a)) {
            befA.push(entryObject.a)
        }
        
        Municipalities[municipality.key] = {
            n: municipality.val,
            d: befD,
            a: befA
        }
    }
})
console.log(
`Converted:
    ${anzStationen} Stationen
    ${anzMasten} H-Masten/Gleise
    ${anzBereiche} Bereiche
In: 
    ${Object.keys(Municipalities).length} Gemeinden
`)


console.log("Saving...")
fs.writeFileSync("./refineddata/stations.json", JSON.stringify(Stations));
fs.writeFileSync("./refineddata/municipalities.json", JSON.stringify(Municipalities));
fs.writeFileSync("./refineddata/authorities.json", JSON.stringify(Authorities));

console.log("Saving Debug...")


fs.writeFileSync("./refineddata/stationsDebug.json", debugJSON(Stations));
fs.writeFileSync("./refineddata/municipalitiesDebug.json", debugJSON(Municipalities));



function debugJSON(obj) {
    if(typeof obj !== "object") return console.error("Must be object");

    var count=0;
    var max = Object.keys(obj).length;

    var out = "{";
    for ( let i in obj ) {
        count++;
        out += `"${i}":${JSON.stringify( obj[i] )} ${count<max?",":""} ${(count<300||count>max-300)?"\n":""}`
    }
    out+="}";

    return out;
}