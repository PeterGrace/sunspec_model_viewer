import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search, Database, Folder, File, Tag, Info } from 'lucide-react';
import { TreeNode, SunSpecModel, Group, Point } from '../types';

interface TreeViewProps {
  model: SunSpecModel;
}

export const TreeView: React.FC<TreeViewProps> = ({ model }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root'])); // Only expand root model node

  const buildTree = useMemo(() => {
    const createTreeNode = (
      id: string,
      name: string,
      label: string | undefined,
      type: 'model' | 'group' | 'point',
      data: SunSpecModel | Group | Point,
      level: number = 0
    ): TreeNode => {
      const node: TreeNode = {
        id,
        name,
        label,
        type,
        isExpanded: expandedNodes.has(id),
        children: [],
        data,
        level
      };

      if (type === 'model') {
        const modelData = data as SunSpecModel;
        if (modelData.group) {
          node.children.push(createTreeNode(
            `${id}_group`,
            modelData.group.name,
            modelData.group.label,
            'group',
            modelData.group,
            level + 1
          ));
        }
      } else if (type === 'group') {
        const groupData = data as Group;
        
        // Add points as children
        if (groupData.points) {
          groupData.points.forEach((point, index) => {
            node.children.push(createTreeNode(
              `${id}_point_${index}`,
              point.name,
              point.label,
              'point',
              point,
              level + 1
            ));
          });
        }

        // Add nested groups as children
        if (groupData.groups) {
          groupData.groups.forEach((group, index) => {
            node.children.push(createTreeNode(
              `${id}_group_${index}`,
              group.name,
              group.label,
              'group',
              group,
              level + 1
            ));
          });
        }
      }

      return node;
    };

    return createTreeNode('root', `Model ${model.id}`, model.label, 'model', model);
  }, [model, expandedNodes]);

  const filteredTree = useMemo(() => {
    if (!searchTerm) return buildTree;

    const filterNode = (node: TreeNode): TreeNode | null => {
      const matchesSearch = 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.type === 'point' && (node.data as Point).desc?.toLowerCase().includes(searchTerm.toLowerCase()));

      const filteredChildren = node.children
        .map(child => filterNode(child))
        .filter(Boolean) as TreeNode[];

      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
          isExpanded: true // Auto-expand matching nodes
        };
      }

      return null;
    };

    return filterNode(buildTree);
  }, [buildTree, searchTerm]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderNode = (node: TreeNode) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id} className="select-none">
        <div
          className={`
            flex items-center p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors
            ${node.level > 0 ? `ml-${Math.min(node.level * 4, 16)}` : ''}
          `}
          onClick={() => hasChildren && toggleNode(node.id)}
          style={{ marginLeft: `${node.level * 20}px` }}
        >
          <div className="flex items-center flex-1 min-w-0">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              )
            ) : (
              <div className="w-4 h-4 mr-2 flex-shrink-0" />
            )}

            {node.type === 'model' && <Database className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />}
            {node.type === 'group' && <Folder className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0" />}
            {node.type === 'point' && <File className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />}

            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className={`font-medium truncate ${
                  node.type === 'model' ? 'text-blue-800' :
                  node.type === 'group' ? 'text-amber-800' :
                  'text-green-800'
                }`}>
                  {node.name}
                </span>
                {node.label && (
                  <span className="text-xs text-slate-500 truncate">
                    ({node.label})
                  </span>
                )}
              </div>
              {node.type === 'point' && (
                <PointDetails point={node.data as Point} />
              )}
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="transition-all duration-200">
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Model Structure</h2>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Info className="w-4 h-4" />
            <span>Model ID: {model.id}</span>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mb-4 p-3 bg-white rounded-lg border border-slate-200">
          <h3 className="text-sm font-medium text-slate-700 mb-2">Point Attributes Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Type</span>
              <span className="text-slate-600">Data type</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">Access</span>
              <span className="text-slate-600">Read/Write permissions</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">Required</span>
              <span className="text-slate-600">Mandatory/Optional</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">Units</span>
              <span className="text-slate-600">Unit of measure</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search points, groups, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto p-4">
        {filteredTree ? renderNode(filteredTree) : (
          <div className="text-center py-8 text-slate-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No results found for "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PointDetails: React.FC<{ point: Point }> = ({ point }) => {
  return (
    <div className="mt-1 space-y-1">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`px-2 py-1 rounded-full ${
          point.type === 'uint16' ? 'bg-blue-100 text-blue-700' :
          point.type === 'int16' ? 'bg-indigo-100 text-indigo-700' :
          point.type === 'string' ? 'bg-purple-100 text-purple-700' :
          point.type === 'enum16' ? 'bg-amber-100 text-amber-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {point.type}
        </span>
        
        {point.access && (
          <span className={`px-2 py-1 rounded-full ${
            point.access === 'RW' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {point.access}
          </span>
        )}
        
        {point.mandatory && (
          <span className={`px-2 py-1 rounded-full ${
            point.mandatory === 'M' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {point.mandatory === 'M' ? 'Mandatory' : 'Optional'}
          </span>
        )}

        {point.units && (
          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
            {point.units}
          </span>
        )}
      </div>
      
      {point.desc && (
        <p className="text-xs text-slate-600 leading-relaxed">{point.desc}</p>
      )}
    </div>
  );
};