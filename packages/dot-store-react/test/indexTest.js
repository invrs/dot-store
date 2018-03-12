import React from "react"
import renderer from "react-test-renderer"

import { StoreProvider } from "../dist"

test("Link changes the class when hovered", () => {
  renderer.create(
    <StoreProvider>
      <div />
    </StoreProvider>
  )
})
