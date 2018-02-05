export function makeCrudService ({
  key,
  defaultRequestParameters = {},
  responseDataTransformer,
  makeCrudArgs,
  serviceInstance = makeCrudArgs.serviceInstance,
  operations = makeCrudArgs.operations,
  requestFactory = _requestFactory,
  request = requestFactory({
    serviceInstance,
    defaultRequestParameters,
    responseDataTransformer
  })
}) {
  return {
    async fetchList ({ requestParameters }) {
      // TODO: Move merging defaultRequestParameters and requestParameters to higher level
      const responseData = await serviceInstance[operations.fetchList]({
        ...defaultRequestParameters,
        ...requestParameters
      }).promise()

      if (typeof responseDataTransformer === 'function') {
        Object.keys(responseData).forEach((datum, key) => {
          responseData[key] = responseDataTransformer({
            key,
            responseData
          })
        })
      }

      return {
        responseData,
        success: true
      }
    },

    fetchSingle ({ requestParameters }) {
      return request({
        operation: operations.fetchSingle,
        requestParameters
      })
    },

    create ({ requestParameters = {} } = {}) {
      return request({
        operation: operations.create,
        requestParameters
      })
    },

    patch ({ requestParameters = {} } = {}) {
      return request({
        operation: operations.patch,
        requestParameters
      })
    },

    put ({ requestParameters = {} } = {}) {
      return request({
        operation: operations.put,
        requestParameters
      })
    },

    delete ({ requestParameters }) {
      return request({
        operation: operations.delete,
        requestParameters
      })
    }
  }
}

function _requestFactory ({ serviceInstance, defaultRequestParameters, responseDataTransformer }) {
  return async ({ operation, requestParameters }) => {
    const responseData = await serviceInstance[operation]({
      ...defaultRequestParameters,
      ...requestParameters
    }).promise()
    const transformedData = typeof responseDataTransformer === 'function' ? responseDataTransformer({ responseData }) : responseData

    return {
      responseData: transformedData,
      success: true
    }
  }
}
