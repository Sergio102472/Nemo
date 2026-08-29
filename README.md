# Nemo

Приложение обмена криптовалют.

## Технический стек

- **Основной**: mam + **$mol**
- Модульная архитектура

## Модуль 1 (текущий)

Файлы `$mol`:

- `nemo/module1/module1.view.tree` — декларативное описание
- `nemo/module1/module1.view.ts` — логика
- `nemo/module1/module1.view.css` — стили

Содержит:

- Информационное окошко (лог последовательности действий) сверху
- Два селекта выбора криптовалют
- Текущий курс выбранной пары
- Кнопку «Обменять» внизу
- При обмене фиксируется **квант времени** (токен)

## Браузерный прототип (можно тестировать прямо сейчас)

Открой в браузере:

**https://htmlpreview.github.io/?https://github.com/Sergio102472/Nemo/blob/main/prototype.html**

или скачай `prototype.html` и открой локально.

## Полноценный запуск на $mol

1. Клонируй MAM:
   ```bash
   git clone https://github.com/hyoo-ru/mam.git
   cd mam
   npm install
   ```
2. Скопируй папку `nemo/` из этого репозитория в корень mam
3. `npm start`
4. Открой http://localhost:9080/nemo/module1/

## Репозиторий

https://github.com/Sergio102472/Nemo
