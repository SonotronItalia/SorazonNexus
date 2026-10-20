'use client'
import type { Form as FormType } from '@/blocks/Form/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider, type FieldValues } from 'react-hook-form'
import RichText from '@/components/RichText'
import { SezioneSfondo } from '@/components/SezioneSfondo'
import { Button } from '@/components/ui/button'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'

// Campo trappola contro lo spam: invisibile ai visitatori, il backend scarta gli invii che lo
// compilano (stesso nome di CAMPO_TRAPPOLA in backend/src/hooks/controllaModulo.ts)
const CAMPO_TRAPPOLA = '_sito'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
  sfondo?: 'nessuno' | 'scuro' | 'chiaro' | 'tenue' | null
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
    sfondo,
  } = props

  // Valori predefiniti per nome del campo (il blocco "message" non ha nome né valore)
  const defaultValues = Object.fromEntries(
    (formFromProps.fields ?? []).flatMap((field) =>
      'name' in field && 'defaultValue' in field && field.defaultValue != null
        ? [[field.name, field.defaultValue]]
        : [],
    ),
  )

  const formMethods = useForm({ defaultValues })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const formDomID = formID !== undefined ? String(formID) : undefined

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: FieldValues) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = await req.json()

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Invio non riuscito. Riprova tra poco.',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: 'Invio non riuscito: controlla la connessione e riprova.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  return (
    <SezioneSfondo sfondo={sfondo}>
      <div className="container lg:max-w-[48rem]">
        {enableIntro && introContent && !hasSubmitted && (
          <RichText className="mb-8 lg:mb-12" data={introContent} enableGutter={false} />
        )}
        <div className="relative rounded-[28px] border border-border bg-background p-6 lg:p-10">
          <FormProvider {...formMethods}>
            {!isLoading &&
              hasSubmitted &&
              confirmationType === 'message' &&
              confirmationMessage && <RichText data={confirmationMessage} />}
            {isLoading && !hasSubmitted && <p>Invio in corso...</p>}
            {error && (
              <p role="alert" className="mb-4 text-sm text-red-500">
                {error.message}
              </p>
            )}
            {!hasSubmitted && (
              <form id={formDomID} onSubmit={handleSubmit(onSubmit)} noValidate>
                <div
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-px w-px overflow-hidden"
                >
                  <label htmlFor={`${formDomID}-${CAMPO_TRAPPOLA}`}>
                    Non compilare questo campo
                  </label>
                  <input
                    id={`${formDomID}-${CAMPO_TRAPPOLA}`}
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    {...register(CAMPO_TRAPPOLA)}
                  />
                </div>
                {/* Campi affiancati secondo la larghezza scelta nel CMS (es. 50%) quando il modulo è
                  abbastanza largo; più stretto (telefono, colonna) ognuno occupa tutta la riga */}
                <div className="@container mb-8 flex flex-wrap gap-x-4 gap-y-6">
                  {formFromProps &&
                    formFromProps.fields &&
                    formFromProps.fields?.map((field, index) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                      if (Field) {
                        const larghezza =
                          'width' in field && field.width ? Number(field.width) : 100
                        return (
                          <div
                            className="w-full @lg:w-(--larghezza)"
                            style={
                              {
                                '--larghezza': `calc(${larghezza}% - ${(1 - larghezza / 100).toFixed(2)}rem)`,
                              } as React.CSSProperties
                            }
                            key={index}
                          >
                            <Field
                              form={formFromProps}
                              {...field}
                              {...formMethods}
                              control={control}
                              errors={errors}
                              register={register}
                            />
                          </div>
                        )
                      }
                      return null
                    })}
                </div>

                <Button form={formDomID} type="submit" variant="default" disabled={isLoading}>
                  {submitButtonLabel}
                </Button>
              </form>
            )}
          </FormProvider>
        </div>
      </div>
    </SezioneSfondo>
  )
}
