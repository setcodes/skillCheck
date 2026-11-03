import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/utils'
import { levelLabel, topicLabel } from '@/entities/question/model/topics'
import type { Level } from '@/entities/question/model/types'

interface QuestionTagsProps {
  topic: string
  level: Level
  className?: string
}

const TOPIC_COLORS: Record<string, string> = {
  'js-core': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  async: 'bg-amber-100 text-amber-800 border-amber-200',
  typescript: 'bg-blue-100 text-blue-800 border-blue-200',
  html: 'bg-orange-100 text-orange-800 border-orange-200',
  css: 'bg-purple-100 text-purple-800 border-purple-200',
  a11y: 'bg-teal-100 text-teal-800 border-teal-200',
  react: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  state: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'browser-network': 'bg-sky-100 text-sky-800 border-sky-200',
  performance: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  security: 'bg-red-100 text-red-800 border-red-200',
  testing: 'bg-lime-100 text-lime-800 border-lime-200',
  architecture: 'bg-pink-100 text-pink-800 border-pink-200',
  algorithms: 'bg-slate-100 text-slate-800 border-slate-200',
}

const LEVEL_COLORS: Record<Level, string> = {
  junior: 'bg-green-100 text-green-800 border-green-200',
  middle: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  senior: 'bg-orange-100 text-orange-800 border-orange-200',
}

export function QuestionTags({ topic, level, className }: QuestionTagsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <Badge variant="outline" className={cn(TOPIC_COLORS[topic] ?? 'bg-gray-100 text-gray-800 border-gray-200')}>
        {topicLabel(topic)}
      </Badge>
      <Badge variant="outline" className={cn(LEVEL_COLORS[level])}>
        {levelLabel(level)}
      </Badge>
    </div>
  )
}
