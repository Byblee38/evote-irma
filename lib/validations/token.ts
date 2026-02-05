import { z } from 'zod'

export const tokenSchema = z.object({
  tokenCode: z.string()
    .min(1, 'Token tidak boleh kosong')
    .trim()
    .toUpperCase()
})

export type TokenInput = z.infer<typeof tokenSchema>
