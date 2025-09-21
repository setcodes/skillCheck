import React, { useState } from 'react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { X, Search, Filter, Settings } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover';
import { cn } from '@/lib/utils';

interface FilterState {
  categories: string[];
  difficulties: number[];
  buckets: string[];
}

interface AdvancedFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  questionCount: number;
  className?: string;
}

const DIFFICULTY_LABELS = {
  1: 'Junior',
  2: 'Middle', 
  3: 'Senior',
  4: 'Expert'
};

const BUCKET_LABELS = {
  'screening': 'Screening',
  'deep': 'Technical',
  'architecture': 'Architecture'
};

export function AdvancedFilter({
  categories,
  selectedCategories,
  onCategoriesChange,
  questionCount,
  className
}: AdvancedFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredCategories = categories.filter(cat => 
    cat.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleCategoryToggle = (category: string) => {
    console.log('Toggling category:', category);
    console.log('Current selected:', selectedCategories);
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const handleClearAll = () => {
    onCategoriesChange([]);
  };

  const handleSelectAll = () => {
    onCategoriesChange([...categories]);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Компактная строка фильтра */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Счетчик вопросов */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{questionCount}</span>
          <span>вопросов</span>
        </div>

        {/* Поиск и селект тегов */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="flex-1 justify-between min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Search className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {selectedCategories.length === 0 
                      ? "Все категории" 
                      : selectedCategories.length === categories.length
                        ? "Все категории"
                        : `${selectedCategories.length} выбрано`
                    }
                  </span>
                </div>
                <Filter className="h-4 w-4 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="start">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Поиск категорий..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="shrink-0"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <Button
                    variant="ghost"
                    className="w-full justify-start font-medium"
                    onClick={() => {
                      handleSelectAll();
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-4 w-4 rounded border",
                        selectedCategories.length === categories.length
                          ? "bg-primary border-primary"
                          : "border-muted-foreground"
                      )} />
                      Выбрать все
                    </div>
                  </Button>
                  {filteredCategories.map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        handleCategoryToggle(category);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "h-4 w-4 rounded border",
                          selectedCategories.includes(category)
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        )} />
                        {category}
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Расширенные фильтры */}
                {showAdvanced && (
                  <div className="border-t pt-3 space-y-3">
                    <div className="text-sm font-medium">Дополнительные фильтры</div>
                    <div className="text-xs text-muted-foreground">
                      Фильтры по уровню сложности и типу вопроса будут добавлены в следующих версиях
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Кнопка сброса */}
          {selectedCategories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Выбранные теги */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {category}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryToggle(category);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
