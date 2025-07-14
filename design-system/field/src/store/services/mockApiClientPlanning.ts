/* eslint-disable no-param-reassign */
import axios from 'axios'

const getApiUrl = () => {
  const { protocol, hostname } = window.location
  return process.env.NX_MOCK_API_PLANNING_URL || `${protocol}//${hostname}:9081`
}

const mockApiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: 5 * 1000,
  headers: {
    common: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },
})

enum PlanGetResponseId {
  OK = '15411851-16a7f103-1c4d-49ce-bb98-4068ca6248c4',
  NOT_FOUND = '15411851-a456b3d6-107b-4eb2-acac-5ab790b3892a',
  ERROR = '15411851-d2218989-498d-4792-b4db-e6c5c3c383a5',
}

enum PlanPutResponseId {
  OK = '15411851-48855b78-309c-4454-a2c4-73d6a1ab1476',
  OK_NEW_DISK = '15411851-bebe1fc0-125c-4676-b69c-de2643648a1f',
  SPACE_ERROR = '15411851-870f13af-693e-46af-accf-5923798a49b6',
  SPACE_WARNING = '15411851-3625a48e-8719-4670-a202-b1099a438d16',
  ERROR = '15411851-60844c41-7a6c-4e14-b7e2-e200cb3de835',
}

enum PlanPostResponseId {
  OK = '15411851-e31e6cec-ae44-49a6-8ef5-ebeb230c9b66',
  OK_NEW_DISK = '15411851-5d8e3d4a-e8cd-420d-b964-883a3eb77e1a',
  SPACE_ERROR = '15411851-aa7dbdf9-cfa9-4e4b-aef9-d888ebe5738e',
  SPACE_WARNING = '15411851-2f335bd6-709f-4eb8-ab2e-6d41f9d2fcea',
  ERROR = '15411851-a53fc6b8-47e9-4343-a88b-d20d3a60abaa',
}

mockApiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (!error.response) {
      console.error(`[MOCK API PLANNING] FAILED ${error.config.url}`)
    }
    return Promise.reject(error)
  }
)

/**
 * manage postman examples for mocked responses
 */
// eslint-disable-next-line no-param-reassign
mockApiClient.interceptors.request.use(async (config) => {
  const { url = '', method = '', data = '' } = config
  const [
    ,
    section,
    subsection,
    // disk,
    // param1,
    param2,
  ] = url.split('/')
  config.headers.common = config.headers.common ?? {}
  switch (section) {
    case 'planning':
      switch (subsection) {
        case 'plan':
          switch (method) {
            case 'get':
              if (param2 === 'EmptyPlan') {
                config.headers.common['x-mock-response-id'] =
                  PlanGetResponseId.NOT_FOUND
                break
              }
              config.headers.common['x-mock-response-id'] = PlanGetResponseId.OK
              break
            case 'post':
              /** normal response */
              // config.headers.common['x-mock-response-id'] =
              //   GeometryPostResponseId.OK
              /** disk space warning */
              config.headers.common['x-mock-response-id'] =
                PlanPostResponseId.SPACE_WARNING
              break
            case 'put':
              if (data.forcecurrentdisk) {
                console.warn('[JOB UPDATE] force current disk')
                config.headers.common['x-mock-response-id'] =
                  PlanPutResponseId.SPACE_WARNING
              } else if (data.savewherespaceavailable) {
                console.info('[JOB UPDATE] save where space available')
                config.headers.common['x-mock-response-id'] =
                  PlanPutResponseId.OK_NEW_DISK
              } else {
                /* config.headers.common['x-mock-response-id'] =
                  GeometryPutResponseId.SPACE_ERROR */
                config.headers.common['x-mock-response-id'] =
                  PlanPutResponseId.SPACE_WARNING
              }
              break
            default:
              break
          }
          break
        default:
          config.headers.common['x-mock-response-code'] = '200'
          break
      }
      break
    case 'routing':
      config.headers.common['x-mock-response-code'] = '200'
      break
    case 'system':
      config.headers.common['x-mock-response-id'] =
        '15411851-a516e3a3-9c96-4015-8c75-24adb2e785e2'
      break

    default:
      config.headers.common['x-mock-response-code'] = '200'
      break
  }
  return config
})

export default mockApiClient
