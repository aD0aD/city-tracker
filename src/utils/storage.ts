import { CityVisit, CityData, PurposeConfig } from '../types'
import { getProvinceByCity } from './provinceMapping'

const STORAGE_KEY = 'city_visits'
const COLOR_CONFIG_KEY = 'purpose_colors'
const PURPOSE_CONFIG_KEY = 'purpose_configs' // 存储类别配置（名称和颜色）

// 将旧格式的日期（YYYY-MM-DD）转换为新格式（YYYY-MM）
function normalizeDate(date: string): string {
  if (date.match(/^\d{4}-\d{2}$/)) {
    // 已经是 YYYY-MM 格式
    return date
  }
  // 如果是 YYYY-MM-DD 格式，转换为 YYYY-MM
  if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date.substring(0, 7)
  }
  // 尝试解析其他格式
  const dateObj = new Date(date)
  if (!isNaN(dateObj.getTime())) {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
  }
  return date
}

// 迁移旧数据格式
function migrateData(): void {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return

  try {
    const visits: CityVisit[] = JSON.parse(data)
    let needsMigration = false

    const migratedVisits = visits.map(visit => {
      const normalizedDate = normalizeDate(visit.date)
      if (normalizedDate !== visit.date) {
        needsMigration = true
        return { ...visit, date: normalizedDate }
      }
      return visit
    })

    if (needsMigration) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedVisits))
      console.log('数据格式已迁移：日期从 YYYY-MM-DD 转换为 YYYY-MM')
    }
  } catch (error) {
    console.error('数据迁移失败:', error)
  }
}

// 初始化时执行数据迁移
if (typeof window !== 'undefined') {
  migrateData()
}

export function getCityVisits(): CityVisit[] {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []
  
  try {
    const visits: CityVisit[] = JSON.parse(data)
    // 确保所有日期都是 YYYY-MM 格式
    return visits.map(visit => ({
      ...visit,
      date: normalizeDate(visit.date)
    }))
  } catch (error) {
    console.error('读取数据失败:', error)
    return []
  }
}

export function saveCityVisit(visit: CityVisit): void {
  const visits = getCityVisits()
  // 确保日期格式正确
  const normalizedVisit = {
    ...visit,
    date: normalizeDate(visit.date)
  }
  visits.push(normalizedVisit)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits))
}

export function getCityData(): CityData[] {
  const visits = getCityVisits()
  const cityMap: Record<string, CityData> = {}

  visits.forEach(visit => {
    const existing = cityMap[visit.city]
    if (existing) {
      existing.count++
    } else {
      cityMap[visit.city] = {
        city: visit.city,
        purpose: visit.purpose,
        count: 1,
        firstVisitDate: visit.date
      }
    }
  })

  return Object.values(cityMap)
}

export function deleteCityVisit(city: string, date: string): void {
  const visits = getCityVisits()
  const filtered = visits.filter(v => !(v.city === city && v.date === date))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

// 更新访问记录的目的
export function updateCityVisit(city: string, date: string, newPurpose: VisitPurpose): void {
  const visits = getCityVisits()
  const updated = visits.map(v => {
    if (v.city === city && v.date === date) {
      return { ...v, purpose: newPurpose }
    }
    return v
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

// 获取默认类别配置
function getDefaultPurposeConfigs(): PurposeConfig[] {
  return [
    { name: '出差', color: '#4A90E2' },
    { name: '旅行', color: '#FF6B6B' },
    { name: '徒步', color: '#52C41A' }
  ]
}

// 获取类别配置列表
export function getPurposeConfigs(): PurposeConfig[] {
  const saved = localStorage.getItem(PURPOSE_CONFIG_KEY)
  if (saved) {
    try {
      const configs = JSON.parse(saved)
      if (Array.isArray(configs) && configs.length > 0) {
        return configs
      }
    } catch {
      // 如果解析失败，使用默认值
    }
  }
  // 如果没有保存的配置，初始化默认配置
  const defaults = getDefaultPurposeConfigs()
  savePurposeConfigs(defaults)
  return defaults
}

// 保存类别配置列表
export function savePurposeConfigs(configs: PurposeConfig[]): void {
  localStorage.setItem(PURPOSE_CONFIG_KEY, JSON.stringify(configs))
  // 同时更新颜色配置（向后兼容）
  const colorMap: Record<string, string> = {}
  configs.forEach(config => {
    colorMap[config.name] = config.color
  })
  localStorage.setItem(COLOR_CONFIG_KEY, JSON.stringify(colorMap))
}

// 添加新类别
export function addPurposeConfig(config: PurposeConfig): void {
  const configs = getPurposeConfigs()
  // 检查是否已存在同名类别
  if (configs.some(c => c.name === config.name)) {
    throw new Error(`类别 "${config.name}" 已存在`)
  }
  configs.push(config)
  savePurposeConfigs(configs)
}

// 更新类别配置
export function updatePurposeConfig(oldName: string, newConfig: PurposeConfig): void {
  const configs = getPurposeConfigs()
  const index = configs.findIndex(c => c.name === oldName)
  if (index === -1) {
    throw new Error(`类别 "${oldName}" 不存在`)
  }
  
  // 如果名称改变了，需要更新所有使用该类别的访问记录
  if (oldName !== newConfig.name) {
    const visits = getCityVisits()
    const updatedVisits = visits.map(visit => {
      if (visit.purpose === oldName) {
        return { ...visit, purpose: newConfig.name }
      }
      return visit
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVisits))
  }
  
  configs[index] = newConfig
  savePurposeConfigs(configs)
}

// 删除类别
export function deletePurposeConfig(purposeName: string, migrateTo?: string): void {
  const configs = getPurposeConfigs()
  if (configs.length <= 1) {
    throw new Error('至少需要保留一个类别')
  }
  
  // 迁移使用该类别的访问记录
  const visits = getCityVisits()
  const targetPurpose = migrateTo || configs.find(c => c.name !== purposeName)?.name || configs[0].name
  const updatedVisits = visits.map(visit => {
    if (visit.purpose === purposeName) {
      return { ...visit, purpose: targetPurpose }
    }
    return visit
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVisits))
  
  // 删除类别配置
  const filtered = configs.filter(c => c.name !== purposeName)
  savePurposeConfigs(filtered)
}

// 获取自定义颜色配置（向后兼容）
export function getPurposeColors(): Record<string, string> {
  const configs = getPurposeConfigs()
  const colorMap: Record<string, string> = {}
  configs.forEach(config => {
    colorMap[config.name] = config.color
  })
  return colorMap
}

// 保存自定义颜色配置（向后兼容）
export function savePurposeColor(purpose: VisitPurpose, color: string): void {
  const configs = getPurposeConfigs()
  const index = configs.findIndex(c => c.name === purpose)
  if (index !== -1) {
    configs[index].color = color
    savePurposeConfigs(configs)
  }
}

// 获取省级数据
export function getProvinceData(): CityData[] {
  const visits = getCityVisits()
  const provinceMap: Record<string, CityData> = {}

  // 所有省份名称列表（用于判断城市名称是否本身就是省份）
  const provinceNames = [
    '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
    '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省',
    '浙江省', '安徽省', '福建省', '江西省', '山东省',
    '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区',
    '海南省', '重庆市', '四川省', '贵州省', '云南省',
    '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区',
    '新疆维吾尔自治区', '台湾省', '香港特别行政区', '澳门特别行政区'
  ]

  visits.forEach(visit => {
    // 如果城市名称本身就是省份名称，直接使用
    let province: string | null = null
    if (provinceNames.includes(visit.city)) {
      province = visit.city
    } else {
      province = getProvinceByCity(visit.city)
    }
    
    if (!province) {
      console.warn(`无法确定城市 "${visit.city}" 所属的省份`)
      return // 如果无法确定省份，跳过
    }

    const existing = provinceMap[province]
    if (existing) {
      // 如果该省份已经有记录，增加访问次数（保留第一次访问的目的）
      existing.count++
    } else {
      // 新省份，记录第一次访问的目的
      provinceMap[province] = {
        city: province, // 使用省份名称作为city字段
        purpose: visit.purpose,
        count: 1,
        firstVisitDate: visit.date
      }
    }
  })

  const result = Object.values(provinceMap)
  console.log('生成的省级数据:', result)
  return result
}

