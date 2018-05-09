# dot-store-react

React integration for [dot-store](https://github.com/invrs/dot-store).

## Install

```bash
npm install --save dot-store-react
```

## Provider

Add `StoreProvider` to your component tree:

```js
import Store from "dot-store"
import { StoreProvider } from "dot-store-react"

export default class Layout extends React.Component {
  constructor(props) {
    super(props)
    this.store = new Store({ counter: 0 })
  }
  render() {
    return (
      <StoreProvider store={this.store}>
        {this.props.children}
      </StoreProvider>
    )
  }
)
```

## Consumer

```js
import { withStore } from "dot-store-react"

class Page extends React.Component {
  shouldComponentUpdate({ detectChanges }) {
    return detectChanges("counter")
  }

  render() {
    return this.props.state.counter
  }
}

export default withStore(Page)
```

## Props

| Prop            | Type                  | Description                            |
| --------------- | --------------------- | -------------------------------------- |
| `changes`       | `Array[String]`       | Changed dot-props                      |
| `detectChanges` | `Function<...String>` | Change match helper                    |
| `state`         | `Object`              | The `store.state` value at render time |
| `store`         | `DotStore`            | The store                              |

**Tip:** The `detectChange` helper can match the prop **and** its children by adding `.*` to the end of the match string.
