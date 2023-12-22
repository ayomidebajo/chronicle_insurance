import { usePathname } from 'next/navigation'
import { FC } from 'react'
import 'twin.macro'
import { ConnectButton } from '../web3/ConnectButton'
import { sidebarLinks } from './Sidebar'

export const Navbar: FC = () => {
  const path = usePathname()
  const tagLine = sidebarLinks.find(({ name }) => path.includes(name))?.name ?? 'Dashboard'
  return (
    <>
      <div tw="sticky top-0 left-0 right-0 z-10 px-6 py-2">
        <div tw="flex w-full items-center justify-between">
          <h1 tw="font-bold text-3xl capitalize">Your {tagLine}</h1>
          <div tw="ml-auto w-fit">
            <ConnectButton />
          </div>
        </div>
      </div>
    </>
  )
}
