/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Button, CircularProgress, Typography } from '@mui/material'
import classNames from 'classnames'
import style from 'components/dialogs/ImportCoordinateSystem/ImportCoordinateSystem.module.scss'
import moment from 'moment'
import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  importCoordinateSystemStartActions,
  importCoordinateSystemWktStartActions,
  listCoordinateSystemsStartActions,
  listCoordinateSystemWktStartActions,
  selectFileList,
  selectIsAnyImported,
} from 'store/features/coordsys/slice'
import {
  CoordinateSystemFile,
  CoordinateSystemImportSystemRequest,
  CoordinateSystemWktImportRequest,
} from 'store/features/coordsys/types'
import { closeDialogAction } from 'store/features/dialogs/slice'

export interface IImportCoordinateSystemProps {
  file_type?: 'csys' | 'wkt'
  csys_name?: string
  onImported?: () => void
}

/**
 * ImportCoordinateSystem dialog
 */
const ImportCoordinateSystem: FC<IImportCoordinateSystemProps> = ({
  file_type = 'wkt',
  csys_name,
  onImported,
}: PropsWithChildren<IImportCoordinateSystemProps>) => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState<CoordinateSystemFile | null>(
    null
  )
  const filesList = useSelector(selectFileList)
  const fileImported = useSelector(selectIsAnyImported)
  const showSpinner = filesList == null

  const handleClickClose = useCallback(() => {
    dispatch(closeDialogAction())
  }, [dispatch])

  const handleClickRefresh = useCallback(() => {
    file_type === 'csys'
      ? dispatch(listCoordinateSystemsStartActions.request())
      : dispatch(listCoordinateSystemWktStartActions.request())
  }, [dispatch, file_type])

  const handleClickUpload = useCallback(() => {
    if (selectedFile) {
      if (file_type === 'csys') {
        const filePayload: CoordinateSystemImportSystemRequest = {
          path: selectedFile.path,
          filename: selectedFile.filename,
        }
        dispatch(importCoordinateSystemStartActions.request(filePayload))
      }
      if (file_type === 'wkt' && csys_name) {
        const filePayload: CoordinateSystemWktImportRequest = {
          name: csys_name,
          path: selectedFile.path,
          filename: selectedFile.filename,
        }
        dispatch(importCoordinateSystemWktStartActions.request(filePayload))
      }
    }
  }, [dispatch, file_type, selectedFile, csys_name])

  const handleFileSelection = useCallback((file: CoordinateSystemFile) => {
    setSelectedFile(file)
  }, [])

  const subTitleText = useMemo(() => {
    if (showSpinner) return ''
    if (filesList && filesList.length > 0) {
      return file_type === 'csys'
        ? t('coordsys.importDialog.csysSubtitle', 'available csys')
        : t('coordsys.importDialog.wktSubtitle', 'available wkt')
    }
    return t('coordsys.importDialog.notAvailable', 'no files')
  }, [showSpinner, filesList, t, file_type])

  /**
   * load files at mount
   */
  useEffect(() => {
    file_type === 'csys'
      ? dispatch(listCoordinateSystemsStartActions.request())
      : dispatch(listCoordinateSystemWktStartActions.request())
  }, [dispatch, file_type])

  useEffect(() => {
    if (fileImported) {
      onImported && onImported()
      /* dispatch(closeDialogAction()) */
    }
  }, [dispatch, fileImported, onImported])

  return (
    <div
      className={classNames({
        [style.container]: true,
        [style.variantGrey]: true,
      })}
      data-testid="import-shp-dialog"
    >
      <div className={style.header}>
        {file_type === 'csys' ? (
          <div className={style.title} data-testid="csys-title">
            {t('coordsys.importDialog.csysTitle', 'tit')}
          </div>
        ) : (
          <div className={style.title} data-testid="wkt-title">
            {t('coordsys.importDialog.wktTitle', { name: csys_name })}
          </div>
        )}
        <div className={style.subtitle} data-testid="subtitle">
          {subTitleText}
        </div>
      </div>
      {showSpinner && (
        <div className={style.spinner}>
          <CircularProgress size={28} data-testid="spinner" />
        </div>
      )}
      {filesList && filesList.length > 0 && (
        <div className={style.border} data-testid="import-coordsys-list">
          <div className={style.scrollable}>
            {filesList &&
              filesList.map((file, index) => (
                <div
                  key={`${file.path}-${file.filename}`}
                  className={classNames({
                    [style.shpRow]: true,
                    [style.shpRowSelected]:
                      `${file.path}${file.filename}` ===
                      `${selectedFile?.path}${selectedFile?.filename}`,
                  })}
                  onClick={() => handleFileSelection(file)}
                  data-testid={`import-coordsys-row-${index}`}
                >
                  <div className={style.shpName}>
                    <span>
                      <Typography variant="body2" noWrap={true}>
                        {file.filename}
                      </Typography>
                    </span>
                    <span>
                      <Typography variant="body2" noWrap={true}>
                        {file.path}
                      </Typography>
                    </span>
                  </div>
                  <div className={style.shpDate}>
                    {moment(file.lastEditDate).format('L')}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      <div className={style.footer}>
        <div className={style.buttonsContainer}>
          <Button
            variant="outlined"
            color="primary"
            data-testid="cancel-button"
            onClick={handleClickClose}
          >
            {t('coordsys.importDialog.cancel', 'cancel')}
          </Button>

          <Button
            variant="outlined"
            color="primary"
            disabled={showSpinner}
            data-testid="refresh-button"
            onClick={handleClickRefresh}
          >
            {t('coordsys.importDialog.refresh', 'refresh')}
          </Button>

          <Button
            color="primary"
            data-testid="upload-button"
            onClick={handleClickUpload}
            disabled={!selectedFile}
          >
            {t('coordsys.importDialog.upload', 'upload')}
          </Button>
        </div>
      </div>
      {/* {showOverlay && (
        <div className={style.overlay}>
          <div className={style.errorIcon}>
            <Icon name="Warning2" />
          </div>
          <div className={style.errorText}>
            <p>{t('coordsys.importDialog.sameCsysName', 'same name')}</p>
            <p>
              {t('coordsys.importDialog.importedCsysName', { name: null })}
            </p>
            <p>
              {t(
                'coordsys.importDialog.confirmation',
                'do you want to proceed'
              )}
            </p>
          </div>
          <div className={style.buttonsContainer}>
            <Button
              variant="outlined"
              color="primary"
              data-testid="rtk-cancel-button"
              onClick={onCancelOverlayHandler}
              sx={{
                borderRadius: '6px',
              }}
            >
              {t('coordsys.importDialog.cancel', 'cancel')}
            </Button>
            <Button
              color="primary"
              data-testid="rtk-retry-button"
              // onClick={onProceedOverlayHandler}
              sx={{
                borderRadius: '6px',
              }}
            >
              {t('coordsys.importDialog.proceed', 'proceed')}
            </Button>
          </div>
        </div>
      )} */}
    </div>
  )
}
export default ImportCoordinateSystem
