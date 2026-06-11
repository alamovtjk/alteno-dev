# AlTeNo Dev — Design Assets

## Файлы

### `design-guide.html`
Полный визуальный гайд — открыть в браузере (двойной клик).
Содержит: цвета, типографику, glassmorphism, кнопки, форму, карточки, статистику, отзывы, таймлайн, навигацию, футер, отступы, анимации.

### `tokens.json`
Токены для импорта в Figma через плагин **Tokens Studio for Figma** (бесплатный).

## Как импортировать в Figma

1. Установить плагин: **Tokens Studio for Figma** (Figma → Community)
2. Открыть плагин → вкладка **JSON**
3. Нажать **Import** → выбрать `tokens.json`
4. Применить токены к фреймам

## Технологии сайта
- React + Vite
- Tailwind CSS v4
- Framer Motion
- Шрифты: Unbounded + Manrope (Google Fonts, Cyrillic)

## Логотип
Буква «A» — временный плейсхолдер в шапке.
Заменить: в `Header.jsx` найти блок с классом `nav-logo-icon` и вставить `<img>` или `<svg>`.
