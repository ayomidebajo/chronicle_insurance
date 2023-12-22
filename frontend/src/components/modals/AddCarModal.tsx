import { useChronicleContracts } from '@/contexts/Insurance'
import { fetchCarLogs } from '@/utils/api'
import { Button } from '@chakra-ui/react'
import { Dialog } from '@headlessui/react'
import { Fragment, useState } from 'react'
import toast from 'react-hot-toast'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import { FiX } from 'react-icons/fi'
import 'twin.macro'

function validateData({ vin, model }: { vin: string; model: string }) {
  const error = {
    vin: '',
    model: '',
  }
  if (model && typeof model !== 'string') {
    error['model'] = 'Model must be a valid string'
  }
  if (!vin || vin?.length == 0) {
    error['vin'] = 'Invalid VIN provided'
  }

  if (!!error.model || !!error.vin) {
    return error
  } else {
    null
  }
}

export const AddNewCarView = () => {
  const [query, setQuery] = useState('')
  const [model, setModel] = useState('')
  const [isOpen, setIsOpen] = useState<false | 1 | 2>(false)

  const { getSingleCar, addCar, isSubmitting } = useChronicleContracts()

  const fetchDataThenAddCar = async () => {
    const error = validateData({ vin: query, model })
    if (!error) {
      const carData = await getSingleCar(query)
      if (!carData) {
        const carLogs = await fetchCarLogs(query)
        await addCar(model, query, carLogs).then(() => setIsOpen(false))
      } else {
        toast.error('Car already registered')
      }
    }
  }

  return (
    <Fragment>
      <Button
        onClick={() => setIsOpen(1)}
        tw="flex items-center gap-3 bg-blue-500 text-lg hover:bg-blue-700"
      >
        <AiOutlinePlusCircle size={20} />
        Add New Car
      </Button>

      <Dialog open={!!isOpen} onClose={() => setIsOpen(false)} tw="relative z-50">
        <div
          tw="fixed inset-0 flex items-center justify-center bg-black/80 p-4 backdrop-blur-2xl"
          aria-hidden="true"
        >
          <Dialog.Panel tw="relative max-h-full w-full max-w-2xl overflow-auto rounded-lg bg-gray-950/75 p-10">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              tw="absolute right-0 top-0 text-black"
            >
              <FiX size={18} />
            </Button>
            <Dialog.Title tw="font-bold text-4xl">Register your Car</Dialog.Title>

            <div tw="mt-4">
              <p>
                <span tw="font-bold">Please provide your VIN...</span>
              </p>
            </div>

            <div tw="mt-20">
              <div tw="flex items-center justify-start gap-4">
                <label htmlFor="vinId">Provide VIN</label>
                <input
                  type="text"
                  name="vinId"
                  id="vinId"
                  tw="rounded-lg border border-gray-900 bg-slate-300 py-2 px-4 text-gray-900 outline-none"
                  value={query}
                  onChange={({ target }) => setQuery(target.value)}
                />
              </div>
              <div tw="mt-8 flex items-center justify-start gap-4">
                <label htmlFor="modelName">Model Name</label>
                <input
                  type="text"
                  name="modelName"
                  id="modelName"
                  tw="rounded-lg border border-gray-900 bg-slate-300 py-2 px-4 text-gray-900 outline-none"
                  value={model}
                  onChange={({ target }) => setModel(target.value)}
                />
              </div>
            </div>

            <div tw="mt-14 flex w-full justify-center">
              <Button
                variant="solid"
                onClick={() => fetchDataThenAddCar()}
                tw="w-24"
                px={20}
                py={5}
                colorScheme="teal"
              >
                Fetch Data
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Fragment>
  )
}
