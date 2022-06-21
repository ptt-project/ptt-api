import numeral from 'numeral'
import dayJS, { Dayjs } from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import customParseFormat from 'dayjs/plugin/customParseFormat'

declare global {
  interface Date {
    toDayjs: (format?: string) => Dayjs
  }
  interface Number {
    toDayjs: (format?: string) => Dayjs
    format: (format: string) => string
  }
  interface String {
    toDayjs: (format?: string) => Dayjs
    toNumber: () => number
  }
}

Date.prototype.toDayjs = function (format?: string) {
  return dayJS(this, format)
}

Number.prototype.toDayjs = function (format?: string) {
  return dayJS(this, format)
}

Number.prototype.format = function (format: string) {
  return numeral(this).format(format)
}

String.prototype.toDayjs = function (format?: string) {
  return dayJS(this, format)
}

String.prototype.toNumber = function () {
  return numeral(this).value()
}
