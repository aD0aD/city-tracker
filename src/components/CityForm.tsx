import React, { useState, useEffect } from 'react'
import { VisitPurpose } from '../types'
import { getPurposeConfigs } from '../utils/storage'

interface CityFormProps {
  onSubmit: (city: string, purpose: VisitPurpose, date: string) => void
  onCancel?: () => void
  initialCity?: string
}

export default function CityForm({ onSubmit, onCancel, initialCity = '' }: CityFormProps) {
  const [city, setCity] = useState(initialCity)
  const [purposes, setPurposes] = useState<string[]>([])
  const [purpose, setPurpose] = useState<VisitPurpose>('')
  
  useEffect(() => {
    const configs = getPurposeConfigs()
    const purposeNames = configs.map(c => c.name)
    setPurposes(purposeNames)
    if (purposeNames.length > 0 && !purpose) {
      setPurpose(purposeNames[0])
    }
  }, [])
  // 日期格式改为 YYYY-MM（年月）
  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
  const [date, setDate] = useState(getCurrentMonth())

  useEffect(() => {
    setCity(initialCity)
  }, [initialCity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSubmit(city.trim(), purpose, date)
      setCity('')
      const configs = getPurposeConfigs()
      if (configs.length > 0) {
        setPurpose(configs[0].name)
      }
      setDate(getCurrentMonth())
    }
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formGroup}>
        <label style={styles.label}>城市名称：</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="例如：北京、上海、深圳"
          style={styles.input}
          required
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>访问目的：</label>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value as VisitPurpose)}
          style={styles.select}
        >
          {purposes.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>访问年月：</label>
        <input
          type="month"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={styles.input}
          required
        />
      </div>
      <div style={styles.buttonGroup}>
        <button type="submit" style={styles.submitButton}>
          添加
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={styles.cancelButton}>
            取消
          </button>
        )}
      </div>
    </form>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    background: 'white'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    background: '#1890ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer'
  }
}

