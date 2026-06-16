
# MCP v kontextu Obsidian REST API pluginu

## Co je MCP

**MCP** znamená **Model Context Protocol**.

Je to standardizovaný způsob, jak může AI model komunikovat s externími nástroji, soubory, databázemi nebo API.
V praxi to znamená, že místo toho, aby každá AI aplikace musela mít vlastní speciální plugin pro Obsidian, GitHub, SQLite nebo jiné služby, může používat jednotné rozhraní MCP.

---

## Zjednodušené schéma

Bez MCP:

```text
AI model
 ├─ speciální plugin pro Obsidian
 ├─ speciální plugin pro REST API
 ├─ speciální plugin pro SQLite
 └─ speciální plugin pro GitHub
```

S MCP:

```text
AI model
  │
  ▼
MCP klient
  │
  ▼
MCP server
  │
  ▼
Obsidian REST API
  │
  ▼
Obsidian vault
```

---

## Obsidian REST API plugin

Obsidian může mít plugin, který zpřístupní poznámky přes HTTP API.

Například:

```http
GET /vault/
GET /vault/ECC.md
PUT /vault/Cashu.md
POST /vault/novy-soubor.md
```

Tento REST API plugin sám o sobě ještě není MCP.

Je to běžné HTTP rozhraní, přes které lze číst, vytvářet a upravovat soubory v Obsidian vaultu.

---

## Kde je v tom MCP

MCP server může fungovat jako **mezivrstva** mezi AI modelem a Obsidian REST API pluginem.

```text
AI / LLM
  │
  ▼
MCP server pro Obsidian
  │
  ▼
Obsidian REST API plugin
  │
  ▼
Vault s poznámkami
```

MCP server převede obecné nástroje typu:

```text
search_notes()
read_note()
write_note()
update_note()
list_files()
```

na konkrétní HTTP volání Obsidian REST API.

---

## Příklad nástrojů, které může MCP server nabídnout

```text
search_notes(query)
```

Vyhledá poznámky podle textu.

```text
read_note(path)
```

Načte obsah konkrétní poznámky.

```text
write_note(path, content)
```

Vytvoří novou poznámku nebo přepíše existující.

```text
append_to_note(path, content)
```

Přidá text na konec existující poznámky.

```text
list_notes(folder)
```

Vypíše poznámky ve složce.

---

## Příklad použití

Uživatel napíše:

```text
Najdi moje poznámky o ECC a vytvoř krátké shrnutí.
```

AI přes MCP provede přibližně toto:

```text
1. search_notes("ECC")
2. read_note("Bitcoin/ECC.md")
3. read_note("Matematika/Elliptic Curves.md")
4. vytvoří shrnutí
```

Uživatel nemusí ručně otevírat soubory. AI si potřebný kontext načte přes MCP server.

---

## Praktický význam pro Obsidian

MCP umožní, aby AI uměla s vaultem pracovat strukturovaně:

- hledat poznámky,
- číst soubory,
- vytvářet nové Markdown poznámky,
- doplňovat existující poznámky,
- generovat přehledy,
- vytvářet odkazy mezi poznámkami,
- pracovat s frontmatter metadaty.

---

## Příklad scénáře

Vault obsahuje poznámky:

```text
Bitcoin.md
ECC.md
Cashu.md
OBT.md
Shannonova_entropie.md
```

Uživatel zadá:

```text
Vytvoř mi přehled poznámek souvisejících s kryptografií.
```

AI může přes MCP:

```text
search_notes("kryptografie")
search_notes("ECC")
search_notes("hash")
search_notes("entropie")
read_note(...)
```

a následně vytvořit například:

```markdown
# Kryptografie v mém vaultu

## ECC
Shrnutí poznámky...

## Hashovací funkce
Shrnutí poznámky...

## Entropie
Shrnutí poznámky...
```

---

## Rozdíl mezi REST API a MCP

| Vrstva | Úloha |
|---|---|
| Obsidian REST API plugin | Umožní přístup k vaultu přes HTTP |
| MCP server | Nabídne AI srozumitelné nástroje |
| AI model | Rozhodne, kdy a jak tyto nástroje použít |

REST API je tedy technická vrstva.

MCP je vrstva, která z REST API udělá nástroje použitelné pro AI asistenta.

---

## Jednoduchá představa

REST API říká:

```http
GET /vault/ECC.md
```

MCP říká:

```text
read_note("ECC.md")
```

Pro člověka i AI je druhý zápis srozumitelnější.

---

## Možné lokální použití

Typická lokální sestava může vypadat takto:

```text
Obsidian
  │
  └─ Local REST API plugin
        │
        └─ běží na localhostu

MCP server
  │
  └─ volá Obsidian REST API

AI klient
  │
  └─ používá MCP server jako nástroj
```

Například:

```text
Obsidian REST API: http://localhost:27123
MCP server: lokální Node.js nebo Python proces
AI klient: Claude Desktop, Cursor, lokální LLM klient apod.
```

---

## Minimální logika MCP serveru

MCP server může být velmi jednoduchý.

Například nástroj `read_note(path)` interně udělá:

```text
GET http://localhost:27123/vault/{path}
```

Nástroj `write_note(path, content)` interně udělá:

```text
PUT http://localhost:27123/vault/{path}
```

Nástroj `search_notes(query)` může interně použít:

```text
POST http://localhost:27123/search/
```

---

## Shrnutí

MCP není náhrada Obsidianu ani jeho REST API pluginu.

Je to standardizovaná vrstva, která umožňuje AI modelu bezpečněji a přehledněji používat nástroje.

V kontextu Obsidianu je typické zapojení:

```text
AI model
→ MCP
→ Obsidian REST API
→ Markdown soubory ve vaultu
```

Hlavní výhoda je, že AI nemusí znát detaily REST endpointů. Dostane jednoduché nástroje typu `read_note`, `search_notes` nebo `write_note`.

---
#obsidian  #plugin #mcp 
