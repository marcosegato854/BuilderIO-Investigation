/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Button, CircularProgress, Typography } from '@mui/material'
import classNames from 'classnames'
import { Icon } from 'components/atoms/Icon/Icon'
import style from 'components/dialogs/ImportShapeFile/ImportShapeFile.module.scss'
import moment from 'moment'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { closeDialogAction } from 'store/features/dialogs/slice'
import {
  importShpStartActions,
  listShpStartActions,
  selectShpList,
} from 'store/features/planning/slice'
import { ImportShpStartRequest, ShpFile } from 'store/features/planning/types'

export interface IImportShapeFileProps {}

/**
 * ImportShapeFile description
 */
const ImportShapeFile: FC<IImportShapeFileProps> = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [selectedShpFile, setSelectedShpFile] = useState<string | null>(null)
  const shpFilesList = useSelector(selectShpList)

  const showSpinner = !shpFilesList

  const handleClickClose = useCallback(() => {
    dispatch(closeDialogAction())
  }, [dispatch])

  const handleClickRefresh = useCallback(() => {
    dispatch(listShpStartActions.request())
  }, [dispatch])

  const handleClickUpload = useCallback(() => {
    if (selectedShpFile) {
      const shpFilePayload: ImportShpStartRequest = {
        shpFile: selectedShpFile,
      }
      dispatch(importShpStartActions.request(shpFilePayload))
      dispatch(closeDialogAction())
    }
  }, [dispatch, selectedShpFile])

  const handleShpFileSelection = useCallback((shpFile: ShpFile) => {
    const path = `${shpFile.path}${shpFile.filename}`
    setSelectedShpFile(path)
  }, [])

  const subTitleText = useMemo(() => {
    if (showSpinner) return ''
    return shpFilesList && shpFilesList.length > 0
      ? t('import_shape.available', 'available')
      : t('import_shape.notAvailable', 'no shp files')
  }, [showSpinner, shpFilesList, t])

  /**
   * load shape files list at mount
   */
  useEffect(() => {
    dispatch(listShpStartActions.request())
  }, [dispatch])

  return (
    <div
      className={classNames({
        [style.container]: true,
        [style.variantGrey]: true,
      })}
      data-testid="import-shp-dialog"
    >
      <div className={style.header}>
        {/* <Icon name="Shp" /> */}
        <div className={style.title}>{t('import_shape.title', 'tit')}</div>
        <div className={style.subtitle}>{subTitleText}</div>
      </div>
      {showSpinner && (
        <div className={style.spinner}>
          <CircularProgress size={28} data-testid="spinner" />
        </div>
      )}
      {shpFilesList && shpFilesList.length > 0 && (
        <div className={style.border} data-testid="import-shp-list">
          <div className={style.scrollable}>
            {shpFilesList &&
              shpFilesList.map((shpFile, index) => (
                <div
                  key={`${shpFile.path}-${shpFile.filename}`}
                  className={classNames({
                    [style.shpRow]: true,
                    [style.shpRowSelected]:
                      `${shpFile.path}${shpFile.filename}` === selectedShpFile,
                  })}
                  onClick={() => handleShpFileSelection(shpFile)}
                  data-testid={`import-shape-row-${index}`}
                >
                  <div className={style.shpName}>
                    <span>
                      <Typography variant="body2" noWrap={true}>
                        {shpFile.filename}
                      </Typography>
                    </span>
                    <span>
                      <Typography variant="body2" noWrap={true}>
                        {shpFile.path}
                      </Typography>
                    </span>
                  </div>
                  <div className={style.shpDate}>
                    {moment(shpFile.lastEditDate).format('L')}
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
            {t('import_shape.cancel', 'cancel')}
          </Button>

          <Button
            variant="outlined"
            color="primary"
            disabled={showSpinner}
            data-testid="refresh-button"
            onClick={handleClickRefresh}
          >
            {t('import_shape.refresh', 'refresh')}
          </Button>

          <Button
            color="primary"
            data-testid="upload-button"
            onClick={handleClickUpload}
            disabled={!selectedShpFile}
          >
            {t('import_shape.upload', 'upload')}
          </Button>
        </div>
      </div>
    </div>
  )
}
export default ImportShapeFile
