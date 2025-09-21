# 📚 Question Management System

Система управления теоретическими вопросами для SkillCheck Interview Suite.

## 🏗️ Архитектура

### Источники вопросов
1. **JSON файлы** - основные вопросы в `*.json`
2. **Markdown файлы** - дополнительные вопросы в `md/`
3. **LocalStorage** - пользовательские вопросы
4. **Pull Requests** - контрибьюторские вопросы

### Приоритеты источников
1. **LocalStorage** (приоритет 1) - пользовательские изменения
2. **Markdown** (приоритет 2) - контрибьюторские вопросы
3. **JSON** (приоритет 3) - базовые вопросы

## 📁 Структура файлов

```
src/shared/questions/
├── frontend-qa-100.json      # Frontend вопросы (100)
├── backend-java-qa-100.json  # Backend (Java) вопросы (100)
├── ba-qa-100.json           # Business Analyst вопросы (95)
├── devops-qa-100.json       # DevOps вопросы (100)
├── templates/                # Шаблоны для новых вопросов
│   ├── question-template.json
│   ├── question-template.md
│   └── README.md
└── md/                      # Markdown вопросы
    ├── frontend/
    ├── backend-java/
    ├── analyst/
    └── devops/
```

## 🔧 Разработка

### Локальная разработка
```bash
# Запуск проекта
npm run dev

# Валидация вопросов
npm run validate-questions

# Сборка
npm run build
```

### Добавление новых вопросов

#### JSON формат
```json
{
  "id": "fe_001_closure",
  "title": "Замыкание в JavaScript",
  "category": "JavaScript",
  "difficulty": 2,
  "bucket": "screening",
  "prompt": "Объясните замыкание...",
  "answer": "Замыкание — это функция..."
}
```

#### Markdown формат
```markdown
---
id: fe_md_001
title: Замыкание в JavaScript
category: JavaScript
difficulty: 2
bucket: screening
---

## Вопрос
Объясните замыкание...

## Ответ
Замыкание — это функция...
```

## 🚀 Контрибьюция

### Через Pull Request
1. Форкните репозиторий
2. Создайте ветку для изменений
3. Добавьте вопросы в соответствующие файлы
4. Запустите валидацию: `npm run validate-questions`
5. Создайте Pull Request

### Автоматические проверки
GitHub Actions автоматически проверяет:
- ✅ Валидность JSON
- ✅ Наличие обязательных полей
- ✅ Уникальность ID
- ✅ Минимальную длину текста
- ✅ Качество вопросов

## 📊 Статистика

| Профессия | JSON | Markdown | Всего |
|-----------|------|----------|-------|
| Frontend | 100 | 0 | 100 |
| Backend (Java) | 100 | 0 | 100 |
| Business Analyst | 95 | 0 | 95 |
| DevOps | 100 | 0 | 100 |
| **Итого** | **395** | **0** | **395** |

## 🎯 Уровни сложности

- **1 (Junior)** - Базовые концепции
- **2 (Middle)** - Промежуточные знания
- **3 (Senior)** - Продвинутые концепции
- **4 (Expert)** - Экспертные знания

## 🏷️ Категории вопросов

- **screening** - Быстрая проверка
- **deep** - Глубокое понимание
- **architecture** - Архитектурные решения

## 🔍 Валидация

### Локальная валидация
```bash
npm run validate-questions
```

### Что проверяется
- Валидность JSON структуры
- Наличие обязательных полей
- Уникальность ID вопросов
- Минимальная длина ответов (10+ символов)
- Минимальная длина вопросов (10+ символов)
- Валидность difficulty (1-4)
- Валидность bucket (screening/deep/architecture)

## 📝 Шаблоны

Используйте шаблоны в `templates/` для создания новых вопросов:
- `question-template.json` - для JSON вопросов
- `question-template.md` - для Markdown вопросов

## 🤝 Поддержка

- **Issues** - для багов и предложений
- **Discussions** - для общих вопросов
- **Pull Requests** - для контрибьюции

---

**Happy Contributing! 🚀**
