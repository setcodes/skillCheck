import type { TheoryQuestion } from '@/entities/question/model/types'
import type { UITask } from '@/entities/task/model/types'
import type { Profession } from '@/entities/profession/model/types'
import { TASKS_BY_PROF } from './tasks'

// Вопросы для Frontend
const QUESTIONS_FRONTEND: TheoryQuestion[] = [
  {
    id: 'fe-1',
    title: 'Что такое замыкание (closure) в JavaScript?',
    category: 'JavaScript',
    difficulty: 3,
    bucket: 'screening',
    prompt: 'Объясните концепцию замыканий в JavaScript и приведите пример.',
    answer: 'Замыкание - это функция, которая имеет доступ к переменным из внешней области видимости даже после того, как внешняя функция завершила выполнение. Это происходит благодаря лексическому контексту (lexical scoping).\n\nПример:\n```javascript\nfunction outerFunction(x) {\n  return function innerFunction(y) {\n    return x + y; // x доступна из внешней функции\n  }\n}\n\nconst addFive = outerFunction(5);\nconsole.log(addFive(3)); // 8\n```'
  },
  {
    id: 'fe-2',
    title: 'Разница между let, const и var',
    category: 'JavaScript',
    difficulty: 2,
    bucket: 'screening',
    prompt: 'В чем разница между объявлением переменных через let, const и var?',
    answer: 'var: функциональная область видимости, поднятие (hoisting), можно переобъявлять\nlet: блочная область видимости, временная мертвая зона, нельзя переобъявлять\nconst: блочная область видимости, нельзя переприсваивать, но объекты можно мутировать'
  }
]

// Вопросы для Backend Java
const QUESTIONS_BACKEND_JAVA: TheoryQuestion[] = [
  {
    id: 'be-1',
    title: 'Принципы SOLID',
    category: 'Архитектура',
    difficulty: 4,
    bucket: 'deep',
    prompt: 'Объясните принципы SOLID в контексте Java разработки.',
    answer: 'S - Single Responsibility: класс должен иметь только одну причину для изменения\nO - Open/Closed: открыт для расширения, закрыт для модификации\nL - Liskov Substitution: объекты базового класса должны заменяться объектами производных классов\nI - Interface Segregation: клиенты не должны зависеть от интерфейсов, которые они не используют\nD - Dependency Inversion: модули высокого уровня не должны зависеть от модулей низкого уровня'
  }
]

// Вопросы для Аналитика
const QUESTIONS_ANALYST: TheoryQuestion[] = [
  {
    id: 'an-1',
    title: 'Методологии анализа требований',
    category: 'Анализ',
    difficulty: 3,
    bucket: 'deep',
    prompt: 'Какие методологии анализа требований вы знаете?',
    answer: '1. Waterfall - последовательный подход\n2. Agile - итеративный подход\n3. User Stories - пользовательские истории\n4. Use Cases - случаи использования\n5. BPMN - моделирование бизнес-процессов'
  }
]

// Вопросы для DevOps
const QUESTIONS_DEVOPS: TheoryQuestion[] = [
  {
    id: 'do-1',
    title: 'Контейнеризация и Docker',
    category: 'Инфраструктура',
    difficulty: 3,
    bucket: 'screening',
    prompt: 'Что такое Docker и зачем он нужен?',
    answer: 'Docker - платформа для контейнеризации приложений. Позволяет упаковать приложение со всеми зависимостями в контейнер, который может работать на любой системе. Преимущества: изоляция, портабельность, масштабируемость, консистентность сред.'
  }
]

const QUESTIONS_BY_PROF: Record<Profession, TheoryQuestion[]> = {
  'frontend': QUESTIONS_FRONTEND,
  'backend-java': QUESTIONS_BACKEND_JAVA,
  'analyst': QUESTIONS_ANALYST,
  'devops': QUESTIONS_DEVOPS
}

export function getQuestions(prof: Profession): TheoryQuestion[] {
  return QUESTIONS_BY_PROF[prof] || []
}

export function putQuestions(prof: Profession, questions: TheoryQuestion[]): void {
  // В реальном приложении здесь была бы логика сохранения
  console.log(`Saving questions for ${prof}:`, questions)
}

export function getTasks(prof: Profession): UITask[] {
  return TASKS_BY_PROF[prof] || []
}

export function putTasks(prof: Profession, tasks: UITask[]): void {
  // В реальном приложении здесь была бы логика сохранения
  console.log(`Saving tasks for ${prof}:`, tasks)
}
