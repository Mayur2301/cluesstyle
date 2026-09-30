// components/customized-tool/Controls-customized-tool.tsx
'use client';

import { useState, useRef } from 'react';
import { DesignElementCustomized, ShirtViewCustomized } from '@/app/types/design';

interface ControlsProps {
  onAddElement: (element: DesignElementCustomized) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onBringToFront: (id: string) => void;
  selectedElement?: DesignElementCustomized;
  onUpdateElement: (id: string, updates: Partial<DesignElementCustomized>) => void;
  selectedView: ShirtViewCustomized;
}

export default function ControlsCustomizedTool({
  onAddElement,
  onDeleteElement,
  onDuplicateElement,
  onBringToFront,
  selectedElement,
  onUpdateElement,
  selectedView,
}: ControlsProps) {
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(32);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addText = () => {
    if (!textInput.trim()) return;
    
    onAddElement({
      id: Date.now().toString(),
      type: 'text',
      content: textInput,
      x: 250,
      y: 250,
      scale: 1,
      rotation: 0,
      view: selectedView,
      fontSize: fontSize,
      color: textColor,
    });
    
    setTextInput('');
  };

  const uploadLogo = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'tshirt-customized-tool');

    try {
      const response = await fetch('/api/upload-customized-tool', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        onAddElement({
          id: Date.now().toString(),
          type: 'logo',
          content: data.url,
          x: 250,
          y: 250,
          scale: 1,
          rotation: 0,
          view: selectedView,
          imageUrl: data.url,
        });
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogo(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Text Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>📝</span> Add Text
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter your text..."
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && addText()}
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-10 border rounded-lg cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Font Size</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72].map(size => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={addText}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-[1.02]"
          >
            Add Text
          </button>
        </div>
      </div>

      {/* Add Logo Section */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>🖼️</span> Add Logo
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-2 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-[1.02] disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Logo'}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Supports JPEG, PNG, WebP (Max 5MB)
        </p>
      </div>

      {/* Edit Controls */}
      {selectedElement && (
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-fadeIn">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>✏️</span> Edit Element
          </h2>
          
          <div className="space-y-4">
            {selectedElement.type === 'text' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Text Color</label>
                  <input
                    type="color"
                    value={selectedElement.color}
                    onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                    className="w-full h-10 border rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Font Size: {selectedElement.fontSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="120"
                    value={selectedElement.fontSize}
                    onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Scale: {selectedElement.scale.toFixed(1)}x</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateElement(selectedElement.id, { scale: Math.max(0.3, selectedElement.scale - 0.1) })}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                >
                  -
                </button>
                <button
                  onClick={() => onUpdateElement(selectedElement.id, { scale: Math.min(3, selectedElement.scale + 0.1) })}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Rotation: {selectedElement.rotation}°</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateElement(selectedElement.id, { rotation: selectedElement.rotation - 15 })}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                >
                  ↺ -15°
                </button>
                <button
                  onClick={() => onUpdateElement(selectedElement.id, { rotation: selectedElement.rotation + 15 })}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                >
                  ↻ +15°
                </button>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onBringToFront(selectedElement.id)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Bring to Front
              </button>
              <button
                onClick={() => onDuplicateElement(selectedElement.id)}
                className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700"
              >
                Duplicate
              </button>
              <button
                onClick={() => onDeleteElement(selectedElement.id)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <button
          onClick={() => {
            localStorage.setItem('tshirt-design-customized-tool', JSON.stringify(JSON.parse(localStorage.getItem('tshirt-design-customized-tool') || '[]')));
            alert('Design saved successfully!');
          }}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all mb-2"
        >
          💾 Save Design
        </button>
        <button
          onClick={() => {
            if (confirm('Clear all designs?')) {
              localStorage.removeItem('tshirt-design-customized-tool');
              window.location.reload();
            }
          }}
          className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-2 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all"
        >
          🗑️ Clear All
        </button>
      </div>
    </div>
  );
}