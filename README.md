# dot-get-set

Flexible filesystem accessor for text and JSON

| Feature                    | Built With                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------ |
| Collapsible "dot" accessor | [camel-dot-prop-immutable](https://github.com/invrs/camel-dot-prop-immutable#readme) |
| Concurrent file access     | [proper-lockfile](https://github.com/moxystudio/node-proper-lockfile#readme)         |

## Example

| File                     | Contents          |
| ------------------------ | ----------------- |
| `hello.txt`              | `world`           |
| `lorem/ipsum/dolor.json` | `{ sit: "amet" }` |
| `test.js`                | See below         |

```js
import getSet from "dot-get-set"
;(async () => {
  let { get, set } = await getSet(__dirname)

  get("hello")
  // "world"

  get("lorem.ipsum.dolor.sit")
  // "amet"

  set("hello", "universe")
  // "universe" > config/hello.txt

  set.merge("lorem.ipsum", { sed: "do" })
  // "do" > lorem/ipsum/sed.json

  set.delete("lorem.ipsum")
  // rm -rf lorem/ipsum

  set("lorem", {})
  // rm -rf lorem
  // "{}" > lorem.json
})()
```

## Static Queries

Expand or collapse the file structure while keeping your queries the same.

| Query               | JSON                               | Expand                              | Collapse                                   |
| ------------------- | ---------------------------------- | ----------------------------------- | ------------------------------------------ |
| `lorem.ipsum.dolor` | `loremIpsumDolor.json` -> `"sit"`  | `loremIpsum/dolor.json` -> `"sit"`  | `loremIpsum.json` -> `{ "dolor": "sit" }`  |
| `lorem.ipsum.dolor` | `loremIpsum/dolor.json` -> `"sit"` | `lorem/ipsum/dolor.json` -> `"sit"` | `lorem/ipsum.json` -> `{ "dolor": "sit" }` |
