import React, { useState } from 'react';
import { ModelList } from './components/ModelList';
import { TreeView } from './components/TreeView';
import { SunSpecModel, ModelInfo } from './types';
import { GitHubService } from './services/githubService';
import { FileText, RotateCcw } from 'lucide-react';

function App() {
  const [model, setModel] = useState<SunSpecModel | null>(null);
  const [selectedModelInfo, setSelectedModelInfo] = useState<ModelInfo | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleModelSelect = async (modelInfo: ModelInfo) => {
    setIsLoading(true);
    setError('');
    setSelectedModelInfo(modelInfo);

    try {
      const modelData = await GitHubService.getModel(modelInfo.filename);

      // Basic validation to ensure it's a SunSpec model
      if (!modelData.id || !modelData.group) {
        throw new Error('Invalid SunSpec model format. Missing required "id" or "group" properties.');
      }

      setModel(modelData as SunSpecModel);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the model.');
      setSelectedModelInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setModel(null);
    setSelectedModelInfo(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">SunSpec Model Viewer</h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Browse and visualize SunSpec information model definitions from the official GitHub repository. Explore the hierarchical structure 
            with detailed point information and interactive tree navigation.
          </p>
        </div>

        {!model ? (
          /* Model Selection */
          <ModelList onModelSelect={handleModelSelect} />
        ) : (
          /* Model View Section */
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Reset Button */}
            <div className="flex justify-end">
              <button
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Back to Model List
              </button>
            </div>

            {/* Tree View */}
            <TreeView model={model} />
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-slate-700">Loading model...</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !isLoading && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;