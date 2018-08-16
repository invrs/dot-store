import React from "react"

const { Provider, Consumer } = React.createContext()

export const withStore = Component =>
  class extends React.Component {
    static async getInitialProps(context) {
      if (Component.getInitialProps) {
        return await Component.getInitialProps(context)
      }
    }

    changeTest(changeTests) {
      return (...matchers) =>
        changeTests.reduce((memo, changeTest) => {
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
          {([changeTests, store]) => (
            <Component
              {...this.props}
              changeTests={changeTests}
              changeTest={this.changeTest(changeTests)}
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
    this.changeTests = []
    this.store = props.store
    this.onUpdate = this.onUpdate.bind(this)
  }

  onUpdate({ change }) {
    this.changeTests = this.changeTests.concat([
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
    const changeTests = this.changeTests.concat([])
    this.changeTests = []

    return (
      <Provider value={[changeTests, this.store]}>
        {this.props.children}
      </Provider>
    )
  }
}
