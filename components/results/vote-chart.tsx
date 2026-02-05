'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { VoteResult } from '@/types/candidate'

interface VoteChartProps {
  data: VoteResult[]
}

const COLORS = ['#1f2937', '#4b5563', '#6b7280', '#9ca3af']

export function VoteChart({ data }: VoteChartProps) {
  const chartData = data.map(item => ({
    name: `#${item.order_number}`,
    votes: item.vote_count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Hasil Voting</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
