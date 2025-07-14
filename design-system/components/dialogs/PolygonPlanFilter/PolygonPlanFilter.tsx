/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
} from '@mui/material'
import {
  rampsOptions,
  roadsOptions,
} from 'components/dialogs/NewJobForm/options'
import { Field, Form, Formik } from 'formik'
import { filter, map, pipe, unnest } from 'ramda'
import React, { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { extractPolygonStartActions } from 'store/features/planning/slice'
import {
  ExtractPolygonStartRequest,
  Polygon,
} from 'store/features/planning/types'
import {
  addRampsInfo,
  getRampsSetting,
  stripRamps,
} from 'utils/planning/polygonHelpers'
import style from './PolygonPlanFilter.module.scss'

export interface IPolygonPlanFilterProps {
  polygon: Polygon
}

interface FilterItem {
  value: string
  label: string
  enable: boolean
}

/**
 * PolygonPlanFilter description
 */
const PolygonPlanFilter: FC<IPolygonPlanFilterProps> = ({
  polygon,
}: PropsWithChildren<IPolygonPlanFilterProps>) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const classes = useMemo(() => stripRamps(polygon.classes), [polygon.classes])

  const checkRoads = useCallback(
    (value: string) => {
      if (!classes.length) return true
      return !!classes.find((el) => el === value)
    },
    [classes]
  )

  const formikInitialValues = useMemo(() => {
    return {
      checkAll: true,
      roads: roadsOptions().map((o) => ({ ...o, enable: checkRoads(o.value) })),
      ramps: getRampsSetting(polygon) || 'include_ramps',
      rampsList: rampsOptions(),
    }
  }, [checkRoads, polygon])

  const onSubmit = useCallback(
    (values) => {
      const roadClasses = unnest(
        pipe(
          filter((road: FilterItem) => road.enable === true),
          map((road: FilterItem) => road.value),
          map(addRampsInfo(values.ramps))
        )(values.roads) as string[][]
      )
      const request: ExtractPolygonStartRequest = {
        coordinates: polygon.coordinates,
        classes: roadClasses,
      }
      dispatch(closeDialogAction())
      dispatch(extractPolygonStartActions.request(request))
    },
    [dispatch, polygon]
  )

  return (
    <Formik initialValues={formikInitialValues} onSubmit={onSubmit}>
      {({ values, setFieldValue, submitForm }) => (
        <Form>
          <FormGroup className={style.form}>
            <FormControlLabel
              className={style.checkboxe}
              control={
                // eslint-disable-next-line react/jsx-wrap-multilines
                <Field
                  color="primary"
                  component={Checkbox}
                  type="checkbox"
                  name="checkBoxAll"
                  checked={values.roads.every((r) => r.enable)}
                  size="small"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setFieldValue('checkAll', event.target.checked)
                    values.roads.forEach((_road: any, index: any) => {
                      setFieldValue(
                        `roads.${index}.enable`,
                        event.target.checked
                      )
                    })
                  }}
                />
              }
              labelPlacement="end"
              label={t('planning.polygon_plan_filter.checkAll', 'Select all')}
            />
            <div className={style.checkboxes}>
              {values.roads.map((road: any, index: any) => {
                return (
                  <FormControlLabel
                    className={style.checkboxe}
                    control={
                      // eslint-disable-next-line react/jsx-wrap-multilines
                      <Field
                        color="primary"
                        component={Checkbox}
                        type="checkbox"
                        name={road.value}
                        checked={road.enable}
                        size="small"
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          setFieldValue(
                            `roads.${index}.enable`,
                            event.target.checked
                          )
                        }}
                      />
                    }
                    labelPlacement="end"
                    label={road.label}
                    key={road.value}
                  />
                )
              })}
            </div>
            <Divider />
            <RadioGroup
              value={values.ramps}
              onChange={(event) => {
                setFieldValue('ramps', event.target.value)
              }}
            >
              {values.rampsList.map((ramp) => {
                return (
                  <FormControlLabel
                    className={style.radio}
                    value={ramp.value}
                    control={<Radio size="small" />}
                    label={ramp.label}
                    key={ramp.value}
                  />
                )
              })}
            </RadioGroup>
            <Divider />
            <div className={style.buttons}>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => dispatch(closeDialogAction())}
              >
                {t('planning.polygon_plan_filter.cancel', 'Cancel')}
              </Button>
              <Button color="primary" size="small" onClick={submitForm}>
                {t('planning.polygon_plan_filter.extract', 'Extract')}
              </Button>
            </div>
          </FormGroup>
        </Form>
      )}
    </Formik>
  )
}

export default PolygonPlanFilter
