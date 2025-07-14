import { useFormikContext } from 'formik'
import { useEffect, useMemo } from 'react'
import { toJson } from 'utils/strings'

export const FormikListener = ({ onTouched }: { onTouched: Function }) => {
  const formik = useFormikContext()
  const valuesString = useMemo(
    () => JSON.stringify(formik.values),
    [formik.values]
  )
  useEffect(() => {
    if (!onTouched) return
    onTouched(toJson(valuesString, 'FORMIK'), formik.setFieldValue)
  }, [valuesString, onTouched, formik.setFieldValue])
  return null
}
