import React from 'react'

import { CONSENSO } from '@/providers/Consenso/costanti'

/**
 * Google Consent Mode v2 (modalità base): nell'<head>, prima di qualsiasi tag Google, tutto
 * parte "negato"; se il visitatore ha già scelto, lo stato si aggiorna subito. I tag veri
 * (gtag.js) si caricano solo dopo il consenso, in GoogleTag.
 * Script normale e non next/script, come InitTheme (next/script qui dava un avviso).
 */
export const ConsentModeScript: React.FC = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
  (function () {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('consent', 'default', {
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
      analytics_storage: 'denied', wait_for_update: 500
    });
    try {
      var s = JSON.parse(localStorage.getItem('${CONSENSO.CHIAVE}') || 'null');
      if (s && s.versione === ${CONSENSO.VERSIONE} && Date.now() - Date.parse(s.data) <= ${CONSENSO.DURATA_MS}) {
        var m = s.marketing ? 'granted' : 'denied';
        gtag('consent', 'update', {
          analytics_storage: s.statistiche ? 'granted' : 'denied',
          ad_storage: m, ad_user_data: m, ad_personalization: m
        });
      }
    } catch (e) {}
  })();
  `,
    }}
  />
)
