// components/customized-tool/Element-customized-tool.tsx
'use client';

import { DesignElementCustomized } from '@/app/types/design';

interface ElementProps {
  element: DesignElementCustomized;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
}

export default function ElementCustomizedTool({
  element,
  isSelected,
  onMouseDown,
  onTouchStart,
}: ElementProps) {
  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`absolute cursor-move select-none transition-shadow ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : ''
      }`}
      style={{
        transform: `translate(${element.x}px, ${element.y}px) scale(${element.scale}) rotate(${element.rotation}deg)`,
        transformOrigin: '0 0',
      }}
    >
      {element.type === 'text' ? (
        <div
          style={{
            fontSize: `${element.fontSize}px`,
            color: element.color,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textShadow: isSelected ? '0 0 8px rgba(59,130,246,0.3)' : 'none',
          }}
          className="hover:opacity-90 transition-opacity"
        >
          {element.content}
        </div>
      ) : (
        <img
          src={element.imageUrl}
          alt="Logo"
          className="max-w-full h-auto"
          style={{ maxWidth: '200px', maxHeight: '200px' }}
          draggable={false}
        />
      )}
      
      {isSelected && (
        <>
          <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-500 rounded-full" />
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-blue-500 rounded-full" />
          <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize" />
        </>
      )}
    </div>
  );
}