# ИЖТ — Telegram-бот

Обработчик команд `/start`, `/app`, `/about`, `/help`. Основной сайт ИЖТ на GitHub Pages **не меняется**. Обработчик видит только сообщения-команды и не получает результаты анкеты.

## Размещение

Для автоматических ответов Telegram нужен публичный HTTPS сервер. Здесь выбран **Cloudflare Workers**, отдельно от GitHub Pages.

1. Создайте аккаунт Cloudflare. В каталоге `bot` выполните `npm install`, затем `npx wrangler login`.
2. Настройте защищённые секреты: `npx wrangler secret put BOT_TOKEN` и `npx wrangler secret put WEBHOOK_SECRET`. Токен берётся в BotFather, значение `WEBHOOK_SECRET` генерируйте случайно (32–64 символа A–Z, a–z, 0–9, дефис или подчёркивание). **Не записывайте секреты в GitHub или в переписку.**
3. Запустите `npm test`, затем `npm run deploy`. Сохраните HTTPS URL Worker.
4. **Перед заменой webhook** проверьте, не используется ли он ChatPlace или другим сервером: Telegram поддерживает только один активный webhook для бота. Замена отключит прежнюю серверную автоматизацию, хотя синяя кнопка Mini App продолжит работать.
5. На собственном компьютере установите webhook (никаких секретов в браузерной адресной строке):

```bash
read -rsp 'Bot token: ' BOT_TOKEN; echo
read -rsp 'Webhook secret: ' WEBHOOK_SECRET; echo
export WORKER_URL='https://izht-telegram-bot.<account>.workers.dev'
curl -sS -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  --data-urlencode "url=${WORKER_URL}/telegram/webhook" \
  --data-urlencode "secret_token=${WEBHOOK_SECRET}" \
  --data-urlencode 'allowed_updates=["message"]'
unset BOT_TOKEN WEBHOOK_SECRET
```

6. Проверьте бота командами `/start`, `/app`, `/about`, `/help`.

GitHub Pages обслуживает приложение; Worker отправляет только ответы бота. `APP_URL` и `CHANNEL_URL` можно менять в `wrangler.toml`.

**Не публикуйте токен Telegram-бота и секрет webhook.**
