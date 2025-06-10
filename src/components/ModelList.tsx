import React, { useState, useEffect } from 'react';
import { GitHubService } from '../services/githubService';
import { ModelInfo } from '../types';
import { Database, Search, ExternalLink, AlertCircle, Loader2, FileText, ChevronDown, ChevronRight } from 'lucide-react';

interface ModelListProps {
  onModelSelect: (modelInfo: ModelInfo) => void;
}

export const ModelList: React.FC<ModelListProps> = ({ onModelSelect }) => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [categorizedModels, setCategorizedModels] = useState<Record<string, { range: string; description: string; models: ModelInfo[] }>>({});
  const [filteredModels, setFilteredModels] = useState<ModelInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredModels(models);
    } else {
      const filtered = models.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.id.toString().includes(searchTerm)
      );
      setFilteredModels(filtered);
    }
  }, [models, searchTerm]);

  const loadModels = async () => {
    setIsLoading(true);
    setError('');

    try {
      const modelInfos = await GitHubService.getAllModelsWithMetadata();
      const categories = GitHubService.categorizeModels(modelInfos);
      
      setModels(modelInfos);
      setCategorizedModels(categories);
      
      // Auto-expand first category if no search term
      if (Object.keys(categories).length > 0) {
        setExpandedCategories(new Set([Object.keys(categories)[0]]));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };
  const handleModelClick = (model: ModelInfo) => {
    onModelSelect(model);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-slate-600">Loading models from GitHub...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Error Loading Models</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadModels}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">SunSpec Models</h2>
          </div>
          <a
            href="https://github.com/sunspec/models"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on GitHub</span>
          </a>
        </div>
        
        <p className="text-slate-600 mb-4">
          Browse and explore SunSpec information model definitions. Select a model to view its detailed structure and points.
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search models by ID, name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Model Categories or Search Results */}
      {searchTerm ? (
        /* Search Results */
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Search Results ({filteredModels.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModels.map((model) => (
              <ModelCard key={model.filename} model={model} onClick={handleModelClick} />
            ))}
          </div>
        </div>
      ) : (
        /* Categorized Models */
        <div className="space-y-6">
          {Object.entries(categorizedModels).map(([categoryKey, category]) => (
            <div key={categoryKey} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div
                className="p-4 bg-slate-50 border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => toggleCategory(categoryKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {expandedCategories.has(categoryKey) ? (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Models {category.range}
                      </h3>
                      <p className="text-sm text-slate-600">{category.description}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                    {category.models.length} models
                  </span>
                </div>
              </div>
              
              {expandedCategories.has(categoryKey) && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.models.map((model) => (
                      <ModelCard key={model.filename} model={model} onClick={handleModelClick} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filteredModels.length === 0 && !isLoading && searchTerm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No models found</h3>
          <p className="text-slate-600">
            No models match "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};

interface ModelCardProps {
  model: ModelInfo;
  onClick: (model: ModelInfo) => void;
}

const ModelCard: React.FC<ModelCardProps> = ({ model, onClick }) => {
  return (
    <div
      onClick={() => onClick(model)}
      className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-slate-800 group-hover:text-blue-800 transition-colors text-sm">
              Model {model.id}
            </h4>
          </div>
          
          {model.label && (
            <p className="text-xs font-medium text-slate-700 mb-1 line-clamp-1">
              {model.label}
            </p>
          )}
          
          {model.desc && (
            <p className="text-xs text-slate-600 line-clamp-2">
              {model.desc}
            </p>
          )}
          
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              ID: {model.id}
            </span>
            <div className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors">
              →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};