const GITHUB_REPO = 'sunspec/models';
const GITHUB_BRANCH = 'master';
const MODELS_PATH = 'json';

export interface GitHubFile {
  name: string;
  path: string;
  download_url: string;
}

export class GitHubService {
  private static baseUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${MODELS_PATH}`;
  private static rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${MODELS_PATH}`;

  static async getModelList(): Promise<GitHubFile[]> {
    try {
      const response = await fetch(`${this.baseUrl}?ref=${GITHUB_BRANCH}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch model list: ${response.statusText}`);
      }
      
      const files: GitHubFile[] = await response.json();
      return files.filter(file => file.name.endsWith('.json'));
    } catch (error) {
      console.error('Error fetching model list:', error);
      throw new Error('Failed to load model list from GitHub');
    }
  }

  static async getAllModelsWithMetadata(): Promise<ModelInfo[]> {
    try {
      const files = await this.getModelList();
      const modelInfos: ModelInfo[] = [];

      // Load all models to get their metadata
      const promises = files.map(async (file) => {
        try {
          const modelData = await this.getModel(file.name);
          const info = this.extractModelInfo(file.name, modelData);
          return {
            ...info,
            filename: file.name
          };
        } catch (err) {
          console.warn(`Failed to load model ${file.name}:`, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const validModels = results.filter(Boolean) as ModelInfo[];
      
      // Sort by model ID
      validModels.sort((a, b) => a.id - b.id);
      return validModels;
    } catch (error) {
      console.error('Error loading all models:', error);
      throw new Error('Failed to load models from GitHub');
    }
  }

  static async getModel(filename: string): Promise<any> {
    try {
      const response = await fetch(`${this.rawUrl}/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.statusText}`);
      }
      
      const modelData = await response.json();
      return modelData;
    } catch (error) {
      console.error('Error fetching model:', error);
      throw new Error(`Failed to load model: ${filename}`);
    }
  }

  static extractModelInfo(filename: string, modelData: any): { id: number; name: string; label?: string; desc?: string } {
    // Extract model ID from filename (e.g., "model_1.json" -> 1)
    const idMatch = filename.match(/model_(\d+)\.json/);
    const id = idMatch ? parseInt(idMatch[1]) : modelData.id || 0;
    
    return {
      id,
      name: filename.replace('.json', ''),
      label: modelData.label || modelData.group?.label,
      desc: modelData.desc || modelData.group?.desc
    };
  }

  static categorizeModels(models: ModelInfo[]): Record<string, { range: string; description: string; models: ModelInfo[] }> {
    const categories: Record<string, { range: string; description: string; models: ModelInfo[] }> = {
      '1-99': { range: '1-99', description: 'Common & Basic Models', models: [] },
      '100-199': { range: '100-199', description: 'Inverter Models', models: [] },
      '200-299': { range: '200-299', description: 'Meter Models', models: [] },
      '300-399': { range: '300-399', description: 'Environmental Models', models: [] },
      '400-499': { range: '400-499', description: 'String Combiner Models', models: [] },
      '500-599': { range: '500-599', description: 'Panel Models', models: [] },
      '600-699': { range: '600-699', description: 'Tracker Models', models: [] },
      '700-799': { range: '700-799', description: 'DER Control Models', models: [] },
      '800-899': { range: '800-899', description: 'Storage Models', models: [] },
      '900+': { range: '900+', description: 'Extended & Custom Models', models: [] }
    };

    models.forEach(model => {
      if (model.id < 100) {
        categories['1-99'].models.push(model);
      } else if (model.id < 200) {
        categories['100-199'].models.push(model);
      } else if (model.id < 300) {
        categories['200-299'].models.push(model);
      } else if (model.id < 400) {
        categories['300-399'].models.push(model);
      } else if (model.id < 500) {
        categories['400-499'].models.push(model);
      } else if (model.id < 600) {
        categories['500-599'].models.push(model);
      } else if (model.id < 700) {
        categories['600-699'].models.push(model);
      } else if (model.id < 800) {
        categories['700-799'].models.push(model);
      } else if (model.id < 900) {
        categories['800-899'].models.push(model);
      } else {
        categories['900+'].models.push(model);
      }
    });

    // Filter out empty categories
    const filteredCategories: Record<string, { range: string; description: string; models: ModelInfo[] }> = {};
    Object.entries(categories).forEach(([key, category]) => {
      if (category.models.length > 0) {
        filteredCategories[key] = category;
      }
    });

    return filteredCategories;
  }
}