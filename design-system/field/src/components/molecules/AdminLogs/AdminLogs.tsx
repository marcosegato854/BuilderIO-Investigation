import { Alert, AlertColor, Checkbox, Grid } from '@mui/material'
import { Icon } from 'components/atoms/Icon/Icon'
import componentStyle from 'components/molecules/AdminLogs/AdminLogs.module.scss'
import moment from 'moment'
import { isEmpty } from 'ramda'
import {
  ChangeEvent,
  FC,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { Virtuoso } from 'react-virtuoso'

export interface IAdminLogsProps {
  logs: LogItem[]
  clearLogs: () => void
  onCopy?: (logs: LogItem[]) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stringify = (s: string | any): string =>
  typeof s === 'string' ? s : JSON.stringify(s)

/**
 * AdminLogs description
 */
export const AdminLogs: FC<IAdminLogsProps> = ({
  logs,
  clearLogs,
  onCopy,
}: PropsWithChildren<IAdminLogsProps>) => {
  const [value, setValue] = useState<string>('')
  const [errors, setErrors] = useState<boolean>(true)
  const [infos, setInfos] = useState<boolean>(true)
  const [warnings, setWarnings] = useState<boolean>(true)

  const toggleErrors = () => {
    setErrors(!errors)
  }

  const toggleWarnings = () => {
    setWarnings(!warnings)
  }

  const toggleInfos = () => {
    setInfos(!infos)
  }

  const copyToClipboard = () => {
    onCopy && onCopy(logs)
  }

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      setValue(newValue)
    },
    [setValue]
  )

  const filteredLogs = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allowedTypes: any = {
      error: errors,
      info: infos,
      warn: warnings,
    }
    return logs.filter((l) => {
      return (
        allowedTypes[l.type] &&
        (isEmpty(value) ||
          l.args.join().toLowerCase().includes(value.toLowerCase()))
      )
    })
  }, [logs, value, errors, infos, warnings])

  return (
    <div className={componentStyle.container}>
      <Grid
        container
        direction="row"
        alignItems="stretch"
        justifyContent="center"
        alignContent="center"
        className={componentStyle.grid}
      >
        <Grid item xs={10}>
          <div className={componentStyle.filter}>
            <span>Filter:</span>
            <input
              type="text"
              className={componentStyle.searchInput}
              value={value}
              onChange={handleChange}
              data-testid="search-input"
            />
            <Checkbox
              icon={<Icon name="Alert" />}
              checked={errors}
              checkedIcon={<Icon name="Alert" />}
              onChange={toggleErrors}
            />
            <Checkbox
              icon={<Icon name="Warning2" />}
              checkedIcon={<Icon name="Warning2" />}
              checked={warnings}
              onChange={toggleWarnings}
            />
            <Checkbox
              icon={<Icon name="Help" />}
              checkedIcon={<Icon name="Help" />}
              checked={infos}
              onChange={toggleInfos}
            />
          </div>
        </Grid>
        <Grid item xs={2} className={componentStyle.clipboard}>
          <Icon name="Delete" onClick={clearLogs} />
          <Icon name="Download" onClick={copyToClipboard} />
        </Grid>
      </Grid>
      <Virtuoso
        style={{ height: 400 }}
        data={filteredLogs}
        itemContent={(index, log) => {
          const severity = ({
            log: 'info',
            info: 'info',
            warn: 'warning',
            error: 'error',
          }[log.type] || 'info') as AlertColor
          const time = moment(log.time).format('HH:mm:ss')
          return (
            <Alert
              severity={severity}
              icon={false}
              className={componentStyle.alert}
            >
              [{time}] {log.args.map(stringify).join(' - ')}
            </Alert>
          )
        }}
      />
    </div>
  )
}
