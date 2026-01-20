import React, { useState } from 'react';
import CategoryDetailScreen from './CategoryDetailScreen';

/**
 * Test page for CategoryDetailScreen component
 * Shows live educational resources from the API
 */
export default function CategoryDetailTestPage() {
  const [categoryId, setCategoryId] = useState<number>(1);
  const [showDetail, setShowDetail] = useState(false);

  // Mock navigation handlers
  const handleBack = () => setShowDetail(false);
  const handleNavToConcerns = () => console.log('Navigate to concerns');
  const handleNavToRecommendations = () => console.log('Navigate to recommendations');
  const handleResourceClick = (resourceId: string) => console.log('Resource clicked:', resourceId);

  if (showDetail) {
    return (
      <CategoryDetailScreen
        categoryId={categoryId}
        onBack={handleBack}
        onNavToConcerns={handleNavToConcerns}
        onNavToRecommendations={handleNavToRecommendations}
        onResourceClick={handleResourceClick}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Category Detail Test Page
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select a Category to View</h2>
          <p className="text-gray-600 mb-4">
            Enter a category ID to see its educational resources from the live API.
          </p>
          
          <div className="mb-4">
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Category ID
            </label>
            <input
              id="categoryId"
              type="number"
              value={categoryId}
              onChange={(e) => setCategoryId(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter category ID (e.g., 1)"
            />
          </div>

          <button
            onClick={() => setShowDetail(true)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Category Details
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Category 1 = Climate & Environment (has 1 test resource)</li>
            <li>• Make sure backend is running on localhost:8000</li>
            <li>• Use the admin interface to add more resources</li>
            <li>• Admin: http://localhost:8000/educational-resources/admin</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
