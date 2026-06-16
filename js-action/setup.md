# JS Action - Obsidian plugin

Minimal Obsidian plugin that renders named actions from markdown code blocks.

## Installation

Copy this folder into the selected vault:

```text
<vault>/.obsidian/plugins/js-action/
|-- manifest.json
|-- main.js
|-- styles.css
`-- data.json
```

In Obsidian, open:

```text
Settings -> Community plugins
```

Refresh the plugin list and enable `JS Action`.

## Setup

The plugin stores variables in `data.json`. The test variable is:

```json
{
  "key1": "string123",
  "volume": 50
}
```

You can also edit `Key 1` and `Volume` in:

```text
Settings -> Community plugins -> JS Action
```

`Volume` is a slider from `0` to `100`.

## Usage

Use a markdown code block:

````markdown
```js-action
get_key1
```
````

The rendered preview shows:

```text
string123
```

The action parser also accepts function-style calls, so this works too:

````markdown
```js-action
get_key1()
```
````

Future actions can receive JSON-style parameters, for example:

````markdown
```js-action
some_action("text", 123, true)
```
````

## Test Actions

````markdown
```js-action
get_key1()
```
````

Returns:

```text
string123
```

````markdown
```js-action
get_volume()
```
````

Returns the current `Volume` slider value.

````markdown
```js-action
get_version()
```
````

Returns the plugin version, currently:

```text
0.1.0
```

````markdown
```js-action
get_datetime()
```
````

Returns the current local date and time:

```text
DD.MM | hh:mm
```
