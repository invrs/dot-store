# dot-store

Easy to use store and event emitter — async, immutable, self-documenting, highly extensible

![pale blue dot](https://qph.fs.quoracdn.net/main-qimg-347d2c178e6bf511ee5b91e8276c79fa)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [Using the store](#using-the-store)
  - [Set values (immutably)](#set-values-immutably)
  - [Get values](#get-values)
  - [Subscribe to changes](#subscribe-to-changes)
- [Store operations](#store-operations)
- [Store subscribers](#store-subscribers)
  - [Subscription options](#subscription-options)
  - [Wildcard props](#wildcard-props)
  - [Check for changes](#check-for-changes)
  - [Unsubscribe](#unsubscribe)
- [Custom operations](#custom-operations)
- [Extensions](#extensions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Install

```bash
npm install --save dot-store
```

## Using the store

```js
import Store from "dot-store"
const store = new Store()
```

### Set values (immutably)

```js
await store.set("users.bob.admin", true)
```

### Get values

```js
store.get("users.bob.admin") // true
store.get() // { users: { bob: { admin: true } } }
```

### Subscribe to changes

This subscription responds to any change within `users.bob`:

```js
store.on("users.bob", async () => {
  console.log("bob changed")
})
```

## Store operations

| Operation            | Async | Description                               |
| :------------------- | :---- | :---------------------------------------- |
| `get(props)`         | no    | Read property value                       |
| `delete(props)`      | yes   | Delete property value                     |
| `merge(prop, value)` | yes   | Merge property value with array or object |
| `set(props, value)`  | yes   | Set property value                        |
| `time(props)`        | yes   | Set property value to current timestamp   |
| `toggle(props)`      | yes   | Toggle boolean property value             |

Async store operations only resolve once all subscriptions resolve.

## Store subscribers

| Subscriber                    | Timing                                                                  |
| :---------------------------- | :---------------------------------------------------------------------- |
| `on(event, prop, fn)`         | Emits every property value change                                       |
| `once(event, prop, fn)`       | Emits once after a property value change                                |
| `onceExists(event, prop, fn)` | Emits once after a property value change or if the value already exists |

When omitted, the `event` parameter defaults to `"afterUpdate"`.

When specified, the `event` parameter can be `"beforeUpdate"` or a [custom operation](#custom-operations).

### Subscription options

Subscriptions receive an options argument with lots of useful stuff:

```js
store.on("users.bob", async options => {
  // see example option values below
})
await store.set("users.bob.admin", true)
```

The `options` in the above subscriber would contain the following values:

| Argument    | Example value                         | Description                                 |
| :---------- | :------------------------------------ | :------------------------------------------ |
| `changed`   | `<Function>`                          | Test if prop value changed                  |
| `store`     | `<DotStore>`                          | Store instance                              |
| `event`     | `"after"`                             | Event tense                                 |
| `op`        | `"set"`                               | Operation string                            |
| `onProp`    | `"users.bob"`                         | Subscription props string                   |
| `onProps`   | `["users", "bob"]`                    | Subscription props array                    |
| `onPrev`    | `undefined`                           | Subscription props value (before operation) |
| `onValue`   | `{ admin: true }`                     | Subscription props value (after operation)  |
| `prop`      | `"users.bob.admin"`                   | Changed props                               |
| `props`     | `["users", "bob", "admin"]`           | Changed props array                         |
| `prev`      | `undefined`                           | Changed props value (before operation)      |
| `value`     | `true`                                | Changed props value (after operation)       |
| `prevState` | `{}`                                  | State (before operation)                    |
| `state`     | `{ users: { bob: { admin: true } } }` | State (after operation)                     |

### Wildcard props

Property keys in curly braces act as a wildcard:

```js
store.on("users.{userId}", async ({ userId }) => {
  userId // "bob"
})

await store.set("users.bob.admin", true)
```

### Check for changes

The `changed(prop)` function tests if a property value changed.

The return value of `changed(prop)` is truthy and doubles as a way to retrieve prop keys:

```js
store.on("users", async ({ changed }) => {
  // ✓ Changed
  changed("users.{userId}.{attr}") // { userId: "bob", attr: "admin" }
  changed("users.bob.admin") // {}
  changed("users.bob") // {}
  changed("users") // {}

  // ⃠ No change
  changed("users.ted.{attr}") // false
  changed("users.ted") // false
})

await store.set("users.bob.admin", true)
```

### Unsubscribe

```js
const off = store.on("users.bob", async () => {})
off()
```

## Custom operations

Custom operations do not modify the store. They allow you to leverage store eventing to run your own logic.

After initializing the store, add a custom operation:

```js
const store = new Store()
store.op("fetch")
```

Subscribe to the custom event:

```js
store.on("afterFetch", "users", async function({ value }) {
  value // { admin: "true" }
})

await store.fetch("users", { admin: "true" })
```

## Extensions

| Package                                                                                                 | Description                |
| :------------------------------------------------------------------------------------------------------ | :------------------------- |
| [`dot-store-analyze`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-analyze#readme) | Document store operations  |
| [`dot-store-cookie`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-cookie#readme)   | Cookie access              |
| [`dot-store-fs`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-fs#readme)           | Filesystem access          |
| [`dot-store-message`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-message#readme) | Sync via `postMessage` API |
| [`dot-store-react`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-react#readme)     | React integration          |
