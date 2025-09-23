import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggablePriorityItem } from './DraggablePriorityItem';

interface Priority {
  id: string;
  text: string;
}

interface PriorityListProps {
  priorities: Priority[];
  onPriorityChange: (index: number, value: string) => void;
  onMoveItem: (dragIndex: number, hoverIndex: number) => void;
  isDemoFilled: boolean;
  onViewText: (text: string, title: string) => void;
}

export const PriorityList = ({ 
  priorities, 
  onPriorityChange, 
  onMoveItem, 
  isDemoFilled, 
  onViewText 
}: PriorityListProps) => {
  return (
    <div className="mb-6">
      <div className="space-y-4">
        <DndProvider backend={HTML5Backend}>
          {priorities.map((priority, index) => (
            <DraggablePriorityItem
              key={priority.id}
              index={index}
              priority={priority}
              onPriorityChange={onPriorityChange}
              onMoveItem={onMoveItem}
              isDemoFilled={isDemoFilled}
              onViewText={onViewText}
            />
          ))}
        </DndProvider>
      </div>
    </div>
  );
};
