import { lazy } from 'react'

export const PlanQualityForm = lazy(
  () => import('components/dialogs/PlanQualityForm/PlanQualityForm')
)
export const NewProjectForm = lazy(
  () => import('components/dialogs/NewProjectForm/NewProjectForm')
)
export const NewJobForm = lazy(
  () => import('components/dialogs/NewJobForm/NewJobForm')
)
export const RTKSettingsDialog = lazy(
  () => import('components/dialogs/RTKSettingsDialog/RTKSettingsDialog')
)
export const JobInfo = lazy(() => import('components/dialogs/JobInfo/JobInfo'))
export const Alert = lazy(() => import('components/dialogs/Alert/Alert'))
export const PolygonPlanFilter = lazy(
  () => import('components/dialogs/PolygonPlanFilter/PolygonPlanFilter')
)
export const SecondAntennaConfigurator = lazy(
  () =>
    import(
      'components/dialogs/SecondAntennaConfigurator/SecondAntennaConfigurator'
    )
)
export const SaveAsCustomJobType = lazy(
  () => import('components/dialogs/SaveAsCustomJobType/SaveAsCustomJobType')
)
export const CreateNewJobType = lazy(
  () => import('components/dialogs/CreateNewJobType/CreateNewJobType')
)
export const LogViewer = lazy(
  () => import('components/dialogs/LogViewer/LogViewer')
)
export const ProcessingDialog = lazy(
  () => import('components/dialogs/ProcessingDialog/ProcessingDialog')
)
export const ImportShapeFile = lazy(
  () => import('components/dialogs/ImportShapeFile/ImportShapeFile')
)
export const UpdateDialog = lazy(
  () => import('components/dialogs/UpdateDialog/UpdateDialog')
)
export const UpdateAvailableDialog = lazy(
  () => import('components/dialogs/UpdateAvailableDialog/UpdateAvailableDialog')
)
export const CoordinateSystemInfo = lazy(
  () => import('components/dialogs/CoordinateSystemInfo/CoordinateSystemInfo')
)
export const ImportCoordinateSystemDialog = lazy(
  () =>
    import('components/dialogs/ImportCoordinateSystem/ImportCoordinateSystem')
)
export const ScannerTemperatureLegend = lazy(
  () =>
    import(
      'components/dialogs/ScannerTemperatureLegend/ScannerTemperatureLegend'
    )
)
export const ContextualHelp = lazy(
  () => import('components/dialogs/ContextualHelp/ContextualHelp')
)

export const LanConnectionHelp = lazy(
  () => import('components/dialogs/LanConnectionHelp/LanConnectionHelp')
)
