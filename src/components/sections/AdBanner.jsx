import { useState, useEffect } from 'react'
import { fetchTable } from '../../lib/supabase'
import { safeUrl } from '../../lib/safeUrl'

/* Управляется из /admin → Настройки → Реклама. Ничего не рендерит, пока
   баннер выключен или картинка не задана — секция просто не занимает места. */
export default function AdBanner() {
  const [ad, setAd] = useState(null)

  useEffect(() => {
    fetchTable('settings', { order: 'key' }).then(rows => {
      const map = {}
      for (const { key, value } of rows) map[key] = value
      if (map.ad_enabled === 'true' && map.ad_image_url) {
        setAd({ image: map.ad_image_url, mobileImage: map.ad_image_mobile_url || null, link: safeUrl(map.ad_link) })
      }
    })
  }, [])

  if (!ad) return null

  const Tag = ad.link ? 'a' : 'div'
  const linkProps = ad.link ? { href: ad.link, target: '_blank', rel: 'noopener noreferrer sponsored' } : {}

  return (
    <section className="ad-banner-section" style={{ position: 'relative', zIndex: 2 }}>
      <div className="shell">
        <Tag className="ad-banner" {...linkProps}>
          <picture>
            {ad.mobileImage && <source media="(max-width: 600px)" srcSet={ad.mobileImage} />}
            <img src={ad.image} alt="Реклама" loading="lazy" />
          </picture>
          <span className="ad-banner-label">Реклама</span>
        </Tag>
      </div>
    </section>
  )
}
