import { ContractIds } from '@/deployments/deployments'
import { contractTxWithToast } from '@/utils/contractTxWithToast'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { PropsWithChildren, createContext, useContext, useState } from 'react'
import toast from 'react-hot-toast'

interface ContextProps {
  isSubmitting: boolean
  veryifyUserIsPremium: (userAccount: string) => Promise<boolean | null>
  doesCarHaveChronicle: (userID: string) => Promise<boolean | null>
  purchaseInsurance: (balance?: number) => Promise<void>
  fileClaim: () => Promise<void>
  getAllCars: () => Promise<CarData[]>
  getSingleCar: (vin: string) => Promise<any>
  getCarsOwnedBySingleOwner: (userID: string) => Promise<string[]>
  addCar: (vin: string, model: string, log: Log[], make?: string) => Promise<any>
  updateCarLogs: (vin: string, log: CarData) => Promise<void>
  getSingleCarHealth: (vin: string) => Promise<CarHealth>
  predictMarketPrice: (vin: string) => Promise<number>
}

export interface Log {
  command: string
  value: string
  desc: string
  command_code: string
  ecu: number
  timestamp: number
}

export interface CarData {
  vin: string
  make: string
  model: string
  logs: Log[]
  owner: string
}

export enum CarHealth {
  Good,
  Bad,
  Fair,
  Excellent,
}

const ChronicleContractContext = createContext<ContextProps | null>(null)

export const useChronicleContracts = () => {
  const context = useContext(ChronicleContractContext)

  if (context == undefined) throw new Error('Chronicle Contract is not Initialized')

  return context
}

export default function ChronicleContractContextProvider({ children }: PropsWithChildren) {
  const [isSubmitting, setSubmitting] = useState(false)
  const { api, activeAccount } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.Chronicle)

  const veryifyUserIsPremium = async (userAccount: string) => {
    if (!api || !contract) {
      toast.error('Chronicle Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      const response = await contractQuery(api, '', contract, 'isPremium', {}, [userAccount])
      const { output, isError, decodedOutput } = decodeOutput(response, contract, 'isPremium')
      if (isError) throw new Error(decodedOutput)

      return output.Ok
    } catch (error) {
      console.error({ error })
      toast.error('Error occurred, please try again!')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const doesCarHaveChronicle = async (userID: string) => {
    if (!api || !contract) {
      toast.error('Chronicle Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      const response = await contractQuery(api, '', contract, 'hasChronicle', {}, [userID])
      const { output, isError, decodedOutput } = decodeOutput(response, contract, 'hasChronicle')
      if (isError) throw new Error(decodedOutput)

      return output
    } catch (error) {
      console.error({ error })
      toast.error('Error occurred, please try again!')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const purchaseInsurance = async () => {
    if (!api || !contract) {
      toast.error('Chronicle Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      if (!activeAccount) throw new Error('Wallet not connected. Try again…')

      await contractTxWithToast(
        api,
        activeAccount.address,
        contract,
        'purchase_insurance',
        {
          value: 12 * 10 ** 12,
        },
        [],
      )
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  const fileClaim = async () => {
    if (!api || !contract) {
      toast.error('Chronicle Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      if (!activeAccount) throw new Error('Wallet not connected. Try again…')

      await contractTxWithToast(api, activeAccount.address, contract, 'fileClaim', {}, [])
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  const getSingleCar = async (vin: string) => {
    if (!api || !contract) {
      toast.error('Chronicle Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      const response = await contractQuery(api, '', contract, 'get_single_car', {}, [vin])
      const { output, isError, decodedOutput } = decodeOutput(response, contract, 'get_single_car')
      if (isError) throw new Error(decodedOutput)

      return output.Ok
    } catch (error) {
      console.error({ error })
      toast.error('Error occurred, please try again!')
      return null
    } finally {
      setSubmitting(false)
    }
  }


  const getSingleCarHealth = async (vin: string) => {
    if (!api || !contract) {
      toast.error('Chronicle Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      const response = await contractQuery(api, '', contract, 'get_single_car_health', {}, [vin])
      const { output, isError, decodedOutput } = decodeOutput(response, contract, 'get_single_car_health')
      if (isError) throw new Error(decodedOutput)

      return output.Ok
    } catch (error) {
      console.error({ error })
      toast.error('Error occurred, please try again!')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const predictMarketPrice = async (vin: string) => {
    if (!api || !contract) {
      toast.error('Chronicle Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      const response = await contractQuery(api, '', contract, 'predict_car_market_value', {}, [vin])
      const { output, isError, decodedOutput } = decodeOutput(response, contract, 'predict_car_market_value')
      if (isError) throw new Error(decodedOutput)

      return output.Ok
    } catch (error) {
      console.error({ error })
      toast.error('Error occurred, please try again!')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const getAllCars = async () => {
    if (!api || !contract) {
      toast.error('Chronicle Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      const response = await contractQuery(api, '', contract, 'get_all_cars', {}, [])
      const { output, isError, decodedOutput } = decodeOutput(response, contract, 'get_all_cars')
      if (isError) throw new Error(decodedOutput)

      console.log({ output })
      return output
    } catch (error) {
      console.error({ error })
      toast.error('Error occurred, please try again!')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const getCarsOwnedBySingleOwner = async (userID: string) => {
    if (!api || !contract) {
      toast.error('Chronicle Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      const response = await contractQuery(
        api,
        '',
        contract,
        'get_cars_owned_by_single_owner',
        {},
        [userID],
      )
      const { output, isError, decodedOutput } = decodeOutput(
        response,
        contract,
        'get_cars_owned_by_single_owner',
      )
      if (isError) throw new Error(decodedOutput)

      return output.Ok
    } catch (error) {
      console.error({ error })
      toast.error('Error occurred, please try again!')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  const addNewCarData = async (model: string, vin: string, logs: any) => {
    if (!api || !contract) {
      toast.error('Chronicle Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      if (!activeAccount) throw new Error('Wallet not connected. Try again…')

      await contractTxWithToast(api, activeAccount.address, contract, 'add_car', {}, [
        model,
        vin,
        logs,
      ])
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  const updateCarLogs = async (vin: string, log: CarData) => {
    if (!api || !contract) {
      toast.error('Chronicle Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      if (!activeAccount) throw new Error('Wallet not connected. Try again…')

      await contractTxWithToast(api, activeAccount.address, contract, 'updateCarLogs', {}, [
        vin,
        log,
      ])
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ChronicleContractContext.Provider
      value={{
        isSubmitting,
        doesCarHaveChronicle,
        fileClaim,
        addCar: addNewCarData,
        purchaseInsurance,
        veryifyUserIsPremium,
        getSingleCar,
        getCarsOwnedBySingleOwner,
        updateCarLogs,
        getAllCars,
        getSingleCarHealth,
        predictMarketPrice
      }}
    >
      {children}
    </ChronicleContractContext.Provider>
  )
}
