# dot-store-fs

Adds filesystem read/write to [dot-store](/invrs/dot-store)

| Feature                        | Built With                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| Concurrent file access         | [proper-lockfile](https://github.com/moxystudio/node-proper-lockfile#readme)         |
| File glob                      | [node-glob](https://github.com/isaacs/node-glob)                                     |
| Fuzzy immutable "dot" accessor | [camel-dot-prop-immutable](https://github.com/invrs/camel-dot-prop-immutable#readme) |

```js
import DotStore from "dot-store"
import withFs from "dot-store-fs"

const store = new DotStore()
await withFs(store, { pattern: "**/*", root: __dirname })
```

Then use the store [as normal](/invrs/dot-store).
