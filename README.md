# dot-get-set

Flexible filesystem accessor for text and JSON

| Feature                        | Built With                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Fuzzy immutable "dot" accessor | [camel-dot-prop-immutable](https://github.com/invrs/camel-dot-prop-immutable#readme) |
| Concurrent file access         | [proper-lockfile](https://github.com/moxystudio/node-proper-lockfile#readme)         |

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

  config = config.set("hello", "universe")
  // "universe" > hello.txt

  config.get("hello")
  // "universe"

  config = config.set("lorem.ipsum.dolor", { sed: "do" })
  // { sed: "do" } > lorem/ipsum/dolor.json

  config.get("lorem.ipsum.dolor")
  // { sed: "do" }
})()
```

Because the operation is immutable, `config` needs to be reassigned when mutated.
