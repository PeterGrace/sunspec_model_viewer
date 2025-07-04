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
            flex items-center p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0
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
          <div className="transition-all duration-200 border-l border-slate-200 ml-2" style={{ marginLeft: `${(node.level + 1) * 20 + 2}px` }}>
            {node.children.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
      {/* Left Side - Tree Structure */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Model Structure</h2>
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Info className="w-4 h-4" />
              <span>Model ID: {model.id}</span>
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

        <div className="flex-1 overflow-y-auto p-4">
          {filteredTree ? renderNode(filteredTree) : (
            <div className="text-center py-8 text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Legend and Information */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <h2 className="text-lg font-semibold text-slate-800">Legend & Information</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Point Attributes Legend */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Point Attributes</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Type</span>
                <span className="text-slate-600 text-sm">Data type (uint16, int16, string, etc.)</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">Scale Factor</span>
                <span className="text-slate-600 text-sm">Scaling factor for numeric values</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Access</span>
                <span className="text-slate-600 text-sm">Read/Write permissions (R, RW)</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">Required</span>
                <span className="text-slate-600 text-sm">Mandatory (M) or Optional (O)</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">Units</span>
                <span className="text-slate-600 text-sm">Unit of measurement</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">Bitfield</span>
                <span className="text-slate-600 text-sm">Bit field with individual bit meanings</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">Enum</span>
                <span className="text-slate-600 text-sm">Enumerated values with specific meanings</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">X values</span>
                <span className="text-slate-600 text-sm">Number of possible enum/bitfield values</span>
              </div>
            </div>
          </div>

          {/* Icons Legend */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Icons</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="text-slate-600 text-sm">SunSpec Model</span>
              </div>
              <div className="flex items-center space-x-3">
                <Folder className="w-5 h-5 text-amber-600" />
                <span className="text-slate-600 text-sm">Group</span>
              </div>
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-green-600" />
                <span className="text-slate-600 text-sm">Point</span>
              </div>
            </div>
          </div>

          {/* Model Information */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Model Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-600">ID:</span>
                <span className="ml-2 text-slate-800">{model.id}</span>
              </div>
              {model.label && (
                <div>
                  <span className="font-medium text-slate-600">Label:</span>
                  <span className="ml-2 text-slate-800">{model.label}</span>
                </div>
              )}
              {model.desc && (
                <div>
                  <span className="font-medium text-slate-600">Description:</span>
                  <p className="mt-1 text-slate-800 leading-relaxed">{model.desc}</p>
                </div>
              )}
              {model.group.desc && model.group.desc !== model.desc && (
                <div>
                  <span className="font-medium text-slate-600">Group Description:</span>
                  <p className="mt-1 text-slate-800 leading-relaxed">{model.group.desc}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Navigation Tips</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Click on groups to expand/collapse them</li>
              <li>• Use the search box to filter points and groups</li>
              <li>• Point details show below each point name</li>
              <li>• Hierarchy is shown with indentation and connecting lines</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const PointDetails: React.FC<{ point: Point }> = ({ point }) => {
  const getDisplayType = (type: string) => {
    return type === 'sunssf' ? 'Scale Factor' : type;
  };

  const isEnumOrBitfield = point.type === 'enum16' || point.type === 'bitfield16' || point.type === 'bitfield32';

  const renderSymbols = () => {
    if (!point.symbols || point.symbols.length === 0) return null;

    return (
      <div className="mt-2 p-2 bg-slate-50 rounded border">
        <h4 className="text-xs font-medium text-slate-700 mb-1">
          {point.type.includes('bitfield') ? 'Bit Values:' : 'Enum Values:'}
        </h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {point.symbols.map((symbol, index) => (
            <div key={index} className="flex items-start justify-between text-xs">
              <div className="flex-1 min-w-0">
                <span className="font-mono text-slate-800">{symbol.name}</span>
                {symbol.label && (
                  <span className="ml-2 text-slate-600">({symbol.label})</span>
                )}
              </div>
              <span className="ml-2 px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-mono flex-shrink-0">
                {symbol.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="mt-1 space-y-1">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`px-2 py-1 rounded-full ${
          point.type === 'uint16' ? 'bg-blue-100 text-blue-700' :
          point.type === 'int16' ? 'bg-indigo-100 text-indigo-700' :
          point.type === 'string' ? 'bg-purple-100 text-purple-700' :
          point.type === 'enum16' ? 'bg-amber-100 text-amber-700' :
          point.type === 'bitfield16' ? 'bg-pink-100 text-pink-700' :
          point.type === 'bitfield32' ? 'bg-pink-100 text-pink-700' :
          point.type === 'sunssf' ? 'bg-teal-100 text-teal-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {getDisplayType(point.type)}
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

        {isEnumOrBitfield && point.symbols && point.symbols.length > 0 && (
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
            {point.symbols.length} values
          </span>
        )}
      </div>
      
      {point.desc && (
        <p className="text-xs text-slate-600 leading-relaxed">{point.desc}</p>
      )}

      {isEnumOrBitfield && renderSymbols()}
    </div>
  );
};