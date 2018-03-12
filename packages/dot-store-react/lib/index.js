import React from "react"
import reactContext from "create-react-context"

import Store from "../../../dist"

const StoreContext = reactContext()

export const withStore = Component =>
  class extends React.Component {
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
    this.store = props.store || new Store()
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
