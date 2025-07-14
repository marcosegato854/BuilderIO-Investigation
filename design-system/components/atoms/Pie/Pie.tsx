import React, { FC, PropsWithChildren } from 'react'
import style from 'components/atoms/Pie/Pie.module.scss'
import classNames from 'classnames'
import { PieChart, Pie as RechartPie, Cell } from 'recharts'
import { useTheme } from '@mui/material'

// inspired by: https://www.freecodecamp.org/news/css-only-pie-chart/

export interface IPieProps {
  perc: number
}

/**
 * Pie description
 */
export const Pie: FC<IPieProps> = ({ perc }: PropsWithChildren<IPieProps>) => {
  const theme = useTheme()
  const COLORS = [theme.colors.primary_24, theme.colors.primary_11]

  const data = [
    { name: 'used', value: 100 - perc },
    { name: 'free', value: perc },
  ]
  return (
    <div className={style.container}>
      <div className={classNames(style.pie)}>
        <PieChart width={17} height={17}>
          <RechartPie
            data={data}
            startAngle={-270}
            cx="50%"
            cy="50%"
            outerRadius={8}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={0}
            animationDuration={500}
            // isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </RechartPie>
        </PieChart>
      </div>
    </div>
  )
}
