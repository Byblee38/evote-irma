'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, Key } from 'lucide-react'
import { validateToken, storeValidatedToken } from '@/app/actions/token'

interface TokenInputProps {
  onSuccess: () => void
}

export function TokenInput({ onSuccess }: TokenInputProps) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await validateToken(token)

    setLoading(false)

    if (result.success && result.isValid && result.tokenId) {
      await storeValidatedToken(result.tokenId)
      onSuccess()
    } else {
      setError(result.error || 'Token tidak valid')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold">Validasi Token</h3>
        <p className="text-muted-foreground">Masukkan kode token untuk mulai voting</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="token" className="text-sm font-medium">Kode Token</Label>
          <Input
            id="token"
            type="text"
            placeholder="VOTE-2026-XXXXXX"
            value={token}
            onChange={(e) => setToken(e.target.value.trim().toUpperCase())}
            disabled={loading}
            required
            className="h-12 text-center text-lg font-mono tracking-wider border-2 focus:border-blue-500 transition-colors"
          />
          <p className="text-xs text-muted-foreground text-center">
            Token akan otomatis diubah ke huruf besar
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-200"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memvalidasi Token...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Validasi Token
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
