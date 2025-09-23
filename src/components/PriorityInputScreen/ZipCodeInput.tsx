import { Input } from "../ui/input";
import zipCodePrefixes from "../../data/zipCodePrefixes.json";

interface ZipCodeInputProps {
  zipCode: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClick: () => void;
  isDemoFilled: boolean;
}

// ZIP code to location mapping using 3-digit prefixes
const getLocationForZip = (zip: string): string | null => {
  if (zip.length === 0) return null;
  
  // Try 3-digit prefix first
  if (zip.length >= 3) {
    const prefix = zip.substring(0, 3);
    const location = zipCodePrefixes[prefix as keyof typeof zipCodePrefixes];
    if (location) return location;
  }
  
  // Fallback to first digit for partial entries
  const firstDigit = zip[0];
  const fallbackMap: { [key: string]: string } = {
    '0': 'Boston, MA',
    '1': 'New York, NY', 
    '2': 'Philadelphia, PA',
    '3': 'Atlanta, GA',
    '4': 'Wall, South Dakota',
    '5': 'Dallas, TX',
    '6': 'Chicago, IL',
    '7': 'Kansas City, MO',
    '8': 'Denver, CO',
    '9': 'Los Angeles, CA'
  };
  
  return fallbackMap[firstDigit] || null;
};

export const ZipCodeInput = ({ zipCode, onChange, onClick, isDemoFilled }: ZipCodeInputProps) => {
  const location = getLocationForZip(zipCode);
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <label className="text-base font-medium text-black">Enter ZIP Code</label>
        <div className="relative">
          <Input
            type="text"
            value={zipCode}
            onChange={onChange}
            onClick={onClick}
            placeholder="#####"
            className={`w-20 h-10 border-2 border-gray-300 rounded-md px-3 text-center text-base bg-gray-50 text-gray-700 ${
              isDemoFilled ? 'cursor-pointer' : 'cursor-default'
            }`}
            maxLength={5}
            readOnly={isDemoFilled}
            title={isDemoFilled ? "Click to view full text" : ""}
          />
        </div>
      </div>
      {location && (
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-600">{location}</p>
        </div>
      )}
    </div>
  );
};
