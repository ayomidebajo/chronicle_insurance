import { CarData, CarHealth, useChronicleContracts } from '@/contexts/Insurance'
import { Button } from '@chakra-ui/react'
import { Dialog } from '@headlessui/react'
import { Fragment, useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import 'twin.macro'

export const ViewCarHealth = ({ car }: { car: string }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [carHealth, setCarHealth] = useState<CarHealth>()
  const [price, setPrice] = useState<number>()
  const { getSingleCarHealth, predictMarketPrice } = useChronicleContracts()

  
  const fetchUserInfo = async () => {
    let data = await getSingleCarHealth(car);
    let price = await predictMarketPrice(car);
    setCarHealth(data)
    setPrice(price)
  }

  useEffect(() => {
    fetchUserInfo();

  }, [car]);

  return (
    <Fragment>
      {/* <Button
        colorScheme="facebook"
        tw="mt-10 pb-1 text-lg underline"
        fontWeight="bold"
        onClick={() => setIsOpen(true)}
        color="blue"
        variant="ghost"
      >
        View More
      </Button> */}

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
              <FiX size={18} tw='bg-white' />
            </Button>
            <Dialog.Title tw="font-bold text-4xl">Car Info</Dialog.Title>

            <div tw="mt-4">
              <p>
                Car health: <span tw="font-bold">{carHealth}</span>
              </p>
              <p>Car price: <span tw="font-bold">{price}</span></p>
            </div>

            {/* <div tw="mt-14 flex w-full justify-center">
              <Button onClick={() => purchaseInsurance()}>Agree &amp; Submit</Button>
            </div> */}
          </Dialog.Panel>
        </div>
      </Dialog>
    </Fragment>
  )
}
