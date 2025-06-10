export interface SunSpecModel {
  id: number;
  group: Group;
  label?: string;
  desc?: string;
  detail?: string;
  notes?: string;
  comments?: string[];
}

export interface Group {
  name: string;
  type: 'group' | 'sync';
  count?: number | string;
  points?: Point[];
  groups?: Group[];
  label?: string;
  desc?: string;
  detail?: string;
  notes?: string;
  comments?: string[];
}

export interface Point {
  name: string;
  type: string;
  size: number;
  value?: number | string;
  count?: number;
  sf?: number | string;
  units?: string;
  access?: 'R' | 'RW';
  mandatory?: 'M' | 'O';
  static?: 'D' | 'S';
  label?: string;
  desc?: string;
  detail?: string;
  notes?: string;
  comments?: string[];
  symbols?: Symbol[];
  standards?: string[];
}

export interface Symbol {
  name: string;
  value: any;
  label?: string;
  desc?: string;
  detail?: string;
  notes?: string;
  comments?: string[];
}

export interface TreeNode {
  id: string;
  name: string;
  label?: string;
  type: 'model' | 'group' | 'point';
  isExpanded: boolean;
  children: TreeNode[];
  data?: SunSpecModel | Group | Point;
  level: number;
}

export interface ModelInfo {
  id: number;
  name: string;
  label?: string;
  desc?: string;
  filename: string;
}