'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Prevent static generation for this test page
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function TestUsersPage() {
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const createUsers = async () => {
    setCreating(true)
    try {
      const response = await fetch('/api/create-role-users', {
        method: 'POST'
      })
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setCreating(false)
    }
  }

  const checkCurrentUser = async () => {
    try {
      const response = await fetch('/api/debug-user')
      const data = await response.json()
      setDebugInfo(data)
    } catch (error: any) {
      setDebugInfo({ error: error.message })
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Test Users Management</h1>

      <div className="grid gap-6">
        {/* Create Users Card */}
        <Card>
          <CardHeader>
            <CardTitle>Create Test Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              This will create 4 test users with different roles:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
              <li>student@test.com (Student)</li>
              <li>teacher@test.com (Teacher)</li>
              <li>parent@test.com (Parent)</li>
              <li>admin@test.com (Admin)</li>
            </ul>
            <p className="text-sm text-gray-600">
              Password for all: <code className="bg-gray-100 px-2 py-1 rounded">password123</code>
            </p>
            <Button onClick={createUsers} disabled={creating}>
              {creating ? 'Creating...' : 'Create Test Users'}
            </Button>

            {result && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Result:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Current User Card */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Current User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Check what role is detected for the currently logged-in user.
            </p>
            <Button onClick={checkCurrentUser} variant="outline">
              Check Current User
            </Button>

            {debugInfo && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "Create Test Users" above</li>
              <li>Logout if you're currently logged in</li>
              <li>Login with one of the test accounts</li>
              <li>You should be redirected to the correct dashboard:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>student@test.com → /student</li>
                  <li>teacher@test.com → /teacher</li>
                  <li>parent@test.com → /parent</li>
                  <li>admin@test.com → /admin</li>
                </ul>
              </li>
              <li>If still redirecting to /student, click "Check Current User" to see what role is detected</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
