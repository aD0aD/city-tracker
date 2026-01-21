import { useState } from 'react'
import { VisitPurpose, CityVisit } from '../types'
import { saveCityVisit, getCityVisits, getPurposeConfigs } from '../utils/storage'

interface BatchImportProps {
  onImportComplete: () => void
  onCancel?: () => void
}

export default function BatchImport({ onImportComplete, onCancel }: BatchImportProps) {
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')

  // 解析导入文本
  const parseImportText = (text: string): CityVisit[] => {
    const lines = text.trim().split('\n').filter(line => line.trim())
    const visits: CityVisit[] = []
    const errors: string[] = []

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return

      // 支持多种格式：
      // 1. CSV格式：城市,目的,年月 (例如：北京市,旅行,2024-01)
      // 2. 制表符分隔：城市	目的	年月
      // 3. 空格分隔：城市 目的 年月
      const parts = trimmedLine.split(/[,\t\s]+/).map(p => p.trim()).filter(p => p)
      
      if (parts.length < 2) {
        errors.push(`第 ${index + 1} 行格式错误：需要至少包含城市和目的`)
        return
      }

      const city = parts[0]
      const purpose = parts[1] as VisitPurpose
      let date = parts[2] || ''

      // 验证目的（使用动态类别列表）
      const validPurposes = getPurposeConfigs().map(c => c.name)
      if (!validPurposes.includes(purpose)) {
        errors.push(`第 ${index + 1} 行：目的必须是以下之一：${validPurposes.join('、')}`)
        return
      }

      // 如果没有提供日期，使用当前年月
      if (!date) {
        const now = new Date()
        date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      } else {
        // 验证日期格式 YYYY-MM
        const dateRegex = /^\d{4}-\d{2}$/
        if (!dateRegex.test(date)) {
          // 尝试转换其他格式
          const dateObj = new Date(date)
          if (isNaN(dateObj.getTime())) {
            errors.push(`第 ${index + 1} 行：日期格式错误，应为 YYYY-MM (例如：2024-01)`)
            return
          }
          date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
        }
      }

      visits.push({ city, purpose, date })
    })

    if (errors.length > 0) {
      setImportError(errors.join('\n'))
      return []
    }

    return visits
  }

  const handleImport = () => {
    setImportError('')
    setImportSuccess('')

    if (!importText.trim()) {
      setImportError('请输入要导入的数据')
      return
    }

    const visits = parseImportText(importText)
    
    if (visits.length === 0 && importError) {
      return // 已经有错误信息了
    }

    // 获取现有数据，避免重复
    const existingVisits = getCityVisits()
    const existingKeys = new Set(
      existingVisits.map(v => `${v.city}-${v.purpose}-${v.date}`)
    )

    let addedCount = 0
    let skippedCount = 0

    visits.forEach(visit => {
      const key = `${visit.city}-${visit.purpose}-${visit.date}`
      if (!existingKeys.has(key)) {
        saveCityVisit(visit)
        existingKeys.add(key)
        addedCount++
      } else {
        skippedCount++
      }
    })

    if (addedCount > 0) {
      setImportSuccess(`成功导入 ${addedCount} 条记录${skippedCount > 0 ? `，跳过 ${skippedCount} 条重复记录` : ''}`)
      setImportText('')
      setTimeout(() => {
        onImportComplete()
      }, 1500)
    } else if (skippedCount > 0) {
      setImportError(`所有记录都已存在，未添加新记录`)
    } else {
      setImportError('没有有效的记录可以导入')
    }
  }

  const handleExample = () => {
    const purposes = getPurposeConfigs().map(c => c.name)
    const example = `北京市,${purposes[0] || '旅行'},2024-01
上海市,${purposes[1] || '出差'},2024-02
深圳市,${purposes[2] || '徒步'},2024-03
广州市,${purposes[0] || '旅行'},2024-01
杭州市,${purposes[1] || '出差'},2024-02`
    setImportText(example)
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>批量导入</h3>
        {onCancel && (
          <button onClick={onCancel} style={styles.closeButton}>×</button>
        )}
      </div>

      <div style={styles.instructions}>
        <p style={styles.instructionText}>
          <strong>格式说明：</strong>每行一条记录，格式为：<code>城市,目的,年月</code>
        </p>
        <p style={styles.instructionText}>
          例如：<code>北京市,旅行,2024-01</code> 或 <code>上海市 出差 2024-02</code>
        </p>
        <p style={styles.instructionText}>
          目的可选：{getPurposeConfigs().map(c => c.name).join('、')}。年月格式：YYYY-MM（如 2024-01），不填则默认为当前年月。
        </p>
        <button onClick={handleExample} style={styles.exampleButton}>
          查看示例
        </button>
      </div>

      <textarea
        value={importText}
        onChange={(e) => {
          setImportText(e.target.value)
          setImportError('')
          setImportSuccess('')
        }}
        placeholder="请输入要导入的数据，每行一条记录&#10;例如：&#10;北京市,旅行,2024-01&#10;上海市,出差,2024-02&#10;深圳市,徒步,2024-03"
        style={styles.textarea}
        rows={10}
      />

      {importError && (
        <div style={styles.error}>
          {importError.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      {importSuccess && (
        <div style={styles.success}>{importSuccess}</div>
      )}

      <div style={styles.buttonGroup}>
        <button onClick={handleImport} style={styles.importButton}>
          导入
        </button>
        {onCancel && (
          <button onClick={onCancel} style={styles.cancelButton}>
            取消
          </button>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
    padding: '0',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  instructions: {
    marginBottom: '16px',
    padding: '12px',
    background: '#f5f5f5',
    borderRadius: '4px'
  },
  instructionText: {
    margin: '4px 0',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.5'
  },
  exampleButton: {
    marginTop: '8px',
    padding: '6px 12px',
    background: '#e6f7ff',
    color: '#1890ff',
    border: '1px solid #91d5ff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'monospace',
    resize: 'vertical',
    minHeight: '150px',
    marginBottom: '12px'
  },
  error: {
    padding: '12px',
    background: '#fff2f0',
    border: '1px solid #ffccc7',
    borderRadius: '4px',
    color: '#ff4d4f',
    fontSize: '13px',
    marginBottom: '12px',
    whiteSpace: 'pre-wrap'
  },
  success: {
    padding: '12px',
    background: '#f6ffed',
    border: '1px solid #b7eb8f',
    borderRadius: '4px',
    color: '#52c41a',
    fontSize: '13px',
    marginBottom: '12px'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px'
  },
  importButton: {
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

