# Замороженные профессии

Backend (Java), Analyst и DevOps пока отключены (`status: 'soon'` в
`src/entities/profession/model/constants.ts`). Их контент и раннеры вынесены из сборки,
но сохранены, чтобы дорабатывать профессии по одной.

- `questions/` — банки вопросов (проверяются `npm run validate-questions`)
- `tasks/` — задачи (TS-файлы, в `tsconfig` не входят)
- `runners/runner.legacy.ts` — старый раннер (Java→JS, Python/Pyodide, SQL/sql.js, YAML, Dockerfile, Mermaid)

Возврат профессии: перенести данные в `src/shared/…`, подключить в `api/questions.ts` и
`api/tasks.ts`, поставить `status: 'active'`, написать раннер по плану (Фаза 2/4
в `docs/REVIEW_AND_ROADMAP.md`). Зависимости раннеров (`java-parser`, `sql.js`, `mermaid`,
`js-yaml`) при этом возвращаются отдельными ленивыми чанками.
