import { shippopApiWraper, shippopClient } from './shippop'
import { smsMktApiWraper, smsMktClient } from './sms-mkt'
import { createMethod } from './tools'

export const api = {
  smsMkt: createMethod(smsMktClient, smsMktApiWraper),
  shippop: createMethod(shippopClient, shippopApiWraper),
}
