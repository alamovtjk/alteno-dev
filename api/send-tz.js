import {
  Document, Paragraph, TextRun, HeadingLevel,
  AlignmentType, Packer, BorderStyle, TableRow,
  TableCell, Table, WidthType, ShadingType,
  convertInchesToTwip,
} from 'docx'
import { Resend } from 'resend'

const STUDIO = {
  name:     'AlTeNo Dev',
  person:   'Самир Аламов',
  telegram: '@alamovtjk',
  email:    'alamovsamir4@gmail.com',
  site:     'alteno-dev-silk.vercel.app',
  city:     'Душанбе, Таджикистан',
}

const TG_TOKEN   = process.env.TG_TOKEN   || ''
const TG_CHAT_ID = process.env.TG_CHAT_ID || ''

/* ── Build Word document ── */
function buildDoc(tz, date) {
  const h = (text) => new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, color: '7c3aed' })],
    spacing: { before: 240, after: 80 },
  })

  const row = (label, value) => new Paragraph({
    children: [
      new TextRun({ text: `${label}:  `, bold: true, size: 22 }),
      new TextRun({ text: value || '—', size: 22 }),
    ],
    spacing: { after: 60 },
  })

  const divider = () => new Paragraph({
    border: { bottom: { color: 'e2e8f0', space: 1, style: BorderStyle.SINGLE, size: 6 } },
    spacing: { after: 160 },
  })

  return new Document({
    creator: 'AlTeNo Dev — ARIEL AI',
    title: `ТЗ — ${tz.client || 'Клиент'} — ${date}`,
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top:    convertInchesToTwip(1),
            right:  convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left:   convertInchesToTwip(1.2),
          },
        },
      },
      children: [
        /* Header */
        new Paragraph({
          children: [
            new TextRun({ text: 'AlTeNo', bold: true, size: 40, color: '7c3aed' }),
            new TextRun({ text: ' Dev', bold: true, size: 40, color: '0d9488' }),
          ],
        }),
        new Paragraph({
          children: [new TextRun({ text: 'AI Веб-студия · Душанбе, Таджикистан', size: 18, color: '64748b', italics: true })],
          spacing: { after: 60 },
        }),
        divider(),

        /* Title */
        new Paragraph({
          children: [new TextRun({ text: 'ТЕХНИЧЕСКОЕ ЗАДАНИЕ', bold: true, size: 36, color: '1e293b' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `Дата составления: ${date}`, size: 20, italics: true, color: '64748b' })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
        }),

        /* Client info */
        h('📋 Информация о клиенте'),
        row('Клиент',  tz.client),
        row('Контакт', tz.contact),
        row('Email',   tz.email !== 'не указан' ? tz.email : '—'),
        divider(),

        /* Project */
        h('🎯 Проект'),
        row('Тип проекта', tz.type),
        row('Сфера / Аудитория', tz.sphere),
        row('Главная цель', tz.goal),
        divider(),

        /* Functions */
        h('⚙️ Функции и возможности'),
        new Paragraph({
          children: [new TextRun({ text: tz.features || '—', size: 22 })],
          spacing: { after: 160 },
        }),
        divider(),

        /* Design */
        h('🎨 Дизайн и стиль'),
        new Paragraph({
          children: [new TextRun({ text: tz.design || '—', size: 22 })],
          spacing: { after: 80 },
        }),
        row('Интеграции', tz.integrations),
        row('Контент и материалы', tz.content),
        divider(),

        /* Timeline & Budget */
        h('📅 Сроки и бюджет'),
        row('Срок реализации', tz.deadline),
        row('Бюджет', tz.budget),
        divider(),

        /* Studio contacts */
        h('📞 Контакты студии'),
        row('Студия',   STUDIO.name),
        row('Менеджер', STUDIO.person),
        row('Telegram', STUDIO.telegram),
        row('Email',    STUDIO.email),
        row('Сайт',     STUDIO.site),
        new Paragraph({
          children: [new TextRun({ text: '\nЕсли у вас есть вопросы по ТЗ — напишите нам в Telegram или по email. Мы ответим в течение нескольких часов.', size: 20, italics: true, color: '64748b' })],
          spacing: { before: 120 },
        }),

        /* Footer */
        new Paragraph({ spacing: { before: 200 } }),
        new Paragraph({
          children: [new TextRun({ text: `© ${new Date().getFullYear()} AlTeNo Dev. Документ сгенерирован AI-ассистентом ARIEL.`, size: 18, color: '94a3b8' })],
          alignment: AlignmentType.CENTER,
        }),
      ],
    }],
  })
}

/* ── Send Telegram to studio ── */
async function sendTelegram(tz, date) {
  if (!TG_TOKEN || !TG_CHAT_ID) return
  const text =
    `🤖 *Новое ТЗ — ARIEL × AlTeNo Dev*\n` +
    `📅 ${date}\n\n` +
    `👤 *Клиент:* ${tz.client}\n` +
    `📞 *Контакт:* ${tz.contact}\n` +
    `📧 *Email:* ${tz.email}\n\n` +
    `💼 *Тип:* ${tz.type}\n` +
    `🏢 *Сфера:* ${tz.sphere}\n` +
    `🎯 *Цель:* ${tz.goal}\n\n` +
    `⚙️ *Функции:*\n${tz.features}\n\n` +
    `🎨 *Дизайн:* ${tz.design}\n` +
    `🔗 *Интеграции:* ${tz.integrations}\n` +
    `📁 *Контент:* ${tz.content}\n\n` +
    `📅 *Срок:* ${tz.deadline}\n` +
    `💰 *Бюджет:* ${tz.budget}`
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'Markdown' }),
  }).catch(() => {})
}

/* ── Send email with .docx to client ── */
async function sendEmail(tz, docxBuffer) {
  const resendKey = process.env.RESEND_KEY
  if (!resendKey || !tz.email || tz.email === 'не указан') return false
  try {
    const resend = new Resend(resendKey)
    await resend.emails.send({
      from: 'AlTeNo Dev <onboarding@resend.dev>',
      to: tz.email,
      subject: `ТЗ на разработку — ${tz.type || 'ваш проект'} — AlTeNo Dev`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
          <div style="background:linear-gradient(135deg,#7c3aed,#0d9488);padding:24px;border-radius:12px 12px 0 0">
            <h1 style="color:#fff;margin:0;font-size:24px">AlTeNo Dev</h1>
            <p style="color:rgba(255,255,255,.8);margin:4px 0 0">AI Веб-студия · Душанбе</p>
          </div>
          <div style="padding:24px;background:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
            <p>Здравствуйте, <strong>${tz.client}</strong>!</p>
            <p>Ваше техническое задание на разработку готово. Во вложении — файл <strong>.docx</strong> с полным описанием проекта.</p>
            <h3 style="color:#7c3aed">Краткое резюме:</h3>
            <table style="width:100%;border-collapse:collapse">
              ${[
                ['Тип проекта', tz.type],
                ['Сфера', tz.sphere],
                ['Цель', tz.goal],
                ['Бюджет', tz.budget],
                ['Срок', tz.deadline],
              ].map(([k,v]) => `<tr><td style="padding:6px 0;color:#64748b;width:140px">${k}</td><td style="padding:6px 0;font-weight:600">${v||'—'}</td></tr>`).join('')}
            </table>
            <div style="margin-top:24px;padding:16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px">
              <p style="margin:0 0 8px"><strong>📞 Наши контакты:</strong></p>
              <p style="margin:4px 0">Telegram: <a href="https://t.me/alamovtjk" style="color:#7c3aed">@alamovtjk</a></p>
              <p style="margin:4px 0">Email: <a href="mailto:alamovsamir4@gmail.com" style="color:#7c3aed">alamovsamir4@gmail.com</a></p>
              <p style="margin:4px 0">Сайт: <a href="https://alteno-dev-silk.vercel.app" style="color:#7c3aed">alteno-dev-silk.vercel.app</a></p>
            </div>
            <p style="margin-top:16px;color:#64748b;font-size:14px">Мы свяжемся с вами в течение 24 часов для обсуждения деталей. Если есть вопросы — пишите в Telegram!</p>
          </div>
        </div>
      `,
      attachments: [{
        filename: `ТЗ_AlTeNo_Dev_${(tz.client || 'client').replace(/\s/g,'_')}.docx`,
        content: docxBuffer.toString('base64'),
      }],
    })
    return true
  } catch (e) {
    console.error('Email error:', e)
    return false
  }
}

/* ── Handler ── */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const { tz } = req.body || {}
  if (!tz) return res.status(400).json({ error: 'Missing tz' })

  const date = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  try {
    // 1. Generate Word doc
    const doc = buildDoc(tz, date)
    const buffer = await Packer.toBuffer(doc)
    const docxBase64 = buffer.toString('base64')

    // 2. Telegram to studio (parallel)
    const [emailSent] = await Promise.all([
      sendEmail(tz, buffer),
      sendTelegram(tz, date),
    ])

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({ docxBase64, emailSent })
  } catch (err) {
    console.error('send-tz error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
