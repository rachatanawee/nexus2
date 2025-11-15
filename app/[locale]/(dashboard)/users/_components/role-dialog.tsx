'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { User } from '../_lib/types'
import { useState } from 'react'
import { updateUserRole } from '../_lib/actions'
import { toast } from 'sonner'

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

const AVAILABLE_ROLES = ['admin', 'manager', 'user']

export function RoleDialog({ open, onOpenChange, user }: RoleDialogProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.roles)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    const formData = new FormData()
    formData.append('targetUserId', user.id)
    formData.append('newRoles', selectedRoles.join(','))

    const result = await updateUserRole({ success: false, message: '' }, formData)
    setLoading(false)

    if (result.success) {
      toast.success(result.message)
      onOpenChange(false)
      window.location.reload()
    } else {
      toast.error(result.message)
      setMessage(result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Roles - {user.email}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            {AVAILABLE_ROLES.map(role => (
              <label key={role} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRole(role)}
                  className="h-4 w-4"
                />
                <span className="capitalize">{role}</span>
              </label>
            ))}
          </div>
          {message && (
            <p className={`text-sm ${message.includes('สำเร็จ') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
