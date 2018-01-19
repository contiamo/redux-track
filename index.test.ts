import { reduxTrack } from "./"
import { createStore, applyMiddleware } from "redux"

describe("Redux Track", () => {
  beforeEach(() => {
    const rootReducer = (state = true, action) => {
      switch (action.type) {
        default:
          return state
      }
    }

    global.myStore = createStore(rootReducer, applyMiddleware(reduxTrack))
    global.myFn = jest.fn()
  })

  it("Should correctly apply middleware", () => {
    myStore.dispatch({ type: "ACTION", otherStuff: [1, 2, 3], reduxTrack: myFn })

    expect(myFn.mock.calls.length).toBe(1)
    expect(myFn.mock.calls[0][1]).toEqual({ otherStuff: [1, 2, 3] })
  })

  it("Should handle multiple trackers", () => {
    const myOtherFn = jest.fn()
    const myOtherOtherFn = jest.fn()
    myStore.dispatch({ type: "ACTION", otherStuff: [1, 2, 3], reduxTrack: [myFn, myOtherFn, myOtherOtherFn] })

    expect(myFn.mock.calls.length).toBe(1)
    expect(myOtherFn.mock.calls.length).toBe(1)
    expect(myOtherOtherFn.mock.calls.length).toBe(1)
    expect(myFn.mock.calls[0][1]).toEqual({ otherStuff: [1, 2, 3] })
    expect(myOtherFn.mock.calls[0][1]).toEqual({ otherStuff: [1, 2, 3] })
    expect(myOtherOtherFn.mock.calls[0][1]).toEqual({ otherStuff: [1, 2, 3] })
  })

  it("Should silently delegate to the next dispatch if no reduxTrack function specified", () => {
    expect(myStore.dispatch({ type: "ACTION", otherStuff: [1, 2, 3] })).toEqual({
      type: "ACTION",
      otherStuff: [1, 2, 3],
    })
  })
})
