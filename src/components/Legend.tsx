import { useState, useEffect } from 'react'
import { PurposeConfig } from '../types'
import { getPurposeConfigs } from '../utils/storage'

const UNVISITED_COLOR = '#F5F5FA'

export default function Legend() {
  const [configs, setConfigs] = useState<PurposeConfig[]>([])

  useEffect(() => {
    // 监听存储变化，更新类别
    const updateConfigs = () => {
      setConfigs(getPurposeConfigs())
    }
    updateConfigs()
    // 定期检查（因为localStorage变化不会触发事件）
    const interval = setInterval(updateConfigs, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="legend">
      {configs.map((config) => (
        <div key={config.name} className="legend-item">
          <span className="legend-color" style={{ background: config.color }}></span>
          <span>{config.name}</span>
        </div>
      ))}
      <div className="legend-item">
        <span className="legend-color" style={{ background: UNVISITED_COLOR }}></span>
        <span>未访问</span>
      </div>
      <div className="legend-note">
        （颜色深度表示访问次数：1-5次，次数越多颜色越深）
      </div>
    </div>
  )
}

