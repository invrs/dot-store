var dotProp = require("..")

describe("dot-prop-immutable.toggle.spec.js", function() {
  var arr = [1, { a: false }]

  var result
  describe("when have an array", () => {
    describe("toggle a value", () => {
      beforeEach(function() {
        result = dotProp.toggle(arr, "1.a")
      })

      it("should toggle prop", () => {
        expect(result).toEqual([1, { a: true }])
      })

      it("invariant", arrInvariant)
    })
  })

  function arrInvariant() {
    expect(arr).toEqual([1, { a: false }])
  }
})
