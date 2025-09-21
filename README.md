# SkillCheck - Open Source Interview Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

## 🎯 Description

**SkillCheck** is a modern web platform for conducting technical interviews and assessing developer skills. The platform provides a comprehensive solution for HR specialists, technical interviewers, and candidates for IT positions.

## 🌟 Features

### 🔧 Working Modes
- **Candidate Mode** — solving practical tasks and taking tests
- **Interviewer Mode** — evaluating solutions, viewing reference answers, scoring
- **Mock Interview** — practice real interviews: random questions and tasks, general timer, report and level recommendation

### 💻 Supported Professions
- **Frontend** — JavaScript, React, web development
- **Backend (Java)** — server-side development in Java
- **Business Analyst** — system analysis, SQL, business analysis
- **DevOps** — infrastructure, automation, CI/CD

### 🎓 Difficulty Levels
- **Junior** — basic tasks for beginners
- **Middle** — intermediate level tasks
- **Senior** — complex tasks for experienced developers

## ✨ Основные возможности

### 🔧 Режимы работы
- **Режим кандидата** — решение практических задач и прохождение тестов
- **Режим интервьюера** — оценка решений, просмотр эталонных ответов, выставление оценок
- **Мок‑интервью (Mock Interview)** — тренировка реального собеседования: случайные вопросы и задачи, общий таймер, отчёт и рекомендация по уровню

### 💻 Поддерживаемые профессии
- **Frontend** — JavaScript, React, веб-разработка
- **Backend (Java)** — серверная разработка на Java
- **Аналитик** — системный анализ, SQL, бизнес-анализ
- **DevOps** — инфраструктура, автоматизация, CI/CD

### 🎓 Уровни сложности
- **Junior** — базовые задачи для начинающих специалистов
- **Middle** — задачи среднего уровня сложности
- **Senior** — сложные задачи для опытных разработчиков

## 🚀 Функциональность

### 📝 Решение задач
- **Встроенный редактор кода** с подсветкой синтаксиса
- **Автоматическое форматирование** кода (Prettier)
- **Полноэкранный режим** для удобства работы, с отображением таймера
- **Мгновенная проверка** решений через тесты
- **Эталонные решения** для интервьюеров

### 🧪 Система тестирования
- **Автоматический запуск тестов** при изменении кода
- **Детальная обратная связь** через уведомления (toasts)
- **Подсчет пройденных тестов** и статистика
- **Информативные сообщения об ошибках**

### ⏱ Таймеры и уведомления
- Глобальный таймер и таймеры задач с выпадающим меню настроек (режим, лимит, пресеты)
- Авто‑уведомления: половина времени, <10% времени, время истекло
- Печать/экспорт отчёта без лишнего интерфейса

### 🧪 Мок‑интервью
- Конфигурируемый набор: кол-во теории/задач, длительность, уровень (Junior/Middle/Senior), разрешение паузы
- Персонализация: ФИО (обязательно), опционально отдел и должность — для печати
- Автоподстановка ФИО и сохранение полей в браузере
- Итоговый отчёт: проценты, рекомендованный уровень, список вопросов/задач с вашими и эталонными ответами
- На экране ответы скрыты (по кнопке «Показать ответ»), при печати ответы отображаются всегда

### 📊 Оценка и аналитика
- **Система оценок** (0-5 баллов) для интервьюеров
- **Комментарии к решениям** кандидатов
- **Сохранение результатов** в локальном хранилище
- **Экспорт данных** для дальнейшего анализа

### 📚 Теоретические вопросы
- **База вопросов** по каждой профессии
- **Различные уровни сложности** вопросов
- **Интерактивный интерфейс** для изучения
 - **База по умолчанию** подгружается из JSON в `src/shared/questions/*.json` (если нет пользовательских данных)

## 🛠 Технологический стек

### Frontend
- **React 18** — современный UI фреймворк
- **TypeScript** — типизированный JavaScript
- **Vite** — быстрый сборщик и dev-сервер
- **Tailwind CSS** — utility-first CSS фреймворк
- **shadcn/ui** — компонентная библиотека
- **Lucide React** — иконки

### Редактор кода
- **Monaco Editor** — редактор кода от VS Code
- **Prettier** — автоматическое форматирование
- **Поддержка языков** — JavaScript, Java, SQL, YAML

### Архитектура
- **Feature-Sliced Design (FSD)** — модульная архитектура
- **Context API** — управление состоянием
- **Local Storage** — персистентность данных

## 🚀 Быстрый старт

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Сборка для продакшена
```bash
npm run build
```

### Предварительный просмотр сборки
```bash
npm run preview
```

## 📁 Структура проекта

```
src/
├── app/                    # Приложение
│   ├── App.tsx            # Главный компонент
│   └── providers/         # Провайдеры контекста
├── entities/              # Бизнес-сущности
│   ├── profession/        # Профессии
│   ├── task/             # Задачи
│   ├── question/         # Вопросы
│   └── user/             # Пользователи
├── features/             # Фичи
│   └── code-editor/      # Редактор кода
├── pages/                # Страницы
│   ├── solve/           # Решение задач
│   ├── theory/          # Теория
│   ├── interview/       # Интервью
│   └── data-hub/        # Аналитика
└── shared/              # Общие компоненты
    ├── api/             # API и бизнес-логика
    ├── questions/       # Базовые JSON с вопросами (дефолтная поставка)
    ├── ui/              # UI компоненты
    ├── hooks/           # Хуки
    └── lib/             # Утилиты

Дополнительно:
- `pages/mock` — режим Мок‑интервью
```

## 🎯 Как использовать

### Для кандидатов
1. Выберите профессию из списка
2. Перейдите в раздел "Решение задач"
3. Выберите уровень сложности (Junior/Middle/Senior)
4. Решите задачу в встроенном редакторе
5. Запустите тесты для проверки решения
6. Изучите теоретические вопросы

### Мок‑интервью
1. На главной откройте вкладку «Мок‑интервью»
2. Заполните ФИО (обязательно) и при необходимости отдел/должность
3. Выберите уровень задач, длительность и состав (теория/задачи)
4. Нажмите «Начать» (таймер стартует автоматически)
5. По завершении просмотрите отчёт, распечатайте PDF

### Для интервьюеров
1. Переключитесь в режим "Интервьюер"
2. Выберите профессию и задачу
3. Просмотрите решение кандидата
4. Сравните с эталонным решением
5. Выставьте оценку и добавьте комментарий
6. Отправьте оценку в систему

## 🔧 Настройка

### Добавление новых профессий
1. Добавьте профессию в `src/entities/profession/model/constants.ts`
2. Создайте задачи в `src/shared/api/tasks.ts`
3. Добавьте вопросы в `src/shared/api/questions.ts`

### Добавление новых задач
1. Определите задачу в соответствующем массиве в `src/shared/api/tasks.ts`
2. Добавьте тесты для проверки решения
3. При необходимости добавьте эталонное решение

## 📈 Планы развития

- [ ] Интеграция с внешними системами HR
- [ ] Система рейтингов и достижений
- [ ] Видеозвонки для онлайн-интервью
- [ ] Аналитика и отчеты
- [ ] Мобильная версия
- [ ] Поддержка дополнительных языков программирования

## 🤝 Contributing

We welcome contributions to the platform! If you have ideas for improvements or found a bug, please create an issue or pull request.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/skillCheck.git`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Create a feature branch: `git checkout -b feature/amazing-feature`
6. Make your changes and commit: `git commit -m 'Add amazing feature'`
7. Push to your branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Adding Questions

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on adding new questions and tasks.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have questions or issues, please create an issue in the repository or contact the development team.

## 🌍 Internationalization

The platform currently supports Russian and English interfaces. We welcome contributions for additional language support.

---

**SkillCheck** — проверяем навыки, находим таланты! 🚀
