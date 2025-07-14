import React, { FC } from 'react'
import Box from '@mui/material/Box'
import { useTranslation } from 'react-i18next'
import { Divider } from '@mui/material'
import { StatusItem } from '../StatusItem/StatusItem'
export interface IStatusBar {
  rtk: boolean
}

export const StatusBar: FC<IStatusBar> = ({ rtk }) => {
  //TODO:
  // InfoTabInformations either comes from the store or is computed at some point.
  // That's the place where we need to translate. Please mimic what is used on the webapp statusbar

  const { t } = useTranslation()

  const InfoTabInformations = {
    imuStatus: {
      text: t('acquisition.imu', 'imu_status'),
      textInfo: 'Computing',
      backgroundColor: 'secondary_1',
      color: 'primary_1',
    },
    gdop: {
      text: t('acquisition.status.gdop', 'gdop'),
      textInfo: 3.863,
      backgroundColor: 'primary_7',
      color: 'primary_1',
    },
    satelliteAvailable: {
      text: t(
        'acquisition.status.numbersatelliteavailable',
        'satellite_available'
      ),
      textInfo: 12,
      backgroundColor: 'primary_7',
      color: 'primary_1',
    },
    rtk: {
      text: t('data_acquisition_small_status_bar.rtk', 'rtk'),
      textInfo: 'H 0.190m V 0.236m',
      backgroundColor: 'secondary_6',
      color: 'primary_11',
    },
    rtkStatus: {
      text: t('acquisition.status.rtkstatus', 'rtk_status'),
      textInfo: 'Fixed',
      backgroundColor: 'secondary_4',
      color: 'primary_1',
    },
    lastCorrectionUpdate: {
      text: t('acquisition.status.lastconnectionupdate', 'last_connection'),
      textInfo: 2,
      backgroundColor: 'secondary_4',
      color: 'primary_1',
    },
    internetAccess: {
      text: t('acquisition.status.internetconnected', 'internet_access'),
      textInfo: 'Yes',
      backgroundColor: 'secondary_4',
      color: 'primary_1',
    },
    rtkServiceConnected: {
      text: t('acquisition.status.rtkserviceconnected', 'rtk_service'),
      textInfo: 'No',
      backgroundColor: 'secondary_6',
      color: 'primary_11',
    },
  } as const
  return (
    <Box
      sx={(theme) => ({
        width: '780px',
        height: !rtk ? '52px' : '156px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pt: '11px',
        pb: '11px',
        pr: '32px',
        pl: '32px',
        borderRadius: '10px',
        backgroundColor: theme.colors.primary_3,
      })}
    >
      {!rtk ? (
        <>
          <Box sx={{ width: '200px', height: '30px' }}>
            <StatusItem
              variant="pcuapp"
              accuracy={1}
              label={InfoTabInformations.imuStatus.text}
              value={InfoTabInformations.imuStatus.textInfo}
            />
          </Box>
          <Box sx={{ width: '150px', height: '30px' }}>
            <StatusItem
              variant="pcuapp"
              accuracy={3}
              label={InfoTabInformations.gdop.text}
              value={InfoTabInformations.gdop.textInfo}
            />
          </Box>
          <Box sx={{ width: '200px', height: '30px' }}>
            <StatusItem
              variant="pcuapp"
              accuracy={3}
              label={InfoTabInformations.satelliteAvailable.text}
              value={InfoTabInformations.satelliteAvailable.textInfo}
            />
          </Box>
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Left column */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
            <Box sx={{ width: '185px', height: '30px' }}>
              <StatusItem
                variant="pcuapp"
                accuracy={1}
                label={InfoTabInformations.imuStatus.text}
                value={InfoTabInformations.imuStatus.textInfo}
              />
            </Box>
            <Box sx={{ width: '185px', height: '30px' }}>
              <StatusItem
                variant="pcuapp"
                accuracy={3}
                label={InfoTabInformations.satelliteAvailable.text}
                value={InfoTabInformations.satelliteAvailable.textInfo}
              />
            </Box>
            <Box sx={{ width: '185px', height: '30px' }}></Box>
          </Box>

          {/* Vertical divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: '#fff', opacity: 0.3, ml: '58px', mr: '45px' }}
          />

          {/* Right column */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: '22px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Box sx={{ width: '160px', height: '30px' }}></Box>
            <Box sx={{ width: '200px', height: '30px' }}>
              <StatusItem
                data-testid="rtk-label"
                variant="pcuapp"
                accuracy={2}
                label={InfoTabInformations.rtk.text}
                value={InfoTabInformations.rtk.textInfo}
              />
            </Box>
            <Box sx={{ width: '160px', height: '30px' }}>
              <StatusItem
                variant="pcuapp"
                accuracy={0}
                label={InfoTabInformations.rtkStatus.text}
                value={InfoTabInformations.rtkStatus.textInfo}
              />
            </Box>
            <Box sx={{ width: '200px', height: '30px' }}>
              <StatusItem
                variant="pcuapp"
                accuracy={0}
                label={InfoTabInformations.lastCorrectionUpdate.text}
                value={InfoTabInformations.lastCorrectionUpdate.textInfo}
              />
            </Box>
            <Box sx={{ width: '160px', height: '30px' }}>
              <StatusItem
                variant="pcuapp"
                accuracy={0}
                label={InfoTabInformations.internetAccess.text}
                value={InfoTabInformations.internetAccess.textInfo}
              />
            </Box>
            <Box sx={{ width: '200px', height: '30px' }}>
              <StatusItem
                variant="pcuapp"
                accuracy={2}
                label={InfoTabInformations.rtkServiceConnected.text}
                value={InfoTabInformations.rtkServiceConnected.textInfo}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
