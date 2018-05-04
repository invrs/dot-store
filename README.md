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

## Subscribe

Subscription callbacks may be asynchronous and execute sequentially before and after each operation.

| Operation | Events                                                       |
| :-------- | :----------------------------------------------------------- |
| `get`     | `beforeGet`, `afterGet`                                      |
| `delete`  | `beforeUpdate`, `afterUpdate`, `beforeDelete`, `afterDelete` |
| `merge`   | `beforeUpdate`, `afterUpdate`, `beforeMerge`, `afterMerge`   |
| `set`     | `beforeUpdate`, `afterUpdate`, `beforeSet`, `afterSet`       |
| `toggle`  | `beforeUpdate`, `afterUpdate`, `beforeToggle`, `afterToggle` |

```js
// Subscribe to all updates
store.subscribe(
  async ({ detectChange, op, prop, state, value }) => {}
)

// Subscribe to a specific event
store.subscribe(
  "beforeGet",
  async ({ detectChange, op, prop, state, value }) => {}
)
```

| Callback argument | Description                                                               |
| :---------------- | :------------------------------------------------------------------------ |
| `detectChange`    | Check if a specific prop changed                                          |
| `op`              | Operation (`get`, `delete`, etc)                                          |
| `prop`            | [Dot-prop](https://github.com/debitoor/dot-prop-immutable#readme) locator |
| `state`           | State snapshot                                                            |
| `value`           | Third argument to operation (if present)                                  |

The `detectChange` helper supports wildcards (`.*`) at the end of the prop you pass it.

## Prop subscriptions

Use `on`, `once`, and `off` to subscribe to specific prop changes.

```js
// Subscribe to all updates for the `test` prop
store.on("test.*", async ({ op, prop, state, value }) => {})

// Subscribe to the first for the `test` prop
store.once(
  "test.*",
  async ({ op, prop, state, value }) => {}
)

// Remove all `on` and `once` listeners for the `test` prop
store.off("test.*")
```

## Extensions

| Package                                                                                             | Description           |
| :-------------------------------------------------------------------------------------------------- | :-------------------- |
| [`dot-store-fs`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-fs#readme)       | Filesystem read/write |
| [`dot-store-react`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-react#readme) | React integration     |
