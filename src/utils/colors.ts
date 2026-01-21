import { VisitPurpose } from '../types'
import { getPurposeColors } from './storage'

// 将十六进制颜色转换为RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [74, 144, 226] // 默认蓝色
}

// 获取基础颜色（从用户自定义或默认值）
function getBaseColor(purpose: VisitPurpose): [number, number, number] {
  const customColors = getPurposeColors()
  const hexColor = customColors[purpose] || '#4A90E2'
  return hexToRgb(hexColor)
}

// 未访问的颜色（柔和的浅灰色）
const UNVISITED_COLOR = [245, 245, 250]

/**
 * 根据访问次数和目的生成颜色
 * @param count 访问次数 (0-5)
 * @param purpose 访问目的（如果count为0则忽略）
 */
export function getCityColor(count: number, purpose?: VisitPurpose): string {
  if (count === 0) {
    return `rgb(${UNVISITED_COLOR.join(',')})`
  }

  if (!purpose) {
    return `rgb(${UNVISITED_COLOR.join(',')})`
  }

  const baseColor = getBaseColor(purpose)
  // 改进的颜色深度算法 - 使用更平滑的渐变
  // 0次和1次颜色区分明显，1-5次逐渐加深
  const intensityMap: Record<number, number> = {
    1: 0.55,  // 1次：55%强度，与0次明显区分
    2: 0.70,  // 2次：70%
    3: 0.80,  // 3次：80%
    4: 0.90,  // 4次：90%
    5: 1.0    // 5次：100%（完全饱和）
  }
  const intensity = intensityMap[count] || 0.55
  
  // 使用更平滑的颜色混合算法
  // 混合基础色和白色，但保持颜色的饱和度
  const r = Math.round(baseColor[0] * intensity + 255 * (1 - intensity))
  const g = Math.round(baseColor[1] * intensity + 255 * (1 - intensity))
  const b = Math.round(baseColor[2] * intensity + 255 * (1 - intensity))

  return `rgb(${r}, ${g}, ${b})`
}

