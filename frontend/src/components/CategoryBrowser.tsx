import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  type: string;
}

interface CategoryBrowserProps {
  onBack: () => void;
  onCategoryClick: (categoryId: number) => void;
}

/**
 * Browse all 70 political categories and view their educational resources
 */
export default function CategoryBrowser({ onBack, onCategoryClick }: CategoryBrowserProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'issue' | 'policy'>('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        'https://voter-mambo-production.up.railway.app/category-admin/categories',
        {
          headers: {
            'Authorization': 'Basic ' + btoa('T0pS33k5:VPVPrim32025!bana7')
          }
        }
      );
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || cat.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Browse Categories</h1>
              <p className="text-sm text-gray-600">
                {categories.length} political categories with educational resources
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({categories.length})
            </button>
            <button
              onClick={() => setFilterType('issue')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'issue'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Issues ({categories.filter(c => c.type === 'issue').length})
            </button>
            <button
              onClick={() => setFilterType('policy')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'policy'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Policies ({categories.filter(c => c.type === 'policy').length})
            </button>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No categories found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryClick(category.id)}
                className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {category.type === 'issue' ? '📋 Issue' : '📜 Policy'} • ID: {category.id}
                    </p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-400 transform rotate-180" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
