import { getCrudActionCreators, getCrudActions } from './actions'
import { crudReducer } from './reducers'

export function makeCrud (makeCrudArgs) {
  if (makeCrudArgs.key === undefined) makeCrudArgs.key = 'id'

  if (makeCrudArgs.crudActions === undefined) makeCrudArgs.crudActions = getCrudActions(`${makeCrudArgs.actionPrefix}_CRUD`)

  if (makeCrudArgs.actionCreators === undefined) makeCrudArgs.actionCreators = getCrudActionCreators(makeCrudArgs.crudActions)

  if (makeCrudArgs.serviceFactory === undefined) {
    makeCrudArgs.serviceFactory = (serviceFactoryArgs) => {
      const mergedArgs = {
        ...makeCrudArgs,
        ...serviceFactoryArgs
      }

      return mergedArgs.makeCrudService({
        makeCrudArgs,
        serviceFactoryArgs,
        ...mergedArgs
      })
    }
  }

  if (makeCrudArgs.service === undefined) makeCrudArgs.service = makeCrudArgs.serviceFactory(makeCrudArgs.serviceFactoryArgs)

  if (makeCrudArgs.makeRequestor === undefined) {
    makeCrudArgs.makeRequestor = (makeRequestorArgs) => {
      const mergedArgs = {
        ...makeCrudArgs,
        ...makeRequestorArgs
      }

      return requestor({
        makeCrudArgs,
        makeRequestorArgs,
        ...mergedArgs
      })
    }
  }

  if (makeCrudArgs.reducers === undefined) {
    makeCrudArgs.reducers = ({ state, action }) => crudReducer({
      state,
      action,
      ...makeCrudArgs
    })
  }

  if (makeCrudArgs.request === undefined) {
    makeCrudArgs.request = {
      fetchList: makeCrudArgs.makeRequestor({ type: 'fetchList' }),
      fetchSingle: makeCrudArgs.makeRequestor({ type: 'fetchSingle' }),
      create: makeCrudArgs.makeRequestor({ type: 'create' }),
      put: makeCrudArgs.makeRequestor({ type: 'put' }),
      delete: makeCrudArgs.makeRequestor({ type: 'delete' }),
      patch: makeCrudArgs.makeRequestor({ type: 'patch' })
    }
  }

  if (makeCrudArgs.additionalRequestors) {
    Object.entries(makeCrudArgs.additionalRequestors).forEach(([additionalRequestorName, additionalRequestor]) => {
      makeCrudArgs.request[additionalRequestorName] = makeCrudArgs.makeRequestor({
        service: makeCrudArgs.serviceFactory(additionalRequestor.serviceFactoryArgs),
        ...additionalRequestor
      })
    })
  }

  return makeCrudArgs
}

// Creates request wrappers for crud operations
export const requestor = (requestorArgs) => (requestArgs = {}) => {
  const mergedArgs = {
    ...requestorArgs,
    ...requestArgs
  }

  // Default values
  const {
    partitionKeyValue,
    crudRequest,
    actionCreators,
    type,
    serviceFactory,
    id,
    action = actionCreators[type],
    service = serviceFactory(mergedArgs),
    fn = service[type]
  } = mergedArgs
  // if `keyValue` defined in params: use that
  // else if `partitionKeyValue` and `id` defined in params: use `{parentId}:{id}`
  // else: set it to `id` (which may be `undefined` (e.g. create), in which case we will set it in the response)
  const keyValue = mergedArgs.keyValue !== undefined ? mergedArgs.keyValue
    : partitionKeyValue && id ? `${partitionKeyValue}:${id}`
      : partitionKeyValue ? partitionKeyValue // eslint-disable-line no-unneeded-ternary
        : id

  return crudRequest({
    requestorArgs,
    requestArgs,
    ...mergedArgs,
    id,
    keyValue,
    action,
    service,
    fn
  })
}

export function getServerError ({ responseBody }) {
  return responseBody
}

export function getRecordsForPartition ({ records, partitionKeyValue }) {
  return Object
    .keys(records)
    .filter(key => key.startsWith(`${partitionKeyValue}:`))
    .map(key => records[key])
}
