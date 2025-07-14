/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren } from 'react'
import classNames from 'classnames'
import { GridVariant } from 'components/molecules/CardsGrid/CardsGrid'
import style from 'components/molecules/JobGridItem/JobGridItem.module.scss'
import { JobItemProcessing } from 'components/molecules/JobItemProcessing/JobItemProcessing'
import useItemClickHandler from 'hooks/useJobItemClickHandler'

export interface IJobGridItemProps {
  /**
   * Object with the data of the Job.
   */
  job?: IJob
}

/**
 * Job's view as a Grid. Shown inside of the Project Browser.
 */
export const JobGridItem: FC<IJobGridItemProps> = ({
  job,
}: PropsWithChildren<IJobGridItemProps>) => {
  const { image, acquired } = job || {}
  const [itemClickHandler] = useItemClickHandler(job)
  const imageSrc = image || '/assets/img/LeicaGeosystems.png'

  return (
    <div
      className={classNames({
        [style.jobGridItem]: true,
        [style.withImage]: !!image,
      })}
    >
      <div
        className={classNames({
          [style.jobGridItem__img]: !!image,
          [style.jobGridItem__imgPlaceholder]: !image,
          [style.jobGridItemAcquired]: acquired,
        })}
        onClick={itemClickHandler}
        data-testid="clickable-image"
      >
        <img src={imageSrc} alt="location" />
      </div>
      {job && (
        <div className={style.jobGridItem__header} role="cell">
          <JobItemProcessing viewMode={GridVariant.GridView} job={job} />
        </div>
      )}
    </div>
  )
}
