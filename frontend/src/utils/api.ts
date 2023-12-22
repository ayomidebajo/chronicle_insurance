import { CarData, Log } from '@/contexts/Insurance'
// this is mockdata, you can use this if you don't want to run the server environment for running the simulated car
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
  // here we are making a get request to the server environment handling both the simulated car and the making requests to the simulated car
  let res = await fetch("http://127.0.0.1:8000");
  
  const Data: CarData = await res.json();
  // console.log(Data, "data from server")
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
