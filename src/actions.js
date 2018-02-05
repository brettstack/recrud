import { createAction } from 'redux-actions'

export const RECRUD_ACTION_META_KEY = '@@recrud/ACTION'
const isRecrudActionMetaCreator = () => ({ [RECRUD_ACTION_META_KEY]: true })

function getCrudStateActionCreators (crudActions) {
  return {
    request: createAction(crudActions.REQUEST, null, isRecrudActionMetaCreator),
    success: createAction(crudActions.SUCCESS, null, isRecrudActionMetaCreator),
    failure: createAction(crudActions.FAILURE, null, isRecrudActionMetaCreator)
  }
}

function getCrudActionStates (base, action) {
  return {
    _BASE: `${base}_${action}`,
    REQUEST: `${base}_${action}_REQUEST`,
    SUCCESS: `${base}_${action}_SUCCESS`,
    FAILURE: `${base}_${action}_FAILURE`
  }
}

export function getCrudActions (base) {
  const actions = {}
  const actionKeys = ['FETCH_LIST', 'FETCH_SINGLE', 'CREATE', 'PUT', 'PATCH', 'DELETE']

  actionKeys.forEach((actionKey) => {
    actions[actionKey] = getCrudActionStates(base, actionKey)
  })

  return actions
}

export function getCrudActionCreators (crudActions) {
  const crudActionCreators = {
    fetchList: getCrudStateActionCreators(crudActions.FETCH_LIST),
    fetchSingle: getCrudStateActionCreators(crudActions.FETCH_SINGLE),
    create: getCrudStateActionCreators(crudActions.CREATE),
    put: getCrudStateActionCreators(crudActions.PUT),
    patch: getCrudStateActionCreators(crudActions.PATCH),
    delete: getCrudStateActionCreators(crudActions.DELETE)
  }

  return crudActionCreators
}
