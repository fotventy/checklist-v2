# Checklist App v2

Современная система для проверки тенантов с веб-интерфейсом.

## Возможности

- Аутентификация пользователей через логин/пароль
- Проверка различных тенантов (Тоталвидео, Аксиома, ПАКТ и др.)
- История проверок
- Отправка уведомлений об ошибках
- Современный адаптивный интерфейс
- Управление пользователями через административный интерфейс

## Технологии

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Prisma (PostgreSQL)
- NextAuth.js
- React Hook Form
- Zod
- Docker & Docker Compose
- Nginx

## Установка

### Локальная разработка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/checklist-v2.git
cd checklist-v2
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` в корне проекта и добавьте необходимые переменные окружения:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/checklist"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. Настройте базу данных:
```bash
npm run prisma:push
```

5. Запустите приложение:
```bash
npm run dev
```

### Docker установка

1. Убедитесь, что Docker и Docker Compose установлены в системе

2. Создайте файл `.env` как описано выше, но измените DATABASE_URL:
```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/checklist"
```

3. Запустите приложение в Docker:
```bash
# Сборка образов
npm run docker:build

# Запуск контейнеров
npm run docker:up

# Остановка контейнеров
npm run docker:down
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000).

## Управление пользователями

### Создание пользователей

1. Создание обычного пользователя:
```bash
npm run create-user
```

2. Создание администратора:
```bash
npm run create-admin
```

### Административный интерфейс

Администраторы имеют доступ к панели управления пользователями по адресу `/admin/users`, где можно:
- Просматривать список пользователей
- Изменять роли пользователей
- Сбрасывать пароли
- Удалять пользователей

## Разработка

- Для создания новой миграции базы данных:
```bash
npx prisma migrate dev
```

- Для обновления типов Prisma Client:
```bash
npm run prisma:generate
```

- Для просмотра базы данных через Prisma Studio:
```bash
npm run prisma:studio
```

## Устранение неполадок

### Проблемы с Docker

1. Если контейнеры не запускаются:
   - Проверьте, что порты 3000 и 5432 не заняты
   - Проверьте логи: `docker-compose logs`

2. Проблемы с базой данных:
   - Убедитесь, что контейнер БД запущен: `docker-compose ps`
   - Проверьте подключение: `docker-compose exec db psql -U postgres`

### Проблемы с Next.js

1. Если приложение не собирается:
   - Удалите `.next` директорию
   - Запустите `npm run build` заново

2. Проблемы с авторизацией:
   - Проверьте настройки SMTP в `.env`
   - Убедитесь, что NEXTAUTH_URL соответствует домену

## Лицензия

MIT
