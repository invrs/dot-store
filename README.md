# dot-store

Like Redux, but easy.

## Install

```js
npm install dot-store
```

## Usage

Create an in-memory store:

```js
import Store from "dot-store"
const store = new Store()
```

Mutate state using a [`dot-prop-immutable` interface](https://github.com/debitoor/dot-prop-immutable#readme):

```js
store.set("users", { employees: {} })
store.merge("users.employees", { john: {} })
store.toggle("users.employees.john.admin")
```

Read state:

```js
store.get("users.employees.john")
// or
store.state.users.employees.john
```

And subscribe to changes:

```js
store.subscribe((props, state) => {
  if (props.match(/^users\./)) {
    // do something if users.* is mutated
  }
})
```
