import React from 'react'

const ToolBar = ({ tools, activeTool, onSelectTool }) => {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="d-flex flex-wrap gap-2">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={`btn ${activeTool === tool.id ? 'btn-primary' : 'btn-secondary'}`}
            >
              <i className={`bi ${tool.icon} me-2`}></i>
              {tool.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ToolBar
