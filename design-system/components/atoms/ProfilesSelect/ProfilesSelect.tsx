import { MenuItem } from '@mui/material'
import { snakeCase } from 'change-case'
import classNames from 'classnames'
import { CustomSelect } from 'components/atoms/CustomSelect/CustomSelect'
import { Icon } from 'components/atoms/Icon/Icon'
import style from 'components/atoms/ProfilesSelect/ProfilesSelect.module.scss'
import { IAlertProps } from 'components/dialogs/Alert/Alert'
import { ICreateNewJobTypeProps } from 'components/dialogs/CreateNewJobType/CreateNewJobType'
import { DialogNames } from 'components/dialogs/dialogNames'
import { Field } from 'formik'
import { isNil } from 'ramda'
import React, { FC, PropsWithChildren, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import {
  dataStorageDeleteJobTypeActions,
  dataStorageTempJobType,
} from 'store/features/dataStorage/slice'
import {
  AcquisitionProfile,
  JobType,
  NewJobTypeOptions,
} from 'store/features/dataStorage/types'
import { openDialogAction } from 'store/features/dialogs/slice'

export interface IProfilesSelectProps {
  /**
   * Job Types
   */
  jobTypes: JobType[]
  /**
   * current profile
   */
  profileValue: number | null | undefined
  /**
   * change callback
   */
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => unknown
  /**
   * new profile created callback
   */
  onNewProfile?: (profileName: NewJobTypeOptions) => unknown
  /**
   * current type: Road, Rail, Boat, Custom, ...
   */
  typeValue?: string
}

/**
 * ProfilesSelect description
 */
export const ProfilesSelect: FC<IProfilesSelectProps> = ({
  typeValue,
  profileValue,
  onChange,
  onNewProfile,
  jobTypes,
}: PropsWithChildren<IProfilesSelectProps>) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const jobTypeOptions = useMemo(() => {
    const profileLabel = (jt: JobType) => {
      return t(`new_job_form.option.job_type.${snakeCase(jt.name)}`, jt.name)
    }
    return [
      ...jobTypes
        .filter((j) => j.name !== 'Custom') // filter out the Custom job saved from previous versions, maybe we can remove this in the future
        .map((jt) => ({
          value: jt.name,
          label: profileLabel(jt),
          profile: isNil(jt.profile) ? null : jt.profile,
        })),
      {
        value: 'Custom',
        label: t('new_job_form.option.job_type.custom', 'Custom'),
        profile: null,
      },
      {
        value: 'new',
        label: t('new_job_form.option.job_type.new', 'new'),
        profile: -2,
      },
    ]
  }, [jobTypes, t])

  const JobTypeIcon = (profile: number | null) => {
    if (profile === AcquisitionProfile.PEDESTRIAN)
      return <Icon name="JobTypePedestrian" />
    if (profile === AcquisitionProfile.RAIL) return <Icon name="JobTypeTrain" />
    if (profile === AcquisitionProfile.MARINE)
      return <Icon name="JobTypeBoat" />
    if (profile === AcquisitionProfile.ROAD) return <Icon name="JobTypeRoad" />
    if (profile === -2) return <Icon name="Plus" />
    return <Icon name="Error" />
  }

  const isCustomProfile = useMemo(() => {
    if (!typeValue) return false
    return !['Road', 'Rail', 'Boat', 'Custom'].includes(typeValue)
  }, [typeValue])

  const onChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'new') {
      dispatch(
        openDialogAction({
          component: DialogNames.CreateNewJobType,
          componentProps: {
            okButtonCallback: (values) => {
              dispatch(dataStorageTempJobType(values))
              onNewProfile && onNewProfile(values)
            },
          } as ICreateNewJobTypeProps,
        })
      )
      return
    }
    onChange(e)
  }

  // const renameHandler = () => {
  //   dispatch(
  //     openDialogAction({
  //       component: DialogNames.Alert,
  //       componentProps: {
  //         type: 'warning',
  //       } as IAlertProps,
  //     })
  //   )
  // }

  const deleteHandler = () => {
    const customProfile = jobTypes.find((jt) => jt.name === typeValue)
    if (!customProfile) return
    dispatch(
      openDialogAction({
        component: DialogNames.Alert,
        componentProps: {
          type: 'warning',
          title: t('job_browser.delete_jobtype_title', 'delete jobtype'),
          text: t('job_browser.delete_jobtype_text', {
            profile: customProfile.name,
            defaultProfile: t(
              `new_job_form.option.job_type.p${customProfile.profile}`
            ),
          }),
          okButtonLabel: t('job_browser.delete_jobtype_ok', 'ok'),
          cancelButtonLabel: t('job_browser.delete_jobtype_cancel', 'cancel'),
          okButtonCallback: () => {
            console.warn(`[DATASTORAGE] delete profile ${customProfile.name}`)
            dispatch(
              dataStorageDeleteJobTypeActions.request({
                name: customProfile.name,
              })
            )
          },
        } as IAlertProps,
      })
    )
  }

  return (
    <div className={style.container}>
      <Field
        component={CustomSelect}
        name="type"
        value={typeValue}
        onChange={onChangeHandler}
      >
        {jobTypeOptions.map((jobTypeOption) => {
          const currentProfile = isNil(jobTypeOption.profile)
            ? profileValue || 0
            : jobTypeOption.profile
          return (
            <MenuItem
              key={`option-${jobTypeOption.label}`}
              value={jobTypeOption.value}
              className={classNames({
                [style.liMenuItem]: true,
                [style.hidden]: jobTypeOption.profile === null,
              })}
            >
              <span className={style.label}>{jobTypeOption.label}</span>
              {JobTypeIcon(currentProfile)}
            </MenuItem>
          )
        })}
      </Field>
      {isCustomProfile && (
        <div className={style.buttons}>
          {/* <Icon
            name="EditName"
            className={style.trackIcon}
            data-testid="rename-profile"
            onClick={renameHandler}
          /> */}
          <Icon
            name="Delete"
            data-testid="delete-profile"
            onClick={deleteHandler}
          />
        </div>
      )}
    </div>
  )
}
