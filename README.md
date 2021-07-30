# zHv-parser
Javascript-Parser des von DELFI e.V zusammengetragenen Zentralen Haltestellen Verzeichnisses (ZHV)

## API
kommt noch, hoffentlich
es ist grade 4 uhr morgens
also ruhe jetz, ja?

## JSON Format
Die klobige .csv Datei wird von dieser Repo in kleinere JSON-Dateien aufgespalten.
Diese dateien sind freundlicher für javascript und (pssst! sie passen auch unter die Github-Dateigrößeobergrenze!)
(Anmerkung: Die Variabelnamen sind meistens nur einzelne buchstaben, um die dateigröße klein zu halten)

Es folgt eine erklärung der einzelnen Dateien:


### `stations.json`
Enthält alle Haltestellen, Bereiche und Gleise/Halte-Masten 
(Bereiche werden zur gruppierung mehrerer Gleise genutzt, glaube ich)
Die Datei enthält ein Object/Dictionary, dass jeweils die DHID (Dauerhafte Haltestellen-Id) als "Key" und ein Haltestellen-Objekt als "Value" hat.
Das Haltestellen-Objekt hat folgendes Eigenschaften:

- `n: String` Der Name der Haltestelle
- `i: String` Der Teil der DHID, die nicht schon in der Gemeinde-Nummer steckt (platzsparmaßnahme halt)
- `c: [Latitude, Longitude]` Koordinaten, verpackt in einem Array der Länge 2, als Kommazahlen 
- `m: Number` Municipality-Id - Die Gemeinde Nummer  
  - Format: bbkkksss  [b=bundesland, k=kreisnummer, s=stadtnummer] [mehr erfahren](https://de.wikipedia.org/wiki/Amtlicher_Gemeindeschl%C3%BCssel)
  - (wenn die bundeslandnummer einstellig ist, ist die nummer 7 und nicht 8 stellig)
  - Mit dieser nummer kann die DHID rekonstruiert werden: "de":bbkkk:`i` (hier muss eine null vorne stehen, wenn das bundesland einstellig ist)
  - Beispiel: rekonstruiert: "de:07334:30658"; `i`-Wert: "30130"; `m`-Wert: 7334034
- `d: Number` District-Id - Die Stadtteilnummer 
  - Diesen Wert scheint niemand zu benutzen? An einigen stellen ist er definiert aber ohne entsprechenden Stadteilnamen also pfff   
 * `a: Number` Autorität-Id (Position im Array von `authorities.json`) (platzsparen, wie gesagt ne)
 * `des: String` die Beschreibung. (selten angegeben)
 * `s : Boolean` Ist die Haltestelle in Betrieb? Dieser Wert ist undefiniert, wenn sie in Betrieb sind (platz, natürlich, darum gehts doch immer) 
 * `b: Object/Dictionary<String, Bereich>` Bereiche (Quasi wie DateiOrdner für gleise und masten)

Die Bereichs und Gleisobjekte haben dieselbe struktur, außer das einige werte fehlen:
- `a`
- `m`
- `d`
- `i`

Haltestellen halten ihre Bereiche in der `b`-Eigenschaft, Bereiche ihre Gleise in der `g` Eigenschaft (na logo)

Wichtig: Der Schlüssel in diesen Objekten entspricht jeweils dem Teil der DHID
D.h Gleis-DHID: "de:07334:1734:1:1", Pfad: `haltestellen["de:07334:1734"].b.1.g.1`

Beispiele für einzelne Haltestellen finden sie in examples.json

Eine für die ersten 500 Zeilen lesbar formatierte version der Dateien finden sie jeweils mit dem -Debug suffix

### `municipalities.json`
Die datei, wenn man anhand der gemeindeschlüssel den namen nachgucken möchte.
Im /wikidata/regions.json sind außerdem alle bundesländer und landkreise in einer baumstruktur aufgelistet

Ein Objekt, Schlüssel sind die Gemeindenummern (siehe oben), Wert ist je das Gemeindeobjekt:
- `n` GemeindeName
- `d` Distrikte (überall leer keine ahnung)
- `a` Array der Autoritäten, die hier haltestellen angemeldet haben (idR nur ein eintrag), wie oben referenz zu `authorities.json`


### `authorities.json`
Ein Array der Autoritätennamen


## Build Befehl
Die library enthält bereits alle fertigen JSON-Dateien.
Falls sie jedoch die aktuellsten Daten des ZHV im JSON format brauchen, besuchen sie das [ZHV](https://zhv.wvigmbh.de/Account/Login.aspx), 
erstellen sie einen Account, und laden in der Tabellenansicht das komplette Verzeichnis als .csv datei herunter.

Klonen Sie diese Repo, legen Sie den Ordner `/rawdata` an und die .csv datei hinein.
Öffen sie das terminal, navigieren sie zum library ordner und führen Sie den Befehl `node . <dateiname>.csv` aus.
Nun werden die DELFI-Daten gelesen und im kompakten JSON Format in den `/refineddata` Ordner gelegt.

