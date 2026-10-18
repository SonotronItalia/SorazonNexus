// Tipi dei campi del modulo ricavati da payload-types (il contratto dei dati con il backend),
// al posto di @payloadcms/plugin-form-builder/types, che è un pacchetto del backend.
import type { Form } from '@/payload-types'

export type { Form }
export type FormFieldBlock = NonNullable<Form['fields']>[number]

// payload-types usa "T | null" per i campi facoltativi; i componenti (e react-hook-form)
// si aspettano "T | undefined". A runtime null e undefined si comportano allo stesso modo qui.
type NoNull<T> = { [K in keyof T]: Exclude<T[K], null> }

type FieldOf<T extends FormFieldBlock['blockType']> = NoNull<Extract<FormFieldBlock, { blockType: T }>>

export type CheckboxField = FieldOf<'checkbox'>
export type CountryField = FieldOf<'country'>
// Il campo email del plugin non ha un valore predefinito, ma il componente lo accetta
export type EmailField = FieldOf<'email'> & { defaultValue?: string }
export type SelectField = FieldOf<'select'>
export type StateField = FieldOf<'state'>
// Usato da Text, Textarea e Number: hanno la stessa forma
export type TextField = FieldOf<'text'>
