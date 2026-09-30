// components/customized-tool/Canvas-customized-tool.tsx
'use client';

import { forwardRef, useEffect, useRef, TouchEvent, MouseEvent } from 'react';
import ElementCustomizedTool from './Element-customized-tool';
import { DesignElementCustomized } from '@/app/types/design';
import { ShirtViewCustomized } from '@/app/types/design';
interface CanvasProps {
  elements: DesignElementCustomized[];
  selectedElementId: string | null;
  onSelectElement: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  dragOffset: { x: number; y: number };
  setDragOffset: (offset: { x: number; y: number }) => void;
  onCanvasSizeChange: (size: { width: number; height: number }) => void;
  view: ShirtViewCustomized;
}

const shirtImages = {
  front: '/aqua-color-t-shirt-view/Front-Facing.png',
  back: '/aqua-color-t-shirt-view/Back Facing.png',
  left: '/aqua-color-t-shirt-view/Left-Facing.png',
  right: '/aqua-color-t-shirt-view/Right Facing.png',
};

const CanvasCustomizedTool = forwardRef<HTMLDivElement, CanvasProps>(({
  elements,
  selectedElementId,
  onSelectElement,
  onUpdatePosition,
  isDragging,
  setIsDragging,
  dragOffset,
  setDragOffset,
  onCanvasSizeChange,
  view,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imageRef.current) {
      onCanvasSizeChange({
        width: imageRef.current.clientWidth,
        height: imageRef.current.clientHeight,
      });
    }
  }, [view, onCanvasSizeChange]);

  const handleMouseDown = (e: MouseEvent | TouchEvent, id: string) => {
    e.stopPropagation();
    onSelectElement(id);
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const element = elements.find(el => el.id === id);
    if (element && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = clientX - rect.left - element.x;
      const offsetY = clientY - rect.top - element.y;
      setDragOffset({ x: offsetX, y: offsetY });
    }
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !selectedElementId || !containerRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const rect = containerRef.current.getBoundingClientRect();
    let x = clientX - rect.left - dragOffset.x;
    let y = clientY - rect.top - dragOffset.y;
    
    // Constrain to canvas
    x = Math.max(0, Math.min(x, rect.width - 50));
    y = Math.max(0, Math.min(y, rect.height - 50));
    
    onUpdatePosition(selectedElementId, x, y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove as any);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove as any);
      window.addEventListener('touchend', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove as any);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove as any);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, selectedElementId]);

  return (
    <div 
      ref={containerRef}
      className="relative bg-gray-50 rounded-xl overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      <img
        ref={imageRef}
        src={shirtImages[view]}
        alt={`T-shirt ${view} view`}
        className="w-full h-auto pointer-events-none select-none"
        draggable={false}
      />
      
      <div 
        ref={ref}
        className="absolute inset-0"
      >
        {elements.map((element) => (
          <ElementCustomizedTool
            key={element.id}
            element={element}
            isSelected={selectedElementId === element.id}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            onTouchStart={(e) => handleMouseDown(e, element.id)}
          />
        ))}
      </div>
    </div>
  );
});

CanvasCustomizedTool.displayName = 'CanvasCustomizedTool';

export default CanvasCustomizedTool;