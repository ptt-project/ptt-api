import axios, { AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import humps from 'humps'
import https from 'https'
import { ContentType, customRequestData, deepLoop } from './tools'

const createClient = () => {
  const ax = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  })
  ax.interceptors.request.use((request: any) => {
    request.url = `${process.env.SHIPPOP_API_HOST}/${request.url}`

    if (request.params) {
      request.params = deepLoop(request.params, modifyRequestData)
    }

    if (request.data) {
      if (!(request.headers['Content-Type'] === ContentType.FORMDATA)) {
        request.data = deepLoop(request.data, modifyRequestData)
        request.data = humps.decamelizeKeys(request.data)
        customRequestData(request)
      } else {
        request.headers = { ...request.headers, ...request.data.getHeaders() }
      }
    }

    return request
  })

  ax.interceptors.response.use(
    (response: AxiosResponse<any>) => {
      if (response.headers['content-type'].includes('application/json')) {
        response.data = humps.camelizeKeys(response.data)
        response.data = modifyResponseData(response.data)
      }
      return response
    },
    (error: any) => Promise.reject(error),
  )
  return ax
}

const modifyResponseData = (data: any): any => {
  // 2019-12-11 or 2019-12-11T10:46:08+00:00
  // if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}\+\d{2}:\d{2})?$/.test(data)) {
  if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
    return dayjs(data)
  }
  if (data instanceof Array) {
    return data.map(d => modifyResponseData(d))
  }
  if (data instanceof Object) {
    const formatData = {}
    Object.keys(data).forEach(key => {
      formatData[key] = modifyResponseData(data[key])
    })
    return formatData
  }
  return data
}

const modifyRequestData = (data: any) => {
  if (dayjs.isDayjs(data)) {
    return data.format()
  }
  return data
}

export const shippopClient = createClient()
export const shippopApiWraper = async (method: Promise<AxiosResponse>) => {
  try {
    const res = await method
    return Promise.resolve(res)
  } catch (e) {
    const { response, message } = e
    const { data } = response || {}
    const { errorMessage } = data || {}
    return Promise.reject(errorMessage || message || e)
  }
}
