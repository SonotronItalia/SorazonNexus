import * as migration_20261018_220039_iniziale from './20261018_220039_iniziale';
import * as migration_20261018_222650_regione_select from './20261018_222650_regione_select';
import * as migration_20261018_232004_galleria_risultati from './20261018_232004_galleria_risultati';
import * as migration_20261019_101838_galleria_sottotitolo_mappa from './20261019_101838_galleria_sottotitolo_mappa';
import * as migration_20261019_104831_colori_sito from './20261019_104831_colori_sito';
import * as migration_20261019_110639_contenitore_larghezze from './20261019_110639_contenitore_larghezze';
import * as migration_20261019_123340_hero_banner from './20261019_123340_hero_banner';
import * as migration_20261019_133414_hero_video_overlay from './20261019_133414_hero_video_overlay';
import * as migration_20261019_151942_effetti from './20261019_151942_effetti';
import * as migration_20261019_154352_tipi_effetto from './20261019_154352_tipi_effetto';
import * as migration_20261019_175101_footer_dati_legali from './20261019_175101_footer_dati_legali';
import * as migration_20261019_180548_footer_social from './20261019_180548_footer_social';
import * as migration_20261019_185812_voci_visibili from './20261019_185812_voci_visibili';
import * as migration_20261019_221311_effetti_posizione_bordo from './20261019_221311_effetti_posizione_bordo';
import * as migration_20261019_223200_torna_su from './20261019_223200_torna_su';
import * as migration_20261019_225236_footer_contatti from './20261019_225236_footer_contatti';
import * as migration_20261020_135644_sicurezza_utenti from './20261020_135644_sicurezza_utenti';
import * as migration_20261020_154951_impostazioni_ruoli from './20261020_154951_impostazioni_ruoli';
import * as migration_20261020_155104_social_in_impostazioni from './20261020_155104_social_in_impostazioni';
import * as migration_20261020_190439_blocchi_prodotto from './20261020_190439_blocchi_prodotto';
import * as migration_20261020_210554_schede_occhiello from './20261020_210554_schede_occhiello';
import * as migration_20261020_222742_ruoli_personalizzati from './20261020_222742_ruoli_personalizzati';
import * as migration_20261020_222806_togli_ruolo_fisso from './20261020_222806_togli_ruolo_fisso';
import * as migration_20261020_230101_sfondo_modulo_mappa from './20261020_230101_sfondo_modulo_mappa';
import * as migration_20261020_235842_seo_e_motori_ai from './20261020_235842_seo_e_motori_ai';
import * as migration_20261021_013459_traduzioni from './20261021_013459_traduzioni';

export const migrations = [
  {
    up: migration_20261018_220039_iniziale.up,
    down: migration_20261018_220039_iniziale.down,
    name: '20261018_220039_iniziale',
  },
  {
    up: migration_20261018_222650_regione_select.up,
    down: migration_20261018_222650_regione_select.down,
    name: '20261018_222650_regione_select',
  },
  {
    up: migration_20261018_232004_galleria_risultati.up,
    down: migration_20261018_232004_galleria_risultati.down,
    name: '20261018_232004_galleria_risultati',
  },
  {
    up: migration_20261019_101838_galleria_sottotitolo_mappa.up,
    down: migration_20261019_101838_galleria_sottotitolo_mappa.down,
    name: '20261019_101838_galleria_sottotitolo_mappa',
  },
  {
    up: migration_20261019_104831_colori_sito.up,
    down: migration_20261019_104831_colori_sito.down,
    name: '20261019_104831_colori_sito',
  },
  {
    up: migration_20261019_110639_contenitore_larghezze.up,
    down: migration_20261019_110639_contenitore_larghezze.down,
    name: '20261019_110639_contenitore_larghezze',
  },
  {
    up: migration_20261019_123340_hero_banner.up,
    down: migration_20261019_123340_hero_banner.down,
    name: '20261019_123340_hero_banner',
  },
  {
    up: migration_20261019_133414_hero_video_overlay.up,
    down: migration_20261019_133414_hero_video_overlay.down,
    name: '20261019_133414_hero_video_overlay',
  },
  {
    up: migration_20261019_151942_effetti.up,
    down: migration_20261019_151942_effetti.down,
    name: '20261019_151942_effetti',
  },
  {
    up: migration_20261019_154352_tipi_effetto.up,
    down: migration_20261019_154352_tipi_effetto.down,
    name: '20261019_154352_tipi_effetto',
  },
  {
    up: migration_20261019_175101_footer_dati_legali.up,
    down: migration_20261019_175101_footer_dati_legali.down,
    name: '20261019_175101_footer_dati_legali',
  },
  {
    up: migration_20261019_180548_footer_social.up,
    down: migration_20261019_180548_footer_social.down,
    name: '20261019_180548_footer_social',
  },
  {
    up: migration_20261019_185812_voci_visibili.up,
    down: migration_20261019_185812_voci_visibili.down,
    name: '20261019_185812_voci_visibili',
  },
  {
    up: migration_20261019_221311_effetti_posizione_bordo.up,
    down: migration_20261019_221311_effetti_posizione_bordo.down,
    name: '20261019_221311_effetti_posizione_bordo',
  },
  {
    up: migration_20261019_223200_torna_su.up,
    down: migration_20261019_223200_torna_su.down,
    name: '20261019_223200_torna_su',
  },
  {
    up: migration_20261019_225236_footer_contatti.up,
    down: migration_20261019_225236_footer_contatti.down,
    name: '20261019_225236_footer_contatti',
  },
  {
    up: migration_20261020_135644_sicurezza_utenti.up,
    down: migration_20261020_135644_sicurezza_utenti.down,
    name: '20261020_135644_sicurezza_utenti',
  },
  {
    up: migration_20261020_154951_impostazioni_ruoli.up,
    down: migration_20261020_154951_impostazioni_ruoli.down,
    name: '20261020_154951_impostazioni_ruoli',
  },
  {
    up: migration_20261020_155104_social_in_impostazioni.up,
    down: migration_20261020_155104_social_in_impostazioni.down,
    name: '20261020_155104_social_in_impostazioni',
  },
  {
    up: migration_20261020_190439_blocchi_prodotto.up,
    down: migration_20261020_190439_blocchi_prodotto.down,
    name: '20261020_190439_blocchi_prodotto',
  },
  {
    up: migration_20261020_210554_schede_occhiello.up,
    down: migration_20261020_210554_schede_occhiello.down,
    name: '20261020_210554_schede_occhiello',
  },
  {
    up: migration_20261020_222742_ruoli_personalizzati.up,
    down: migration_20261020_222742_ruoli_personalizzati.down,
    name: '20261020_222742_ruoli_personalizzati',
  },
  {
    up: migration_20261020_222806_togli_ruolo_fisso.up,
    down: migration_20261020_222806_togli_ruolo_fisso.down,
    name: '20261020_222806_togli_ruolo_fisso',
  },
  {
    up: migration_20261020_230101_sfondo_modulo_mappa.up,
    down: migration_20261020_230101_sfondo_modulo_mappa.down,
    name: '20261020_230101_sfondo_modulo_mappa',
  },
  {
    up: migration_20261020_235842_seo_e_motori_ai.up,
    down: migration_20261020_235842_seo_e_motori_ai.down,
    name: '20261020_235842_seo_e_motori_ai',
  },
  {
    up: migration_20261021_013459_traduzioni.up,
    down: migration_20261021_013459_traduzioni.down,
    name: '20261021_013459_traduzioni'
  },
];
