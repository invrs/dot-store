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
    - [The `changed` function](#the-changed-function)
  - [Wildcard subscription props](#wildcard-subscription-props)
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

```js
store.on("users.bob", async () => {
  console.log("bob changed")
})
```

Listeners execute when the value at the subscription prop changes **and also when any child value changes**.

## Store operations

| Operation            | Async | Description                         |
| :------------------- | :---- | :---------------------------------- |
| `get(props)`         | no    | Read property                       |
| `delete(props)`      | yes   | Delete property                     |
| `merge(prop, value)` | yes   | Merge property with array or object |
| `set(props, value)`  | yes   | Set property                        |
| `time(props)`        | yes   | Set property to current timestamp   |
| `toggle(props)`      | yes   | Toggle boolean property             |

Async store operations only resolve once all subscription listeners finish.

## Store subscribers

| Subscriber                          | Timing                                                               |
| :---------------------------------- | :------------------------------------------------------------------- |
| `on(event, prop, listener)`         | Emits every property change                                          |
| `once(event, prop, listener)`       | Emits once after a property change                                   |
| `onceExists(event, prop, listener)` | Emits once after a property change or if the property already exists |

Typically we omit the `event` parameter, as it defaults to `afterUpdate` when not specified.

The `event` parameter is sometimes used to specify a `beforeUpdate` event or to subscribe to a [custom operation](#custom-operations).

### Subscription options

Subscriptions receive an options argument with lots of useful stuff:

```js
store.on("users.bob", async options => {
  // do stuff with options
})
await store.set("users.bob.admin", true)
```

The `options` in the above subscriber would contain the following values:

| Argument      | Example value                         | Description                                 |
| :------------ | :------------------------------------ | :------------------------------------------ |
| `changed`     | `<Function>`                          | Function to check which props changed       |
| `store`       | `<DotStore>`                          | Store instance                              |
| `event`       | `"after"`                             | Event tense           |
| `op`          | `"set"`                               | Operation string     |
| `listenProp`  | `"users.bob"`                         | Subscription props string                   |
| `listenProps` | `["users", "bob"]`                    | Subscription props array                    |
| `listenPrev`  | `undefined`                           | Subscription props value (before operation) |
| `listenValue` | `{ admin: true }`                     | Subscription props value (after operation)  |
| `prop`        | `"users.bob.admin"`                   | Changed props                               |
| `props`       | `["users", "bob", "admin"]`           | Changed props array                         |
| `prev`        | `undefined`                           | Changed props value (before operation)      |
| `value`       | `true`                                | Changed props value (after operation)       |
| `prevState`   | `{}`                                  | State (before operation)                    |
| `state`       | `{ users: { bob: { admin: true } } }` | State (after operation)                     |

#### The `changed` function

The `changed` function returns a truthy value based on whether the value at the passed prop was changed.

The return value doubles as a way to retrieve keys of the changed prop:

```js
store.on(
  "users",
  async ({ changed, prop, listenProp, value }) => {
    changed("users.{userId}.{prop}") // { userId: "bob", prop: "admin" }

    changed("users.bob") // {}
    changed("users.bob.admin") // {}

    changed("users.bob.role") // false
    changed("users.ted") // false
  }
)

await store.set("users.bob.admin", true)
```

### Wildcard subscription props

Properties in curly braces act as a wildcard for the subscription:

```js
store.on("users.{login}", async ({ login }) => {
  login // "bob"
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

After initializing the store, you may add a custom operation:

```js
const store = new Store()
store.op("fetch")
```

Specify the custom event when you subscribe:

```js
store.on("afterFetch", "users", async function({ value }) {
  value // { admin: "true" }
})

await store.fetch("users", { admin: "true" })
```

Custom operations do not emit the default `afterUpdate` events.

## Extensions

| Package                                                                                                 | Description                |
| :------------------------------------------------------------------------------------------------------ | :------------------------- |
| [`dot-store-analyze`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-analyze#readme) | Document store operations  |
| [`dot-store-cookie`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-cookie#readme)   | Cookie access              |
| [`dot-store-fs`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-fs#readme)           | Filesystem access          |
| [`dot-store-message`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-message#readme) | Sync via `postMessage` API |
| [`dot-store-react`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-react#readme)     | React integration          |
