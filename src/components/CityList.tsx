import { useState } from 'react'
import { CityData, CityVisit } from '../types'
import { deleteCityVisit, getCityVisits } from '../utils/storage'
import EditVisitModal from './EditVisitModal'

interface CityListProps {
  cityData: CityData[]
  onUpdate: () => void
}

export default function CityList({ cityData, onUpdate }: CityListProps) {
  const visits = getCityVisits()
  const [editingVisit, setEditingVisit] = useState<{
    city: string
    date: string
    purpose: string
  } | null>(null)

  const handleDelete = (city: string, date: string) => {
    if (window.confirm(`确定要删除 ${city} 在 ${date} 的访问记录吗？`)) {
      deleteCityVisit(city, date)
      onUpdate()
    }
  }

  const handleEdit = (city: string, date: string, purpose: string) => {
    setEditingVisit({ city, date, purpose })
  }

  // 按城市分组访问记录
  const visitsByCity: Record<string, CityVisit[]> = {}
  visits.forEach(visit => {
    const key = visit.city
    if (!visitsByCity[key]) {
      visitsByCity[key] = []
    }
    visitsByCity[key].push(visit)
  })

  // 按首次访问日期排序
  const sortedCities = Object.entries(visitsByCity).sort((a, b) => {
    const aFirst = a[1].sort((x, y) => x.date.localeCompare(y.date))[0].date
    const bFirst = b[1].sort((x, y) => x.date.localeCompare(y.date))[0].date
    return bFirst.localeCompare(aFirst)
  })

  return (
    <>
      {editingVisit && (
        <EditVisitModal
          city={editingVisit.city}
          date={editingVisit.date}
          currentPurpose={editingVisit.purpose as any}
          onClose={() => setEditingVisit(null)}
          onUpdate={onUpdate}
        />
      )}
      <div style={styles.container}>
        <h3 style={styles.title}>访问记录</h3>
        <div style={styles.list}>
        {sortedCities.map(([city, cityVisits]) => {
          const cityInfo = cityData.find(c => c.city === city)
          const sortedVisits = cityVisits.sort((a, b) => b.date.localeCompare(a.date))
          
          return (
            <div key={city} style={styles.cityGroup}>
              <div style={styles.cityHeader}>
                <span style={styles.cityName}>{city}</span>
                <span style={styles.cityInfo}>
                  {cityInfo?.purpose} · {cityInfo?.count}次
                </span>
              </div>
              <div style={styles.visitsList}>
                {sortedVisits.map((visit, idx) => (
                  <div key={idx} style={styles.visitItem}>
                    <span style={styles.visitDate}>{visit.date}</span>
                    <span style={styles.visitPurpose}>{visit.purpose}</span>
                    <div style={styles.buttonGroup}>
                      <button
                        onClick={() => handleEdit(visit.city, visit.date, visit.purpose)}
                        style={styles.editButton}
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(visit.city, visit.date)}
                        style={styles.deleteButton}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        </div>
      </div>
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '20px',
    maxHeight: '600px',
    overflowY: 'auto'
  },
  title: {
    marginBottom: '16px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  cityGroup: {
    borderBottom: '1px solid #eee',
    paddingBottom: '12px'
  },
  cityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  cityName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },
  cityInfo: {
    fontSize: '14px',
    color: '#666'
  },
  visitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  visitItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 0',
    fontSize: '14px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px'
  },
  editButton: {
    padding: '4px 12px',
    background: '#1890ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  visitDate: {
    color: '#666',
    minWidth: '100px'
  },
  visitPurpose: {
    color: '#1890ff',
    minWidth: '60px'
  },
  deleteButton: {
    padding: '4px 12px',
    background: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  }
}

