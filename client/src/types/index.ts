export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  extension?: string;
  path: string[];
  lastModified: string;
  content?: string;
  class?: string;
  description?: string;
  owner?: string;
}

export interface SearchParams {
  query: string;
  currentPath: string[];
}
