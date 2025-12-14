export type FileType = 'markdown' | 'python' | 'javascript' | 'typescript' | 'html' | 'css' | 'java' | 'cpp';

export type ProgrammingLanguageOptions =
  | "typescript"
  | "javascript"
  | "cpp"
  | "java"
  | "php"
  | "python"
  | "html"
  | "sql"
  | "json"
  | "rust"
  | "xml"
  | "clojure"
  | "csharp"
  | "other";

export interface CanvasFile {
  fileId: string;
  threadId: string;
  type: string;
  title: string;
  content: string;
  filePath?: string | null;
  language?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FileUploadResponse {
  file_id: string;
  thread_id: string;
  type: string;
  title: string;
  original_filename: string;
  converted_to_markdown: boolean;
  message: string;
}

export interface TextSelection {
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface SelectionBox {
  top: number;
  left: number;
  text: string;
}

export interface VersionState {
  versions: CanvasFile[];
  currentIndex: number;
}

// Artifact V3 Types (for versioning feature)
export interface ArtifactMarkdownV3 {
  index: number;
  type: "text";
  title: string;
  fullMarkdown: string;
}

export interface ArtifactCodeV3 {
  index: number;
  type: "code";
  title: string;
  language: ProgrammingLanguageOptions;
  code: string;
}

export interface ArtifactV3 {
  currentIndex: number;
  contents: (ArtifactMarkdownV3 | ArtifactCodeV3)[];
}

// Text Selection Types
export interface TextHighlight {
  fullMarkdown: string;
  markdownBlock: string;
  selectedText: string;
}

export interface CodeHighlight {
  startCharIndex: number;
  endCharIndex: number;
}
