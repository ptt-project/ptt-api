import { smsMktApiWraper, smsMktClient } from './sms-mkt'
import { createMethod } from './tools'

export const api = {
  smsMkt: createMethod(smsMktClient, smsMktApiWraper),
}
