import { useDrag, useDrop } from 'react-dnd';
import { GripVertical } from 'lucide-react';
import { Input } from "../ui/input";

interface DraggablePriorityItemProps {
  index: number;
  priority: { id: string; text: string };
  onPriorityChange: (index: number, value: string) => void;
  onMoveItem: (dragIndex: number, hoverIndex: number) => void;
  isDemoFilled: boolean;
  onViewText: (text: string, title: string) => void;
}

export const DraggablePriorityItem = ({ 
  index, 
  priority, 
  onPriorityChange, 
  onMoveItem, 
  isDemoFilled,
  onViewText 
}: DraggablePriorityItemProps) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'priority',
    item: { index },
    canDrag: true, // Always allow dragging in demo
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'priority',
    hover: (item: { index: number }, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      if (item.index !== index) {
        onMoveItem(item.index, index);
        item.index = index;
      }
    },
  });

  const canDrag = true; // Always show drag handle in demo

  const handleClick = () => {
    if (isDemoFilled && priority.text.trim()) {
      onViewText(priority.text, `Priority ${index + 1}`);
    }
  };

  return (
    <div
      ref={(node) => {
        preview(node);
        drop(node);
      }}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      {canDrag && (
        <div
          ref={drag}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={16} />
        </div>
      )}
      <div className="flex-1">
        <Input
          type="text"
          value={priority.text}
          onChange={(e) => onPriorityChange(index, e.target.value)}
          onClick={handleClick}
          placeholder={`Priority ${index + 1}`}
          className={`w-full h-12 border-2 border-gray-300 rounded-md px-4 text-base bg-gray-50 text-gray-700 ${
            isDemoFilled ? 'cursor-pointer' : 'cursor-default'
          }`}
          maxLength={250}
          readOnly={isDemoFilled}
          title={isDemoFilled ? "Click to view full text" : ""}
        />
      </div>
    </div>
  );
};
