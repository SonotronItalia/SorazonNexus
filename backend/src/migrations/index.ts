import * as migration_20261018_220039_iniziale from './20261018_220039_iniziale';
import * as migration_20261018_222650_regione_select from './20261018_222650_regione_select';

export const migrations = [
  {
    up: migration_20261018_220039_iniziale.up,
    down: migration_20261018_220039_iniziale.down,
    name: '20261018_220039_iniziale',
  },
  {
    up: migration_20261018_222650_regione_select.up,
    down: migration_20261018_222650_regione_select.down,
    name: '20261018_222650_regione_select'
  },
];
