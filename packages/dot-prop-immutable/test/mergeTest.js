/* eslint-disable sort-keys */

var dotProp = require("..")

describe("merge test", function() {
  var obj = {
    a: 1,
    b: {
      x: 1,
      y: 2,
    },
    c: [1, 2],
    d: null,
    "b.x": 10,
  }

  var result
  describe("when have an object", () => {
    describe("merge an object value into object", () => {
      beforeEach(function() {
        result = dotProp.merge(obj, "b", { z: 3 })
      })

      it("should merge prop", () => {
        expect(result).toEqual({
          a: 1,
          b: {
            x: 1,
            y: 2,
            z: 3,
          },
          c: [1, 2],
          d: null,
          "b.x": 10,
        })
      })

      it("invariant", objInvariant)
    })

    describe("merge an array value into array", () => {
      beforeEach(function() {
        result = dotProp.merge(obj, "c", [3, 4])
      })

      it("should merge prop", () => {
        expect(result).toEqual({
          a: 1,
          b: {
            x: 1,
            y: 2,
          },
          c: [1, 2, 3, 4],
          d: null,
          "b.x": 10,
        })
      })

      it("invariant", objInvariant)
    })

    describe("merge an object value into null", () => {
      beforeEach(function() {
        result = dotProp.merge(obj, "d", { foo: "bar" })
      })

      it("should merge prop", () => {
        expect(result).toEqual({
          a: 1,
          b: {
            x: 1,
            y: 2,
          },
          c: [1, 2],
          d: { foo: "bar" },
          "b.x": 10,
        })
      })

      it("invariant", objInvariant)
    })

    describe("merge an object value into undefined", () => {
      beforeEach(function() {
        result = dotProp.merge(obj, "z", { foo: "bar" })
      })

      it("should merge prop", () => {
        expect(result).toEqual({
          a: 1,
          b: {
            x: 1,
            y: 2,
          },
          c: [1, 2],
          d: null,
          z: { foo: "bar" },
          "b.x": 10,
        })
      })

      it("invariant", objInvariant)
    })
  })

  function objInvariant() {
    expect(obj).toEqual({
      a: 1,
      b: {
        x: 1,
        y: 2,
      },
      c: [1, 2],
      d: null,
      "b.x": 10,
    })
  }
})
