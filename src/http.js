import qs from 'qs'

const DEFAULT_HEADERS = {
  Accept: 'application/json'
}

export async function httpRequest (url, {
  method = 'GET',
  requestParameters = {},
  body = {},
  defaultHeaders = DEFAULT_HEADERS,
  headers = {},
  prefix = ''
} = {}) {
  const credentials = 'same-origin'// send cookies in same-origin requests
  const requestObject = { credentials, method }
  let queryString = ''

  switch (method) {
    case 'GET': {
      const queryStringParams = qs.stringify(requestParameters)

      if (queryStringParams) {
        const queryStringPrefix = url.includes('?') ? '&' : '?'
        queryString = queryStringPrefix + queryStringParams
      }
      break
    }
    case 'DELETE':
    case 'POST':
    case 'PUT':
    case 'PATCH':
      requestObject.body = JSON.stringify(body)
      break
    default:
      throw new Error(`Unsupported method in http request: ${method}`)
  }

  requestObject.headers = {
    ...defaultHeaders,
    ...headers
  }

  const fullUrl = prefix + url + queryString
  const request = new Request(fullUrl, requestObject) // eslint-disable-line no-undef

  let response

  try {
    response = await fetch(request) // eslint-disable-line no-undef
  } catch (error) {
    console.error('Network error!')
    throw error
  }

  let responseData
  try {
    // In case an API returns an empty body, we cannot use response.json() directly
    // If an empty body is returned, we will convert it to an empty JSON object
    responseData = await response.clone().text()
    responseData = responseData.length ? JSON.parse(responseData) : {}
  } catch (error) {
    console.error('Failed parsing response', response)
    throw error
  }

  return {
    request,
    response,
    responseData
  }
}

export function GET (url, { ...options }) {
  const method = 'GET'

  return httpRequest(url, { method, ...options })
}

export function POST (url, { ...options }) {
  const method = 'POST'

  return httpRequest(url, { method, ...options })
}

export function PUT (url, { ...options }) {
  const method = 'PUT'

  return httpRequest(url, { method, ...options })
}

export function PATCH (url, { ...options }) {
  const method = 'PATCH'

  return httpRequest(url, { method, ...options })
}

export function DELETE (url, { ...options }) {
  const method = 'DELETE'

  return httpRequest(url, { method, ...options })
}

export function makeCrudService ({
  baseUrl,
  resource: _resource,
  key,
  partitionKey,
  defaultRequestParameters = {},
  responseDataTransformer,
  responseCollectionKey,
  serviceFactoryArgs
}) {
  // NOTE: resource can be set as a serviceFactory
  const resource = typeof _resource === 'function' ? _resource(serviceFactoryArgs) : _resource

  return {
    async fetchList ({ requestParameters }) {
      const { responseData, request, response } = await GET(`${baseUrl}/${resource}`, {
        requestParameters: {
          ...defaultRequestParameters,
          ...requestParameters
        }
      })

      if (typeof responseDataTransformer === 'function') {
        Object.keys(responseData).forEach((datum, key) => {
          responseData[key] = responseDataTransformer({
            key,
            responseData,
            request,
            response
          })
        })
      }

      return {
        responseData,
        request,
        response,
        success: response && response.ok
      }
    },

    async fetchSingle ({ id = '', requestParameters }) {
      const { responseData, request, response } = await GET(`${baseUrl}/${resource}/${id}`, {
        requestParameters: {
          ...defaultRequestParameters,
          ...requestParameters
        }
      })
      let transformedData = { ...responseData }

      if (typeof responseDataTransformer === 'function') {
        transformedData = responseDataTransformer({ responseData, request, response })
      }

      return {
        responseData: transformedData,
        request,
        response,
        success: response && response.ok
      }
    },

    async create ({ body = {} } = {}) {
      const { responseData, request, response } = await POST(`${baseUrl}/${resource}`, { body }, { ...defaultRequestParameters })
      let transformedData = { ...responseData }
      if (typeof responseDataTransformer === 'function') {
        transformedData = responseDataTransformer({
          responseData,
          request,
          response
        })
      }

      return {
        responseData: transformedData,
        request,
        response,
        success: response && response.ok
      }
    },

    async put ({ body = {}, id = body[key] } = {}) {
      const { responseData, request, response } = await PUT(`${baseUrl}/${resource}/${id}`, { body }, { ...defaultRequestParameters })
      let transformedData = { ...responseData }
      if (typeof responseDataTransformer === 'function') {
        transformedData = responseDataTransformer({
          responseData,
          request,
          response
        })
      }

      return {
        responseData: transformedData,
        request,
        response,
        success: response && response.ok
      }
    },

    async patch ({
      current,
      next,
      id = current[key],
      idPath = id ? `/${id}` : '',
      patchOperations = {}// buildPatchOperationsFromDiff({ current, next })
    }) {
      // No patches; return mock response with current responseData
      if (!patchOperations.length) {
        return Promise.resolve({
          request: {},
          response: { ok: true },
          responseData: {
            ...current
          }
        })
      }

      const { responseData, request, response } = await PATCH(`${baseUrl}/${resource}${idPath}`, { body: { patchOperations } }, { ...defaultRequestParameters })
      let transformedData = { ...responseData }

      if (typeof responseDataTransformer === 'function') {
        transformedData = responseDataTransformer({ responseData, request, response })
      }

      return {
        responseData: transformedData,
        request,
        response,
        success: response && response.ok
      }
    },

    async delete ({ id }) {
      const { responseData, request, response } = await DELETE(`${baseUrl}/${resource}/${id}`, { ...defaultRequestParameters })

      return {
        responseData,
        request,
        response,
        success: response && response.ok
      }
    }
  }
}
