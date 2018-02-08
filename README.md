# dot-get-set

Flexible filesystem accessor for text and JSON

| Feature                                | Built With                                                                           |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| Collapsible & immutable "dot" accessor | [camel-dot-prop-immutable](https://github.com/invrs/camel-dot-prop-immutable#readme) |
| Concurrent file access                 | [proper-lockfile](https://github.com/moxystudio/node-proper-lockfile#readme)         |

## Example

| File                   | Contents          |
| ---------------------- | ----------------- |
| hello.txt              | `world`           |
| lorem/ipsum/dolor.json | `{ sit: "amet" }` |
| test.js                | See below         |

```js
import getSet from "dot-get-set"
;(async () => {
  let config = await getSet(__dirname)

  config.get("hello")
  // "world"

  config.get("lorem.ipsum.dolor.sit")
  // "amet"

  config = op.set("hello", "universe")
  // "universe" > hello.txt

  config = op.set("lorem.ipsum.dolor", { sed: "do" })
  // { sed: "do" } > lorem/ipsum/dolor.json
})()
```
