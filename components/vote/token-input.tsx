'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle } from 'lucide-react'
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="token">Kode Token</Label>
        <Input
          id="token"
          type="text"
          placeholder="VOTE-2024-XXXXXX"
          value={token}
          onChange={(e) => setToken(e.target.value.trim().toUpperCase())}
          disabled={loading}
          required
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memvalidasi...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Validasi Token
          </>
        )}
      </Button>
    </form>
  )
}
