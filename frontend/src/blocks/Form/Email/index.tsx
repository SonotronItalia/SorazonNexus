import type { EmailField } from '@/blocks/Form/types'
import type { FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React from 'react'

import { Error } from '../Error'
import { Width } from '../Width'

export const Email: React.FC<
  EmailField & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => {
  return (
    <Width width={width}>
      <Label htmlFor={name}>
        {label}

        {required && (
          <span className="required">
            * <span className="sr-only">(obbligatorio)</span>
          </span>
        )}
      </Label>
      <Input
        defaultValue={defaultValue}
        id={name}
        type="text"
        inputMode="email"
        autoComplete="email"
        {...register(name, {
          pattern: { value: /^\S[^\s@]*@\S+\.\S+$/, message: 'Indirizzo email non valido' },
          required,
        })}
      />

      {errors[name] && <Error name={name} />}
    </Width>
  )
}
