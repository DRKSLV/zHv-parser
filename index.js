//// TYPES
/**
 * @typedef Haltestelle
 * @property {String} n name
 * @property {String} i haltestellen id (der letzte teil der DHID, erster teil ist "de", zweiter landkreisschlüssel )
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











