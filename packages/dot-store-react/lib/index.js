import React from "react"

const { Provider, Consumer } = React.createContext()

export const withStore = Component =>
  class extends React.Component {
    static async getInitialProps(context) {
      if (Component.getInitialProps) {
        return await Component.getInitialProps(context)
      }
    }

    changeTest(changeTestFns) {
      return (...matchers) =>
        changeTestFns.reduce((memo, changeTest) => {
          let out = changeTest(...matchers)

          if (out) {
            return { ...(memo || {}), ...out }
          } else {
            return memo
          }
        }, false)
    }

    render() {
      return (
        <Consumer>
          {([changeTestFns, store]) => (
            <Component
              {...this.props}
              changeTestFns={changeTestFns}
              changeTest={this.changeTest(changeTestFns)}
              state={store.state}
              store={store}
            />
          )}
        </Consumer>
      )
    }
  }

export const withStoreProvider = createStore => Component =>
  class extends React.Component {
    static displayName = `withStoreProvider(${
      Component.displayName
    })`

    static async getInitialProps(context) {
      const store = createStore()

      let props = {}

      if (Component.getInitialProps) {
        props = await Component.getInitialProps({
          ...context,
          store,
        })
      }

      return { ...props, storeState: store.state }
    }

    constructor(props) {
      super(props)
      this.store = createStore({ state: props.storeState })
    }

    render() {
      return (
        <StoreProvider store={this.store}>
          <Component {...this.props} />
        </StoreProvider>
      )
    }
  }

export class StoreProvider extends React.Component {
  constructor(props) {
    super(props)
    this.changeTestFns = []
    this.store = props.store
    this.onUpdate = this.onUpdate.bind(this)
  }

  onUpdate({ change }) {
    this.changeTestFns = this.changeTestFns.concat([
      change.test,
    ])
    this.forceUpdate()
  }

  componentDidMount() {
    this.store.on(this.onUpdate)
  }

  componentWillUnmount() {
    this.store.off(this.onUpdate)
  }

  render() {
    const changeTestFns = this.changeTestFns.concat([])
    this.changeTestFns = []

    return (
      <Provider value={[changeTestFns, this.store]}>
        {this.props.children}
      </Provider>
    )
  }
}
