import { useState, useEffect } from 'react'
import { PurposeConfig } from '../types'
import { 
  getPurposeConfigs, 
  savePurposeConfigs, 
  addPurposeConfig, 
  updatePurposeConfig, 
  deletePurposeConfig 
} from '../utils/storage'

interface PurposeSettingsProps {
  onClose: () => void
  onUpdate: () => void
}

export default function PurposeSettings({ onClose, onUpdate }: PurposeSettingsProps) {
  const [configs, setConfigs] = useState<PurposeConfig[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newPurpose, setNewPurpose] = useState({ name: '', color: '#4A90E2' })

  useEffect(() => {
    setConfigs(getPurposeConfigs())
  }, [])

  const handleAdd = () => {
    if (!newPurpose.name.trim()) {
      alert('请输入类别名称')
      return
    }
    if (configs.some(c => c.name === newPurpose.name)) {
      alert('该类别已存在')
      return
    }
    try {
      addPurposeConfig(newPurpose)
      setConfigs(getPurposeConfigs())
      setNewPurpose({ name: '', color: '#4A90E2' })
      onUpdate()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleUpdate = (index: number, config: PurposeConfig) => {
    try {
      const oldName = configs[index].name
      updatePurposeConfig(oldName, config)
      setConfigs(getPurposeConfigs())
      setEditingIndex(null)
      onUpdate()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDelete = (index: number) => {
    const config = configs[index]
    if (configs.length <= 1) {
      alert('至少需要保留一个类别')
      return
    }
    if (!window.confirm(`确定要删除类别 "${config.name}" 吗？\n使用该类别的所有访问记录将被迁移到其他类别。`)) {
      return
    }
    try {
      deletePurposeConfig(config.name)
      setConfigs(getPurposeConfigs())
      onUpdate()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const presetColors = [
    '#4A90E2', '#1890FF', '#0050B3', '#722ED1', '#2F54EB', // 蓝色系
    '#FF6B6B', '#FF7875', '#FF4D4F', '#FF7A45', '#FA8C16', // 红色/橙色系
    '#52C41A', '#73D13D', '#389E0D', '#13C2C2', '#36CFC9', // 绿色/青色系
    '#F5222D', '#FA541C', '#FAAD14', '#A0D911', '#13C2C2', // 其他颜色
  ]

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>类别管理</h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        <div style={styles.content}>
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>现有类别</h4>
            {configs.map((config, index) => (
              <div key={index} style={styles.configItem}>
                {editingIndex === index ? (
                  <EditConfigItem
                    config={config}
                    presetColors={presetColors}
                    onSave={(newConfig) => handleUpdate(index, newConfig)}
                    onCancel={() => setEditingIndex(null)}
                  />
                ) : (
                  <ViewConfigItem
                    config={config}
                    onEdit={() => setEditingIndex(index)}
                    onDelete={() => handleDelete(index)}
                    canDelete={configs.length > 1}
                  />
                )}
              </div>
            ))}
          </div>

          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>添加新类别</h4>
            <div style={styles.addForm}>
              <input
                type="text"
                value={newPurpose.name}
                onChange={(e) => setNewPurpose({ ...newPurpose, name: e.target.value })}
                placeholder="类别名称"
                style={styles.nameInput}
              />
              <div style={styles.colorPicker}>
                <input
                  type="color"
                  value={newPurpose.color}
                  onChange={(e) => setNewPurpose({ ...newPurpose, color: e.target.value })}
                  style={styles.colorInput}
                />
                <input
                  type="text"
                  value={newPurpose.color}
                  onChange={(e) => {
                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                      setNewPurpose({ ...newPurpose, color: e.target.value })
                    }
                  }}
                  style={styles.colorTextInput}
                  placeholder="#4A90E2"
                />
              </div>
              <div style={styles.colorPresets}>
                {presetColors.map((color) => (
                  <button
                    key={color}
                    style={{
                      ...styles.colorPreset,
                      background: color,
                      border: newPurpose.color === color ? '3px solid #333' : '1px solid #ddd'
                    }}
                    onClick={() => setNewPurpose({ ...newPurpose, color })}
                    title={color}
                  />
                ))}
              </div>
              <button onClick={handleAdd} style={styles.addButton}>
                添加类别
              </button>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.closeBtn}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

function ViewConfigItem({ 
  config, 
  onEdit, 
  onDelete, 
  canDelete 
}: { 
  config: PurposeConfig
  onEdit: () => void
  onDelete: () => void
  canDelete: boolean
}) {
  return (
    <div style={styles.viewItem}>
      <div style={styles.viewItemLeft}>
        <div style={{ ...styles.colorPreview, background: config.color }} />
        <span style={styles.purposeName}>{config.name}</span>
        <span style={styles.colorCode}>{config.color}</span>
      </div>
      <div style={styles.viewItemRight}>
        <button onClick={onEdit} style={styles.editBtn}>编辑</button>
        {canDelete && (
          <button onClick={onDelete} style={styles.deleteBtn}>删除</button>
        )}
      </div>
    </div>
  )
}

function EditConfigItem({
  config,
  presetColors,
  onSave,
  onCancel
}: {
  config: PurposeConfig
  presetColors: string[]
  onSave: (config: PurposeConfig) => void
  onCancel: () => void
}) {
  const [edited, setEdited] = useState<PurposeConfig>(config)

  return (
    <div style={styles.editItem}>
      <div style={styles.editForm}>
        <input
          type="text"
          value={edited.name}
          onChange={(e) => setEdited({ ...edited, name: e.target.value })}
          style={styles.nameInput}
        />
        <div style={styles.colorPicker}>
          <input
            type="color"
            value={edited.color}
            onChange={(e) => setEdited({ ...edited, color: e.target.value })}
            style={styles.colorInput}
          />
          <input
            type="text"
            value={edited.color}
            onChange={(e) => {
              if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                setEdited({ ...edited, color: e.target.value })
              }
            }}
            style={styles.colorTextInput}
          />
        </div>
        <div style={styles.colorPresets}>
          {presetColors.map((color) => (
            <button
              key={color}
              style={{
                ...styles.colorPreset,
                background: color,
                border: edited.color === color ? '3px solid #333' : '1px solid #ddd'
              }}
              onClick={() => setEdited({ ...edited, color })}
              title={color}
            />
          ))}
        </div>
        <div style={styles.editActions}>
          <button onClick={() => onSave(edited)} style={styles.saveBtn}>保存</button>
          <button onClick={onCancel} style={styles.cancelBtn}>取消</button>
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
    minWidth: '500px',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
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
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  },
  configItem: {
    marginBottom: '12px'
  },
  viewItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#f5f5f5',
    borderRadius: '4px'
  },
  viewItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  viewItemRight: {
    display: 'flex',
    gap: '8px'
  },
  colorPreview: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: '2px solid #ddd'
  },
  purposeName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
    minWidth: '80px'
  },
  colorCode: {
    fontSize: '14px',
    color: '#666',
    fontFamily: 'monospace'
  },
  editBtn: {
    padding: '6px 12px',
    background: '#1890ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  deleteBtn: {
    padding: '6px 12px',
    background: '#ff4d4f',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  editItem: {
    padding: '12px',
    background: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  addForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  nameInput: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  colorPicker: {
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
  colorPresets: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  colorPreset: {
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    padding: 0
  },
  addButton: {
    padding: '10px 20px',
    background: '#52c41a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  editActions: {
    display: 'flex',
    gap: '8px'
  },
  saveBtn: {
    padding: '8px 16px',
    background: '#1890ff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  cancelBtn: {
    padding: '8px 16px',
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  closeBtn: {
    padding: '10px 20px',
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  }
}

