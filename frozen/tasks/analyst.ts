import { UITask } from '../tasks'

/* =============== ANALYST TASKS =============== */
export const BA: UITask[] = [
  // =============== JUNIOR (4 задачи) ===============
  // Основы аналитики
  {
    id: 'ba_sql_revenue_analysis',
    level: 'junior',
    title: 'Анализ выручки по месяцам (SQL)',
    exportName: 'SQL_REVENUE',
    description: 'Напишите SQL запрос для анализа выручки по месяцам.',
    language: 'sql',
    starter: `-- TODO: Напишите SQL запрос для анализа выручки
-- Требования:
-- - Группировка по месяцам (используйте SUBSTR(date, 1, 7))
-- - Сумма выручки за каждый месяц
-- - Сортировка по месяцам
-- - Таблица: orders (id, date, amount, customer_id)

SELECT 
  -- TODO: Добавьте поля для группировки по месяцам
  -- TODO: Добавьте агрегацию выручки
FROM orders
-- TODO: Добавьте группировку и сортировку`,
    tests: `-- Тесты для SQL запроса
-- Проверяем корректность анализа выручки
-- Создаем тестовые данные
CREATE TABLE orders (
  id INTEGER,
  date TEXT,
  amount REAL,
  customer_id INTEGER
);

INSERT INTO orders VALUES 
  (1, '2024-01-15', 100.00, 1),
  (2, '2024-01-20', 150.00, 2),
  (3, '2024-02-10', 200.00, 1),
  (4, '2024-02-15', 75.00, 3),
  (5, '2024-03-05', 300.00, 2);

-- Выполняем запрос пользователя
-- Проверяем, что результат содержит нужные колонки
-- Проверяем, что данные сгруппированы по месяцам
-- Проверяем, что есть агрегация выручки`,
    testsSql: {
      schema: [
        `CREATE TABLE orders (
  id INTEGER,
  date TEXT,
  amount REAL,
  customer_id INTEGER
);`
      ],
      data: [
        `INSERT INTO orders VALUES (1, '2024-01-15', 100.00, 1);`,
        `INSERT INTO orders VALUES (2, '2024-01-20', 150.00, 2);`,
        `INSERT INTO orders VALUES (3, '2024-02-10', 200.00, 1);`,
        `INSERT INTO orders VALUES (4, '2024-02-15', 75.00, 3);`,
        `INSERT INTO orders VALUES (5, '2024-03-05', 300.00, 2);`
      ],
      expectedRows: [
        ['2024-01', 250.0, 2, 125.0],
        ['2024-02', 275.0, 2, 137.5],
        ['2024-03', 300.0, 1, 300.0]
      ]
    },
    solution: `SELECT 
  SUBSTR(date, 1, 7) as month,
  SUM(amount) as total_revenue,
  COUNT(*) as order_count,
  AVG(amount) as avg_order_value
FROM orders
WHERE date >= '2024-01-01'
GROUP BY SUBSTR(date, 1, 7)
ORDER BY month;`
  },

  {
    id: 'ba_python_data_cleaning',
    level: 'junior',
    title: 'Очистка данных (Python)',
    exportName: 'data_cleaning',
    description: 'Напишите Python скрипт для очистки данных.',
    language: 'python',
    starter: `# TODO: Напишите Python скрипт для очистки данных
# Требования:
# - Удалить дубликаты
# - Заполнить пропущенные значения
# - Очистить выбросы
# - Нормализовать данные

import pandas as pd
import numpy as np

def clean_data(df):
    # TODO: Реализуйте очистку данных
    # 1. Удалите дубликаты
    # 2. Заполните пропущенные значения
    # 3. Очистите выбросы
    # 4. Нормализуйте данные
    pass

# Пример использования
if __name__ == "__main__":
    # Создаем тестовые данные
    data = {
        'name': ['John', 'Jane', 'John', 'Bob', None],
        'age': [25, 30, 25, 150, 35],
        'salary': [50000, 60000, 50000, 70000, None]
    }
    df = pd.DataFrame(data)
    print("Исходные данные:")
    print(df)

    cleaned_df = clean_data(df)
    print("\\nОчищенные данные:")
    print(cleaned_df)`,
    tests: `# Тесты для Python скрипта
# Проверяем корректность очистки данных
import pandas as pd
import numpy as np

# Создаем тестовые данные
data = {
    'name': ['John', 'Jane', 'John', 'Bob', None],
    'age': [25, 30, 25, 35, 40],
    'city': ['New York', 'London', 'New York', 'Paris', 'Tokyo'],
    'salary': [50000, 60000, 50000, 70000, None]
}
df = pd.DataFrame(data)

# Тестируем функцию очистки
cleaned_df = clean_data(df)

# Проверяем, что дубликаты удалены
assert len(cleaned_df) == 4, 'Дубликаты должны быть удалены'

# Проверяем, что пропущенные значения заполнены
assert cleaned_df['name'].isna().sum() == 0, 'Пропущенные значения в name должны быть заполнены'
assert cleaned_df['salary'].isna().sum() == 0, 'Пропущенные значения в salary должны быть заполнены'

# Проверяем, что возраст в разумных пределах
assert (cleaned_df['age'] >= 18).all(), 'Возраст должен быть >= 18'
assert (cleaned_df['age'] <= 100).all(), 'Возраст должен быть <= 100'`,
    solution: `import pandas as pd
import numpy as np

def clean_data(df):
    # 1. Удаляем дубликаты
    df = df.drop_duplicates()

    # 2. Заполняем пропущенные значения
    df['name'] = df['name'].fillna('Unknown')
    df['salary'] = df['salary'].fillna(df['salary'].median())

    # 3. Очищаем выбросы (возраст > 100)
    df = df[df['age'] <= 100]

    # 4. Нормализуем данные
    df['age_normalized'] = (df['age'] - df['age'].mean()) / df['age'].std()
    df['salary_normalized'] = (df['salary'] - df['salary'].mean()) / df['salary'].std()

    return df

# Пример использования
if __name__ == "__main__":
    # Создаем тестовые данные
    data = {
        'name': ['John', 'Jane', 'John', 'Bob', None],
        'age': [25, 30, 25, 150, 35],
        'salary': [50000, 60000, 50000, 70000, None]
    }
    df = pd.DataFrame(data)
    print("Исходные данные:")
    print(df)

    cleaned_df = clean_data(df)
    print("\\nОчищенные данные:")
    print(cleaned_df)`
  },

  {
    id: 'ba_dashboard_metrics',
    level: 'junior',
    title: 'Ключевые метрики дашборда',
    exportName: 'dashboard_metrics',
    description: 'Рассчитайте ключевые метрики для дашборда.',
    language: 'python',
    starter: `# TODO: Рассчитайте ключевые метрики для дашборда
# Требования:
# - DAU (Daily Active Users)
# - Retention Rate
# - Average Session Duration
# - Conversion Rate

import pandas as pd
from datetime import datetime, timedelta

def calculate_metrics(users_df, sessions_df, orders_df):
    # TODO: Реализуйте расчет метрик
    # 1. DAU - количество уникальных пользователей в день
    # 2. Retention Rate - процент пользователей, вернувшихся на следующий день
    # 3. Average Session Duration - средняя длительность сессии
    # 4. Conversion Rate - процент пользователей, совершивших покупку
    
    metrics = {}
    
    # TODO: Рассчитайте DAU
    # metrics['dau'] = ...
    
    # TODO: Рассчитайте Retention Rate
    # metrics['retention_rate'] = ...
    
    # TODO: Рассчитайте Average Session Duration
    # metrics['avg_session_duration'] = ...
    
    # TODO: Рассчитайте Conversion Rate
    # metrics['conversion_rate'] = ...
    
    return metrics

# Пример использования
if __name__ == "__main__":
    # Создаем тестовые данные
    users = pd.DataFrame({
        'user_id': [1, 2, 3, 4, 5],
        'registration_date': ['2024-01-01', '2024-01-02', '2024-01-01', '2024-01-03', '2024-01-02']
    })
    
    sessions = pd.DataFrame({
        'user_id': [1, 2, 3, 1, 4, 5],
        'session_start': ['2024-01-01 10:00', '2024-01-02 11:00', '2024-01-01 12:00', '2024-01-02 14:00', '2024-01-03 15:00', '2024-01-02 16:00'],
        'session_end': ['2024-01-01 10:30', '2024-01-02 11:45', '2024-01-01 12:15', '2024-01-02 14:30', '2024-01-03 15:20', '2024-01-02 16:45']
    })
    
    orders = pd.DataFrame({
        'user_id': [1, 2, 4],
        'order_date': ['2024-01-01', '2024-01-02', '2024-01-03'],
        'amount': [100, 200, 150]
    })
    
    metrics = calculate_metrics(users, sessions, orders)
    print("Ключевые метрики:")
    for key, value in metrics.items():
        print(f"{key}: {value}")`,
    tests: `# Тесты для расчета метрик
# Проверяем корректность расчетов
import pandas as pd
from datetime import datetime, timedelta

# Создаем тестовые данные
users_data = {
    'user_id': [1, 2, 3, 4, 5],
    'registration_date': ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05']
}
users_df = pd.DataFrame(users_data)

sessions_data = {
    'user_id': [1, 1, 2, 2, 3, 4, 5],
    'session_start': ['2024-01-01 10:00:00', '2024-01-02 11:00:00', '2024-01-02 12:00:00', '2024-01-03 13:00:00', '2024-01-03 14:00:00', '2024-01-04 15:00:00', '2024-01-05 16:00:00'],
    'session_end': ['2024-01-01 10:30:00', '2024-01-02 11:45:00', '2024-01-02 12:30:00', '2024-01-03 13:45:00', '2024-01-03 14:30:00', '2024-01-04 15:45:00', '2024-01-05 16:30:00']
}
sessions_df = pd.DataFrame(sessions_data)

orders_data = {
    'user_id': [1, 2, 3],
    'order_date': ['2024-01-01', '2024-01-02', '2024-01-03'],
    'amount': [100, 200, 150]
}
orders_df = pd.DataFrame(orders_data)

# Тестируем функцию расчета метрик
metrics = calculate_metrics(users_df, sessions_df, orders_df)

# Проверяем, что все метрики рассчитаны
assert 'dau' in metrics, 'DAU должна быть рассчитана'
assert 'retention_rate' in metrics, 'Retention Rate должна быть рассчитана'
assert 'avg_session_duration' in metrics, 'Average Session Duration должна быть рассчитана'
assert 'conversion_rate' in metrics, 'Conversion Rate должна быть рассчитана'

# Проверяем, что метрики имеют разумные значения
assert metrics['dau'] > 0, 'DAU должна быть больше 0'
assert 0 <= metrics['retention_rate'] <= 100, 'Retention Rate должна быть в процентах'
assert metrics['avg_session_duration'] > 0, 'Average Session Duration должна быть больше 0'
assert 0 <= metrics['conversion_rate'] <= 100, 'Conversion Rate должна быть в процентах'`,
    solution: `import pandas as pd
from datetime import datetime, timedelta

def calculate_metrics(users_df, sessions_df, orders_df):
    metrics = {}
    
    # 1. DAU - количество уникальных пользователей в день
    sessions_df['date'] = pd.to_datetime(sessions_df['session_start']).dt.date
    daily_users = sessions_df.groupby('date')['user_id'].nunique()
    metrics['dau'] = daily_users.mean()
    
    # 2. Retention Rate - процент пользователей, вернувшихся на следующий день
    user_first_session = sessions_df.groupby('user_id')['date'].min()
    user_sessions = sessions_df.groupby('user_id')['date'].apply(set)
    
    retained_users = 0
    total_users = len(user_first_session)
    
    for user_id, first_date in user_first_session.items():
        next_date = first_date + timedelta(days=1)
        if next_date in user_sessions[user_id]:
            retained_users += 1
    
    metrics['retention_rate'] = (retained_users / total_users) * 100 if total_users > 0 else 0
    
    # 3. Average Session Duration - средняя длительность сессии
    sessions_df['session_start'] = pd.to_datetime(sessions_df['session_start'])
    sessions_df['session_end'] = pd.to_datetime(sessions_df['session_end'])
    sessions_df['duration'] = (sessions_df['session_end'] - sessions_df['session_start']).dt.total_seconds() / 60
    metrics['avg_session_duration'] = sessions_df['duration'].mean()
    
    # 4. Conversion Rate - процент пользователей, совершивших покупку
    total_users = users_df['user_id'].nunique()
    converted_users = orders_df['user_id'].nunique()
    metrics['conversion_rate'] = (converted_users / total_users) * 100 if total_users > 0 else 0
    
    return metrics

# Пример использования
if __name__ == "__main__":
    # Создаем тестовые данные
    users = pd.DataFrame({
        'user_id': [1, 2, 3, 4, 5],
        'registration_date': ['2024-01-01', '2024-01-02', '2024-01-01', '2024-01-03', '2024-01-02']
    })
    
    sessions = pd.DataFrame({
        'user_id': [1, 2, 3, 1, 4, 5],
        'session_start': ['2024-01-01 10:00', '2024-01-02 11:00', '2024-01-01 12:00', '2024-01-02 14:00', '2024-01-03 15:00', '2024-01-02 16:00'],
        'session_end': ['2024-01-01 10:30', '2024-01-02 11:45', '2024-01-01 12:15', '2024-01-02 14:30', '2024-01-03 15:20', '2024-01-02 16:45']
    })
    
    orders = pd.DataFrame({
        'user_id': [1, 2, 4],
        'order_date': ['2024-01-01', '2024-01-02', '2024-01-03'],
        'amount': [100, 200, 150]
    })
    
    metrics = calculate_metrics(users, sessions, orders)
    print("Ключевые метрики:")
    for key, value in metrics.items():
        print(f"{key}: {value}")`
  },

  {
    id: 'ba_system_architecture',
    level: 'junior',
    title: 'Архитектура системы',
    exportName: 'system_architecture',
    description: 'Создайте диаграмму архитектуры системы.',
    language: 'mermaid',
    starter: `graph TD
    %% TODO: Создайте диаграмму архитектуры системы
    %% Требования:
    %% - Пользовательский интерфейс
    %% - API Gateway
    %% - Микросервисы
    %% - База данных
    %% - Кэш
    %% - Мониторинг

    A[Пользователь] --> B[API Gateway]
    %% TODO: Добавьте остальные компоненты`,
    tests: `# Тесты для Mermaid диаграммы
# Проверяем корректность архитектуры
# Проверяем, что диаграмма содержит основные компоненты
assert 'graph' in userCode.lower(), 'Диаграмма должна начинаться с graph'
assert 'api gateway' in userCode.lower() or 'apigateway' in userCode.lower(), 'Должен быть API Gateway'
assert 'database' in userCode.lower() or 'db' in userCode.lower(), 'Должна быть база данных'
assert 'user' in userCode.lower(), 'Должен быть пользователь'
assert 'service' in userCode.lower(), 'Должны быть сервисы'`,
    solution: `graph TD
    A[Пользователь] --> B[API Gateway]
    B --> C[Auth Service]
    B --> D[User Service]
    B --> E[Order Service]
    B --> F[Payment Service]
    
    C --> G[(User DB)]
    D --> G
    E --> H[(Order DB)]
    F --> I[(Payment DB)]
    
    B --> J[Redis Cache]
    B --> K[Message Queue]
    
    L[Monitoring] --> B
    L --> C
    L --> D
    L --> E
    L --> F
    
    M[Load Balancer] --> B
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#e8f5e8
    style E fill:#e8f5e8
    style F fill:#e8f5e8
    style G fill:#fff3e0
    style H fill:#fff3e0
    style I fill:#fff3e0
    style J fill:#fce4ec
    style K fill:#fce4ec
    style L fill:#f1f8e9
    style M fill:#e3f2fd`
  },

  // =============== MIDDLE (8 задач) ===============
  // Продвинутая аналитика
  {
    id: 'ba_ab_testing',
    level: 'middle',
    title: 'A/B тестирование (Python)',
    exportName: 'ab_testing',
    description: 'Напишите Python скрипт для анализа A/B теста.',
    language: 'python',
    starter: `# TODO: Напишите Python скрипт для анализа A/B теста
# Требования:
# - Загрузка данных A/B теста
# - Статистический анализ (t-test, chi-square)
# - Расчет статистической значимости
# - Визуализация результатов

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

def analyze_ab_test(data):
    # TODO: Реализуйте анализ A/B теста
    # 1. Загрузите данные
    # 2. Проведите статистический анализ
    # 3. Рассчитайте p-value
    # 4. Создайте визуализацию
    pass

# Пример использования
if __name__ == "__main__":
    # Создаем тестовые данные A/B теста
    data = {
        'group': ['A', 'B'] * 1000,
        'conversion': np.random.binomial(1, [0.1, 0.12], 2000),
        'revenue': np.random.normal([100, 110], 20, 2000)
    }
    df = pd.DataFrame(data)
    
    analyze_ab_test(df)`,
    tests: `# Тесты для A/B тестирования
# Проверяем корректность статистического анализа
import pandas as pd
import numpy as np

# Создаем тестовые данные A/B теста
data = {
    'group': ['A', 'B'] * 100,
    'conversion': [0, 1, 0, 1, 0, 1, 0, 1, 0, 1] * 20,
    'revenue': np.random.normal([100, 110], 20, 200)
}
df = pd.DataFrame(data)

# Тестируем функцию анализа A/B теста
results = analyze_ab_test(df)

# Проверяем, что функция возвращает результаты
assert isinstance(results, dict), 'Функция должна возвращать словарь с результатами'

# Проверяем, что есть основные метрики
assert 'conversion_a' in results, 'Должна быть конверсия группы A'
assert 'conversion_b' in results, 'Должна быть конверсия группы B'
assert 'p_value_conversion' in results, 'Должен быть p-value для конверсии'
assert 'p_value_revenue' in results, 'Должен быть p-value для выручки'

# Проверяем, что значения в разумных пределах
assert 0 <= results['conversion_a'] <= 1, 'Конверсия группы A должна быть от 0 до 1'
assert 0 <= results['conversion_b'] <= 1, 'Конверсия группы B должна быть от 0 до 1'
assert 0 <= results['p_value_conversion'] <= 1, 'P-value для конверсии должен быть от 0 до 1'
assert 0 <= results['p_value_revenue'] <= 1, 'P-value для выручки должен быть от 0 до 1'`,
    solution: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

def analyze_ab_test(data):
    # 1. Загружаем данные
    df = pd.DataFrame(data)
    
    # 2. Разделяем на группы
    group_a = df[df['group'] == 'A']
    group_b = df[df['group'] == 'B']
    
    # 3. Статистический анализ конверсии
    conversion_a = group_a['conversion'].mean()
    conversion_b = group_b['conversion'].mean()
    
    # Chi-square тест для конверсии
    contingency_table = pd.crosstab(df['group'], df['conversion'])
    chi2, p_value_conversion, _, _ = stats.chi2_contingency(contingency_table)
    
    # 4. Статистический анализ выручки
    revenue_a = group_a['revenue']
    revenue_b = group_b['revenue']
    
    # t-test для выручки
    t_stat, p_value_revenue = stats.ttest_ind(revenue_a, revenue_b)
    
    # 5. Результаты
    results = {
        'conversion_a': conversion_a,
        'conversion_b': conversion_b,
        'conversion_lift': ((conversion_b - conversion_a) / conversion_a) * 100,
        'p_value_conversion': p_value_conversion,
        'revenue_a': revenue_a.mean(),
        'revenue_b': revenue_b.mean(),
        'revenue_lift': ((revenue_b.mean() - revenue_a.mean()) / revenue_a.mean()) * 100,
        'p_value_revenue': p_value_revenue,
        'significant_conversion': p_value_conversion < 0.05,
        'significant_revenue': p_value_revenue < 0.05
    }
    
    # 6. Визуализация
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
    
    # График конверсии
    ax1.bar(['Group A', 'Group B'], [conversion_a, conversion_b])
    ax1.set_title('Conversion Rate by Group')
    ax1.set_ylabel('Conversion Rate')
    
    # График выручки
    ax2.boxplot([revenue_a, revenue_b], labels=['Group A', 'Group B'])
    ax2.set_title('Revenue Distribution by Group')
    ax2.set_ylabel('Revenue')
    
    plt.tight_layout()
    plt.show()
    
    return results

# Пример использования
if __name__ == "__main__":
    # Создаем тестовые данные A/B теста
    data = {
        'group': ['A', 'B'] * 1000,
        'conversion': np.random.binomial(1, [0.1, 0.12], 2000),
        'revenue': np.random.normal([100, 110], 20, 2000)
    }
    df = pd.DataFrame(data)
    
    results = analyze_ab_test(df)
    print("Результаты A/B теста:")
    for key, value in results.items():
        print(f"{key}: {value}")`
  },

  {
    id: 'ba_cohort_analysis',
    level: 'middle',
    title: 'Когортный анализ (Python)',
    exportName: 'cohort_analysis',
    description: 'Напишите Python скрипт для когортного анализа пользователей.',
    language: 'python',
    starter: `# TODO: Напишите Python скрипт для когортного анализа
# Требования:
# - Группировка пользователей по когортам (месяц регистрации)
# - Расчет retention rate для каждой когорты
# - Визуализация когортной таблицы
# - Анализ трендов retention

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

def cohort_analysis(users_df, orders_df):
    # TODO: Реализуйте когортный анализ
    # 1. Создайте когорты по месяцу регистрации
    # 2. Рассчитайте retention rate
    # 3. Создайте когортную таблицу
    # 4. Визуализируйте результаты
    pass

# Пример использования
if __name__ == "__main__":
    # Создаем тестовые данные
    users = pd.DataFrame({
        'user_id': range(1, 1001),
        'registration_date': pd.date_range('2023-01-01', periods=1000, freq='D')
    })
    
    orders = pd.DataFrame({
        'user_id': np.random.randint(1, 1001, 5000),
        'order_date': pd.date_range('2023-01-01', periods=5000, freq='H')
    })
    
    cohort_analysis(users, orders)`,
    tests: `# Тесты для когортного анализа
# Проверяем корректность расчетов
import pandas as pd
import numpy as np

# Создаем тестовые данные
users_data = {
    'user_id': range(1, 101),
    'registration_date': pd.date_range('2023-01-01', periods=100, freq='D')
}
users_df = pd.DataFrame(users_data)

orders_data = {
    'user_id': np.random.randint(1, 101, 200),
    'order_date': pd.date_range('2023-01-01', periods=200, freq='D')
}
orders_df = pd.DataFrame(orders_data)

# Тестируем функцию когортного анализа
cohort_table = cohort_analysis(users_df, orders_df)

# Проверяем, что функция возвращает результат
assert cohort_table is not None, 'Функция должна возвращать когортную таблицу'

# Проверяем, что это DataFrame
assert isinstance(cohort_table, pd.DataFrame), 'Результат должен быть DataFrame'

# Проверяем, что есть колонки с месяцами
assert len(cohort_table.columns) > 0, 'Должны быть колонки с месяцами'

# Проверяем, что есть строки с когортами
assert len(cohort_table.index) > 0, 'Должны быть строки с когортами'

# Проверяем, что значения в разумных пределах (0-100 для retention rate)
for col in cohort_table.columns:
    for idx in cohort_table.index:
        value = cohort_table.loc[idx, col]
        if pd.notna(value):
            assert 0 <= value <= 100, f'Retention rate должен быть от 0 до 100, получен {value}'`,
    solution: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

def cohort_analysis(users_df, orders_df):
    # 1. Создаем когорты по месяцу регистрации
    users_df['registration_date'] = pd.to_datetime(users_df['registration_date'])
    users_df['cohort'] = users_df['registration_date'].dt.to_period('M')
    
    orders_df['order_date'] = pd.to_datetime(orders_df['order_date'])
    orders_df['order_month'] = orders_df['order_date'].dt.to_period('M')
    
    # 2. Объединяем данные
    user_orders = users_df.merge(orders_df, on='user_id', how='left')
    
    # 3. Рассчитываем retention rate
    cohort_data = user_orders.groupby(['cohort', 'order_month']).agg({
        'user_id': 'nunique'
    }).reset_index()
    
    # 4. Создаем когортную таблицу
    cohort_table = cohort_data.pivot(index='cohort', columns='order_month', values='user_id')
    
    # 5. Рассчитываем retention rate в процентах
    cohort_sizes = cohort_table.iloc[:, 0]  # Размер когорты в первый месяц
    retention_table = cohort_table.div(cohort_sizes, axis=0) * 100
    
    # 6. Визуализация
    plt.figure(figsize=(12, 8))
    sns.heatmap(retention_table, annot=True, fmt='.1f', cmap='YlOrRd')
    plt.title('Cohort Analysis - Retention Rate (%)')
    plt.xlabel('Order Month')
    plt.ylabel('Registration Cohort')
    plt.tight_layout()
    plt.show()
    
    # 7. Анализ трендов
    avg_retention = retention_table.mean(axis=1)
    print("Средний retention rate по когортам:")
    print(avg_retention)
    
    return {
        'cohort_table': cohort_table,
        'retention_table': retention_table,
        'avg_retention': avg_retention
    }

# Пример использования
if __name__ == "__main__":
    # Создаем тестовые данные
    users = pd.DataFrame({
        'user_id': range(1, 1001),
        'registration_date': pd.date_range('2023-01-01', periods=1000, freq='D')
    })
    
    orders = pd.DataFrame({
        'user_id': np.random.randint(1, 1001, 5000),
        'order_date': pd.date_range('2023-01-01', periods=5000, freq='H')
    })
    
    results = cohort_analysis(users, orders)
    print("Когортный анализ завершен")`
  },

  // =============== SENIOR (8 задач) ===============
  // Экспертная аналитика
  {
    id: 'ba_ml_pipeline',
    level: 'senior',
    title: 'ML Pipeline для предсказания (Python)',
    exportName: 'ml_pipeline',
    description: 'Создайте ML pipeline для предсказания оттока клиентов.',
    language: 'python',
    starter: `# TODO: Создайте ML pipeline для предсказания оттока клиентов
# Требования:
# - Feature engineering
# - Модель машинного обучения
# - Валидация и метрики
# - Pipeline для продакшена

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

def create_ml_pipeline():
    # TODO: Создайте ML pipeline
    # 1. Подготовьте данные
    # 2. Создайте features
    # 3. Обучите модель
    # 4. Валидируйте результаты
    pass

# Пример использования
if __name__ == "__main__":
    # Создаем тестовые данные
    data = {
        'user_id': range(1, 1001),
        'age': np.random.randint(18, 65, 1000),
        'total_orders': np.random.poisson(5, 1000),
        'avg_order_value': np.random.normal(100, 30, 1000),
        'days_since_last_order': np.random.randint(1, 365, 1000),
        'churned': np.random.binomial(1, 0.2, 1000)
    }
    df = pd.DataFrame(data)
    
    create_ml_pipeline()`,
    tests: `# Тесты для ML pipeline
# Проверяем корректность модели
import pandas as pd
import numpy as np

# Создаем тестовые данные
data = {
    'age': np.random.randint(18, 80, 100),
    'income': np.random.normal(50000, 15000, 100),
    'tenure': np.random.randint(0, 60, 100),
    'satisfaction': np.random.uniform(1, 5, 100),
    'churned': np.random.binomial(1, 0.2, 100)
}
df = pd.DataFrame(data)

# Тестируем функцию создания ML pipeline
pipeline = create_ml_pipeline()

# Проверяем, что функция возвращает pipeline
assert pipeline is not None, 'Функция должна возвращать pipeline'

# Проверяем, что это sklearn Pipeline
from sklearn.pipeline import Pipeline
assert isinstance(pipeline, Pipeline), 'Результат должен быть sklearn Pipeline'

# Проверяем, что pipeline имеет шаги
assert len(pipeline.steps) > 0, 'Pipeline должен иметь шаги'

# Проверяем, что есть шаги для предобработки и модели
step_names = [step[0] for step in pipeline.steps]
assert any('scaler' in name.lower() or 'preprocess' in name.lower() for name in step_names), 'Должен быть шаг предобработки'
assert any('model' in name.lower() or 'classifier' in name.lower() for name in step_names), 'Должен быть шаг модели'`,
    solution: `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import joblib

def create_ml_pipeline():
    # 1. Подготавливаем данные
    data = {
        'user_id': range(1, 1001),
        'age': np.random.randint(18, 65, 1000),
        'total_orders': np.random.poisson(5, 1000),
        'avg_order_value': np.random.normal(100, 30, 1000),
        'days_since_last_order': np.random.randint(1, 365, 1000),
        'churned': np.random.binomial(1, 0.2, 1000)
    }
    df = pd.DataFrame(data)
    
    # 2. Feature engineering
    df['order_frequency'] = df['total_orders'] / df['days_since_last_order']
    df['high_value_customer'] = (df['avg_order_value'] > df['avg_order_value'].quantile(0.8)).astype(int)
    df['recent_activity'] = (df['days_since_last_order'] < 30).astype(int)
    
    # 3. Подготавливаем features и target
    feature_cols = ['age', 'total_orders', 'avg_order_value', 'days_since_last_order', 
                   'order_frequency', 'high_value_customer', 'recent_activity']
    X = df[feature_cols]
    y = df['churned']
    
    # 4. Разделяем на train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # 5. Создаем pipeline
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])
    
    # 6. Обучаем модель
    pipeline.fit(X_train, y_train)
    
    # 7. Предсказания
    y_pred = pipeline.predict(X_test)
    y_pred_proba = pipeline.predict_proba(X_test)[:, 1]
    
    # 8. Метрики
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    
    print(f"\\nROC AUC Score: {roc_auc_score(y_test, y_pred_proba):.3f}")
    
    # 9. Cross-validation
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring='roc_auc')
    print(f"\\nCross-validation ROC AUC: {cv_scores.mean():.3f} (+/- {cv_scores.std() * 2:.3f})")
    
    # 10. Feature importance
    feature_importance = pipeline.named_steps['classifier'].feature_importances_
    feature_names = feature_cols
    
    importance_df = pd.DataFrame({
        'feature': feature_names,
        'importance': feature_importance
    }).sort_values('importance', ascending=False)
    
    print("\\nFeature Importance:")
    print(importance_df)
    
    # 11. Сохраняем модель
    joblib.dump(pipeline, 'churn_prediction_model.pkl')
    
    return pipeline

# Пример использования
if __name__ == "__main__":
    model = create_ml_pipeline()
    print("ML pipeline создан и сохранен")`
  }
]
