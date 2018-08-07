# dot-store

Store and event emitter in one — async, immutable, self-documenting, and highly extensible!

![pale blue dot](https://qph.fs.quoracdn.net/main-qimg-347d2c178e6bf511ee5b91e8276c79fa)

## Install

```bash
npm install --save dot-store
```

## Create a store instance

```js
import Store from "dot-store"
const store = new Store()
```

## Set values (immutable)

```js
await store.set("users.bob.admin", true)
```

## Get values

```js
store.get("users.bob.admin") // true
store.get() // { users: { bob: { admin: true } } }
```

## Out-of-the-box Operations

| Operation | Async | Description                         |
| :-------- | :---- | :---------------------------------- |
| `get`     | no    | Read property                       |
| `delete`  | yes   | Delete property                     |
| `merge`   | yes   | Merge property with array or object |
| `set`     | yes   | Set property                        |
| `time`    | yes   | Set property to current timestamp   |
| `toggle`  | yes   | Toggle boolean property             |

## Asynchronous

What does it mean when we say `dot-store` is async?

Store operations return a promise that resolves once all subscriptions to that change finish.

This makes it easy to update logic around store updates without needing to change the operation call.

## Subscribe to changes

```js
store.on("users.bob", async ({ changed }) => {
  if (changed("users.bob.admin")) {
    console.log("bob's admin status changed")
  }
})
```

## Dynamic subscriptions

Use curly brace notation to perform a wildcard match on a property:

```js
store.on("users.{login}", async ({ login }) => {
  login // "bob"
})

await store.set("users.bob.admin", true)
```

## Out-of-the-box Subscribers

| Subscriber   | Event Timing                                                |
| :----------- | :---------------------------------------------------------- |
| `on`         | Emit event after every property change                      |
| `once`       | Emit event once after property change                       |
| `onceExists` | Emit event once if property exists or after property change |

## Subscription arguments

Subscriptions receive a lot of useful arguments:

| Listener argument | Description                                   |
| :---------------- | :-------------------------------------------- |
| `changed`         | Function to check if props changed            |
| `event`           | Event type string (`before` or `after`)       |
| `listenProp`      | Subscription props string                     |
| `listenProps`     | Subscription props array                      |
| `listenPrev`      | Subscription props value (before operation)   |
| `listenValue`     | Subscription props value (after operation)    |
| `op`              | Operation string (`get`, `delete`, etc)       |
| `prop`            | Changed property (may be within `listenProp`) |
| `props`           | Changed property array                        |
| `value`           | Changed property value                        |
| `prev`            | Previous changed property value               |
| `prevState`       | Previous state snapshot                       |
| `state`           | State snapshot                                |
| `store`           | Store instance                                |

## Custom operations

After initializing the store, you can add custom operations:

```js
store.op("fetch")
```

Then use `fetch` similarly as `set`:

```js
store.on("fetch", "users", async function({ value }) {
  value // { admin: "true" }
})

await store.fetch("users", { admin: "true" })
```

Custom operations do not modify the store unless you do so from the subscription.

## Unsubscribe

```js
const off = store.on("users.bob", async () => {})
off()
```

## Extensions

| Package                                                                                                 | Description                        |
| :------------------------------------------------------------------------------------------------------ | :--------------------------------- |
| [`dot-store-analyze`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-analyze#readme) | Document store operations          |
| [`dot-store-cookie`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-cookie#readme)   | Cookie access                      |
| [`dot-store-fs`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-fs#readme)           | Filesystem access                  |
| [`dot-store-iframe`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-fs#readme)       | Iframe & DFP access (browser only) |
| [`dot-store-message`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-message#readme) | Sync via `postMessage` API         |
| [`dot-store-react`](https://github.com/invrs/dot-store/tree/master/packages/dot-store-react#readme)     | React integration                  |
