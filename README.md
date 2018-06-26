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
store.get().users.employees.bob
// or with listeners
await store.getAsync("users.employees.bob")
```

## Prop subscriptions

Subscribe and unsubscribe to store changes:

```js
// Async listener
const listener = async () => {}

// Listen to prop changes (afterUpdate)
store.on("hello.world", listener)

// Disable listener
const off = store.on("hello.world", listener)
off()

// Once prop value changes (promise)
await store.once("hello.world")

// Once prop value exists (promise)
await store.onceExists("hello.world")

// Capture prop keys as variables
store.on("users.{id}", async ({ id }) => {
  // Listen to any user update
})

// Once prop value exists (w/ prop key and callback)
store.onceExists(
  "users.{id}",
  async ({ id }) => {} // Listen for new users
)
```

Subscription listeners receive a lot of useful arguments:

| Listener argument | Description                                                                       |
| :---------------- | :-------------------------------------------------------------------------------- |
| `changed`         | Check if props changed function                                                   |
| `event`           | Event type string (`before` or `after`)                                           |
| `listenPrev`      | Previous `listenProp` value                                                       |
| `listenProp`      | Listener [dot-prop](https://github.com/debitoor/dot-prop-immutable#readme) string |
| `listenProps`     | Array of `listenProp` keys                                                        |
| `listenValue`     | `listenProp` value                                                                |
| `op`              | Operation string (`get`, `delete`, etc)                                           |
| `prev`            | Previous `prop` value                                                             |
| `prevState`       | Previous state snapshot                                                           |
| `prop`            | Changed [dot-prop](https://github.com/debitoor/dot-prop-immutable#readme) string  |
| `props`           | Array of changed `prop` keys                                                      |
| `state`           | State snapshot                                                                    |
| `store`           | Store instance                                                                    |
| `value`           | `prop` value                                                                      |

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

| Package                                                                                                 | Description                |
| :------------------------------------------------------------------------------------------------------ | :------------------------- |
| [`dot-store-cookie`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-cookie#readme)   | Cookie access              |
| [`dot-store-fs`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-fs#readme)           | Filesystem access          |
| [`dot-store-message`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-message#readme) | Sync via `postMessage` API |
| [`dot-store-react`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-react#readme)     | React integration          |
