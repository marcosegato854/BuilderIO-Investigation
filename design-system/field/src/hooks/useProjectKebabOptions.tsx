import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import {
  dataStorageDeleteProjectDialog,
  dataStorageEditProject,
  dataStorageProjectDetailActions,
} from 'store/features/dataStorage/slice'

/**
 * Hook that returns the kebab options of a project
 */
const useProjectKebabOptions = (
  setDetailsMenuItem: React.Dispatch<
    React.SetStateAction<HTMLLIElement | null | undefined>
  >,
  project?: IProject
) => {
  const { name, disk: diskName } = project || {}
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const kebabOptions: Array<IClickableOption> = [
    {
      onClick: () =>
        dispatch(
          dataStorageEditProject({
            disk: diskName || '',
            project: name || '',
          })
        ),
      value: 'edit',
      label: t('project_browser.kebab.edit_project', 'Edit'),
    },
    {
      onClick: (e: React.MouseEvent<HTMLLIElement>) => {
        setDetailsMenuItem(e.currentTarget)
        dispatch(
          dataStorageProjectDetailActions.request({
            disk: diskName || '',
            project: name || '',
          })
        )
      },
      dontCloseOnClick: true,
      // onClick: () =>
      //   dispatch(dataStorageProjectDetailActions.request(name || '')),
      value: 'view',
      label: t('project_browser.kebab.view_settings', 'View'),
    },
    {
      onClick: () =>
        dispatch(
          dataStorageDeleteProjectDialog({
            disk: diskName || '',
            project: name || '',
          })
        ),
      value: 'delete',
      label: t('project_browser.kebab.delete', 'Delete'),
    },
  ]
  return [kebabOptions]
}
export default useProjectKebabOptions
