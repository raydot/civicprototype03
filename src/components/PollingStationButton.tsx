import { MapPin } from 'lucide-react';

interface PollingStationButtonProps {
  className?: string;
}

export default function PollingStationButton({ className = '' }: PollingStationButtonProps) {
  const handleClick = () => {
    // Demo mode - polling station button does nothing
    // In the real app, this would navigate to: https://www.michigan.gov/sos/elections/polling-locations
  };

  return (
    <button 
      onClick={handleClick}
      className={`w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 ${className}`}
    >
      <MapPin className="w-5 h-5" />
      Find My Polling Station
    </button>
  );
}