import { useState, useEffect } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';

interface EmailDraftScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToRecommendations: () => void;
  onNavToSaveShare: () => void;
}

export default function EmailDraftScreen({ 
  onBack,
  onNavToConcerns,
  onNavToRecommendations,
  onNavToSaveShare
}: EmailDraftScreenProps) {
  const [emailSubject, setEmailSubject] = useState("Support for Education Affordability and Environmental Action");
  const [emailMessage, setEmailMessage] = useState(`Dear Representative Dingell,

As a college student in Ann Arbor, I'm deeply concerned about the rising costs of higher education and the urgent need to protect our environment. I appreciate your past support on these issues and encourage you to keep fighting for accessible education and meaningful climate legislation.

Please continue advocating for reduced tuition, student loan reform, and increased support for renewable energy policies. These priorities matter to young people like me.

Thank you for your leadership.

Sincerely,

[Your Name]`);
  const [showMockEmail, setShowMockEmail] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleOpenEmailClient = () => {
    setShowMockEmail(true);
  };

  const handleSendEmail = () => {
    setShowConfetti(true);
    // Hide confetti and close mock email after 2 seconds
    setTimeout(() => {
      setShowConfetti(false);
      setShowMockEmail(false);
    }, 2000);
  };

  // Confetti component
  const ConfettiDisplay = () => {
    useEffect(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.zIndex = '9999';
      canvas.style.pointerEvents = 'none';
      document.body.appendChild(canvas);

      const confetti: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        color: string;
        size: number;
        rotation: number;
        rotationSpeed: number;
      }> = [];

      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];

      // Create confetti particles
      for (let i = 0; i < 100; i++) {
        confetti.push({
          x: Math.random() * canvas.width,
          y: -10,
          vx: (Math.random() - 0.5) * 6,
          vy: Math.random() * 3 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 4,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = confetti.length - 1; i >= 0; i--) {
          const c = confetti[i];
          
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.rotate((c.rotation * Math.PI) / 180);
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
          ctx.restore();

          c.x += c.vx;
          c.y += c.vy;
          c.vy += 0.1; // gravity
          c.rotation += c.rotationSpeed;

          if (c.y > canvas.height + 10) {
            confetti.splice(i, 1);
          }
        }

        if (confetti.length > 0) {
          requestAnimationFrame(animate);
        } else {
          document.body.removeChild(canvas);
        }
      };

      animate();

      return () => {
        if (document.body.contains(canvas)) {
          document.body.removeChild(canvas);
        }
      };
    }, []);

    return null;
  };

  if (showMockEmail) {
    return (
      <div 
        className="h-full bg-white flex flex-col cursor-pointer relative"
        onClick={() => setShowMockEmail(false)}
      >
        {/* Dismissal hint */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/70 text-white text-xs px-3 py-1 rounded-full">
            Tap anywhere to close
          </div>
        </div>
        
        {/* Mock iPhone Email Header */}
        <div className="px-4 py-3 bg-blue-500">
          <div className="flex items-center justify-between">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMockEmail(false);
              }}
              className="text-white text-base"
            >
              Cancel
            </button>
            <h3 className="text-white font-medium">New Message</h3>
            <div className="w-16"></div>
          </div>
        </div>

        {/* Mock Email Fields */}
        <div className="bg-white">
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-gray-600 text-base w-12">To:</span>
              <span className="text-blue-600 text-base ml-2">debbie.dingell@mail.house.gov</span>
            </div>
          </div>
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-gray-600 text-base w-12">From:</span>
              <span className="text-gray-900 text-base ml-2">your.email@example.com</span>
            </div>
          </div>
          <div className="px-4 py-2 border-b border-gray-200">
            <div className="flex items-start">
              <span className="text-gray-600 text-base w-12 pt-0.5">Subject:</span>
              <span className="text-gray-900 text-base ml-2 flex-1">{emailSubject}</span>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="flex-1 bg-white p-4">
          <div className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
            {emailMessage}
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="bg-white p-4 border-t border-gray-200">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleSendEmail();
            }}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg text-base font-medium"
          >
            Send Now
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMockEmail(false);
            }}
            className="w-full mt-2 text-gray-600 py-2 text-base"
          >
            Save Draft
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {showConfetti && <ConfettiDisplay />}
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2>Email Draft</h2>
          </div>
          <HamburgerMenu 
            onNavToConcerns={onNavToConcerns}
            onNavToRecommendations={onNavToRecommendations}
            onNavToSaveShare={onNavToSaveShare}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {/* Representative Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <h3>Representative Debbie Dingell</h3>
              <p className="text-sm text-gray-600">U.S. Representative • debbie.dingell@mail.house.gov</p>
            </div>
          </div>
        </div>

        {/* Subject Field */}
        <div className="mb-4">
          <label className="block text-sm mb-2">Subject</label>
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg bg-input-background"
          />
        </div>

        {/* Message Field */}
        <div className="mb-6">
          <label className="block text-sm mb-2">Message</label>
          <textarea
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            rows={12}
            className="w-full p-3 border border-gray-200 rounded-lg bg-input-background resize-none"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleOpenEmailClient}
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <Mail className="w-5 h-5" />
          Open In Email Client
        </button>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            💡 <strong>Pro tip:</strong> Add your personal story or local examples to make your message more impactful.
          </p>
        </div>
      </div>
    </div>
  );
}