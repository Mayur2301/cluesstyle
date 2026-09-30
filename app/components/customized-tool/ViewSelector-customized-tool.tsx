// components/customized-tool/ViewSelector-customized-tool.tsx
'use client';

// import { ShirtViewCustomized } from '../../customized-your-t-shirt/customized-t-shirt';
import { ShirtViewCustomized } from '@/app/types/design';
interface ViewSelectorProps {
  selectedView: ShirtViewCustomized;
  onViewChange: (view: ShirtViewCustomized) => void;
}

export default function ViewSelectorCustomizedTool({
  selectedView,
  onViewChange,
}: ViewSelectorProps) {
  const views: { id: ShirtViewCustomized; label: string; icon: string }[] = [
    { id: 'front', label: 'Front', icon: '👕' },
    { id: 'back', label: 'Back', icon: '👚' },
    { id: 'left', label: 'Left Side', icon: '⬅️' },
    { id: 'right', label: 'Right Side', icon: '➡️' },
  ];

  return (
    <div className="mb-6">
      <div className="flex gap-3 flex-wrap">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
              selectedView === view.id
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{view.icon}</span>
            {view.label}
          </button>
        ))}
      </div>
    </div>
  );
}