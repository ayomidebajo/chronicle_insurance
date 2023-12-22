import { AddNewCarView } from '@/components/modals/AddCarModal'
import { RegisterAccountView } from '@/components/modals/RegisterOwner'
import { ViewCarData } from '@/components/modals/ViewCarData'
import { ViewCarHealth } from '@/components/modals/ViewCarHealth'
import { CarData, useChronicleContracts } from '@/contexts/Insurance'
import { truncateHash } from '@/utils/truncateHash'
import { Spinner } from '@chakra-ui/react'
import { useInkathon } from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import 'twin.macro'

const HomePage: NextPage = () => {
  const [isPremium, setPremium] = useState(false)
  const [showHealth, setShowHealth] = useState(false)
  const [cars, setCars] = useState<CarData[]>([])
  const { getCarsOwnedBySingleOwner, getSingleCar, veryifyUserIsPremium, getSingleCarHealth } = useChronicleContracts()
  const { activeAccount } = useInkathon()

  const fetchUserInfo = async () => {
    if (activeAccount?.address) {
      const isPremium = await veryifyUserIsPremium(activeAccount.address)
      setPremium(!!isPremium)
      const cars = await getCarsOwnedBySingleOwner(activeAccount?.address)
      if (cars?.length) {
        const promisedCars = cars.map(async (car) => {
          const carData = await getSingleCar(car)
          return carData
        })

        Promise.all(promisedCars).then((res) => {
          setCars(res)
        })
      }
    }
  }

  useEffect(() => {
    fetchUserInfo()

  }, [activeAccount?.address])

  async function getCarHealth(vin: string) {
    let data = await getSingleCarHealth(vin).then(res => console.log(res));


    // return data;
  }

  return (
    <>
      <div tw="mb-10 px-5 pt-10">
        <p>please refresh as neccessary</p>
        <div tw="mt-20 flex w-full items-center justify-between rounded-md bg-slate-100 px-16 py-6">
          <h2 tw="font-bold text-3xl">Cars Owned</h2>

          <div>{isPremium ? <AddNewCarView /> : <RegisterAccountView />}</div>
        </div>

        <section>
          {cars?.length ? (
            <ul tw="mt-10">
              {cars.map((car) => {
                const { vin, logs, model, owner } = car
                return (
                  <div
                    key={vin}
                    tw="col-span-1 w-full scale-95 rounded-lg border border-slate-50 bg-slate-300 px-6 py-3 shadow-xl transition hover:scale-100"
                  >
                    <div tw="flex items-center justify-between font-bold">
                      <h2 tw="font-semibold text-lg text-gray-900 uppercase">VIN: {vin}</h2>

                      <p tw="text-blue-700">
                        Owned By: <strong>{truncateHash(owner)}</strong>
                      </p>
                    </div>

                    <ul tw="mt-10 grid grid-cols-2 gap-6">
                      <li tw="flex flex-col items-start gap-2">
                        <span>Model</span>
                        <strong>{model}</strong>
                      </li>

                      <li tw="flex flex-col items-start gap-2">
                        <span>Car Health</span>
                        <button onClick={() => setShowHealth(!showHealth)}><strong>Click me to view car health!</strong></button>
                        <div>{showHealth && <ViewCarHealth car={vin} />}</div>
                      </li>

                      <li tw="flex flex-col items-start gap-2">
                        <span>Predicted Market Value</span>
                        <strong>$70</strong>
                      </li>
                    </ul>

                    {/* <div>
                      <ViewCarData car={car} />
                    </div> */}
                  </div>
                )
              })}
            </ul>
          ) : (
            <div>
              <Spinner size="28" colorScheme="teal" />
            </div>
          )}
        </section>
      </div>
    </>
  )
}

export default HomePage
