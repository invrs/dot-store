import React from "react"
import renderer from "react-test-renderer"

import { StoreProvider, withStore } from "../dist"
import Store from "../../../dist"

test("props", () => {
  let props

  const Component = withStore(
    class extends React.Component {
      render() {
        props = this.props
        return null
      }
    }
  )

  renderer.create(
    <StoreProvider>
      <Component />
    </StoreProvider>
  )

  expect(props.changes).toBeInstanceOf(Array)
  expect(props.store).toBeInstanceOf(Store)
})
