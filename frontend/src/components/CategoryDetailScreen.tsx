import React, { useState, useEffect } from 'react';
import { ChevronLeft, ExternalLink, Clock, BookOpen, Video, Headphones, Play, Heart } from 'lucide-react';
import HamburgerMenu from './HamburgerMenu';
import { config } from '../config/environment';

interface CategoryDetailScreenProps {
  onBack: () => void;
  onNavToConcerns: () => void;
  onNavToRecommendations: () => void;
  onResourceClick: (resourceId: string) => void;
  categoryId: number;
  onToggleSave?: (recommendation: SavedRecommendation) => void;
  isRecommendationSaved?: (id: string) => boolean;
}

interface SavedRecommendation {
  id: string;
  category: string;
  title: string;
  description?: string;
}

interface Resource {
  id: number;
  title: string;
  source: string;
  type: string;
  duration: string | null;
  description: string | null;
  url: string;
  display_order: number;
}

interface CategoryData {
  id: number;
  name: string;
  type: string;
  description: string;
  resources: Resource[];
}

export default function CategoryDetailScreen({ 
  onBack, 
  onNavToConcerns, 
  onNavToRecommendations,
  onResourceClick,
  categoryId,
  onToggleSave,
  isRecommendationSaved
}: CategoryDetailScreenProps) {
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryData();
  }, [categoryId]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${config.BACKEND_URL}/educational-resources/category/${categoryId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load category data');
      }

      const data = await response.json();
      setCategoryData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load category');
      console.error('Error fetching category:', err);
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'podcast': return <Headphones className="w-4 h-4" />;
      case 'lesson': return <BookOpen className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">Civics Education</h1>
          <HamburgerMenu 
            onNavToConcerns={onNavToConcerns}
            onNavToRecommendations={onNavToRecommendations}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !categoryData) {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">Civics Education</h1>
          <HamburgerMenu 
            onNavToConcerns={onNavToConcerns}
            onNavToRecommendations={onNavToRecommendations}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-red-600 mb-4">{error || 'Category not found'}</p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Civics Education</h1>
        <HamburgerMenu 
          onNavToConcerns={onNavToConcerns}
          onNavToRecommendations={onNavToRecommendations}
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Title and Description */}
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-3">
              {categoryData.type.toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
              {categoryData.name}
            </h2>
            {categoryData.description && (
              <p className="text-base text-gray-700 leading-relaxed">
                {categoryData.description}
              </p>
            )}
          </div>

          {/* Educational Resources */}
          {categoryData.resources.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                Educational Resources ({categoryData.resources.length})
              </h3>
              {categoryData.resources
                .sort((a, b) => a.display_order - b.display_order)
                .map((resource) => (
                  <div key={resource.id} className="relative">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 leading-tight pr-4">
                              {resource.title}
                            </h4>
                            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span className="font-medium">{resource.source}</span>
                            {resource.duration && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {resource.duration}
                                </span>
                              </>
                            )}
                          </div>
                          {resource.description && (
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {resource.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </a>
                    
                    {/* Heart Save Button */}
                    {onToggleSave && isRecommendationSaved && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleSave({
                            id: `category-${categoryId}-resource-${resource.id}`,
                            category: categoryData.name,
                            title: resource.title,
                            description: resource.source
                          });
                        }}
                        className="absolute top-3 right-3 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-sm transition-all"
                      >
                        <Heart 
                          className={`w-5 h-5 ${
                            isRecommendationSaved(`category-${categoryId}-resource-${resource.id}`) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-gray-400 hover:text-red-400'
                          }`} 
                        />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No resources available yet for this category.</p>
            </div>
          )}

          {/* Learning Impact */}
          {categoryData.resources.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Build your civic knowledge
              </h4>
              <p className="text-sm text-green-800">
                These carefully curated resources from trusted educational institutions help you understand complex civic issues and participate more effectively in democratic processes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
