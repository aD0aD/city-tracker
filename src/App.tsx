import { useState, useEffect } from 'react'
import Map from './components/Map'
import CityForm from './components/CityForm'
import CityList from './components/CityList'
import BatchImport from './components/BatchImport'
import Legend from './components/Legend'
import PurposeSettings from './components/PurposeSettings'
import { CityData, VisitPurpose } from './types'
import { getCityData, getProvinceData, saveCityVisit } from './utils/storage'
import './App.css'

type ViewMode = 'city' | 'province'

function App() {
  const [cityData, setCityData] = useState<CityData[]>([])
  const [provinceData, setProvinceData] = useState<CityData[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('city')
  const [showForm, setShowForm] = useState(false)
  const [showBatchImport, setShowBatchImport] = useState(false)
  const [showPurposeSettings, setShowPurposeSettings] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string>('')

  useEffect(() => {
    updateCityData()
  }, [])

  const updateCityData = () => {
    const city = getCityData()
    const province = getProvinceData()
    console.log('更新数据: 城市数据', city.length, '条, 省份数据', province.length, '条')
    if (province.length > 0) {
      console.log('省份数据详情:', province)
    }
    setCityData(city)
    setProvinceData(province)
  }

  const handleAddCity = (city: string, purpose: VisitPurpose, date: string) => {
    saveCityVisit({ city, purpose, date })
    updateCityData()
    setShowForm(false)
    setSelectedCity('')
  }

  const handleCityClick = (cityName: string) => {
    // 点击地图上的城市时，可以快速添加
    setSelectedCity(cityName)
    setShowForm(true)
  }

  return (
    <div className="app">
      <div className="header">
        <h1>我的城市足迹</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className="view-switcher">
            <button
              className={`view-button ${viewMode === 'city' ? 'active' : ''}`}
              onClick={() => setViewMode('city')}
            >
              🏙️ 市级视图
            </button>
            <button
              className={`view-button ${viewMode === 'province' ? 'active' : ''}`}
              onClick={() => setViewMode('province')}
            >
              🗺️ 省级视图
            </button>
          </div>
          <button 
            className="add-button"
            onClick={() => {
              setShowForm(!showForm)
              setShowBatchImport(false)
            }}
          >
            {showForm ? '取消添加' : '+ 添加城市'}
          </button>
          <button 
            className="batch-import-button"
            onClick={() => {
              setShowBatchImport(!showBatchImport)
              setShowForm(false)
            }}
          >
            {showBatchImport ? '取消导入' : '📥 批量导入'}
          </button>
          <button 
            className="settings-button"
            onClick={() => {
              setShowPurposeSettings(!showPurposeSettings)
              setShowForm(false)
              setShowBatchImport(false)
            }}
            style={{
              padding: '8px 16px',
              background: '#722ED1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {showPurposeSettings ? '关闭设置' : '⚙️ 类别设置'}
          </button>
        </div>
      </div>

      {showPurposeSettings && (
        <PurposeSettings
          onClose={() => setShowPurposeSettings(false)}
          onUpdate={updateCityData}
        />
      )}

      {showForm && (
        <div className="form-container">
          <CityForm 
            onSubmit={handleAddCity}
            onCancel={() => {
              setShowForm(false)
              setSelectedCity('')
            }}
            initialCity={selectedCity}
          />
        </div>
      )}

      {showBatchImport && (
        <div className="form-container">
          <BatchImport
            onImportComplete={() => {
              updateCityData()
              setShowBatchImport(false)
            }}
            onCancel={() => setShowBatchImport(false)}
          />
        </div>
      )}

      <Legend />

      <div className="main-content">
        <div className="map-container">
          <Map 
            key={`${viewMode}-${viewMode === 'city' ? cityData.length : provinceData.length}`}
            cityData={viewMode === 'city' ? cityData : provinceData} 
            onCityClick={handleCityClick}
            viewMode={viewMode}
          />
        </div>
        <div className="list-container">
          <CityList cityData={viewMode === 'city' ? cityData : provinceData} onUpdate={updateCityData} />
        </div>
      </div>
    </div>
  )
}

export default App

