# Архитектурный план серверной части Blockera

## Выбор стека

- **База данных:** PostgreSQL в продакшене (Supabase/Neon), SQLite в dev-режиме для локальной разработки через Prisma.
- **ORM:** Prisma ORM (`prisma` + `@prisma/client`) для типобезопасного доступа и миграций.
- **API-слой:** Next.js App Router (ручки в `src/app/api/*`) с использованием Route Handlers.
- **Аутентификация:** NextAuth.js с провайдером Discord OAuth2 и кастомной ролью `admin`.

## Следующие шаги

1. Добавить `prisma/schema.prisma` с моделями `Product`, `Order`, `Payment`, `AuditLog`, `User`.
2. Сконфигурировать `.env` (`DATABASE_URL`) и `prisma/migrations`.
3. Реализовать middleware для проверки ролей (admin / customer).
4. Создать API-ручки:
   - `POST/GET /api/admin/products`
   - `POST/GET /api/admin/orders`
   - `POST /api/admin/audit`
5. Собрать защищённый раздел `/admin` (Server Components + client forms).
6. Настроить интеграционные тесты (Playwright или Cypress) для CRUD по товарам и оформлению покупки.

> Данный документ фиксирует выбранный стек; реализация требует дальнейших тасков.
