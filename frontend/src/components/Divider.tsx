import type { ComponentRenderProps } from '@json-render/react'
import { cx, elemCls } from './tailwind.js'

export function Divider({ element }: ComponentRenderProps) {
  return <hr className={cx('border-t border-gray-200 my-2', elemCls(element))} />
}
