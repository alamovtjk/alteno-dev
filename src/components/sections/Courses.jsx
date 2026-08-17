/* Заглушка секции «Обучение» — рабочая кнопка на бота, текст и оформление
   ещё предстоит проработать отдельно (не хардкодим тройной перевод под
   контент, который заведомо будет меняться). */
export default function Courses() {
  return (
    <section id="courses" className="section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <div className="sec-head">
          <div className="eyebrow reveal"><span className="line" />Обучение</div>
          <h2 className="sec-title ub reveal">
            Учим программировать <span className="grad">и трудоустраиваем</span>
          </h2>
          <p className="sec-sub reveal">
            Видео-уроки для начинающих разработчиков из Таджикистана. Подписка,
            оплата и доступ — прямо в Telegram-боте.
          </p>
        </div>
        <div className="reveal" style={{ textAlign: 'center' }}>
          <a className="btn btn-primary" href="https://t.me/altenodev_bot?start=subscribe" target="_blank" rel="noreferrer">
            Оформить подписку в Telegram
          </a>
        </div>
      </div>
    </section>
  )
}
