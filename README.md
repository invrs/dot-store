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
const listener = async ({
  detectChange,
  op,
  prop,
  state,
  value,
}) => {}

// Add `afterUpdate` listener
store.subscribe(listener)

// Remove all `afterUpdate` listeners
store.unsubscribe()

// Add `beforeGet` listener
store.subscribe("beforeGet", listener)

// Remove `beforeGet` listener
store.unsubscribe("beforeGet", listener)

// Remove all `beforeGet` listeners
store.unsubscribe("beforeGet")
```

| Callback argument | Description                                                              |
| :---------------- | :----------------------------------------------------------------------- |
| `detectChange`    | Check if a prop changed                                                  |
| `op`              | Operation (`get`, `delete`, etc)                                         |
| `prevState`       | Previous state snapshot                                                  |
| `prop`            | [Dot-prop](https://github.com/debitoor/dot-prop-immutable#readme) string |
| `props`           | Array of prop keys                                                       |
| `state`           | State snapshot                                                           |
| `store`           | Store instance                                                           |
| `value`           | Third argument to operation (if present)                                 |

## Prop subscriptions

Use `on`, `once`, `oncePresent`, and `off` to subscribe to specific prop changes:

```js
const listener = async ({
  op,
  prevState,
  prop,
  props,
  state,
  store,
  value,
}) => {}

// Add `afterUpdate` listener for `test` prop
store.on("test", listener)

// Add `afterUpdate` listener for first `test` prop update
store.once("test", listener)

// Like `once`, but fires listener immediately if value present
store.oncePresent("test", listener)

// Remove listener
store.off("test", listener)

// Remove all `test` listeners
store.off("test")
```

You can also create wildcard listeners that capture specific props:

```js
store.on("test.{id}.{attr}", async ({ id, attr }) => {})
```

## Extensions

| Package                                                                                             | Description           |
| :-------------------------------------------------------------------------------------------------- | :-------------------- |
| [`dot-store-fs`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-fs#readme)       | Filesystem read/write |
| [`dot-store-react`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-react#readme) | React integration     |
