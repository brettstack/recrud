import { getServerError } from './service'
import { RECRUD_ACTION_META_KEY } from './actions'

function getDefaultErrorObject () {
  return {
    message: ''
  }
}

function getDefaultErrorsObject () {
  return {
    fetchList: getDefaultErrorObject(),
    fetchSingle: getDefaultErrorObject(),
    create: getDefaultErrorObject(),
    put: getDefaultErrorObject(),
    update: getDefaultErrorObject(),
    delete: getDefaultErrorObject()
  }
}

const STATES = {
  isFetchingList: false,
  isFetchingSingle: false,
  isCreating: false,
  isPutting: false,
  isUpdating: false,
  isDeleting: false
}

export const COMMON_INITIAL_STATE = {
  states: { ...STATES },
  error: getDefaultErrorObject(),
  errors: getDefaultErrorsObject(),
  records: {}
}

const DEFAULT_ITEM = {
  states: { ...STATES },
  error: getDefaultErrorObject(),
  errors: getDefaultErrorsObject(),
  data: {}
}

export function reduceState ({ state, states = {}, error = {}, errors = {}, records = {}, additional = {} }) {
  const newState = {
    ...state,
    records: {
      ...state.records,
      ...records
    },
    states: {
      ...state.states,
      ...states
    },
    error: {
      ...state.error,
      ...error
    },
    errors: {
      ...state.errors,
      ...errors
    },
    ...additional
  }

  return newState
}

export function reduceRecords ({ state, keyValue, states = {}, error = {}, errors = {}, data = {}, additional = {}, ignoreIfNoExist = false }) {
  if (keyValue === undefined) return { ...state.records }

  if (ignoreIfNoExist && !state.records[keyValue]) {
    console.warn(`Cannot find record ${keyValue} in`, state.records)

    return { ...state.records }
  }

  const records = {
    ...state.records,
    [keyValue]: reduceRecord({ state, keyValue, states, error, errors, data, additional, ignoreIfNoExist })
  }

  return records
}

export function reduceRecord ({ state, keyValue, states = {}, error = {}, errors = {}, data = {}, additional = {}, ignoreIfNoExist = false }) {
  const record = state.records[keyValue] || { ...DEFAULT_ITEM }

  if (ignoreIfNoExist && !state.records[keyValue]) {
    console.warn(`Cannot find record ${keyValue} in`, state.records)

    return { ...record }
  }

  return {
    ...DEFAULT_ITEM,
    ...record,
    data: {
      ...record.data,
      ...data
    },
    states: {
      ...record.states,
      ...states
    },
    error: {
      ...record.error,
      ...error
    },
    errors: {
      ...record.errors,
      ...errors
    },
    ...additional
  }
}

function getActionKeys ({ crudActions, action }) {
  const CRUD_FETCH_SINGLE = crudActions.FETCH_SINGLE._BASE
  const CRUD_FETCH_LIST = crudActions.FETCH_LIST._BASE
  const CRUD_CREATE = crudActions.CREATE._BASE
  const CRUD_PUT = crudActions.PUT._BASE
  const CRUD_PATCH = crudActions.PATCH._BASE
  const CRUD_DELETE = crudActions.DELETE._BASE
  const actionKeyMap = {
    [CRUD_FETCH_SINGLE]: {
      isStatingKey: 'isFetchingSingle',
      errorKey: 'fetchSingle'
    },
    [CRUD_FETCH_LIST]: {
      isStatingKey: 'isFetchingList',
      errorKey: 'fetchList'
    },
    [CRUD_CREATE]: {
      isStatingKey: 'isCreating',
      errorKey: 'create'
    },
    [CRUD_PUT]: {
      isStatingKey: 'isPutting',
      errorKey: 'put'
    },
    [CRUD_PATCH]: {
      isStatingKey: 'isUpdating',
      errorKey: 'update'
    },
    [CRUD_DELETE]: {
      isStatingKey: 'isDeleting',
      errorKey: 'delete'
    }
  }
  const actionTypeBase = action.type.replace(/_(REQUEST|SUCCESS|FAILURE)$/, '')

  // NOTE: returning {} if no match since this happens before the action type check
  return actionKeyMap[actionTypeBase] || {}
}

function isRecrudAction ({ action }) {
  return action.meta && action.meta[RECRUD_ACTION_META_KEY]
}

export function crudReducer ({ state = {}, action = {}, ...makeCrudArgs }) {
  if (!isRecrudAction({ action })) return state

  const {
    crudActions = makeCrudArgs.crudActions,
    key = makeCrudArgs.key,
    responseCollectionKey = makeCrudArgs.responseCollectionKey,
    partitionKey,
    partitionKeyValue,
    responseData,
    getKeyValueFromResponseData,
    clearRecords = false,
    keyValue = getKeyValue({ key, partitionKey, keyValue: action.payload.keyValue, partitionKeyValue, data: responseData, getKeyValueFromResponseData })
  } = action.payload
  const { isStatingKey, errorKey } = getActionKeys({ crudActions, action })

  switch (action.type) {
    case crudActions.FETCH_LIST.REQUEST: {
      const error = {
        message: ''
      }
      const errors = {
        fetchList: error
      }

      return reduceState({
        state,
        states: {
          isFetchingList: true
        },
        error,
        errors
      })
    }

    case crudActions.FETCH_SINGLE.REQUEST: {
      const error = {
        message: ''
      }
      const errors = {
        fetchSingle: error
      }
      const records = reduceRecords({
        state,
        keyValue,
        states: {
          isFetchingSingle: true
        },
        error,
        errors
      })

      return reduceState({
        state,
        records,
        states: {
          isFetchingSingle: true
        },
        error,
        errors
      })
    }

    case crudActions.CREATE.REQUEST: {
      const error = {
        message: ''
      }
      const errors = {
        create: error
      }

      return reduceState({
        state,
        states: {
          isCreating: true
        },
        error,
        errors
      })
    }

    case crudActions.PUT.REQUEST: {
      const error = {
        message: ''
      }
      const errors = {
        put: error
      }
      const records = reduceRecords({
        state,
        keyValue,
        states: {
          isPutting: true
        },
        error,
        errors
      })

      return reduceState({
        state,
        records,
        states: {
          isPutting: true
        },
        error,
        errors
      })
    }

    case crudActions.PATCH.REQUEST: {
      const error = {
        message: ''
      }
      const errors = {
        update: error
      }
      const records = reduceRecords({
        state,
        keyValue,
        states: {
          isUpdating: true
        },
        error,
        errors
      })

      return reduceState({
        state,
        records,
        states: {
          isUpdating: true
        },
        error,
        errors
      })
    }

    case crudActions.DELETE.REQUEST: {
      const error = {
        message: ''
      }
      const errors = {
        delete: error
      }
      const records = reduceRecords({
        state,
        keyValue,
        states: {
          isDeleting: true
        },
        error,
        errors
      })

      return reduceState({
        state,
        records,
        states: {
          isDeleting: true
        },
        error,
        errors
      })
    }

    case crudActions.FETCH_LIST.SUCCESS: {
      // TODO: Improve clearRecords implementation; this was done hastily
      const records = clearRecords ? {} : { ...state.records }
      const responseCollection = responseCollectionKey ? responseData[responseCollectionKey] : responseData
      const error = {
        message: ''
      }
      const errors = {
        fetchList: error
      }

      responseCollection.forEach((data) => {
        const recordKeyValue = getKeyValue({ getKeyValueFromResponseData, partitionKey, partitionKeyValue, key, data })

        records[recordKeyValue] = reduceRecord({
          state,
          keyValue: recordKeyValue,
          data,
          error,
          errors
        })
      })

      return reduceState({
        state: {
          ...state,
          records: clearRecords ? {} : state.records
        },
        records,
        states: {
          isFetchingList: false
        },
        error,
        errors
      })
    }

    case crudActions.FETCH_SINGLE.SUCCESS: {
      const error = {
        message: ''
      }
      const errors = {
        fetchSingle: error
      }
      const records = reduceRecords({
        state,
        keyValue,
        data: responseData,
        states: {
          isFetchingSingle: false
        },
        error,
        errors
      })

      return reduceState({
        state,
        records,
        states: {
          isFetchingSingle: false
        },
        error,
        errors
      })
    }

    case crudActions.CREATE.SUCCESS: {
      const error = {
        message: ''
      }
      const errors = {
        create: error
      }
      const records = {
        ...state.records,
        [keyValue]: {
          ...DEFAULT_ITEM,
          data: responseData,
          error,
          errors
        }
      }

      return reduceState({
        state,
        records,
        states: {
          isCreating: false
        },
        error,
        errors
      })
    }

    case crudActions.PUT.SUCCESS: {
      const record = state.records[keyValue] || { ...DEFAULT_ITEM }
      const error = {
        message: ''
      }
      const errors = {
        put: error
      }

      const records = {
        ...state.records,
        [keyValue]: {
          ...DEFAULT_ITEM,
          ...record,
          data: responseData,
          states: {
            ...record.states,
            isPutting: false
          },
          error: {
            ...record.error,
            ...error
          },
          errors: {
            ...record.errors,
            ...errors
          }
        }
      }

      return reduceState({
        state,
        records,
        states: {
          isPutting: false
        },
        error,
        errors
      })
    }

    case crudActions.PATCH.SUCCESS: {
      const record = state.records[keyValue] || { ...DEFAULT_ITEM }
      const error = {
        message: ''
      }
      const errors = {
        update: error
      }

      // TODO: use reduceRecord here and everywhere else relevant
      const records = {
        ...state.records,
        [keyValue]: {
          ...DEFAULT_ITEM,
          ...record,
          data: {
            ...record.data,
            responseData
          },
          states: {
            ...record.states,
            isUpdating: false
          },
          error: {
            ...record.error,
            ...error
          },
          errors: {
            ...record.errors,
            ...errors
          }
        }
      }

      return reduceState({
        state,
        records,
        states: {
          isUpdating: false
        },
        error,
        errors
      })
    }

    case crudActions.DELETE.SUCCESS: {
      // Need to remove it from the current state object, otherwise it ends up in the reduceState result
      // when state.records and records are merged
      delete state.records[keyValue]
      const error = {
        message: ''
      }
      const errors = {
        delete: error
      }

      return reduceState({
        state,
        states: {
          isDeleting: false
        },
        error,
        errors
      })
    }

    case crudActions.FETCH_LIST.FAILURE:
    case crudActions.CREATE.FAILURE: {
      const errorMessage = action.payload.error
        ? action.payload.error.message
        : getServerError({ responseBody: action.payload.responseData })
      const error = {
        message: errorMessage
      }
      const errors = {
        [errorKey]: error
      }

      return reduceState({
        state,
        states: {
          [isStatingKey]: false
        },
        error,
        errors
      })
    }

    case crudActions.FETCH_SINGLE.FAILURE:
    case crudActions.PUT.FAILURE:
    case crudActions.PATCH.FAILURE:
    case crudActions.DELETE.FAILURE: {
      const errorMessage = action.payload.error
        ? action.payload.error.message
        : getServerError({ responseBody: responseData })
      const records = { ...state.records }
      const record = records[keyValue]
      const error = {
        message: errorMessage
      }
      const errors = {
        [errorKey]: error
      }

      if (record) {
        records[keyValue] = {
          ...DEFAULT_ITEM,
          ...record,
          [isStatingKey]: false,
          error: {
            ...record.error,
            ...error
          },
          errors: {
            ...record.errors,
            ...errors
          }
        }
      }

      return reduceState({
        state,
        records,
        states: {
          [isStatingKey]: false
        },
        error,
        errors
      })
    }

    default:
      return state
  }
}

function getKeyValue ({ key, partitionKey, keyValue, partitionKeyValue, data, getKeyValueFromResponseData }) {
  return keyValue ? keyValue // eslint-disable-line no-unneeded-ternary
    : typeof getKeyValueFromResponseData === 'function' ? getKeyValueFromResponseData({ responseData: data })
      : partitionKeyValue && key && data && data[key] ? `${partitionKeyValue}:${data[key]}`
        : partitionKey && key && data && data[partitionKey] && data[key] ? `${data[partitionKey]}:${data[key]}`
          : data ? data[key]
            : undefined
}
