import { useChronicleContracts } from '@/contexts/Insurance'
import { Button } from '@chakra-ui/react'
import { Dialog } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { AiOutlinePlusCircle } from 'react-icons/ai'
import { FiX } from 'react-icons/fi'
import 'twin.macro'

export const RegisterAccountView = () => {
  const [isOpen, setIsOpen] = useState<false | 1 | 2>(false)
  const { purchaseInsurance } = useChronicleContracts()

  return (
    <Fragment>
      <Button
        onClick={() => setIsOpen(1)}
        tw="flex items-center gap-3 bg-blue-500 text-lg hover:bg-blue-700"
      >
        <AiOutlinePlusCircle size={20} />
        Purchase Insurance
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
            <Dialog.Title tw="font-bold text-4xl">Purchase your Insurance premium</Dialog.Title>

            <div tw="mt-4">
              <p>
                <span tw="font-bold">This might cost you as much as 12 AZERO</span>
              </p>
            </div>

            <div tw="mt-14 flex w-full justify-center">
              <Button onClick={() => {
                purchaseInsurance();
                setIsOpen(false);
              }}>Agree &amp; Submit</Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Fragment>
  )
}
