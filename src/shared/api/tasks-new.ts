// Импорты задач по профессиям
import { BA } from './tasks/analyst'

// Экспорт всех задач
export const ALL_TASKS = [
  ...BA,
  // TODO: Добавить остальные профессии
]

// Экспорт по профессиям для удобства
export { BA }

// Типы (перенесены из entities для совместимости)
export type UITask = {
  id: string;
  level: 'junior'|'middle'|'senior';
  title: string;
  exportName: string;
  description: string;
  starter: string;
  tests: string;
  language?: 'javascript'|'typescript'|'java'|'sql'|'yaml'|'python'|'dockerfile'|'mermaid';
  testsSql?: {
    schema?: string[];
    data?: string[];
    expectedRows: any[];
    check?: string;
    queryVar?: string;
  };
  testsYaml?: {
    rules: { path: string; equals?: any; regex?: string; exists?: boolean; length?: number }[]
  };
  solution?: string; // Эталонное решение для интервьюера
}

// Функция для получения задач по профессии
export function getTasksByProfession(profession: string): UITask[] {
  switch (profession) {
    case 'analyst':
      return BA;
    // TODO: Добавить остальные профессии
    default:
      return [];
  }
}

// Функция для получения задач по уровню
export function getTasksByLevel(level: 'junior'|'middle'|'senior'): UITask[] {
  return ALL_TASKS.filter(task => task.level === level);
}

// Функция для получения задачи по ID
export function getTaskById(id: string): UITask | undefined {
  return ALL_TASKS.find(task => task.id === id);
}
