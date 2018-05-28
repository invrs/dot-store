var dotProp = require("..")

describe("number test", function() {
  var arr = [1, { a: false }]

  var result
  describe("when have an array", () => {
    describe("when set prop using number as path", () => {
      beforeEach(function() {
        result = dotProp.set(arr, 1, 3)
      })

      it("should replace prop", () => {
        expect(result).toEqual([1, 3])
      })

      it("invariant", arrInvariant)
    })

    describe("when get prop using number as path", () => {
      beforeEach(function() {
        result = dotProp.get(arr, 1)
      })

      it("should get prop", () => {
        expect(result).toEqual({ a: false })
      })

      it("invariant", arrInvariant)
    })

    describe("when delete prop using number as path", () => {
      beforeEach(function() {
        result = dotProp.delete(arr, 1)
      })

      it("should remove prop", () => {
        expect(result).toEqual([1])
      })
      it("invariant", arrInvariant)
    })
  })

  function arrInvariant() {
    expect(arr).toEqual([1, { a: false }])
  }
})
