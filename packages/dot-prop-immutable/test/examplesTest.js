var dotProp = require("..")

describe("examples test", function() {
  describe("when get", function() {
    it("prop", function() {
      expect(
        dotProp.get({ foo: { bar: "unicorn" } }, "foo.bar")
      ).toEqual("unicorn")
    })

    it("prop undefined", function() {
      expect(
        dotProp.get(
          { foo: { bar: "a" } },
          "foo.notDefined.deep"
        )
      ).toEqual(undefined)
    })

    it("prop with dot", function() {
      expect(
        dotProp.get(
          { foo: { "dot.dot": "unicorn" } },
          "foo.dot\\.dot"
        )
      ).toEqual("unicorn")
    })

    it("use an array as get path", function() {
      expect(
        dotProp.get({ foo: { "dot.dot": "unicorn" } }, [
          "foo",
          "dot.dot",
        ])
      ).toEqual("unicorn")
    })

    it("index", function() {
      expect(
        dotProp.get(
          {
            foo: [
              { bar: "gold-unicorn" },
              "white-unicorn",
              "silver-unicorn",
            ],
          },
          "foo.1"
        )
      ).toEqual("white-unicorn")
    })

    it("index deep", function() {
      expect(
        dotProp.get(
          {
            foo: [
              { bar: "gold-unicorn" },
              "white-unicorn",
              "silver-unicorn",
            ],
          },
          "foo.0.bar"
        )
      ).toEqual("gold-unicorn")
    })

    it("array index", function() {
      expect(
        dotProp.get(
          [
            { bar: "gold-unicorn" },
            "white-unicorn",
            "silver-unicorn",
          ],
          "0.bar"
        )
      ).toEqual("gold-unicorn")
    })

    it("index $end", function() {
      expect(
        dotProp.get(
          {
            foo: [
              { bar: "gold-unicorn" },
              "white-unicorn",
              "silver-unicorn",
            ],
          },
          "foo.$end"
        )
      ).toEqual("silver-unicorn")
      expect(dotProp.get({ foo: [] }, "foo.$end")).toEqual(
        undefined
      )
      expect(
        dotProp.set({ foo: [] }, "foo.$end", "bar")
      ).toEqual({ foo: ["bar"] })
    })
  })

  describe("when set", function() {
    var obj = { foo: { bar: "a" } }
    var obj1, obj2, obj3

    describe("when prop", function() {
      beforeEach(function() {
        obj1 = dotProp.set(obj, "foo.bar", "b")
      })

      it("obj1", function() {
        expect(obj1).toEqual({ foo: { bar: "b" } })
      })

      describe("when prop undefined", function() {
        beforeEach(function() {
          obj2 = dotProp.set(obj1, "foo.baz", "x")
        })

        it("obj2", function() {
          expect(obj2).toEqual({
            foo: { bar: "b", baz: "x" },
          })
        })

        describe("when prop undefined", function() {
          beforeEach(function() {
            obj3 = dotProp.set(
              obj2,
              "foo.dot\\.dot",
              "unicorn"
            )
          })

          it("obj3", function() {
            expect(obj3).toEqual({
              foo: {
                bar: "b",
                baz: "x",
                "dot.dot": "unicorn",
              },
            })
          })

          it("obj !== obj1", function() {
            expect(obj).not.toEqual(obj1)
          })

          it("obj1 !== obj2", function() {
            expect(obj1).not.toEqual(obj2)
          })

          it("obj2 !== obj3", function() {
            expect(obj2).not.toEqual(obj3)
          })
        })
      })
    })

    it("Use an array as set path", function() {
      expect(
        dotProp.set(
          { foo: { bar: "b", baz: "x" } },
          ["foo", "dot.dot"],
          "unicorn"
        )
      ).toEqual({
        foo: { bar: "b", baz: "x", "dot.dot": "unicorn" },
      })
    })

    it("Setter where value is a function", function() {
      expect(
        dotProp.set(obj, "foo.bar", v => v + "bc")
      ).toEqual({ foo: { bar: "abc" } })
    })

    it("Index into array", function() {
      expect(
        dotProp.set(
          {
            foo: [
              { bar: "gold-unicorn" },
              "white-unicorn",
              "silver-unicorn",
            ],
          },
          "foo.1",
          "platin-unicorn"
        )
      ).toEqual({
        foo: [
          { bar: "gold-unicorn" },
          "platin-unicorn",
          "silver-unicorn",
        ],
      })
    })

    it("Index into array deep", function() {
      expect(
        dotProp.set(
          {
            foo: [
              { bar: "gold-unicorn" },
              "white-unicorn",
              "silver-unicorn",
            ],
          },
          "foo.0.bar",
          "platin-unicorn"
        )
      ).toEqual({
        foo: [
          { bar: "platin-unicorn" },
          "white-unicorn",
          "silver-unicorn",
        ],
      })
    })

    it("Array", function() {
      expect(
        dotProp.set(
          [
            { bar: "gold-unicorn" },
            "white-unicorn",
            "silver-unicorn",
          ],
          "0.bar",
          "platin-unicorn"
        )
      ).toEqual([
        { bar: "platin-unicorn" },
        "white-unicorn",
        "silver-unicorn",
      ])
    })

    it("Index into array", function() {
      expect(
        dotProp.set(
          {
            foo: [
              { bar: "gold-unicorn" },
              "white-unicorn",
              "silver-unicorn",
            ],
          },
          "foo.$end",
          "platin-unicorn"
        )
      ).toEqual({
        foo: [
          { bar: "gold-unicorn" },
          "white-unicorn",
          "platin-unicorn",
        ],
      })
    })
  })

  describe("when delete", function() {
    it("Array element by index", function() {
      expect(
        dotProp.delete(
          {
            foo: [
              { bar: "gold-unicorn" },
              "white-unicorn",
              "silver-unicorn",
            ],
          },
          "foo.1"
        )
      ).toEqual({
        foo: [{ bar: "gold-unicorn" }, "silver-unicorn"],
      })
    })

    it("Array element by $end", function() {
      expect(
        dotProp.delete(
          {
            foo: [
              { bar: "gold-unicorn" },
              "white-unicorn",
              "silver-unicorn",
            ],
          },
          "foo.$end"
        )
      ).toEqual({
        foo: [{ bar: "gold-unicorn" }, "white-unicorn"],
      })
    })

    it("Out of array", function() {
      expect(
        dotProp.delete(
          {
            foo: [
              { bar: "gold-unicorn" },
              "white-unicorn",
              "silver-unicorn",
            ],
          },
          "foo.10"
        )
      ).toEqual({
        foo: [
          { bar: "gold-unicorn" },
          "white-unicorn",
          "silver-unicorn",
        ],
      })
    })

    it("Array indexed by a property", function() {
      try {
        dotProp.delete(
          {
            foo: [
              { bar: "gold-unicorn" },
              "white-unicorn",
              "silver-unicorn",
            ],
          },
          "foo.bar"
        )
      } catch (err) {
        expect(err).toEqual(
          new Error(
            "Array index 'bar' has to be an integer"
          )
        )
      }
    })

    it("Deep prop", function() {
      expect(
        dotProp.delete(
          {
            foo: [
              { bar: "gold-unicorn" },
              "white-unicorn",
              "silver-unicorn",
            ],
          },
          "foo.0.bar"
        )
      ).toEqual({
        foo: [{}, "white-unicorn", "silver-unicorn"],
      })
    })
  })
})
