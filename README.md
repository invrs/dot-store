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
await store.get("users.employees.bob")
// or
store.getSync("users.employees.bob")
// or
store.state.users.employees.bob
```

## Prop subscriptions

Easily subscribe to store changes:

```js
// Async listener
const listener = async () => {}

// Subscribe to prop (afterUpdate)
store.on("test", listener)

// Remove prop listener
let off = store.on("test", listener)
off()

// Resolve once prop changes
await store.once("test")

// Resolve once prop exists
await store.onceExists("test")
```

### Prop variables

Capture variables from props:

```js
store.on("test.{id}.{attr}", async ({ id, attr }) => {})
```

### Listener arguments

Subscription listeners receive a lot of useful arguments:

| Listener argument | Description                                                              |
| :---------------- | :----------------------------------------------------------------------- |
| `changed`         | Check if props changed                                                   |
| `op`              | Operation (`get`, `delete`, etc)                                         |
| `prev`            | Previous value                                                           |
| `prevState`       | Previous state snapshot                                                  |
| `prop`            | [Dot-prop](https://github.com/debitoor/dot-prop-immutable#readme) string |
| `props`           | Array of prop keys                                                       |
| `state`           | State snapshot                                                           |
| `store`           | Store instance                                                           |
| `value`           | Third argument to operation (if present)                                 |

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
store.off(listener)

// Subscribe to `beforeGet`
store.on("beforeGet", listener)

// Unsubscribe from `beforeGet`
store.off("beforeGet", listener)

// Unsubscribe all from `beforeGet`
store.off("beforeGet")
```

## Extensions

| Package                                                                                             | Description           |
| :-------------------------------------------------------------------------------------------------- | :-------------------- |
| [`dot-store-fs`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-fs#readme)       | Filesystem read/write |
| [`dot-store-react`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-react#readme) | React integration     |
