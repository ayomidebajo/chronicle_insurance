import { useInkathon } from '@scio-labs/use-inkathon'
import { FC, PropsWithChildren, useEffect } from 'react'
import toast from 'react-hot-toast'
import 'twin.macro'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export const BaseLayout: FC<PropsWithChildren> = ({ children }) => {
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])
  return (
    <>
      <div tw="relative flex min-h-full">
        <div tw="flex h-full items-stretch bg-[#081029]">
          <aside tw="w-full max-w-xs">
            <Sidebar />
          </aside>
          <main tw="relative flex h-full grow flex-col overflow-auto">
            <Navbar />
            <div tw="h-full bg-white pb-14 text-black">{children}</div>
          </main>
        </div>
      </div>
    </>
  )
}
