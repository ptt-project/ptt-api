import { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios'
import qs from 'qs'
import FormData from 'form-data'

export enum ContentType {
  XFORM = 'application/x-www-form-urlencoded',
  JSON = 'application/json',
  FORMDATA = 'multipart/form-data',
}

const customClientWithData = (
  url: string,
  method: AxiosInstance['put'] | AxiosInstance['post'] | AxiosInstance['patch'],
  data: any,
  option?: AxiosRequestConfig & { contentType: ContentType },
) => {
  const { contentType = ContentType.JSON, ...restOption } = option || {}
  return method(url, data, {
    headers: {
      'Content-Type': contentType,
    },
    ...restOption,
  })
}

const customClient = (
  url: string,
  method: AxiosInstance['delete'] | AxiosInstance['get'],
  params: any,
  option?: AxiosRequestConfig & { contentType: ContentType },
) => {
  const { contentType = ContentType.JSON, ...restOption } = option || {}
  return method(url, {
    params,
    headers: {
      'Content-Type': contentType,
    },
    ...restOption,
  })
}

type ResponseData<T> = Promise<{ data: T }>

export const createMethod = (
  client: AxiosInstance,
  apiWraper: (method: Promise<AxiosResponse>) => Promise<any>,
) => ({
  get: <T extends unknown>(
    url: string,
    param?: any,
    option?: AxiosRequestConfig & { contentType: ContentType },
  ): ResponseData<T> => apiWraper(customClient(url, client.get, param, option)),
  put: <T extends unknown>(
    url: string,
    data?: any,
    option?: AxiosRequestConfig & { contentType: ContentType },
  ): ResponseData<T> =>
    apiWraper(customClientWithData(url, client.put, data, option)),
  post: <T extends unknown>(
    url: string,
    data?: any,
    option?: AxiosRequestConfig & { contentType: ContentType },
  ): ResponseData<T> =>
    apiWraper(customClientWithData(url, client.post, data, option)),
  patch: <T extends unknown>(
    url: string,
    data?: any,
    option?: AxiosRequestConfig & { contentType: ContentType },
  ): ResponseData<T> =>
    apiWraper(customClientWithData(url, client.patch, data, option)),
  delete: <T extends unknown>(
    url: string,
    param?: any,
    option?: AxiosRequestConfig & { contentType: ContentType },
  ): ResponseData<T> =>
    apiWraper(customClient(url, client.delete, param, option)),
})

export const customRequestData = (request: any) => {
  if (request.headers['Content-Type'] === ContentType.FORMDATA) {
    if (request.data) {
      console.log('==== debug ====')
      const formData = new FormData()
      Object.entries(request.data).forEach(([key, value]: any[]) => {
        if (value instanceof Array) {
          value.forEach(val => {
            formData.append(`${key}`, val)
          })
        } else {
          formData.append(key, value)
        }
      })

      request.data = formData
    }
  } else if (request.headers['Content-Type'] === ContentType.XFORM) {
    if (request.data) {
      request.data = qs.stringify(request.data)
    }
  } else if (request.headers['Content-Type'] === ContentType.JSON) {
  }
}

export const deepLoop = (data: any, func: (data: any) => any): any => {
  if (data instanceof Array) {
    return data.map(d => deepLoop(d, func))
  }
  if (data instanceof Object) {
    const formatData: any = {}
    Object.keys(data).forEach(key => {
      formatData[key] = deepLoop(data[key], func)
    })
    return formatData
  }
  return func(data)
}

export const createFormData = (data: Record<string, any>): any => {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof Object) {
      Object.entries(value).forEach(([keyObject, valueObject]) => {
        if (valueObject instanceof Object) {
          Object.entries(valueObject).forEach(([keyObject2, valueObject2]) => {
            if (valueObject2 instanceof Object) {
              Object.entries(valueObject2).forEach(
                ([keyObject3, valueObject3]) => {
                  // console.log(
                  //   `${key}[${keyObject}][${keyObject2}][${keyObject3}]`,
                  //   valueObject3,
                  // )
                  formData.append(
                    `${key}[${keyObject}][${keyObject2}][${keyObject3}]`,
                    valueObject3,
                  )
                },
              )
            } else {
              // console.log(`${key}[${keyObject}][${keyObject2}]`, valueObject2)
              formData.append(
                `${key}[${keyObject}][${keyObject2}]`,
                valueObject2,
              )
            }
          })
        } else {
          // console.log(`${key}[${keyObject}]`, valueObject)
          formData.append(`${key}[${keyObject}]`, valueObject)
        }
      })
    } else {
      // console.log(`${key}`, value)
      formData.append(key, value)
    }
  })
  // console.log('=== debug2 ===')
  return formData
}
