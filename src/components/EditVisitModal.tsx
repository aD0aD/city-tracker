import { useState, useEffect } from 'react'
import { VisitPurpose } from '../types'
import { updateCityVisit, getPurposeConfigs } from '../utils/storage'

interface EditVisitModalProps {
  city: string
  date: string
  currentPurpose: VisitPurpose
  onClose: () => void
  onUpdate: () => void
}

export default function EditVisitModal({
  city,
  date,
  currentPurpose,
  onClose,
  onUpdate
}: EditVisitModalProps) {
  const [purpose, setPurpose] = useState<VisitPurpose>(currentPurpose)
  const [purposes, setPurposes] = useState<string[]>([])

  useEffect(() => {
    const configs = getPurposeConfigs()
    setPurposes(configs.map(c => c.name))
  }, [])

  const configs = getPurposeConfigs()
  const currentConfig = configs.find(c => c.name === purpose) || configs[0]
  const currentColor = currentConfig?.color || '#4A90E2'

  const handleSave = () => {
    if (purpose !== currentPurpose) {
      updateCityVisit(city, date, purpose)
    }
    onUpdate()
    onClose()
  }


  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>编辑访问记录</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        <div style={styles.content}>
          <div style={styles.formGroup}>
            <label style={styles.label}>城市：</label>
            <div style={styles.cityName}>{city}</div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>日期：</label>
            <div style={styles.date}>{date}</div>
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
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            取消
          </button>
          <button onClick={handleSave} style={styles.saveButton}>
            保存
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    borderRadius: '8px',
    padding: '24px',
    minWidth: '400px',
    maxWidth: '500px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#999',
    padding: 0,
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1
  },
  content: {
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px'
  },
  cityName: {
    padding: '10px',
    background: '#f5f5f5',
    borderRadius: '4px',
    color: '#666'
  },
  date: {
    padding: '10px',
    background: '#f5f5f5',
    borderRadius: '4px',
    color: '#666'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    background: 'white'
  },
  colorSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative'
  },
  colorPreview: {
    width: '40px',
    height: '40px',
    borderRadius: '4px',
    border: '2px solid #ddd',
    cursor: 'pointer',
    flexShrink: 0
  },
  colorValue: {
    fontSize: '14px',
    color: '#666',
    fontFamily: 'monospace'
  },
  colorPicker: {
    position: 'absolute',
    top: '50px',
    left: 0,
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1001,
    minWidth: '300px'
  },
  colorPresets: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },
  colorOption: {
    width: '40px',
    height: '40px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    padding: 0
  },
  colorInputGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  colorInput: {
    width: '60px',
    height: '40px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: 0
  },
  colorTextInput: {
    flex: 1,
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'monospace'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  saveButton: {
    padding: '10px 20px',
    background: '#1890ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
}

