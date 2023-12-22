import Link from 'next/link'
import { IconType } from 'react-icons'
import { FaCarSide } from 'react-icons/fa6'
import { RxHome } from 'react-icons/rx'
import 'twin.macro'

export interface SidebarLink {
  name: string
  href: string
  id: string
  icon: IconType
  inactive?: boolean
}
export const sidebarLinks: SidebarLink[] = [
  { name: 'Dashboard', href: '/', id: 'dashboard', icon: RxHome },
  { name: 'Cars', href: '/cars', id: 'cars', icon: FaCarSide },
]

export const Sidebar = () => {
  return (
    <div>
      <h1 tw="px-6 py-3 text-2xl">Chronicles</h1>

      <nav tw="mt-20">
        <ul tw="flex flex-col gap-6">
          {sidebarLinks.map(({ name, id, href, icon: Icon }) => {
            return (
              <li key={id} tw="pl-3 pr-7">
                <Link href={href} tw="flex items-center gap-4 text-lg">
                  <Icon size={24} />
                  {name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
