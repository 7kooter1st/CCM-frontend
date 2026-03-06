# Lab8 — Асинхронный сервис расчёта потребления (Django)

Второй сервис на **Python/Django** для отложенного расчёта поля **total_power** заявки. Основной сервис — Go (Charge-consumption-manager).

## Запуск

1. Создать виртуальное окружение и установить зависимости:
   ```bash
   python3 -m venv env
   source env/bin/activate   # Windows: env\Scripts\activate
   pip install -r requirements.txt
   ```

2. Настроить переменные окружения (или создать `.env` из `.env.example`):
   - `CALLBACK_URL` — URL основного сервиса (Go), например `http://127.0.0.1:8000`
   - `RESULT_TOKEN` — токен 8 байт, должен совпадать с `RESULT_TOKEN` в .env основного сервиса

3. Запуск на порту 8001 (чтобы не конфликтовать с Go на 8000):
   ```bash
   python3 manage.py runserver 0.0.0.0:8001
   ```

## API

- **POST /calculate/**  
  Тело: `{"consumption_id": <id>, "usecases": [{"consumption": <uint>, "duration": <uint>}, ...]}`  
  Сразу возвращает 200, расчёт выполняется в фоне (задержка 5–10 сек). По завершении сервис отправляет **PUT** на основной сервис:  
  `PUT {CALLBACK_URL}/api/consumptions/{id}/result/` с телом `{"token": "<RESULT_TOKEN>", "total_power": <число>}`.

## Порядок показа (по заданию)

1. **GET** списка заявок (Insomnia / интерфейс).
2. Вызвать метод асинхронного сервиса: в Insomnia **POST** на `http://127.0.0.1:8001/calculate/` с `consumption_id` и `usecases`; отдельно — кнопкой в интерфейсе (модератор нажимает «Завершить» по заявке со статусом «сформирован»).
3. Убедиться, что в **GET** списка заявок результат (total_power) появляется с задержкой 5–10 сек.
4. Вызвать метод основного сервиса с ключом: **PUT** `/api/consumptions/:id/result` с телом `{"token": "a1b2c3d4", "total_power": 123}` — для проверки псевдо-авторизации (без токена или с неверным токеном основной сервис вернёт 403).
