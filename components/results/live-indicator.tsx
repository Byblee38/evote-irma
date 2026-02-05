'use client'

import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'

export function LiveIndicator() {
  return (
    <Badge className="gap-2 border-gray-300">
      <Activity className="w-3 h-3 animate-pulse text-primary" />
      <span>Live</span>
    </Badge>
  )
}
