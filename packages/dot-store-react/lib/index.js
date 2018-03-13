import React from "react"
import reactContext from "create-react-context"

const StoreContext = reactContext()

export const withStore = Component =>
  class extends React.Component {
    static async getInitialProps(context) {
      if (Component.getInitialProps) {
        return await Component.getInitialProps(context)
      }
    }

    render() {
      return (
        <StoreContext.Consumer>
          {([changes, store]) => (
            <Component changes={changes} store={store} />
          )}
        </StoreContext.Consumer>
      )
    }
  }

export class StoreProvider extends React.Component {
  constructor(props) {
    super(props)
    this.changes = []
    this.store = props.store
    this.subscribe()
  }

  subscribe() {
    this.store.subscribe(change => {
      this.changes = this.changes.concat([change])
      this.forceUpdate()
    })
  }

  render() {
    let changes = this.changes.concat([])
    this.changes = []

    return (
      <StoreContext.Provider value={[changes, this.store]}>
        {this.props.children}
      </StoreContext.Provider>
    )
  }
}
