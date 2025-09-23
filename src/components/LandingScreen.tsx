import { Button } from "./ui/button";
import { voterPrimeLogo, heroImage } from '@/assets';

interface LandingScreenProps {
  onGetStarted: () => void;
}

export default function LandingScreen({ onGetStarted }: LandingScreenProps) {
  return (
    <div 
      className="w-full bg-white flex flex-col"
      style={{ 
        height: '100%',
        minHeight: '100vh',
        minHeight: '100dvh' // Dynamic viewport height for mobile browsers
      }}
    >
      {/* Main Content - takes available space and centers content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 min-h-0">
        <div className="text-center w-full max-w-sm">
          {/* Logo */}
          <div className="mb-6">
            <img 
              src={voterPrimeLogo} 
              alt="VoterPrime" 
              className="h-12 mx-auto"
            />
          </div>
          
          {/* Tagline */}
          <div className="mb-8">
            <p className="text-lg text-black leading-relaxed">
              Turn concern into action.
            </p>
          </div>
          
          {/* Hero Image */}
          <div className="mb-8">
            <img 
              src={heroImage} 
              alt="Hand holding a heart over a ballot box representing civic engagement" 
              className="w-64 h-64 mx-auto rounded-lg object-cover shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Button Area - fixed at bottom with proper spacing */}
      <div className="flex-shrink-0 p-6 bg-white border-t border-gray-100">
        <div className="w-full max-w-sm mx-auto">
          <Button 
            onClick={onGetStarted}
            className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-lg font-medium text-base transition-colors"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}