'use client'

import { AccountSettings } from './CreateUserModal'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'

interface AccountSettingsFormProps {
  data: AccountSettings
  onChange: (data: AccountSettings) => void
}

export default function AccountSettingsForm({ data, onChange }: AccountSettingsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
        <p className="text-sm text-gray-600 mt-1">
          Configure account status and initial settings
        </p>
      </div>

      <div className="space-y-4">
        {/* Account Status */}
        <Card className="p-4">
          <Label htmlFor="accountStatus">Account Status</Label>
          <Select
            value={data.accountStatus}
            onValueChange={(value) =>
              onChange({ ...data, accountStatus: value as AccountSettings['accountStatus'] })
            }
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active - User can log in immediately</SelectItem>
              <SelectItem value="inactive">Inactive - User cannot log in</SelectItem>
              <SelectItem value="suspended">Suspended - Account is temporarily disabled</SelectItem>
            </SelectContent>
          </Select>
        </Card>

        {/* Bypass Verification */}
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="bypassVerification"
              checked={data.bypassVerification}
              onCheckedChange={(checked) =>
                onChange({ ...data, bypassVerification: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label htmlFor="bypassVerification" className="cursor-pointer font-medium">
                Bypass Email Verification
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Mark the email as verified immediately. User won't need to verify their email address.
              </p>
            </div>
          </div>
        </Card>

        {/* Send Welcome Email */}
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="sendWelcomeEmail"
              checked={data.sendWelcomeEmail}
              onCheckedChange={(checked) =>
                onChange({ ...data, sendWelcomeEmail: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label htmlFor="sendWelcomeEmail" className="cursor-pointer font-medium">
                Send Welcome Email
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Send an email with login credentials and welcome information to the user.
              </p>
            </div>
          </div>
        </Card>

        {/* Require Password Change */}
        <Card className="p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="requirePasswordChange"
              checked={data.requirePasswordChange}
              onCheckedChange={(checked) =>
                onChange({ ...data, requirePasswordChange: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label htmlFor="requirePasswordChange" className="cursor-pointer font-medium">
                Require Password Change on First Login
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Force the user to change their temporary password when they first log in.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Security Note:</strong> A secure temporary password will be generated automatically. 
          Make sure to securely share this password with the user.
        </p>
      </div>
    </div>
  )
}
