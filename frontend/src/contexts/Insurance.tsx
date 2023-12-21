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
  doesCarHaveInsurance: (userID: string) => Promise<boolean | null>
  purchaseInsurance: (balance: number) => Promise<void>
  fileClaim: () => Promise<void>
  getSingleCar: (vin: string) => Promise<void>
  getCarsOwnedBySingleOwner: (userID: string) => Promise<void>
  addCar: (vin: string, make: string, model: string, log: Log) => Promise<CarData>
  updateCarLogs: (vin: string, log: CarData) => Promise<void>
  checkSingleCarHealth: (vin: string) => Promise<Log[]>
}

interface Log {
  command: string
  value: string
  desc: string
  command_code: string
  ecu: number
  timestamp: number
}

interface CarData {
  vin: string
  make: string
  model: string
  logs: Log[]
  owner: string
}

const InsuranceContractContext = createContext<ContextProps | null>(null)

export const useInsuranceContracts = () => {
  const context = useContext(InsuranceContractContext)

  if (context == undefined) throw new Error('Insurance Contract is not Initialized')

  return context
}

export default function InsuranceContractContextProvider({ children }: PropsWithChildren) {
  const [isSubmitting, setSubmitting] = useState(false)
  const { api, activeAccount } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.Insurance)

  const veryifyUserIsPremium = async (userAccount: string) => {
    if (!api || !contract) {
      toast.error('Insurance Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      const response = await contractQuery(api, '', contract, 'isPremium', {}, [userAccount])
      const { output, isError, decodedOutput } = decodeOutput(response, contract, 'isPremium')
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

  const doesCarHaveInsurance = async (userID: string) => {
    if (!api || !contract) {
      toast.error('Insurance Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      const response = await contractQuery(api, '', contract, 'hasInsurance', {}, [userID])
      const { output, isError, decodedOutput } = decodeOutput(response, contract, 'hasInsurance')
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

  const purchaseInsurance = async (balance: number) => {
    if (!api || !contract) {
      toast.error('Insurance Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      if (!activeAccount) throw new Error('Wallet not connected. Try again…')

      await contractTxWithToast(
        api,
        activeAccount.address,
        contract,
        'purchaseInsurance',
        {
          value: 0.5 * 10 ** 12,
        },
        [balance],
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
      toast.error('Insurance Contract cannot be initialized')
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
      toast.error('Insurance Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      const response = await contractQuery(api, '', contract, 'getSingleCar', {}, [vin])
      const { output, isError, decodedOutput } = decodeOutput(response, contract, 'getSingleCar')
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

  const getCarsOwnedBySingleOwner = async (userID: string) => {
    if (!api || !contract) {
      toast.error('Insurance Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      const response = await contractQuery(api, '', contract, 'getCarsOwnedBySingleOwner', {}, [userID])
      const { output, isError, decodedOutput } = decodeOutput(
        response,
        contract,
        'getCarsOwnedBySingleUser',
      )
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

  const updateCarLogs = async (vin: string, log: CarData) => {
    if (!api || !contract) {
      toast.error('Insurance Contract cannot be initialized')
      return
    }
    setSubmitting(true)

    try {
      if (!activeAccount) throw new Error('Wallet not connected. Try again…')

      await contractTxWithToast(api, activeAccount.address, contract, 'updateCarLogs', {}, [vin, log])
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <InsuranceContractContext.Provider
      value={{
        isSubmitting,
        doesCarHaveInsurance,
        fileClaim,
        purchaseInsurance,
        veryifyUserIsPremium,
        getSingleCar,
        getCarsOwnedBySingleOwner,
        updateCarLogs,
        // add missing functions here
      }}
    >
      {children}
    </InsuranceContractContext.Provider>
  )
}
