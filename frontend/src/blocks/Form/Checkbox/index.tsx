import type { CheckboxField } from '@/blocks/Form/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { useFormContext } from 'react-hook-form'

import { Checkbox as CheckboxUi } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'

export const Checkbox: React.FC<
  CheckboxField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  // Una casella obbligatoria va spuntata (required da solo accetta anche il valore false)
  const props = register(name, {
    validate: required ? (v) => v === true || 'Campo obbligatorio' : undefined,
  })
  const { setValue } = useFormContext()

  return (
    <Width width={width}>
      <div className="flex items-center gap-2">
        <CheckboxUi
          defaultChecked={defaultValue}
          id={name}
          {...props}
          onCheckedChange={(checked) => {
            setValue(props.name, checked)
          }}
        />
        <Label htmlFor={name}>
          {required && (
            <span className="required">
              * <span className="sr-only">(obbligatorio)</span>
            </span>
          )}
          {label}
        </Label>
      </div>
      {errors[name] && <Error name={name} />}
    </Width>
  )
}
