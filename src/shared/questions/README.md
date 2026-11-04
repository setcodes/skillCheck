# Банк вопросов

Активный банк — `frontend.json` (массив вопросов). Схема — `src/shared/bank/schema.ts`,
шаблон — `templates/question-template.json`, справочник тем — `src/entities/question/model/topics.ts`.

Поля вопроса:

| Поле | Смысл |
|---|---|
| `id` | стабильный ASCII-id `fe-<тема>-NNN` |
| `aliases` | прежние id (для старых ссылок и сохранённых оценок) |
| `level` / `kind` | `junior \| middle \| senior` / `screening \| deep \| practical \| architecture` |
| `topic` / `tags` | тема из справочника / свободные kebab-case теги |
| `answer` | `short` (суть), `full` (развёрнутый ответ), `mustMention`, `commonMistakes`, `redFlags` |
| `followUps`, `sources` | уточняющие вопросы и источники |
| `reviewedAt` | дата вычитки `YYYY-MM-DD`; `null` — ответ не проверен человеком |

Проверка: `npm run validate-questions` (ошибки схемы валят CI, контентный долг — предупреждения и таблица
покрытия «тема × уровень»). Замороженные профессии — в `/frozen/questions` (старый формат).

Встроенный банк — источник истины и обновляется вместе с приложением; импорт пользователя хранится
отдельным слоем и накладывается сверху по `id`. Записи, совпадающие со встроенными, в этот слой не попадают, а экспорт выгружает
только его — в том же формате, что и банк. Как предложить вопрос в общий банк — в [CONTRIBUTING.md](../../../CONTRIBUTING.md).
