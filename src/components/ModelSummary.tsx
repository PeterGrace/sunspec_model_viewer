import React from 'react';
import { SunSpecModel } from '../types';
import { Database, Layers, FileText, Tag } from 'lucide-react';

interface ModelSummaryProps {
  model: SunSpecModel;
}

export const ModelSummary: React.FC<ModelSummaryProps> = ({ model }) => {
  const countPoints = (group: any): number => {
    let count = 0;
    if (group.points) count += group.points.length;
    if (group.groups) {
      group.groups.forEach((subGroup: any) => {
        count += countPoints(subGroup);
      });
    }
    return count;
  };

  const countGroups = (group: any): number => {
    let count = 1; // Count the current group
    if (group.groups) {
      group.groups.forEach((subGroup: any) => {
        count += countGroups(subGroup);
      });
    }
    return count;
  };

  const totalPoints = countPoints(model.group);
  const totalGroups = countGroups(model.group) - 1; // Subtract 1 to exclude root group

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Database className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-800">Model Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Model ID</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{model.id}</p>
        </div>

        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Groups</span>
          </div>
          <p className="text-2xl font-bold text-amber-900 mt-1">{totalGroups}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Points</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">{totalPoints}</p>
        </div>
      </div>

      <div className="space-y-4">
        {model.label && (
          <div>
            <h3 className="font-medium text-slate-700 mb-1">Label</h3>
            <p className="text-slate-600">{model.label}</p>
          </div>
        )}

        {model.desc && (
          <div>
            <h3 className="font-medium text-slate-700 mb-1">Description</h3>
            <p className="text-slate-600">{model.desc}</p>
          </div>
        )}

        {model.group.desc && (
          <div>
            <h3 className="font-medium text-slate-700 mb-1">Group Description</h3>
            <p className="text-slate-600">{model.group.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
};