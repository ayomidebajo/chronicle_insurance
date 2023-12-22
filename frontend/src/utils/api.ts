import { Log } from '@/contexts/Insurance'
import * as Data from './response.json'

export enum CarCommand {
  ENGINE_LOAD = 'EngineLoad',
  THROTTLE_POS = 'ThrottlePosition',
  DISTANCE_W_MIL = 'DistanceWithMil',
}

export function getCarCommand(cmd: string): CarCommand {
  let command: CarCommand
  switch (cmd) {
    case 'ENGINE_LOAD':
      command = CarCommand.ENGINE_LOAD
      break
    case 'THROTTLE_POS':
      command = CarCommand.THROTTLE_POS
      break
    default:
      command = CarCommand.DISTANCE_W_MIL
      break
  }
  return command
}
export async function fetchCarLogs(vin: string) {
  const carLogs = Object.entries(Data)
    .filter(([key]) => key.includes('_'))
    .map(([key, value]) => {
      return {
        command: getCarCommand(key),
        value: value['value'],
        desc: value.command.desc,
        command_code: value.command.command,
        ecu: value.command.ecu,
        timestamp: value['time'],
      } as Log
    })
  return carLogs
}
