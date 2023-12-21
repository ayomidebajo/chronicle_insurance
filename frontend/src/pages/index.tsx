import { RegisterAccountView } from '@/components/modals/RegisterOwner'
import { useInkathon } from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import 'twin.macro'

const HomePage: NextPage = () => {
  // Display `useInkathon` error messages (optional)
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  return (
    <>
      <div tw="mb-10 px-5 pt-10">
        <div tw="mt-20 flex w-full items-center justify-between rounded-md bg-slate-100 px-16 py-6">
          <h2 tw="font-bold text-3xl">Cars Owned</h2>

          <div>
            <RegisterAccountView />
            {/* <CreateProposalView /> */}
          </div>
        </div>

        <section></section>
      </div>
    </>
  )
}

export default HomePage
