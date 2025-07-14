/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Box, Button, Typography } from '@mui/material'
import { DiskSelectBox } from 'components/atoms/DiskSelectBox/DiskSelectBox'
import { HelpButton } from 'components/atoms/HelpButton/HelpButton'
import { Icon } from 'components/atoms/Icon/Icon'
import { ImageSelector } from 'components/atoms/ImageSelector/ImageSelector'
import { OpenSelectbox } from 'components/atoms/OpenSelectbox/OpenSelectbox'
import style from 'components/dialogs/NewProjectForm/NewProjectForm.module.scss'
import CoordinateSystemSelector from 'components/molecules/CoordinateSystemSelector/CoordinateSystemSelector'
import { Field, Form, Formik } from 'formik'
import { TextField } from 'formik-mui'
import useAutoSelect from 'hooks/useAutoSelect'
import { FC, PropsWithChildren, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectCurrentSystem,
  setCurrentCoordinateSystem,
} from 'store/features/coordsys/slice'
import { CurrentCoordinateSystem } from 'store/features/coordsys/types'
import {
  dataStorageClearCurrentProject,
  dataStorageNewProjectActions,
  dataStorageUpdateProjectActions,
  selectDataStorageDisks,
  selectDataStorageProjects,
} from 'store/features/dataStorage/slice'
import { closeDialogAction } from 'store/features/dialogs/slice'
import { diskSpaceInfo } from 'utils/disks'
import { getMaxNameChars, getUniqueName } from 'utils/names'
import { object, string } from 'yup'

export enum Unit {
  Imperial = 'imperial',
  Metric = 'metric',
}

interface FlatProject {
  name: string
  coordinateUnit: Coordinate['unit']
  image?: string
  disk: string
  isCoordinateLocked?: boolean
}

const flattenProject = (project: IProject): FlatProject => ({
  coordinateUnit: project.coordinate?.unit || 'metric',
  image: project.image,
  name: project.name,
  disk: project.disk,
  isCoordinateLocked: !!project.coordinate?.locked,
})

const unflattenProject = (
  flatProject: FlatProject,
  currentCoordinate?: CurrentCoordinateSystem | null
): IProject => ({
  name: flatProject.name,
  image: flatProject.image,
  coordinate: {
    unit: flatProject.coordinateUnit,
    automatic: !!currentCoordinate?.isAutomatic,
    name: currentCoordinate?.name || '',
    locked: !!flatProject.isCoordinateLocked,
  },
  disk: flatProject.disk,
})

const nameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9_]$/

export interface INewProjectFormProps {
  initialValues?: IProject
}

/**
 * NewProjectForm description
 */
const NewProjectForm: FC<INewProjectFormProps> = ({
  initialValues,
}: PropsWithChildren<INewProjectFormProps>) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const titleInputRef = useAutoSelect()
  const projects = useSelector(selectDataStorageProjects)
  const disks = useSelector(selectDataStorageDisks)
  const projectNamesList = projects
    .map((project) => project.name)
    .filter((name) => name !== initialValues?.name)
  const currentSystem = useSelector(selectCurrentSystem)

  const hasJobs = initialValues?.jobs ? initialValues?.jobs > 0 : false

  const defaultProjectName = useMemo(
    () => getUniqueName(projects, 'Project'),
    [projects]
  )

  const unitOptions: IOption[] = [
    {
      label: t('unit.imperial', 'imp'),
      value: Unit.Imperial,
    },
    {
      label: t('unit.metric', 'met'),
      value: Unit.Metric,
    },
  ]

  const disksAvailable: IOptionDisk[] = useMemo(
    () =>
      disks.map((disk) => ({
        label: diskSpaceInfo(disk),
        value: disk.name,
        critical: disk.critical,
      })),
    [disks]
  )

  const defaultDisk = useMemo(
    () => disks.find((disk) => disk.default === true),
    [disks]
  )

  const isEditing = useMemo(() => {
    if (!initialValues) return false
    return true
  }, [initialValues])

  const title = useMemo(() => {
    if (initialValues) return t('edit_project_form.title', 'Edit Project')
    return t('new_project_form.title', 'New Project')
  }, [initialValues, t])

  const saveBtnTxt = useMemo(() => {
    if (initialValues) return t('edit_project_form.saveBtn', 'Save')
    return t('new_project_form.saveBtn', 'Create Project')
  }, [initialValues, t])

  const formikInitialValues: Partial<FlatProject> = useMemo(() => {
    const defaultValues: Partial<FlatProject> = {
      name: defaultProjectName,
      coordinateUnit: Unit.Metric,
      disk: defaultDisk?.name || '',
      image: '',
    }
    if (initialValues) {
      return {
        ...defaultValues,
        ...flattenProject(initialValues),
      }
    }
    return defaultValues
  }, [initialValues, defaultProjectName, defaultDisk])

  const validationSchema = useMemo(
    () =>
      object({
        name: string()
          .required(
            t('new_project_form.validation.project_name', 'name required')
          )
          .min(3, t('new_project_form.validation.min3', '3 characters min'))
          .matches(
            nameRegex,
            t(
              'new_project_form.validation.bad_characters',
              'unallowed characters'
            )
          )
          .max(
            getMaxNameChars(),
            t('new_project_form.validation.max', '25 characters max')
          )
          .notOneOf(
            projectNamesList,
            t(
              'new_project_form.validation.name_duplicate',
              'name already in use'
            )
          ),
        coordinateUnit: string().required(
          t('new_project_form.validation.unit', 'unit required')
        ),
        disk: string().required(
          t('new_project_form.validation.disk', 'disk required')
        ),
      }),
    [projectNamesList, t]
  )

  const onSubmit = useCallback(
    (values, { setSubmitting }) => {
      // TODO: this makes the form editable again, but it should be done only when receiving errors. We can lock the screen in other ways
      setSubmitting(false)
      const unflattenedValues = unflattenProject(values, currentSystem)
      console.info('[NEW_PROJECT_FORM] submit', unflattenedValues)
      if (initialValues) {
        dispatch(
          dataStorageUpdateProjectActions.request({
            diskName: initialValues.disk,
            projectName: initialValues.name,
            project: unflattenedValues,
          })
        )
        return
      }
      dispatch(dataStorageNewProjectActions.request(unflattenedValues))
    },
    [currentSystem, dispatch, initialValues]
  )

  /**
   * Keyboard interactions: avoid the 'enter' key to submit the form
   */
  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.keyCode === 13) {
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', keyDownHandler)
    return () => {
      document.removeEventListener('keydown', keyDownHandler)
    }
  }, [])

  const closeHandler = () => {
    dispatch(setCurrentCoordinateSystem(null))
    dispatch(closeDialogAction())
    dispatch(dataStorageClearCurrentProject())
  }

  return (
    <Formik
      initialValues={formikInitialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, submitForm }) => {
        const thumbLabel = values.image
          ? t('new_job_form.delete_thumbnail', 'delete thumbnail')
          : t('new_job_form.add_a_thumbnail', 'thumbnail')
        return (
          <Form className={style.newProjectForm}>
            <div className={style.header}>
              <h1 className={style.title}>{title}</h1>
            </div>
            <div className={style.scrollable}>
              <Field
                component={TextField}
                name="name"
                type="text"
                placeholder="Project001"
                variant="outlined"
                label={t(
                  'new_project_form.project_title_label',
                  'Project title'
                )}
                InputLabelProps={{
                  shrink: true,
                }}
                inputRef={titleInputRef}
                className={style.projectNameInput}
                data-testid="project-name-input"
              />

              {/* THUMBNAIL */}
              <div className={style.thumbnail}>
                <h2 className={style.label}>
                  {thumbLabel}
                  {values.image && (
                    <button
                      data-testid="delete-button"
                      type="button"
                      onClick={() => {
                        setFieldValue('image', null)
                      }}
                      className={style.deleteButton}
                    >
                      <Icon name="DeleteTool" />
                    </button>
                  )}
                </h2>
                <div className={style.imageSelector}>
                  <ImageSelector
                    image={values.image}
                    onChange={(image) => {
                      setFieldValue('image', image)
                    }}
                  />
                </div>
              </div>

              {/* DISK SELECTION */}
              <div className={style.row}>
                <h2 className={style.label}>
                  {t('new_project_form.select_disk', 'Select Disk')}
                </h2>
                <div className={style.singleOpenSelectBox}>
                  <DiskSelectBox
                    value={values.disk}
                    options={disksAvailable}
                    disabled={isEditing}
                    onChange={(value: string) => {
                      return setFieldValue('disk', value)
                    }}
                  />
                </div>
              </div>

              {/* MEASUREMENT UNIT */}
              <div className={style.row}>
                <h2 className={style.label}>
                  {t('new_project_form.define_units', 'unit')}
                </h2>
                <div className={style.singleOpenSelectBox}>
                  <OpenSelectbox
                    value={values.coordinateUnit}
                    options={unitOptions}
                    onChange={(value: string) => {
                      return setFieldValue('coordinateUnit', value)
                    }}
                    disabled={hasJobs}
                  />
                </div>
              </div>

              {/* COORDINATE SYSTEM */}
              <Box className={style.row} flexDirection={'column'}>
                <Typography className={style.label} mb={1}>
                  {t(
                    'coordsys.selection.projectFormTitle',
                    'coordinate system'
                  )}
                  <HelpButton
                    className={style.helpIcon}
                    node="coordinate_system"
                  />
                </Typography>
                <Box display={'flex'} justifyContent={'center'}>
                  <CoordinateSystemSelector
                    isLocked={values.isCoordinateLocked}
                  />
                </Box>
              </Box>
            </div>
            <div className={style.footer}>
              <Box sx={{ display: 'flex', gap: '15px' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={closeHandler}
                >
                  {t('new_project_form.cancel', 'Cancel')}
                </Button>
                <Button
                  data-testid="submit-button"
                  color="primary"
                  onClick={submitForm}
                >
                  {saveBtnTxt}
                </Button>
              </Box>
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}

export default NewProjectForm
