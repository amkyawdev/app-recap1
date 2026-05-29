import React, { useState, useEffect } from 'react'

const SubtitleStyleEditor = ({ subtitle, onUpdate, onClose }) => {
  const [style, setStyle] = useState(subtitle.style || {
    fontSize: 24,
    fontColor: '#FFFFFF',
    fontFamily: 'Arial',
    fontWeight: 'normal',
    backgroundColor: 'rgba(0,0,0,0.7)',
    textAlign: 'center',
    padding: '8px'
  })

  const fontSizes = [16, 18, 20, 22, 24, 28, 32, 36, 40]
  const fontColors = ['#FFFFFF', '#FFFF00', '#FF0000', '#00FF00', '#00FFFF', '#FF00FF', '#000000']
  const bgColors = [
    { name: 'Black', value: 'rgba(0,0,0,0.8)' },
    { name: 'White', value: 'rgba(255,255,255,0.8)' },
    { name: 'Red', value: 'rgba(255,0,0,0.7)' },
    { name: 'Blue', value: 'rgba(0,0,255,0.7)' },
    { name: 'Green', value: 'rgba(0,128,0,0.7)' },
    { name: 'Yellow', value: 'rgba(255,255,0,0.7)' },
    { name: 'None', value: 'transparent' }
  ]

  const handleSave = () => {
    onUpdate(subtitle.id, { style })
    onClose()
  }

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.8)', zIndex: 9999 }}>
      <div className="card shadow-lg" style={{ maxWidth: '400px', width: '90%' }}>
        <div className="card-header d-flex justify-content-between align-items-center bg-dark">
          <h5 className="mb-0 text-white">
            <i className="bi bi-palette me-2"></i>Subtitle Style
          </h5>
          <button onClick={onClose} className="btn btn-sm btn-outline-light">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="card-body bg-dark">
          {/* Font Size */}
          <div className="mb-3">
            <label className="form-label text-muted small">Font Size</label>
            <div className="d-flex flex-wrap gap-2">
              {fontSizes.map(size => (
                <button key={size} onClick={() => setStyle({ ...style, fontSize: size })} 
                  className={`btn btn-sm ${style.fontSize === size ? 'btn-primary' : 'btn-outline-secondary'}`}>
                  {size}px
                </button>
              ))}
            </div>
          </div>

          {/* Font Color */}
          <div className="mb-3">
            <label className="form-label text-muted small">Font Color</label>
            <div className="d-flex flex-wrap gap-2">
              {fontColors.map(color => (
                <button key={color} onClick={() => setStyle({ ...style, fontColor: color })}
                  className="btn btn-sm p-2" style={{ backgroundColor: color, border: style.fontColor === color ? '3px solid #DC2626' : '1px solid #555' }}>
                </button>
              ))}
              <input type="color" value={style.fontColor} onChange={(e) => setStyle({ ...style, fontColor: e.target.value })} className="form-control form-control-sm w-auto" />
            </div>
          </div>

          {/* Font Weight */}
          <div className="mb-3">
            <label className="form-label text-muted small">Font Style</label>
            <div className="d-flex flex-wrap gap-2">
              <button onClick={() => setStyle({ ...style, fontWeight: 'normal' })} 
                className={`btn btn-sm ${style.fontWeight === 'normal' ? 'btn-primary' : 'btn-outline-secondary'}`}>
                Normal
              </button>
              <button onClick={() => setStyle({ ...style, fontWeight: 'bold' })} 
                className={`btn btn-sm ${style.fontWeight === 'bold' ? 'btn-primary' : 'btn-outline-secondary'}`}>
                Bold
              </button>
              <button onClick={() => setStyle({ ...style, fontStyle: 'italic' })} 
                className={`btn btn-sm ${style.fontStyle === 'italic' ? 'btn-primary' : 'btn-outline-secondary'}`}>
                Italic
              </button>
            </div>
          </div>

          {/* Background Color */}
          <div className="mb-3">
            <label className="form-label text-muted small">Background</label>
            <div className="d-flex flex-wrap gap-2">
              {bgColors.map(bg => (
                <button key={bg.name} onClick={() => setStyle({ ...style, backgroundColor: bg.value })}
                  className={`btn btn-sm ${style.backgroundColor === bg.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={bg.value !== 'transparent' ? { backgroundColor: bg.value, color: bg.name === 'White' ? 'black' : 'white' } : {}}>
                  {bg.name}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-3 p-3 bg-black rounded-3 text-center">
            <span style={{
              fontSize: style.fontSize + 'px',
              color: style.fontColor,
              fontWeight: style.fontWeight,
              fontStyle: style.fontStyle,
              backgroundColor: style.backgroundColor,
              padding: style.padding,
              textAlign: style.textAlign,
              borderRadius: '4px'
            }}>
              {subtitle.text}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <button onClick={handleSave} className="btn btn-primary flex-grow-1">
              <i className="bi bi-check-lg me-2"></i>Apply Style
            </button>
            <button onClick={onClose} className="btn btn-outline-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubtitleStyleEditor
