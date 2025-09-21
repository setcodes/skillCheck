import React from 'react';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/lib/utils';

interface QuestionTagsProps {
  category: string;
  difficulty: number;
  className?: string;
}

// Маппинг категорий на цвета
const CATEGORY_CONFIG = {
  'Linux': { color: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Docker': { color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  'Kubernetes': { color: 'bg-purple-100 text-purple-800 border-purple-200' },
  'CI/CD': { color: 'bg-green-100 text-green-800 border-green-200' },
  'Cloud': { color: 'bg-sky-100 text-sky-800 border-sky-200' },
  'Security': { color: 'bg-red-100 text-red-800 border-red-200' },
  'Monitoring': { color: 'bg-orange-100 text-orange-800 border-orange-200' },
  'Containers': { color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  'Networking': { color: 'bg-teal-100 text-teal-800 border-teal-200' },
  'Git/CI': { color: 'bg-gray-100 text-gray-800 border-gray-200' },
  'IaC': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'Modern DevOps': { color: 'bg-pink-100 text-pink-800 border-pink-200' },
  'Performance': { color: 'bg-amber-100 text-amber-800 border-amber-200' },
  'GitOps': { color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  'Mixed': { color: 'bg-slate-100 text-slate-800 border-slate-200' },
};

// Маппинг уровней сложности
const DIFFICULTY_CONFIG = {
  1: { label: 'Junior', color: 'bg-green-100 text-green-800 border-green-200' },
  2: { label: 'Middle', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  3: { label: 'Senior', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  4: { label: 'Expert', color: 'bg-red-100 text-red-800 border-red-200' },
};

export function QuestionTags({ category, difficulty, className }: QuestionTagsProps) {
  const categoryConfig = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || 
    { color: 'bg-gray-100 text-gray-800 border-gray-200' };
  
  const difficultyConfig = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG] || 
    { label: 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200' };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {/* Тематика */}
      <Badge 
        variant="outline" 
        className={cn(categoryConfig.color)}
      >
        {category}
      </Badge>

      {/* Уровень сложности */}
      <Badge 
        variant="outline" 
        className={cn(difficultyConfig.color)}
      >
        {difficultyConfig.label}
      </Badge>
    </div>
  );
}
