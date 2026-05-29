import React from 'react'

const ToolBar = ({ tools, activeTool, onSelectTool }) => {
  return (
    <div className="bg-gray-dark rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              activeTool === tool.id 
                ? 'bg-red-custom text-white' 
                : 'bg-gray-custom text-gray-light hover:bg-gray-custom/80'
            }`}
          >
            <span>{tool.icon}</span>
            <span>{tool.name}</span>
          </button>
        ))}
      </div>
      
      {/* Tool Options */}
      {activeTool === 'trim' && (
        <div className="mt-4 p-4 bg-gray-custom/50 rounded-lg">
          <p className="text-gray-light text-sm">Use trim controls below video to set start/end points</p>
        </div>
      )}
      
      {activeTool === 'speed' && (
        <div className="mt-4 p-4 bg-gray-custom/50 rounded-lg">
          <p className="text-gray-light text-sm">Adjust playback speed using the speed buttons below video</p>
        </div>
      )}
      
      {activeTool === 'volume' && (
        <div className="mt-4 p-4 bg-gray-custom/50 rounded-lg">
          <p className="text-gray-light text-sm">Use the volume slider to adjust audio level</p>
        </div>
      )}
      
      {activeTool === 'export' && (
        <div className="mt-4 p-4 bg-gray-custom/50 rounded-lg">
          <p className="text-gray-light text-sm">Click the Export button to download your edited video</p>
        </div>
      )}
    </div>
  )
}

export default ToolBar
