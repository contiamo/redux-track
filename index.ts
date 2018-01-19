import { Middleware, Dispatch, Store, Reducer, Action } from "redux"

export type ReduxTrack = (action: Action, payload?: {}) => any

export interface IReduxTrackAction extends Action {
  [key: string]: any
  reduxTrack?: ReduxTrack | ReduxTrack[]
}

export const reduxTrack: Middleware = store => next => <A extends IReduxTrackAction>(action: A): A => {
  const { type, reduxTrack } = action

  if (!reduxTrack) {
    return next(action)
  }

  const payload = { ...(<IReduxTrackAction>action) }
  delete payload.type
  delete payload.reduxTrack

  if (Array.isArray(reduxTrack)) {
    reduxTrack.forEach(fn => fn(type, payload))
    return next(action)
  }

  reduxTrack(type, payload)
  return next(action)
}
