# dot-store

Like Redux, but easy.

![pale blue dot](https://qph.fs.quoracdn.net/main-qimg-347d2c178e6bf511ee5b91e8276c79fa)

## Install

```bash
npm install --save dot-store
```

## Basics

Create an in-memory store:

```js
import Store from "dot-store"
const store = new Store()
```

Operate on state with ["dot props"](https://github.com/debitoor/dot-prop-immutable#readme):

```js
await store.set("users.employees", { bob: {} })
await store.merge("users.employees.bob", { name: "Bob" })
await store.toggle("users.employees.bob.admin")
await store.delete("users.employees.bob")
```

Read state:

```js
store.get("users.employees.bob")
// or
store.state.users.employees.bob
// or with listeners
await store.getAsync("users.employees.bob")
```

## Prop subscriptions

Subscribe and unsubscribe to store changes:

```js
// Async listener
const listener = async () => {}

// Subscribe to prop (afterUpdate)
store.on("hello.world", listener)

// Remove prop listener
const off = store.on("hello.world", listener)
off()

// Resolve once prop changes
await store.once("hello.world")

// Resolve once prop exists
await store.onceExists("hello.world")

// Capture prop keys as variables
store.on("{hello}.{world}", async ({ hello, world }) => {})
```

Subscription listeners receive a lot of useful arguments:

| Listener argument | Description                                                                       |
| :---------------- | :-------------------------------------------------------------------------------- |
| `changed`         | Function to check if props changed                                                |
| `listenProp`      | Listener [dot-prop](https://github.com/debitoor/dot-prop-immutable#readme) string |
| `listenProps`     | Array of listener prop keys                                                       |
| `listenValue`     | Listener prop value                                                               |
| `op`              | Operation string (`get`, `delete`, etc)                                           |
| `prev`            | Previous value                                                                    |
| `prevState`       | Previous state snapshot                                                           |
| `prop`            | Changed [dot-prop](https://github.com/debitoor/dot-prop-immutable#readme) string  |
| `props`           | Array of changed prop keys                                                        |
| `state`           | State snapshot                                                                    |
| `store`           | Store instance                                                                    |
| `value`           | The prop update value                                                             |

## Operation subscriptions

Subscription listeners may be asynchronous and execute sequentially before and after each operation.

| Operation | Events                                                       |
| :-------- | :----------------------------------------------------------- |
| `get`     | `beforeGet`, `afterGet`                                      |
| `delete`  | `beforeUpdate`, `afterUpdate`, `beforeDelete`, `afterDelete` |
| `merge`   | `beforeUpdate`, `afterUpdate`, `beforeMerge`, `afterMerge`   |
| `set`     | `beforeUpdate`, `afterUpdate`, `beforeSet`, `afterSet`       |
| `toggle`  | `beforeUpdate`, `afterUpdate`, `beforeToggle`, `afterToggle` |

```js
// Async listener
const listener = async () => {}

// Subscribe to `afterUpdate`
store.on(listener)

// Remove `afterUpdate` subscription
const off = store.on(listener)
off()

// Subscribe to `beforeGet`
store.on("beforeGet", listener)

// Unsubscribe from `beforeGet`
const off = store.on("beforeGet", listener)
off()
```

## Extensions

| Package                                                                                             | Description           |
| :-------------------------------------------------------------------------------------------------- | :-------------------- |
| [`dot-store-fs`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-fs#readme)       | Filesystem read/write |
| [`dot-store-react`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-react#readme) | React integration     |
