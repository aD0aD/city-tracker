import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { CityData } from '../types'
import { getCityColor } from '../utils/colors'
import { getMapProvinceName } from '../utils/provinceNameMapping'

type ViewMode = 'city' | 'province'

interface MapProps {
  cityData: CityData[]
  onCityClick?: (cityName: string) => void
  viewMode?: ViewMode
}

export default function Map({ cityData, onCityClick, viewMode = 'city' }: MapProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!chartRef.current) return
    
    // 当视图模式改变时，重置地图加载状态
    setMapLoaded(false)

    // 加载中国地图数据
    const loadMap = async () => {
      try {
        let mapData: any
        
        if (viewMode === 'province') {
          // 省级视图：直接加载省级数据
          const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
          mapData = await response.json()
          console.log('加载省级地图数据')
          // 调试：打印地图中所有省份名称
          if (mapData.features) {
            const provinceNames = mapData.features.map((f: any) => f.properties?.name || f.properties?.NAME || '未知')
            console.log('地图中的省份名称:', provinceNames)
          }
        } else {
          // 市级视图：加载所有城市数据
          const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000.json')
          mapData = await response.json()
          
          // 检查是否是省级数据（features数量少于300通常是省级）
          // 如果是省级数据，我们需要加载所有省份的城市数据并合并
          if (!mapData.features || mapData.features.length < 300) {
          console.log('检测到省级数据，开始加载所有城市数据...')
          
          // 所有省份的行政区划代码
          const provinceCodes = [
            '110000', // 北京市
            '120000', // 天津市
            '130000', // 河北省
            '140000', // 山西省
            '150000', // 内蒙古自治区
            '210000', // 辽宁省
            '220000', // 吉林省
            '230000', // 黑龙江省
            '310000', // 上海市
            '320000', // 江苏省
            '330000', // 浙江省
            '340000', // 安徽省
            '350000', // 福建省
            '360000', // 江西省
            '370000', // 山东省
            '410000', // 河南省
            '420000', // 湖北省
            '430000', // 湖南省
            '440000', // 广东省
            '450000', // 广西壮族自治区
            '460000', // 海南省
            '500000', // 重庆市
            '510000', // 四川省
            '520000', // 贵州省
            '530000', // 云南省
            '540000', // 西藏自治区
            '610000', // 陕西省
            '620000', // 甘肃省
            '630000', // 青海省
            '640000', // 宁夏回族自治区
            '650000', // 新疆维吾尔自治区
            '710000', // 台湾省
            '810000', // 香港特别行政区
            '820000'  // 澳门特别行政区
          ]
          
          // 合并所有省份的城市数据
          const allFeatures: any[] = []
          const promises = provinceCodes.map(async (code) => {
            try {
              // 对于台湾省，先尝试加载完整数据，如果失败则尝试基础数据
              let cityResponse
              if (code === '710000') {
                // 台湾省可能需要特殊处理
                try {
                  cityResponse = await fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`)
                } catch {
                  // 如果完整数据失败，尝试基础数据
                  cityResponse = await fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${code}.json`)
                }
              } else {
                cityResponse = await fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${code}_full.json`)
              }
              
              const cityData = await cityResponse.json()
              if (cityData.features && cityData.features.length > 0) {
                allFeatures.push(...cityData.features)
                console.log(`成功加载省份 ${code}，包含 ${cityData.features.length} 个区域`)
              } else if (cityData.features) {
                // 即使只有一个feature也添加（可能是省级数据）
                allFeatures.push(...cityData.features)
                console.log(`加载省份 ${code} 的基础数据`)
              }
            } catch (err) {
              console.warn(`加载省份 ${code} 的数据失败:`, err)
              // 对于台湾省，如果失败，尝试备用数据源
              if (code === '710000') {
                try {
                  const fallbackResponse = await fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${code}.json`)
                  const fallbackData = await fallbackResponse.json()
                  if (fallbackData.features && fallbackData.features.length > 0) {
                    allFeatures.push(...fallbackData.features)
                    console.log(`使用备用数据源加载台湾省成功`)
                  }
                } catch (fallbackErr) {
                  console.error(`台湾省备用数据源也失败:`, fallbackErr)
                }
              }
            }
          })
          
          await Promise.all(promises)
          
          // 创建合并后的地图数据
          mapData = {
            type: 'FeatureCollection',
            features: allFeatures,
            properties: {
              name: '中国',
              cp: [104.0, 35.0],
              childNum: allFeatures.length
            }
          }
          
          console.log(`成功加载 ${allFeatures.length} 个城市/区县的数据`)
          }
        }
        
        // 如果地图已经注册过，先注销再注册
        try {
          if (typeof (echarts as any).getMap === 'function' && (echarts as any).getMap('china')) {
            if (typeof (echarts as any).unregisterMap === 'function') {
              (echarts as any).unregisterMap('china')
            }
          }
        } catch (e) {
          // 如果注销失败，忽略错误
          console.warn('注销地图失败，继续注册新地图:', e)
        }
        echarts.registerMap('china', mapData)
        
        setMapLoaded(true)
        
        // 如果图表已经初始化，等待下一个useEffect来更新
      } catch (error) {
        console.error('加载地图数据失败:', error)
        // 如果加载失败，使用省级数据作为备用
        try {
          const fallbackResponse = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
          const fallbackData = await fallbackResponse.json()
          echarts.registerMap('china', fallbackData)
          setMapLoaded(true)
          console.warn('使用省级地图数据作为备用')
        } catch (fallbackError) {
          console.error('备用数据源也加载失败:', fallbackError)
          echarts.registerMap('china', {} as any)
          setMapLoaded(true)
        }
      }
    }

    loadMap()
  }, [viewMode])

  useEffect(() => {
    if (!chartRef.current || !mapLoaded) {
      console.log(`[地图渲染] 跳过: mapLoaded=${mapLoaded}, cityData.length=${cityData.length}, viewMode=${viewMode}`)
      return
    }

    console.log(`[地图渲染] 开始渲染: viewMode=${viewMode}, cityData.length=${cityData.length}`)
    if (viewMode === 'province') {
      console.log(`[地图渲染] 省级数据详情:`, cityData)
    }

    // 初始化图表
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    const chart = chartInstance.current

    // 创建数据映射（根据视图模式使用不同的名称映射）
    const dataMap: Record<string, CityData> = {}
    
    cityData.forEach(data => {
      if (viewMode === 'province') {
        // 省级视图：地图数据使用的是完整名称（如"北京市"、"河北省"）
        // 所以直接使用完整名称作为key
        dataMap[data.city] = data
        
        // 特殊处理：台湾省在地图数据中可能是"台湾"而不是"台湾省"
        if (data.city === '台湾省') {
          dataMap['台湾'] = data
        }
        
        // 同时保留短名称映射，以防万一
        const shortName = getMapProvinceName(data.city)
        if (shortName !== data.city) {
          dataMap[shortName] = data
        }
      } else {
        // 市级视图：直接使用城市名称
        dataMap[data.city] = data
      }
    })

    // 配置选项
    const option: echarts.EChartsOption = {
      title: {
        text: viewMode === 'city' ? '我的城市足迹（市级视图）' : '我的城市足迹（省级视图）',
        left: 'center',
        textStyle: {
          fontSize: 24,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const regionName = params.name
          // 尝试多种名称匹配
          let data = dataMap[regionName]
          if (!data && viewMode === 'province') {
            // 如果是省级视图，尝试反向查找
            // 特殊处理：台湾省在地图数据中可能是"台湾"而不是"台湾省"
            if (regionName === '台湾' || regionName === '台湾省') {
              data = dataMap['台湾省'] || dataMap['台湾']
            } else {
              for (const [, value] of Object.entries(dataMap)) {
                if (getMapProvinceName(value.city) === regionName || value.city === regionName) {
                  data = value
                  break
                }
              }
            }
          }
          if (data) {
            return `
              <div style="padding: 8px;">
                <strong>${viewMode === 'province' ? data.city : regionName}</strong><br/>
                访问次数: ${data.count}次<br/>
                目的: ${data.purpose}<br/>
                首次访问: ${data.firstVisitDate}
              </div>
            `
          }
          return `${regionName}<br/>未访问`
        }
      },
      visualMap: {
        show: false,
        min: 0,
        max: 5,
        inRange: {
          color: ['#e6e6e6', '#6495ed']
        }
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        itemStyle: {
          areaColor: '#f0f0f0',
          borderColor: '#999',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            areaColor: '#389BB7',
            borderWidth: 2
          }
        }
      },
      series: [
        {
          name: viewMode === 'city' ? '城市访问' : '省份访问',
          type: 'map',
          map: 'china',
          geoIndex: 0,
          data: cityData.length > 0
            ? (() => {
              // 省级视图里，ECharts 通过 name 与地图 feature 的 name 做 join。
              // 各数据源对省份命名可能是“全称/简称”混用（尤其台湾），因此这里同时写入多个候选名称并去重。
              const items: Array<{ name: string; value: number; itemStyle: { color: string } }> = []
              const seen = new Set<string>()

              for (const data of cityData) {
                const value = Math.min(data.count, 5)
                const color = getCityColor(data.count, data.purpose)

                if (viewMode === 'province') {
                  const candidates = new Set<string>()
                  // 全称（如：台湾省）
                  candidates.add(data.city)
                  // 简称（如：台湾）
                  candidates.add(getMapProvinceName(data.city))

                  // 额外兼容：台湾可能在地图数据里出现“台湾/台湾省”两种
                  if (data.city === '台湾省') candidates.add('台湾')
                  if (data.city === '台湾') candidates.add('台湾省')

                  for (const name of candidates) {
                    if (!name || seen.has(name)) continue
                    seen.add(name)
                    items.push({ name, value, itemStyle: { color } })
                  }
                } else {
                  // 市级视图：直接用城市名
                  if (!seen.has(data.city)) {
                    seen.add(data.city)
                    items.push({ name: data.city, value, itemStyle: { color } })
                  }
                }

                // 调试日志（保留原逻辑输出）
                if (viewMode === 'province') {
                  console.log(`[地图渲染] province视图: ${data.city}, 颜色: ${color}, 次数: ${data.count}, 目的: ${data.purpose}`)
                } else {
                  console.log(`[地图渲染] city视图: ${data.city}, 颜色: ${color}, 次数: ${data.count}, 目的: ${data.purpose}`)
                }
              }

              return items
            })()
            : [],
          emphasis: {
            itemStyle: {
              areaColor: '#389BB7'
            }
          }
        }
      ]
    }

    // 完全替换选项，确保地图正确更新
    chart.setOption(option, { notMerge: true, lazyUpdate: false })

    // 添加点击事件
    if (onCityClick) {
      chart.on('click', (params: any) => {
        if (params.name) {
          onCityClick(params.name)
        }
      })
    }

    // 响应式调整
    const handleResize = () => {
      chart.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      // 清理点击事件
      if (chartInstance.current && onCityClick) {
        chartInstance.current.off('click')
      }
    }
  }, [cityData, onCityClick, mapLoaded, viewMode])

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '600px'
      }}
    />
  )
}

