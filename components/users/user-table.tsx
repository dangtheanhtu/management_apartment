"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import { EditUserDialog } from "./edit-user-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"
import type { User } from "@/lib/types/user"

interface UserTableProps {
  users: User[]
}

export function UserTable({ users }: UserTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-rose-500 to-pink-600 text-white border-0 hover:from-rose-600 hover:to-pink-700 shadow-sm font-semibold px-3 py-1"
      case "staff":
        return "bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 hover:from-orange-600 hover:to-amber-700 shadow-sm font-semibold px-3 py-1"
      case "resident":
        return "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 hover:from-emerald-600 hover:to-teal-700 shadow-sm font-semibold px-3 py-1"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 font-semibold px-3 py-1"
    }
  }

  const getStatusBadgeClass = (status: string) => {
    return status === "active" 
      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700 shadow-sm font-semibold px-3 py-1" 
      : "bg-gradient-to-r from-gray-400 to-slate-500 text-white border-0 hover:from-gray-500 hover:to-slate-600 shadow-sm font-semibold px-3 py-1"
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin"
      case "staff":
        return "Staff"
      case "resident":
        return "Resident"
      default:
        return role
    }
  }

  const getStatusLabel = (status: string) => {
    return status === "active" ? "Active" : "Inactive"
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeClass(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(user.status)}>
                      {getStatusLabel(user.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingUser(user)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingUser && (
        <EditUserDialog user={editingUser} open={!!editingUser} onOpenChange={() => setEditingUser(null)} />
      )}

      {deletingUser && (
        <DeleteUserDialog user={deletingUser} open={!!deletingUser} onOpenChange={() => setDeletingUser(null)} />
      )}
    </>
  )
}
