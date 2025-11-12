'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  CreditCard,
  Eye,
  EyeOff,
  TestTube,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react'

interface PaymentGateway {
  enabled: boolean
  publishableKey?: string
  secretKey?: string
  clientId?: string
  keyId?: string
  keySecret?: string
  webhookSecret?: string
  webhookUrl?: string
  testMode: boolean
}

interface PaymentGatewayConfigProps {
  gateway: 'stripe' | 'paypal' | 'razorpay'
  config: PaymentGateway
  onUpdate: (config: PaymentGateway) => void
  onTest?: () => Promise<boolean>
}

const gatewayInfo = {
  stripe: {
    name: 'Stripe',
    description: 'Accept credit cards, debit cards, and digital wallets',
    color: 'bg-purple-100 text-purple-800',
    fields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: false }
    ]
  },
  paypal: {
    name: 'PayPal',
    description: 'Accept PayPal payments and digital wallets',
    color: 'bg-blue-100 text-blue-800',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
      { key: 'webhookUrl', label: 'Webhook URL', type: 'text', required: false }
    ]
  },
  razorpay: {
    name: 'Razorpay',
    description: 'Accept payments in India with multiple payment methods',
    color: 'bg-indigo-100 text-indigo-800',
    fields: [
      { key: 'keyId', label: 'Key ID', type: 'text', required: true },
      { key: 'keySecret', label: 'Key Secret', type: 'password', required: true },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password', required: false }
    ]
  }
}

export default function PaymentGatewayConfig({ 
  gateway, 
  config, 
  onUpdate, 
  onTest 
}: PaymentGatewayConfigProps) {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const info = gatewayInfo[gateway]

  const handleFieldChange = (field: string, value: string) => {
    onUpdate({
      ...config,
      [field]: value
    })
  }

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleTest = async () => {
    if (!onTest) return
    
    setTesting(true)
    setTestResult(null)
    
    try {
      const success = await onTest()
      setTestResult({
        success,
        message: success 
          ? `${info.name} connection successful!` 
          : `${info.name} connection failed. Please check your credentials.`
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-6 h-6 text-gray-500" />
            <div>
              <CardTitle>{info.name}</CardTitle>
              <p className="text-sm text-gray-600">{info.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={info.color}>
              {config.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
            {config.testMode && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Test Mode
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Enable {info.name}</h4>
            <p className="text-sm text-gray-600">
              Allow customers to pay using {info.name}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => onUpdate({ ...config, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {config.enabled && (
          <>
            {/* Configuration Fields */}
            <div className="space-y-4">
              {info.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <div className="relative">
                    <Input
                      type={field.type === 'password' && !showPasswords[field.key] ? 'password' : 'text'}
                      value={(config as any)[field.key] || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className={field.type === 'password' ? 'pr-10' : ''}
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(field.key)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords[field.key] ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Test Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <h4 className="font-medium text-gray-900">Test Mode</h4>
                <p className="text-sm text-gray-600">
                  Use test credentials for development and testing
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.testMode}
                  onChange={(e) => onUpdate({ ...config, testMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>

            {/* Test Connection */}
            {onTest && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={testing}
                  className="w-full"
                >
                  {testing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>

                {testResult && (
                  <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                    testResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`text-sm ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.message}
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}