import { Button } from "../ui/button";

interface DemoCalloutProps {
  isDemoFilled: boolean;
  showDemoCallout: boolean;
  onAutoFill: () => void;
}

export const DemoCallout = ({ isDemoFilled, showDemoCallout, onAutoFill }: DemoCalloutProps) => {
  if (isDemoFilled) {
    return (
      <div className="mb-8 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
        <p className="text-sm text-center text-orange-800 font-medium">
          Demo data loaded - click any field to view full text
        </p>
      </div>
    );
  }

  if (!showDemoCallout) {
    return null;
  }

  return (
    <div className="mb-8 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
      <div className="text-center">
        <p className="text-sm text-orange-800 font-medium mb-3">
          This is a demo! Click below to auto-fill with sample data
        </p>
        <Button 
          onClick={onAutoFill}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium"
        >
          Fill Demo Data
        </Button>
      </div>
    </div>
  );
};
