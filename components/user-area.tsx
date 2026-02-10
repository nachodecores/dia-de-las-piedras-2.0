"use client"

import { useUser, UserButton } from "@clerk/nextjs"

export function UserArea() {
  const { user } = useUser()

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium">{user?.firstName}</span>
      <UserButton />
    </div>
  )
}
