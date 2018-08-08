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
  - [Subscription wildcards](#subscription-wildcards)
  - [Subscription options](#subscription-options)
  - [Unsubscribe](#unsubscribe)
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

| Operation | Async | Description                         |
| :-------- | :---- | :---------------------------------- |
| `get(props)`     | no    | Read property                       |
| `delete(props)`  | yes   | Delete property                     |
| `merge(prop, value)`   | yes   | Merge property with array or object |
| `set(props, value)`     | yes   | Set property                        |
| `time(props)`    | yes   | Set property to current timestamp   |
| `toggle(props)`  | yes   | Toggle boolean property             |

Async store operations only resolve once all subscription listeners finish.

## Store subscribers

| Subscriber | Timing                                                |
| :----------- | :---------------------------------------------------------- |
| `on(prop, listener)`         | Emits every property change                      |
| `once(prop, listener)`       | Emits once after a property change                       |
| `onceExists(prop, listener)` | Emits once after a property change or if the property already exists |

Subscribers may also receive a third argument, a `"before"` string, to emit before the property changes.

### Subscription wildcards

Properties in curly braces act as a wildcard for the subscription:

```js
store.on("users.{login}", async ({ login }) => {
  login // "bob"
})

await store.set("users.bob.admin", true)
```

### Subscription options

Subscriptions receive an options argument with lots of useful stuff:

| Argument | Description                                   |
| :---------------- | :-------------------------------------------- |
| `changed`         | Function to check which props changed            |
| `event`           | Event tense (`before` or `after`)       |
| `listenProp`      | Subscription props string                     |
| `listenProps`     | Subscription props array                      |
| `listenPrev`      | Subscription props value (before operation)   |
| `listenValue`     | Subscription props value (after operation)    |
| `op`              | Operation string (`get`, `delete`, etc)       |
| `prop`            | Changed props |
| `props`           | Changed props array                        |
| `value`           | Changed props value                        |
| `prev`            | Previous changed property value               |
| `prevState`       | Previous state snapshot                       |
| `state`           | State snapshot                                |
| `store`           | Store instance                                |

The `changed` function can be used to check which child prop values changed:

```js
store.on("users.bob", async ({ changed }) => {
  if (changed("users.bob.admin")) {
    console.log("bob's admin status changed")
  }
})
```

You can also use it to extract keys from a changed prop:

```js
store.on("users.bob", async ({ changed }) => {
  const { prop } = changed("users.bob.{prop}") || {}
  if (prop) {
    console.log(`bob's ${prop} status changed`)
  }
})
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

Use the custom operation the same as you would any other:

```js
store.on("fetch", "users", async function({ value }) {
  value // { admin: "true" }
})

await store.fetch("users", { admin: "true" })
```

## Extensions

| Package                                                                                                 | Description                        |
| :------------------------------------------------------------------------------------------------------ | :--------------------------------- |
| [`dot-store-analyze`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-analyze#readme) | Document store operations          |
| [`dot-store-cookie`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-cookie#readme)   | Cookie access                      |
| [`dot-store-fs`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-fs#readme)           | Filesystem access                  |
| [`dot-store-iframe`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-iframe#readme)       | Iframe & DFP access (browser only) |
| [`dot-store-message`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-message#readme) | Sync via `postMessage` API         |
| [`dot-store-react`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-react#readme)     | React integration                  |
