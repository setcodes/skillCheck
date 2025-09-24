import { UITask } from '../tasks'

/* =============== DEVOPS TASKS =============== */
export const DEVOPS: UITask[] = [
  // JUNIOR (8 задач) - Основы DevOps
  {
    id: 'dv_dockerfile',
    level: 'junior',
    title: 'Dockerfile для Node.js приложения',
    exportName: 'Dockerfile',
    description: 'Создайте оптимизированный Dockerfile для Node.js приложения.',
    language: 'dockerfile',
    starter: `# TODO: Создайте Dockerfile для Node.js приложения
# Требования:
# - Используйте официальный Node.js образ
# - Установите зависимости
# - Скопируйте код приложения
# - Откройте порт 3000
# - Запустите приложение

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`,
    tests: `# Тесты для Dockerfile
# Проверяем, что образ собирается и запускается
# Проверяем основные инструкции Dockerfile
assert 'FROM' in userCode, 'Dockerfile должен содержать инструкцию FROM'
assert 'WORKDIR' in userCode, 'Dockerfile должен содержать инструкцию WORKDIR'
assert 'COPY' in userCode, 'Dockerfile должен содержать инструкцию COPY'
assert 'RUN' in userCode, 'Dockerfile должен содержать инструкцию RUN'
assert 'EXPOSE' in userCode, 'Dockerfile должен содержать инструкцию EXPOSE'
assert 'CMD' in userCode, 'Dockerfile должен содержать инструкцию CMD'

# Проверяем, что используется Node.js образ
assert 'node:' in userCode, 'Должен использоваться Node.js образ'

# Проверяем, что открыт порт 3000
assert '3000' in userCode, 'Должен быть открыт порт 3000'

# Проверяем, что есть установка зависимостей
assert 'npm install' in userCode or 'npm ci' in userCode, 'Должна быть установка зависимостей npm'`,
    solution: `FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]`
  },

  {
    id: 'dv_docker_compose',
    level: 'junior',
    title: 'Docker Compose для веб-приложения',
    exportName: 'docker_compose',
    description: 'Создайте docker-compose.yml для веб-приложения с базой данных.',
    language: 'yaml',
    starter: `# TODO: Создайте docker-compose.yml
# Требования:
# - Веб-приложение (Node.js)
# - База данных (PostgreSQL)
# - Redis для кэширования
# - Настроить сети и переменные окружения

version: '3.8'
services:
  # TODO: Добавьте сервисы`,
    tests: `# Тесты для Docker Compose
# Проверяем корректность конфигурации
# Проверяем основные секции docker-compose.yml
assert 'version:' in userCode, 'Docker Compose должен содержать версию'
assert 'services:' in userCode, 'Docker Compose должен содержать секцию services'

# Проверяем, что есть веб-приложение
assert 'web:' in userCode or 'app:' in userCode, 'Должен быть сервис веб-приложения'

# Проверяем, что есть база данных
assert 'db:' in userCode or 'database:' in userCode or 'postgres:' in userCode, 'Должен быть сервис базы данных'

# Проверяем, что есть Redis
assert 'redis:' in userCode, 'Должен быть сервис Redis'

# Проверяем, что есть порты
assert 'ports:' in userCode, 'Должны быть настроены порты'

# Проверяем, что есть переменные окружения
assert 'environment:' in userCode, 'Должны быть переменные окружения'`,
    solution: `version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge`
  },

  {
    id: 'dv_kubernetes_deployment',
    level: 'junior',
    title: 'Kubernetes Deployment',
    exportName: 'k8s_deployment',
    description: 'Создайте Kubernetes Deployment для веб-приложения.',
    language: 'yaml',
    starter: `# TODO: Создайте Kubernetes Deployment
# Требования:
# - 3 реплики приложения
# - Ресурсы: CPU 100m, Memory 128Mi
# - Health checks (liveness и readiness)
# - Переменные окружения

apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web-app
spec:
  # TODO: Добавьте спецификацию`,
    tests: `# Тесты для Kubernetes Deployment
# Проверяем корректность конфигурации
# Проверяем основные поля Kubernetes Deployment
assert 'apiVersion: apps/v1' in userCode, 'Должен быть правильный apiVersion'
assert 'kind: Deployment' in userCode, 'Должен быть kind Deployment'
assert 'metadata:' in userCode, 'Должна быть секция metadata'
assert 'spec:' in userCode, 'Должна быть секция spec'

# Проверяем, что есть реплики
assert 'replicas:' in userCode, 'Должны быть настроены реплики'

# Проверяем, что есть селектор
assert 'selector:' in userCode, 'Должен быть селектор'

# Проверяем, что есть шаблон подов
assert 'template:' in userCode, 'Должен быть шаблон подов'

# Проверяем, что есть контейнеры
assert 'containers:' in userCode, 'Должны быть контейнеры'

# Проверяем, что есть ресурсы
assert 'resources:' in userCode, 'Должны быть настроены ресурсы'`,
    solution: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: myapp:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5`
  },

  {
    id: 'dv_kubernetes_service',
    level: 'junior',
    title: 'Kubernetes Service',
    exportName: 'k8s_service',
    description: 'Создайте Kubernetes Service для доступа к приложению.',
    language: 'yaml',
    starter: `# TODO: Создайте Kubernetes Service
# Требования:
# - ClusterIP для внутреннего доступа
# - LoadBalancer для внешнего доступа
# - Селектор для подключения к Deployment

apiVersion: v1
kind: Service
metadata:
  name: web-app-service
spec:
  # TODO: Добавьте спецификацию`,
    tests: `# Тесты для Kubernetes Service
# Проверяем корректность конфигурации
# Проверяем основные поля Kubernetes Service
assert 'apiVersion: v1' in userCode, 'Должен быть правильный apiVersion'
assert 'kind: Service' in userCode, 'Должен быть kind Service'
assert 'metadata:' in userCode, 'Должна быть секция metadata'
assert 'spec:' in userCode, 'Должна быть секция spec'

# Проверяем, что есть тип сервиса
assert 'type:' in userCode, 'Должен быть тип сервиса'

# Проверяем, что есть порты
assert 'ports:' in userCode, 'Должны быть настроены порты'

# Проверяем, что есть селектор
assert 'selector:' in userCode, 'Должен быть селектор'

# Проверяем, что есть targetPort
assert 'targetPort:' in userCode, 'Должен быть targetPort'`,
    solution: `apiVersion: v1
kind: Service
metadata:
  name: web-app-service
  labels:
    app: web-app
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: web-app

---
apiVersion: v1
kind: Service
metadata:
  name: web-app-internal
  labels:
    app: web-app
spec:
  type: ClusterIP
  ports:
  - port: 3000
    targetPort: 3000
    protocol: TCP
    name: http
  selector:
    app: web-app`
  },

  {
    id: 'dv_github_actions',
    level: 'junior',
    title: 'GitHub Actions CI/CD',
    exportName: 'github_actions',
    description: 'Создайте GitHub Actions workflow для CI/CD.',
    language: 'yaml',
    starter: `# TODO: Создайте GitHub Actions workflow
# Требования:
# - Запуск на push в main и PR
# - Установка Node.js
# - Запуск тестов
# - Сборка Docker образа
# - Деплой в staging

name: CI/CD Pipeline

on:
  # TODO: Добавьте триггеры`,
    tests: `# Тесты для GitHub Actions
# Проверяем корректность workflow
# Проверяем основные поля GitHub Actions workflow
assert 'name:' in userCode, 'Workflow должен иметь имя'
assert 'on:' in userCode, 'Workflow должен иметь триггеры'

# Проверяем, что есть триггеры
assert 'push:' in userCode or 'pull_request:' in userCode, 'Должны быть триггеры push или pull_request'

# Проверяем, что есть jobs
assert 'jobs:' in userCode, 'Должны быть jobs'

# Проверяем, что есть steps
assert 'steps:' in userCode, 'Должны быть steps'

# Проверяем, что есть установка Node.js
assert 'actions/setup-node' in userCode or 'setup-node' in userCode, 'Должна быть установка Node.js'

# Проверяем, что есть запуск тестов
assert 'npm test' in userCode or 'npm run test' in userCode, 'Должны быть запущены тесты'`,
    solution: `name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: \${{ env.REGISTRY }}
        username: \${{ github.actor }}
        password: \${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: \${{ steps.meta.outputs.tags }}
        labels: \${{ steps.meta.outputs.labels }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment"
        # Здесь будет команда деплоя`
  },

  {
    id: 'dv_helm_chart',
    level: 'junior',
    title: 'Helm Chart для приложения',
    exportName: 'helm_chart',
    description: 'Создайте базовый Helm Chart для приложения.',
    language: 'yaml',
    starter: `# TODO: Создайте Helm Chart
# Структура:
# Chart.yaml - метаданные чарта
# values.yaml - значения по умолчанию
# templates/deployment.yaml - шаблон Deployment
# templates/service.yaml - шаблон Service

# Chart.yaml
apiVersion: v2
name: myapp
description: A Helm chart for my application
version: 0.1.0
appVersion: "1.0.0"

# TODO: Добавьте остальные файлы`,
    tests: `# Тесты для Helm Chart
# Проверяем корректность шаблонов
# Проверяем основные поля Helm Chart
assert 'apiVersion: v2' in userCode, 'Должен быть правильный apiVersion'
assert 'name:' in userCode, 'Chart должен иметь имя'
assert 'version:' in userCode, 'Chart должен иметь версию'
assert 'appVersion:' in userCode, 'Chart должен иметь appVersion'

# Проверяем, что есть шаблоны
assert 'templates/' in userCode or 'deployment.yaml' in userCode, 'Должны быть шаблоны'

# Проверяем, что есть values
assert 'values:' in userCode or 'values.yaml' in userCode, 'Должны быть values'

# Проверяем, что есть Helm функции
assert '{{' in userCode and '}}' in userCode, 'Должны быть Helm шаблоны'`,
    solution: `# Chart.yaml
apiVersion: v2
name: myapp
description: A Helm chart for my application
version: 0.1.0
appVersion: "1.0.0"

# values.yaml
replicaCount: 3

image:
  repository: myapp
  tag: "latest"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
  targetPort: 3000

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi

# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "myapp.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.targetPort }}
              protocol: TCP
          resources:
            {{- toYaml .Values.resources | nindent 12 }}

# templates/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}
      protocol: TCP
      name: http
  selector:
    {{- include "myapp.selectorLabels" . | nindent 4 }}`
  },

  {
    id: 'dv_monitoring_prometheus',
    level: 'junior',
    title: 'Prometheus мониторинг',
    exportName: 'prometheus_monitoring',
    description: 'Настройте Prometheus для мониторинга приложения.',
    language: 'yaml',
    starter: `# TODO: Настройте Prometheus мониторинг
# Требования:
# - Prometheus сервер
# - Grafana для визуализации
# - Node Exporter для метрик системы
# - Настройка scrape_configs

# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  # TODO: Добавьте конфигурацию`,
    tests: `# Тесты для Prometheus конфигурации
# Проверяем корректность настроек
# Проверяем основные поля Prometheus конфигурации
assert 'global:' in userCode, 'Должна быть секция global'
assert 'scrape_configs:' in userCode, 'Должны быть scrape_configs'

# Проверяем, что есть scrape_interval
assert 'scrape_interval:' in userCode, 'Должен быть scrape_interval'

# Проверяем, что есть job для приложения
assert 'job_name:' in userCode, 'Должен быть job_name'

# Проверяем, что есть targets
assert 'targets:' in userCode or 'static_configs:' in userCode, 'Должны быть targets'

# Проверяем, что есть порт 9090 (стандартный порт Prometheus)
assert '9090' in userCode, 'Должен быть порт 9090'`,
    solution: `# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'web-app'
    static_configs:
      - targets: ['web-app:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\\d+)?;(\\d+)
        replacement: $1:$2
        target_label: __address__
      - action: labelmap
        regex: __meta_kubernetes_pod_label_(.+)
      - source_labels: [__meta_kubernetes_namespace]
        action: replace
        target_label: kubernetes_namespace
      - source_labels: [__meta_kubernetes_pod_name]
        action: replace
        target_label: kubernetes_pod_name

# alert_rules.yml
groups:
  - name: web-app
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is {{ $value | humanizePercentage }}"`
  },

  {
    id: 'dv_logging_elk',
    level: 'junior',
    title: 'ELK Stack для логирования',
    exportName: 'elk_logging',
    description: 'Настройте ELK Stack (Elasticsearch, Logstash, Kibana) для централизованного логирования.',
    language: 'yaml',
    starter: `# TODO: Настройте ELK Stack
# Требования:
# - Elasticsearch для хранения логов
# - Logstash для обработки логов
# - Kibana для визуализации
# - Filebeat для сбора логов

# docker-compose.yml для ELK
version: '3.8'
services:
  # TODO: Добавьте сервисы`,
    tests: `# Тесты для ELK Stack
# Проверяем корректность конфигурации
# Проверяем основные компоненты ELK Stack
assert 'elasticsearch:' in userCode, 'Должен быть сервис Elasticsearch'
assert 'logstash:' in userCode, 'Должен быть сервис Logstash'
assert 'kibana:' in userCode, 'Должен быть сервис Kibana'

# Проверяем, что есть порты
assert '9200' in userCode, 'Должен быть порт 9200 для Elasticsearch'
assert '5601' in userCode, 'Должен быть порт 5601 для Kibana'

# Проверяем, что есть переменные окружения
assert 'environment:' in userCode, 'Должны быть переменные окружения'

# Проверяем, что есть volumes
assert 'volumes:' in userCode, 'Должны быть volumes'`,
    solution: `# docker-compose.yml для ELK
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    ports:
      - "5044:5044"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.11.0
    user: root
    volumes:
      - ./filebeat.yml:/usr/share/filebeat/filebeat.yml
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - logstash

volumes:
  elasticsearch_data:

# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "web-app" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
}

# filebeat.yml
filebeat.inputs:
- type: container
  paths:
    - '/var/lib/docker/containers/*/*.log'
  processors:
    - add_docker_metadata:
        host: "unix:///var/run/docker.sock"

output.logstash:
  hosts: ["logstash:5044"]`
  },

  // MIDDLE (8 задач) - Продвинутые DevOps практики
  {
    id: 'dv_kubernetes_advanced',
    level: 'middle',
    title: 'Kubernetes ConfigMap и Secret',
    exportName: 'k8s_configmap_secret',
    description: 'Создайте ConfigMap и Secret для конфигурации приложения.',
    language: 'yaml',
    starter: `# TODO: Создайте ConfigMap и Secret
# Требования:
# - ConfigMap для переменных окружения
# - Secret для чувствительных данных
# - Обновите Deployment для использования ConfigMap и Secret

# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  # TODO: Добавьте конфигурационные данные
  # APP_NAME: "my-application"
  # LOG_LEVEL: "info"
  # DATABASE_HOST: "postgres-service"

---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  # TODO: Добавьте закодированные в base64 секреты
  # DATABASE_PASSWORD: <base64-encoded-password>
  # API_KEY: <base64-encoded-api-key>

---
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: myapp:latest
        ports:
        - containerPort: 3000
        env:
        # TODO: Добавьте переменные из ConfigMap и Secret
        - name: APP_NAME
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: APP_NAME
        # TODO: Добавьте остальные переменные`,
    tests: `# Тесты для ConfigMap и Secret
# Проверяем корректность конфигурации
# Проверяем основные поля ConfigMap
assert 'kind: ConfigMap' in userCode, 'Должен быть ConfigMap'
assert 'metadata:' in userCode, 'Должна быть секция metadata'
assert 'data:' in userCode, 'Должна быть секция data'

# Проверяем основные поля Secret
assert 'kind: Secret' in userCode, 'Должен быть Secret'
assert 'type: Opaque' in userCode, 'Secret должен быть типа Opaque'

# Проверяем, что есть переменные окружения
assert 'APP_NAME' in userCode or 'LOG_LEVEL' in userCode, 'Должны быть переменные окружения'

# Проверяем, что есть использование в Deployment
assert 'configMapKeyRef:' in userCode, 'Должно быть использование ConfigMap в Deployment'
assert 'secretKeyRef:' in userCode, 'Должно быть использование Secret в Deployment'`,
    solution: `# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_NAME: "my-application"
  LOG_LEVEL: "info"
  DATABASE_HOST: "postgres-service"
  REDIS_HOST: "redis-service"
  MAX_CONNECTIONS: "100"

---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  DATABASE_PASSWORD: cG9zdGdyZXMxMjM=  # postgres123
  API_KEY: YWJjZGVmZ2hpams=  # abcdefghijk
  JWT_SECRET: eW91ci1qd3Qtc2VjcmV0  # your-jwt-secret

---
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: web-app
        image: myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: APP_NAME
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: APP_NAME
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: LOG_LEVEL
        - name: DATABASE_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: DATABASE_HOST
        - name: DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: DATABASE_PASSWORD
        - name: API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: API_KEY
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"`
  },

  {
    id: 'dv_terraform_infrastructure',
    level: 'middle',
    title: 'Terraform инфраструктура',
    exportName: 'terraform_infrastructure',
    description: 'Создайте Terraform конфигурацию для AWS инфраструктуры.',
    language: 'yaml',
    starter: `# TODO: Создайте Terraform конфигурацию
# Требования:
# - VPC с публичными и приватными подсетями
# - Security Groups для веб-приложения и базы данных
# - RDS PostgreSQL база данных
# - Application Load Balancer
# - Auto Scaling Group

# main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

# TODO: Добавьте ресурсы AWS`,
    tests: `# Тесты для Terraform конфигурации
# Проверяем корректность инфраструктуры
# Проверяем основные поля Terraform конфигурации
assert 'terraform {' in userCode, 'Должен быть блок terraform'
assert 'provider "aws"' in userCode, 'Должен быть AWS provider'

# Проверяем, что есть VPC
assert 'aws_vpc' in userCode, 'Должна быть VPC'

# Проверяем, что есть Security Groups
assert 'aws_security_group' in userCode, 'Должны быть Security Groups'

# Проверяем, что есть RDS
assert 'aws_db_instance' in userCode, 'Должна быть RDS база данных'

# Проверяем, что есть Load Balancer
assert 'aws_lb' in userCode, 'Должен быть Load Balancer'

# Проверяем, что есть Auto Scaling
assert 'aws_autoscaling_group' in userCode, 'Должна быть Auto Scaling Group'`,
    solution: `# main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-west-2"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "main-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main-igw"
  }
}

# Public Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-west-2a"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet"
  }
}

# Private Subnet
resource "aws_subnet" "private" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-west-2b"

  tags = {
    Name = "private-subnet"
  }
}

# Security Group for Web App
resource "aws_security_group" "web" {
  name_prefix = "web-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "web-security-group"
  }
}

# Security Group for Database
resource "aws_security_group" "database" {
  name_prefix = "database-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }

  tags = {
    Name = "database-security-group"
  }
}

# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "main-db-subnet-group"
  subnet_ids = [aws_subnet.private.id]

  tags = {
    Name = "main-db-subnet-group"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "main" {
  identifier = "main-postgres"
  engine     = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  storage_type = "gp2"
  storage_encrypted = true

  db_name  = "myapp"
  username = "postgres"
  password = "changeme123"

  vpc_security_group_ids = [aws_security_group.database.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true

  tags = {
    Name = "main-postgres"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "main-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.web.id]
  subnets            = [aws_subnet.public.id]

  tags = {
    Name = "main-alb"
  }
}

# ALB Target Group
resource "aws_lb_target_group" "main" {
  name     = "main-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name = "main-tg"
  }
}

# ALB Listener
resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.main.arn
  }
}`
  },

  // SENIOR (8 задач) - Продвинутые DevOps и архитектура
  {
    id: 'dv_microservices_architecture',
    level: 'senior',
    title: 'Микросервисная архитектура',
    exportName: 'microservices_architecture',
    description: 'Создайте полную микросервисную архитектуру с мониторингом.',
    language: 'yaml',
    starter: `# TODO: Создайте микросервисную архитектуру
# Требования:
# - API Gateway (Kong/Nginx)
# - Микросервисы (User, Order, Payment)
# - Service Mesh (Istio)
# - Мониторинг (Prometheus, Grafana, Jaeger)
# - Логирование (ELK Stack)
# - Message Queue (Kafka)

# docker-compose.yml
version: '3.8'
services:
  # TODO: Добавьте все сервисы`,
    tests: `# Тесты для микросервисной архитектуры
# Проверяем корректность конфигурации
# Проверяем основные компоненты микросервисной архитектуры
assert 'version: \'3.8\'' in userCode, 'Должен быть правильный формат docker-compose'

# Проверяем, что есть API Gateway
assert 'kong:' in userCode or 'nginx:' in userCode or 'api-gateway:' in userCode, 'Должен быть API Gateway'

# Проверяем, что есть микросервисы
assert 'user-service:' in userCode or 'order-service:' in userCode or 'payment-service:' in userCode, 'Должны быть микросервисы'

# Проверяем, что есть мониторинг
assert 'prometheus:' in userCode, 'Должен быть Prometheus'
assert 'grafana:' in userCode, 'Должна быть Grafana'

# Проверяем, что есть логирование
assert 'elasticsearch:' in userCode or 'kibana:' in userCode, 'Должен быть ELK Stack'

# Проверяем, что есть Message Queue
assert 'kafka:' in userCode or 'rabbitmq:' in userCode, 'Должна быть Message Queue'

# Service Mesh не является обязательным для базовой микросервисной архитектуры
# (Istio/Linkerd сложно настроить в docker-compose)`,
    solution: `# docker-compose.yml
version: '3.8'

services:
  # API Gateway
  kong:
    image: kong:3.4
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /kong/declarative/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
    ports:
      - "8000:8000"
      - "8001:8001"
    volumes:
      - ./kong.yml:/kong/declarative/kong.yml

  # User Service
  user-service:
    build: ./user-service
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/users
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  # Order Service
  order-service:
    build: ./order-service
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/orders
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKER=kafka:9092
    depends_on:
      - postgres
      - redis
      - kafka

  # Payment Service
  payment-service:
    build: ./payment-service
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/payments
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKER=kafka:9092
    depends_on:
      - postgres
      - redis
      - kafka

  # Databases
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: microservices
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Message Queue
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
    environment:
      - COLLECTOR_OTLP_ENABLED=true

  # Logging
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    ports:
      - "5044:5044"
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  postgres_data:
  grafana_data:

# kong.yml
_format_version: "3.0"
services:
  - name: user-service
    url: http://user-service:3000
    routes:
      - name: user-route
        paths:
          - /api/users
  - name: order-service
    url: http://order-service:3000
    routes:
      - name: order-route
        paths:
          - /api/orders
  - name: payment-service
    url: http://payment-service:3000
    routes:
      - name: payment-route
        paths:
          - /api/payments

# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  - job_name: 'user-service'
    static_configs:
      - targets: ['user-service:3000']
  - job_name: 'order-service'
    static_configs:
      - targets: ['order-service:3000']
  - job_name: 'payment-service'
    static_configs:
      - targets: ['payment-service:3000']`
  }
]
