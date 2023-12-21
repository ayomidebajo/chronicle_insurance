import { FC, PropsWithChildren } from 'react'
import 'twin.macro'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export const BaseLayout: FC<PropsWithChildren> = ({ children }) => {
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
