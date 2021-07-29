const fs = require("fs");
const data = fs.readFileSync( "./rawdata/"+process.argv[2] ).toString("utf8");

/**
 * Alle Haltestellen 
 * @type {Object.<string, Haltestelle>}
 */
const ZHV = {};

/**
 * Alle Gemeinden
 * @type {Object.<number, Municipality>}
 */
const Municipalities = {};

/** @type {Array.<String>} */
const Authorities = [];


var anzStationen = 0, anzMasten = 0, anzBereiche = 0;

/**
 * @typedef Haltestelle
 * @property {String} n name
 * @property {String} d dauerhafte haltestellen id
 * @property {LatLon} c coords
 * @property {Number} m Municipality id:  bbkkksss  [b=bundesland, k=kreisid, s=stadtid] ( https://de.wikipedia.org/wiki/Amtlicher_Gemeindeschl%C3%BCssel)
 * @property {Number} di District id
 * @property {String} a authority (avv, etc)
 * @property {String} des description
 * @property {Boolean} s is serviced? (if not defined, read as true)
 */

/**
 * @typedef LatLon
 * @property {Number} lat latitude
 * @property {Number} lon longitude
 */

/**
 * @typedef Municipality
 * @property {String} n name
 * @property {Object.<Number, String>} dists districts
 * @property {Array.<String>} auths authorities reporting stops for this Municipality
 */

/**
 * 
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
        c: {} // to be able to assign without error
    };
    var entryType;
    var entryParent;
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
                return  entryObject.d = field;
            case "Name":
                return entryObject.n = field;
            case "Longitude":
                return entryObject.c.lon = Number.parseFloat(field);
            case "Latitude":
                return entryObject.c.lat = Number.parseFloat(field);
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
                return entryObject.di = Number.parseInt(field) || undefined;
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
    //console.log(entryType);
    switch(entryType) {
        case "S": // HAltestelle
            ZHV[entryObject.d] = entryObject;
            anzStationen++;
            break;
        case "A": // bereich
            //console.log("Ignoring BEreich")
            anzBereiche++;
            break;
        case "Q": // mast/steig
            anzMasten++;
            //console.log("Ignoring Steig")
            break;
    }

    // assign extracted municipality
    if(municipality.val){
        var bef = Municipalities[municipality.key];
        var befD = {};
        if(bef) {
            befD = bef.dists;
        }
        if(district.val)
            befD[district.key] = district.val;

        
        Municipalities[municipality.key] = {
            n: municipality.val,
            dists: befD
        }
    }
})
console.log(
`Converted:
    ${anzStationen} Stationen
    ${anzMasten} H-Masten/Gleise
    ${anzBereiche} Bereiche
`)


console.log("Saving...")
fs.writeFileSync("./refineddata/stations.json", JSON.stringify(ZHV));
fs.writeFileSync("./refineddata/municipalities.json", JSON.stringify(Municipalities));
fs.writeFileSync("./refineddata/authorities.json", JSON.stringify(Authorities));

console.log("Saving Debug...")


fs.writeFileSync("./refineddata/stationsDebug.json", debugJSON(ZHV));
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