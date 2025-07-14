/* eslint-disable no-empty-pattern */
// TODO migration to v5
import { TextField } from '@mui/material'
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/lab'
import AdapterMoment from '@mui/lab/AdapterMoment'

import {
  Button,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Slider,
  Typography,
} from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import classNames from 'classnames'
import { Field, Form, Formik } from 'formik'
import useTheme from 'hooks/useTheme'
import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { darkTheme, useMUIStyles } from 'utils/themes/mui'
import { useTheme as useMuiTheme } from '@mui/material'
import style from './PlanQualityForm.module.scss'

// TODO: change accordingly to the store; dates should be created using Moment.js
export interface IPlanQualityFormProps {
  distance?: string
  distances?: string[]
  captureDate?: Date
  captureStart?: Date
  captureEnd?: Date
  satellites?: { time: string; nr: number }[]
  accuracyForecast?: { type: string; value: number }[]
}

// TODO: connect to the store when APIs will be ready
// TODO: create the function to assign the reference hour to the graph + leftscroll position
// TODO: find the right component for dates and time based on the API content and format it accordingly

/**
 * PlanQualityForm description
 */
const PlanQualityForm: FC<IPlanQualityFormProps> = ({
  distance,
  distances,
  captureDate,
  captureStart,
  captureEnd,
  satellites,
  accuracyForecast,
}: PropsWithChildren<IPlanQualityFormProps>) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const muiTheme = useMuiTheme()

  // TODO: initial values shoud come from a prop, move them when connecting to the store
  const formikInitialValues = {
    distance,
    distances,
    captureDate,
    captureStart,
    captureEnd,
    satellites,
    accuracyForecast,
  }
  const [selectedDistance, setSelectedDistance] = useState(distance)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    captureDate
  )
  const [selectedTimeStart, setSelectedTimeStart] = useState<Date>(
    captureStart!
  )
  const [selectedTimeEnd, setSelectedTimeEnd] = useState<Date | undefined>(
    captureEnd
  )
  const chartScroll = useRef<HTMLDivElement>(null)

  /** Handle form submission */
  const onSubmit = useCallback((values, { setSubmitting }) => {
    setSubmitting(false)
    // TODO: dispatch to store
  }, [])

  type CustomTooltipType = {
    active?: boolean
    payload?: Array<{ value: string }>
    label?: string
  }
  const CustomTooltip = ({ active, payload, label }: CustomTooltipType) => {
    if (active && payload && payload.length) {
      return (
        <div className={style.customTooltip}>
          <p className={style.label}>{`${label} : ${payload[0]?.value}`}</p>
        </div>
      )
    }

    return null
  }

  useEffect(() => {
    // depending on how we retrive the values, here we should move the div when the time changes
    if (chartScroll.current !== null) {
      chartScroll.current.scrollLeft += 1100
    }

    /* TODO:
    1. read the new value (identify start / end)
    2. approximate the time to ne nearest 00 or 30 mins step
    3. match with the array? index for start and value
    4. read the total length of the div and divide by the total amount of x elements
    5. update the reference rectangle
    6. update the left position
     */
  }, [])

  return (
    <div data-test="plan-quality-form">
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <Formik initialValues={formikInitialValues} onSubmit={onSubmit}>
          {({ values, errors, setFieldValue, submitForm }) => (
            <Form className={style.planQualityForm}>
              <div className={style.title}>
                <div className={style.titleIcon}>
                  <Icon name="QualityEstimation" />
                </div>
                <h1>
                  {t('side_panel.job.quality.title', 'Quality estimation')}
                </h1>
              </div>
              <div className={style.scrollable}>
                <div className={style.dataContainer}>
                  <div className={style.row}>
                    <h2 className={style.label}>
                      {t(
                        'side_panel.job.quality.distance',
                        'Distance to base station'
                      )}
                    </h2>
                    <FormControl className={style.selectBox}>
                      <Field
                        as={Select}
                        type="select"
                        name="type"
                        value={selectedDistance || ''}
                        onChange={
                          (e: React.ChangeEvent<HTMLSelectElement>) =>
                            setSelectedDistance(e.target.value)
                          // eslint-disable-next-line react/jsx-curly-newline
                        }
                        MenuProps={{
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                        }}
                      >
                        {values.distances &&
                          values.distances.map((dist) => (
                            <MenuItem key={`option-${dist}`} value={dist}>
                              {dist}
                            </MenuItem>
                          ))}
                      </Field>
                    </FormControl>
                  </div>
                  <div className={style.row}>
                    <h2 className={style.label}>
                      {t('side_panel.job.quality.captureDate', 'Capture date')}
                    </h2>
                    <div className={style.rowPickerDate}>
                      {/* <KeyboardDatePicker
                        autoOk
                        // disablePast
                        value={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        format="DD/MM/yyyy"
                        variant="inline"
                        InputAdornmentProps={{
                          position: 'start',
                          classes: { root: style.icon },
                        }}
                        InputProps={{ disableUnderline: true }}
                        KeyboardButtonProps={{ size: 'small' }}
                        keyboardIcon={<Icon name="Calendar" />}
                      /> */}
                      <DatePicker
                        value={selectedDate}
                        onChange={(date: Date) => setSelectedDate(date!)}
                        inputFormat="DD/MM/yyyy"
                        // InputAdornmentProps={{
                        //   position: 'start',
                        //   classes: { root: style.icon },
                        // }}
                        // InputProps={{ disableUnderline: true }}
                        // KeyboardButtonProps={{ size: 'small' }}
                        // keyboardIcon={<Calendar />}
                        // renderInput={(params) => <TextField {...params} />}
                      />
                    </div>
                  </div>
                  <div className={style.row}>
                    <h2 className={style.label}>
                      {t('side_panel.job.quality.captureStart', 'Capture time')}
                    </h2>
                    <div className={style.rowPickerTime}>
                      {/* <KeyboardTimePicker
                        autoOk
                        mask="__:__"
                        ampm={false}
                        minutesStep={5}
                        value={selectedTimeStart}
                        onChange={
                          (timeStart) => setSelectedTimeStart(timeStart)
                          // eslint-disable-next-line react/jsx-curly-newline
                        }
                        variant="inline"
                        InputAdornmentProps={{
                          position: 'start',
                          classes: { root: style.icon },
                        }}
                        InputProps={{ disableUnderline: true }}
                        KeyboardButtonProps={{ size: 'small' }}
                        keyboardIcon={<Icon name="Clock" />}
                      /> */}
                      <TimePicker
                        mask="__:__"
                        ampm={false}
                        minutesStep={5}
                        value={selectedTimeStart}
                        onChange={
                          (newValue: Date) => setSelectedTimeStart(newValue!)
                          // eslint-disable-next-line react/jsx-curly-newline
                        }
                        // InputAdornmentProps={{
                        //   position: 'start',
                        //   classes: { root: style.icon },
                        // }}
                        // InputProps={{ disableUnderline: true }}
                        // KeyboardButtonProps={{ size: 'small' }}
                        // keyboardIcon={<Clock />}
                        // renderInput={(params) => <TextField {...params} />}
                      />
                    </div>
                    <h2 className={style.label}>
                      {t('side_panel.job.quality.captureEnd', 'to')}
                    </h2>
                    <div className={style.rowPickerTime}>
                      {/* <KeyboardTimePicker
                        autoOk
                        mask="__:__"
                        ampm={false}
                        minutesStep={5}
                        value={selectedTimeEnd}
                        onChange={(timeEnd) => setSelectedTimeEnd(timeEnd)}
                        variant="inline"
                        InputAdornmentProps={{
                          position: 'start',
                          classes: { root: style.icon },
                        }}
                        InputProps={{ disableUnderline: true }}
                        KeyboardButtonProps={{ size: 'small' }}
                        keyboardIcon={<Icon name="Clock" />}
                      /> */}
                      <TimePicker
                        mask="__:__"
                        ampm={false}
                        minutesStep={5}
                        value={selectedTimeEnd}
                        onChange={(timeEnd: Date) =>
                          setSelectedTimeEnd(timeEnd!)
                        }
                        // InputAdornmentProps={{
                        //   position: 'start',
                        //   classes: { root: style.icon },
                        // }}
                        // InputProps={{ disableUnderline: true }}
                        // KeyboardButtonProps={{ size: 'small' }}
                        // keyboardIcon={<Clock />}
                        // renderInput={(params) => <TextField {...params} />}
                      />
                    </div>
                  </div>

                  <div className={style.chart}>
                    <h2 className={style.label}>
                      {t(
                        'side_panel.job.quality.satellite',
                        'Satellite nr per 30m interval'
                      )}
                    </h2>
                    <div className={style.chartScroll} ref={chartScroll}>
                      <AreaChart
                        width={2800}
                        height={200}
                        data={values.satellites}
                        margin={{ left: -40, right: 40, top: 10 }}
                      >
                        <CartesianGrid stroke={muiTheme.colors.primary_13} />
                        <XAxis
                          dataKey="time"
                          stroke={muiTheme.colors.primary_13}
                        />
                        <YAxis
                          dataKey="nr"
                          stroke={muiTheme.colors.primary_13}
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: '8px',
                          }}
                          content={<CustomTooltip />}
                        />
                        <ReferenceArea
                          x1={21}
                          x2={23}
                          y1={0}
                          y2={24}
                          fill={darkTheme.colors.secondary_9}
                          opacity="0.5"
                        />
                        <Area
                          dataKey="nr"
                          stroke={darkTheme.colors.secondary_2}
                          fill={darkTheme.colors.secondary_2}
                          dot={{
                            stroke: darkTheme.colors.secondary_3,
                            fill: darkTheme.colors.secondary_3,
                            opacity: 0.7,
                          }}
                          type="linear"
                        />
                      </AreaChart>
                    </div>
                  </div>
                  <div className={style.slider}>
                    <h2 className={style.sliderLabel}>
                      {t(
                        'side_panel.job.quality.positionAccuracy',
                        'Position accuracy forecast'
                      )}
                    </h2>
                    <div className={style.sliderContainer}>
                      <Grid container spacing={2}>
                        {values.accuracyForecast?.map((accuracy) => {
                          return (
                            <Grid item container xs={4} key={accuracy.type}>
                              <Slider
                                disabled
                                defaultValue={accuracy.value}
                                aria-labelledby={accuracy.type}
                                className={classNames({
                                  [style[`slider${accuracy.type}`]]: true,
                                })}
                              />
                              <Typography className={style.sliderCaption}>
                                {accuracy.value}%{' '}
                                {t(
                                  `side_panel.job.quality.${accuracy.type}`,
                                  accuracy.type
                                )}
                              </Typography>
                            </Grid>
                          )
                        })}
                      </Grid>
                    </div>
                  </div>
                </div>
              </div>
              <div className={style.footer}>
                <div className={style.buttonsContainer}>
                  <Button
                    variant="outlined"
                    color="primary"
                    data-testid="confirm-button"
                    onClick={() => dispatch(closeDialogAction())}
                  >
                    {t('new_job_form.cancel', 'Cancel')}
                  </Button>

                  <Button
                    color="primary"
                    data-testid="cancel-button"
                    onClick={submitForm}
                  >
                    {t('plan_quality_form.save_btn', 'Save')}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </LocalizationProvider>
    </div>
  )
}
export default PlanQualityForm
