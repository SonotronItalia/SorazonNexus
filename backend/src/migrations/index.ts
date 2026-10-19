import * as migration_20261018_220039_iniziale from './20261018_220039_iniziale';
import * as migration_20261018_222650_regione_select from './20261018_222650_regione_select';
import * as migration_20261018_232004_galleria_risultati from './20261018_232004_galleria_risultati';
import * as migration_20261019_101838_galleria_sottotitolo_mappa from './20261019_101838_galleria_sottotitolo_mappa';
import * as migration_20261019_104831_colori_sito from './20261019_104831_colori_sito';
import * as migration_20261019_110639_contenitore_larghezze from './20261019_110639_contenitore_larghezze';
import * as migration_20261019_123340_hero_banner from './20261019_123340_hero_banner';

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
    name: '20261019_123340_hero_banner'
  },
];
