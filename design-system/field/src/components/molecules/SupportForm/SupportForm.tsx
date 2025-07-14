import {
  Button,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { CustomSelect } from 'components/atoms/CustomSelect/CustomSelect'
import { Field, Form, Formik } from 'formik'
import { TextField } from 'formik-mui'
import { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { darkTheme } from 'utils/themes/mui'
import { object, string } from 'yup'
import style from './SupportForm.module.scss'

export interface ISupportFormProps {
  onClose?: () => void
  emailList?: IOption[]
  motivationList?: IOption[]
}

/**
 * SupportForm description
 */
export const SupportForm: FC<ISupportFormProps> = ({
  onClose,
  emailList,
  motivationList,
}: PropsWithChildren<ISupportFormProps>) => {
  const { t } = useTranslation()

  // TODO: update the values for email and motivation list from Store/backend
  // TODO: onSubmit function

  const validationSchema = useMemo(
    () =>
      object({
        description: string().required(
          t('helpSupport.validation.description', 'Description required')
        ),
      }),
    [t]
  )

  const onSubmit = useCallback((values) => {
    // console.log(values)
  }, [])

  return (
    <ThemeProvider theme={darkTheme}>
      <Formik
        initialValues={{
          email: 'leica.support@uk.com',
          motivation: 'acquisition',
          description: '',
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, submitForm }) => (
          <Form>
            <Grid container direction="column" spacing={3}>
              {emailList && (
                <Grid item xs={12}>
                  <span className={style.formEmailLabel}>
                    {t('helpSupport.supportEmail', 'Select support email')}:{' '}
                  </span>
                  <CustomSelect
                    value={values.email}
                    onChange={(emailValue) => {
                      return setFieldValue('email', emailValue.target.value)
                    }}
                    disableUnderline
                    id="email"
                    MenuProps={{
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                    }}
                    className={style.formSelect}
                  >
                    {emailList.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </CustomSelect>
                </Grid>
              )}
              {motivationList && (
                <Grid item xs={12}>
                  <div>
                    {t('helpSupport.motivation', 'What can we help you with?')}
                  </div>
                  <RadioGroup
                    row
                    aria-label="motivation"
                    name="motivation"
                    value={values.motivation}
                    onChange={(motivationValue) => {
                      return setFieldValue(
                        'motivation',
                        motivationValue.target.value
                      )
                    }}
                  >
                    {motivationList.map((motivation) => (
                      <FormControlLabel
                        key={motivation.value}
                        value={motivation.value}
                        control={<Radio size="small" />}
                        label={motivation.label}
                        className={style.formRadio}
                      />
                    ))}
                  </RadioGroup>
                </Grid>
              )}
              <Grid item xs={12}>
                <div>
                  {t('helpSupport.description', 'Describe your issue')}:
                </div>
                <Field
                  component={TextField}
                  name="description"
                  type="text"
                  value={values.description}
                  multiline
                  // rows={4} // TODO: check if it displays correctly, probably it needs an updated verion of Formik
                  InputProps={{
                    minRows: 4,
                  }}
                  variant="outlined"
                  fullWidth={true}
                  className="borderWhite"
                />
              </Grid>
              <Grid item xs={12}>
                <div className={style.footer}>
                  {t(
                    'helpSupport.footer',
                    'Sending will share all the information with the Leica Support'
                  )}
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={style.buttonsContainer}>
                  <Button variant="outlined" color="primary" onClick={onClose}>
                    {t('helpSupport.cancel', 'Cancel')}
                  </Button>
                  <Button color="primary" type="submit">
                    {t('helpSupport.send', 'Send')}
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </ThemeProvider>
  )
}
