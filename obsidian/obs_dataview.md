---
type: popis
tags:
  - test
  - plugin
  - obsidian
  - dataview
---
vlastnosti nahoře, ale zdá se, že mohou být i jinde? netluče se to?

---



# Obsidian Dataview

Dataview je plugin pro Obsidian, který z poznámek vytváří živý index metadat. Nad tímto indexem můžeš stavět dynamické seznamy, tabulky, kalendáře, přehledy úkolů a dashboardy.

Oficiální dokumentace: https://blacksmithgu.github.io/obsidian-dataview/

Dataview je určený hlavně pro zobrazování a výpočty. Běžné dotazy obsah poznámek neupravují; výjimkou jsou interaktivní úkoly, které lze zaškrtnout přímo ve výsledku dotazu.

## Instalace

1. Otevři Settings.
2. Přejdi do Community plugins.
3. Zvol Browse.
4. Vyhledej Dataview.
5. Klikni na Install.
6. Zapni plugin tlačítkem Enable.

## Jak používat ukázky v tomto souboru

Každá ukázka má stejnou strukturu:

1. nadpis
2. stručný popis
3. viditelný fragment kódu v bloku `text`, který se neprovádí
4. stejný kód ve spustitelném bloku `dataview` nebo `dataviewjs`
5. oddělovací čáru `---`

## Co Dataview indexuje

Dataview nečte celý obsah poznámky jako databázi. Pracuje hlavně s metadaty.

Automaticky umí použít například:

- název, cestu a složku souboru
- čas vytvoření a poslední úpravy souboru
- tagy
- odkazy z poznámky a odkazy do poznámky
- seznamy a úkoly
- datum z názvu denní poznámky ve formátu `yyyy-MM-dd`

Ruční metadata můžeš doplnit přes YAML frontmatter, inline fields nebo pole na konkrétních úkolech.

## Vzor metadat pro poznámku

Tento blok vlož na začátek poznámky. Není to Dataview dotaz, ale data, nad kterými potom Dataview pracuje.

```yaml
---
type: book
author: "Satoshi Nakamoto"
status: active
rating: 10
created: 2026-06-15
tags:
  - bitcoin
  - cryptography
---
```

## Inline fields

Inline fields zapisují metadata přímo do textu poznámky.

```markdown
Autor:: yenda
Stav:: active
Priorita:: high

Tuhle knihu hodnotím [rating:: 9] a téma je [topic:: bitcoin].
```

## Implicitní pole

Dataview poskytuje řadu polí automaticky. Mezi nejpoužívanější patří:

- `file.name`: název souboru
- `file.link`: odkaz na soubor
- `file.path`: cesta k souboru
- `file.folder`: složka
- `file.tags`: tagy
- `file.etags`: explicitní tagy
- `file.inlinks`: odkazy vedoucí do poznámky
- `file.outlinks`: odkazy z poznámky
- `file.ctime`: čas vytvoření
- `file.cday`: den vytvoření
- `file.mtime`: čas poslední úpravy
- `file.mday`: den poslední úpravy
- `file.day`: datum odvozené z názvu denní poznámky
- `file.tasks`: úkoly v souboru
- `file.lists`: položky seznamů v souboru

## Ukázky

### Všechny poznámky

Zobrazí seznam všech poznámek ve vaultu. U velkých vaultů je lepší použít `FROM`, aby se dotaz omezil na složku nebo tag.

```text
LIST
```

```dataview
LIST
```

---

### Poznámky podle tagu

Zobrazí všechny poznámky s tagem `#bitcoin`.

```text
LIST
FROM #bitcoin
```

```dataview
LIST
FROM #bitcoin
```

---

### Poznámky podle složky

Zobrazí poznámky ze složky `Projects` a jejích podsložek.

```text
LIST
FROM "proj_btc"
```

```dataview
LIST
FROM "proj_btc"
```

---

### Kombinace tagů a složek

Zobrazí poznámky s tagem `#bitcoin`, které jsou zároveň ve složce `Research`.

```text
LIST
FROM #bitcoin AND "Research"
```

```dataview
LIST
FROM #bitcoin AND "Research"
```

---

### Více možných zdrojů

Zobrazí poznámky, které mají tag `#status/open` nebo `#status/wip`.

```text
LIST
FROM #status/open OR #status/wip
```

```dataview
LIST
FROM #status/open OR #status/wip
```

---

### Poznámky odkazující na stránku

Zobrazí poznámky, které odkazují na stránku `Bitcoin`.

```text
LIST
FROM [[Bitcoin]]
```

```dataview
LIST
FROM [[Bitcoin]]
```

---

### Odkazy ze stránky

Zobrazí stránky, na které odkazuje stránka `Bitcoin`.

```text
LIST
FROM outgoing([[Bitcoin]])
```

```dataview
LIST
FROM outgoing([[Bitcoin]])
```

---

### Seznam s doplňkovou hodnotou

U každé poznámky zobrazí také složku, ve které leží.

```text
LIST file.folder
FROM #bitcoin
```

```dataview
LIST file.folder
FROM #bitcoin
```

---

### Seznam bez odkazu na soubor

Zobrazí jen vypočtený text bez automatického odkazu na poznámku.

```text
LIST WITHOUT ID file.name + " je ve složce " + file.folder
FROM #bitcoin
```

```dataview
LIST WITHOUT ID file.name + " je ve složce " + file.folder
FROM #bitcoin
```

---

### Jednoduchá tabulka

Zobrazí tabulku knih se třemi vlastními poli.

```text
TABLE author, year, rating
FROM "Books"
SORT rating DESC
```

```dataview
TABLE author, year, rating
FROM "Books"
SORT rating DESC
```

---

### Tabulka s českými názvy sloupců

Použije `AS` pro přejmenování sloupců ve výsledku.

```text
TABLE
  author AS "Autor",
  year AS "Rok",
  rating AS "Hodnocení"
FROM "Books"
SORT rating DESC
```

```dataview
TABLE
  author AS "Autor",
  year AS "Rok",
  rating AS "Hodnocení"
FROM "Books"
SORT rating DESC
```

---

### Tabulka bez automatického prvního sloupce

`TABLE WITHOUT ID` odstraní výchozí sloupec se souborem. Odkaz na soubor si můžeš přidat ručně.

```text
TABLE WITHOUT ID
  file.link AS "Kniha",
  author AS "Autor",
  rating AS "Hodnocení"
FROM "Books"
```

```dataview
TABLE WITHOUT ID
  file.link AS "Kniha",
  author AS "Autor",
  rating AS "Hodnocení"
FROM "Books"
```

---

### Aktivní projekty

Vyfiltruje projekty, které mají pole `status` nastavené na `active`.

```text
TABLE status, priority
FROM "Projects"
WHERE status = "active"
```

```dataview
TABLE status, priority
FROM "Projects"
WHERE status = "active"
```

---

### Položky po termínu

Najde poznámky, které mají pole `due` a jeho datum je před dneškem.

```text
LIST
WHERE due AND due < date(today)
```

```dataview
LIST
WHERE due AND due < date(today)
```

---

### Poznámky změněné za poslední den

Najde poznámky upravené během posledních 24 hodin.

```text
LIST
WHERE file.mtime >= date(today) - dur(1 day)
SORT file.mtime DESC
```

```dataview
LIST
WHERE file.mtime >= date(today) - dur(1 day)
SORT file.mtime DESC
```

---

### Starší nedokončené projekty

Najde projekty, které nejsou dokončené a vznikly před více než měsícem.

```text
LIST
FROM #projects
WHERE !completed AND file.ctime <= date(today) - dur(1 month)
```

```dataview
LIST
FROM #projects
WHERE !completed AND file.ctime <= date(today) - dur(1 month)
```

---

### Řazení podle více polí

Nejdřív řadí podle priority, potom podle poslední úpravy.

```text
TABLE priority, status, file.mtime
FROM "Projects"
SORT priority DESC, file.mtime DESC
```

```dataview
TABLE priority, status, file.mtime
FROM "Projects"
SORT priority DESC, file.mtime DESC
```

---

### Posledních 20 souborů

Seřadí poznámky podle poslední úpravy a zobrazí jen prvních 20 výsledků.

```text
TABLE file.mtime AS "Poslední úprava"
SORT file.mtime DESC
LIMIT 20
```

```dataview
TABLE file.mtime AS "Poslední úprava"
SORT file.mtime DESC
LIMIT 20
```

---

### Projekty seskupené podle stavu

`GROUP BY` vytvoří jednu skupinu pro každou hodnotu pole `status`.

```text
TABLE rows.file.link AS "Poznámky"
FROM "Projects"
GROUP BY status
```

```dataview
TABLE rows.file.link AS "Poznámky"
FROM "Projects"
GROUP BY status
```

---

### Počet poznámek ve skupině

Po seskupení použije `length(rows)` pro výpočet počtu poznámek v každé skupině.

```text
TABLE length(rows) AS "Počet"
FROM "Projects"
GROUP BY status
SORT length(rows) DESC
```

```dataview
TABLE length(rows) AS "Počet"
FROM "Projects"
GROUP BY status
SORT length(rows) DESC
```

---

### Rozbalení autorů

`FLATTEN` vytvoří samostatný řádek pro každého autora v poli `authors`.

```text
TABLE authors AS "Autor"
FROM #LiteratureNote
FLATTEN authors
```

```dataview
TABLE authors AS "Autor"
FROM #LiteratureNote
FLATTEN authors
```

---

### Položky seznamů obsahující slovo

Rozbalí seznamy v denních poznámkách a najde položky obsahující slovo `bitcoin`.

```text
TABLE L.text AS "Položka"
FROM "Daily"
FLATTEN file.lists AS L
WHERE contains(L.text, "bitcoin")
```

```dataview
TABLE L.text AS "Položka"
FROM "Daily"
FLATTEN file.lists AS L
WHERE contains(L.text, "bitcoin")
```

---

### Všechny nesplněné úkoly

Zobrazí interaktivní seznam všech nesplněných úkolů.

```text
TASK
WHERE !completed
```

```dataview
TASK
WHERE !completed
```

---

### Nesplněné úkoly z projektů

Omezí úkoly na složku `Projects`.

```text
TASK
FROM "Projects"
WHERE !completed
```

```dataview
TASK
FROM "Projects"
WHERE !completed
```

---

### Úkoly s tagem

Zobrazí nesplněné úkoly, které mají tag `#shopping`.

```text
TASK
WHERE !completed AND contains(tags, "#shopping")
```

```dataview
TASK
WHERE !completed AND contains(tags, "#shopping")
```

---

### Úkoly seskupené podle souboru

Seskupí nesplněné úkoly podle poznámky, ze které pocházejí.

```text
TASK
WHERE !completed
GROUP BY file.link
```

```dataview
TASK
WHERE !completed
GROUP BY file.link
```

---

### Nejstarší nesplněné úkoly

Vybere deset nejstarších nesplněných úkolů a seskupí je podle souboru.

```text
TASK
WHERE !completed
SORT created ASC
LIMIT 10
GROUP BY file.link
```

```dataview
TASK
WHERE !completed
SORT created ASC
LIMIT 10
GROUP BY file.link
```

---

### Kalendář podle data vytvoření

Zobrazí poznámky v kalendáři podle dne vytvoření.

```text
CALENDAR file.cday
```

```dataview
CALENDAR file.cday
```

---

### Kalendář podle vlastního termínu

Zobrazí kalendář podle pole `due`, ale jen tam, kde je `due` opravdu datum.

```text
CALENDAR due
WHERE typeof(due) = "date"
```

```dataview
CALENDAR due
WHERE typeof(due) = "date"
```

---

### Počet příchozích odkazů

Spočítá, kolik poznámek odkazuje na každou poznámku s tagem `#bitcoin`.

```text
TABLE length(file.inlinks) AS "Počet zmínek"
FROM #bitcoin
SORT length(file.inlinks) DESC
```

```dataview
TABLE length(file.inlinks) AS "Počet zmínek"
FROM #bitcoin
SORT length(file.inlinks) DESC
```

---

### Stáří knihy

Vypočítá stáří knihy podle pole `year`.

```text
TABLE
  author AS "Autor",
  date(now).year - year AS "Stáří"
FROM "Books"
WHERE year
SORT year ASC
```

```dataview
TABLE
  author AS "Autor",
  date(now).year - year AS "Stáří"
FROM "Books"
WHERE year
SORT year ASC
```

---

### Výchozí hodnota chybějícího pole

Když poznámka nemá pole `status`, zobrazí se místo něj `unknown`.

```text
TABLE default(status, "unknown") AS "Stav"
FROM "Projects"
```

```dataview
TABLE default(status, "unknown") AS "Stav"
FROM "Projects"
```

---

### Knihovna knih

Praktický dashboard pro poznámky typu `book`.

```text
TABLE
  author AS "Autor",
  year AS "Rok",
  rating AS "Hodnocení",
  status AS "Stav"
FROM "Books"
WHERE type = "book"
SORT rating DESC
```

```dataview
TABLE
  author AS "Autor",
  year AS "Rok",
  rating AS "Hodnocení",
  status AS "Stav"
FROM "Books"
WHERE type = "book"
SORT rating DESC
```

---

### Hry podle hodnocení

Ukázka podle oficiálních příkladů Dataview: zobrazí hry ze složky `Games` seřazené podle hodnocení.

```text
TABLE
  time-played AS "Odehráno",
  length AS "Délka",
  rating AS "Hodnocení"
FROM "Games"
SORT rating DESC
```

```dataview
TABLE
  time-played AS "Odehráno",
  length AS "Délka",
  rating AS "Hodnocení"
FROM "Games"
SORT rating DESC
```

---

### Denní poznámky podle data

Použije `file.day`, pokud název poznámky obsahuje datum ve formátu denní poznámky.

```text
LIST file.day
WHERE file.day
SORT file.day DESC
```

```dataview
LIST file.day
WHERE file.day
SORT file.day DESC
```

---

### Bitcoin projekty

Zobrazí aktivní přehled projektů s tématem `bitcoin`.

```text
TABLE
  topic AS "Téma",
  status AS "Stav",
  priority AS "Priorita"
FROM "Projects"
WHERE type = "project" AND topic = "bitcoin"
SORT priority DESC
```

```dataview
TABLE
  topic AS "Téma",
  status AS "Stav",
  priority AS "Priorita"
FROM "Projects"
WHERE type = "project" AND topic = "bitcoin"
SORT priority DESC
```

---

### Kapitoly Matematika Bitcoinu

Zobrazí kapitoly konkrétní knihy a seřadí je podle pole `order`.

```text
TABLE
  order AS "Pořadí",
  status AS "Stav"
FROM "Matematika Bitcoinu"
WHERE book = "matematika-bitcoinu"
SORT order ASC
```

```dataview
TABLE
  order AS "Pořadí",
  status AS "Stav"
FROM "Matematika Bitcoinu"
WHERE book = "matematika-bitcoinu"
SORT order ASC
```

---

### Poznámky bez tagů

Najde poznámky, které nemají žádný tag.

```text
LIST
WHERE length(file.tags) = 0
```

```dataview
LIST
WHERE length(file.tags) = 0
```

---

### Poznámky odkazující na aktuální stránku

Najde poznámky, které obsahují odkaz na právě otevřenou stránku.

```text
LIST
WHERE contains(file.outlinks, this.file.link)
```

```dataview
LIST
WHERE contains(file.outlinks, this.file.link)
```

---

### Inline dotaz na počet úkolů

Inline dotaz zobrazí jednu hodnotu přímo v textu poznámky. První řádek je jen viditelná ukázka, druhý řádek se v Obsidianu vyhodnotí.

```text
Počet úkolů v této poznámce: `= length(this.file.tasks)`
```

Počet úkolů v této poznámce: `= length(this.file.tasks)`

---

### Inline dotaz na název poznámky

Zobrazí název aktuální poznámky přímo v textu.

```text
Název aktuální poznámky: `= this.file.name`
```

Název aktuální poznámky: `= this.file.name`

---

### DataviewJS tabulka

Použije JavaScript API Dataview pro vytvoření tabulky stránek s tagem `#bitcoin`.

```text
dv.table(
  ["Soubor"],
  dv.pages("#bitcoin").map(p => [p.file.link])
)
```

```dataviewjs
dv.table(
  ["Soubor"],
  dv.pages("#bitcoin").map(p => [p.file.link])
)
```

---

### DataviewJS seznam aktivních projektů

Použije JavaScript pro vypsání aktivních projektů ze složky `Projects`.

```text
for (const page of dv.pages('"Projects"').where(p => p.status === "active")) {
  dv.paragraph(page.file.link)
}
```

```dataviewjs
for (const page of dv.pages('"Projects"').where(p => p.status === "active")) {
  dv.paragraph(page.file.link)
}
```

---

## Často používané funkce

- `length()`
- `contains()`
- `default()`
- `date()`
- `dateformat()`
- `dur()`
- `typeof()`
- `choice()`
- `round()`
- `sum()`
- `average()`
- `filter()`
- `map()`

## Doporučení

Dataview je nejspolehlivější, když:

- používáš jednotné názvy polí
- dáváš strukturovaná metadata do YAML frontmatteru
- používáš inline fields pro údaje v konkrétní větě, položce seznamu nebo úkolu
- omezuješ velké dotazy pomocí `FROM`
- nejdřív řadíš a až potom používáš `LIMIT`
- držíš typy hodnot konzistentní, například `rating` vždy jako číslo a `due` vždy jako datum

Dobře se kombinuje s pluginy:

- Tasks
- Templater
- Calendar
- Periodic Notes
- Meta Bind
- Kanban

## Shrnutí

Dataview promění poznámky v dotazovatelnou osobní databázi. Základ tvoří metadata, DQL dotazy a případně DataviewJS pro pokročilejší práci.

---
[[dataview_report test]]

