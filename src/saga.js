import { put, call } from 'redux-saga/effects'

export function * crudRequest ({
  action,
  id,
  key,
  partitionKey,
  partitionKeyValue,
  keyValue,
  fn,
  requestParameters,
  getKeyValueFromResponseData,
  clearRecords,
  responseCollectionKey
}) {
  const responsePayload = {
    id,
    key,
    partitionKey,
    partitionKeyValue,
    keyValue,
    getKeyValueFromResponseData,
    clearRecords,
    responseCollectionKey
  }
  try {
    yield put(action.request({ id, keyValue, requestData: requestParameters }))

    const fnResponse = yield call(fn, { id, requestParameters })
    const successPayload = {
      ...responsePayload,
      ...fnResponse
    }

    if (fnResponse.success) {
      yield put(action.success(successPayload))
    } else {
      yield put(action.failure(successPayload))
    }

    return fnResponse
  } catch (error) {
    const errorPayload = {
      ...responsePayload,
      error
    }
    yield put(action.failure(errorPayload))
    throw error
  }
}
