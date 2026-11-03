# Банк вопросов

Активный банк — `frontend-qa-100.json` (массив вопросов). Формат: `templates/question-template.json`.
Поля: `id`, `title`, `category`, `difficulty` (1–3), `bucket` (`screening` | `deep` | `architecture`), `prompt`, `answer`.

Проверка: `npm run validate-questions`. Замороженные профессии — в `/frozen/questions`.

Встроенный банк копируется в localStorage при первом запуске; обновление банка у существующих
пользователей появится в Фазе 3 (версионирование).
