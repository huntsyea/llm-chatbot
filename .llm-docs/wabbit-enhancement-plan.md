# Wabbit Enhancement Plan

## Overview

This document outlines a comprehensive plan for enhancing the Wabbit application, focusing on improved UI, research capabilities, and consistent markdown rendering across different LLM models. Each phase delivers tangible value while establishing a foundation for future improvements.

## Core Design Principles

### SOLID Architecture

1. **Single Responsibility Principle**: Each component and service has one clearly defined purpose
2. **Open/Closed Principle**: Systems are open for extension but closed for modification
3. **Liskov Substitution Principle**: API clients are interchangeable through consistent interfaces
4. **Interface Segregation**: Small, focused interfaces for each component
5. **Dependency Inversion**: High-level modules depend on abstractions, not implementations

### Extensibility Focus

- Explicit extension points in all component interfaces
- Plugin architecture for future enhancements
- Clear separation between data, presentation, and business logic
- Consistent typing and interfaces throughout the application

## Phase 1: Foundation (1-2 weeks)

### Component Architecture Refactoring

The foundation phase establishes core patterns and structures that support all future enhancements.

```typescript
// src/interfaces/core.ts - Centralized type definitions
export interface Response {
  query: string;
  response: string;
  model: string;
  timestamp: number;
  // Extension point: additional metadata
  metadata?: Record<string, unknown>;
}

// src/services/api/ApiClientInterface.ts
export interface ApiClientOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  // Extension point: additional parameters
  [key: string]: unknown;
}

export interface ApiClient {
  generateResponse(prompt: string, options: ApiClientOptions): Promise<string>;
  // Extension point: additional API methods
}
```

### Enhanced Markdown Processing

Implement a dedicated service for normalizing and rendering markdown consistently across different models.

```typescript
// src/services/markdown/MarkdownService.ts
export interface MarkdownNormalizationOptions {
  standardizeHeadings?: boolean;
  enforceListFormatting?: boolean;
  standardizeTables?: boolean;
  sanitizeHTML?: boolean;
  enforceCodeBlocks?: boolean;
  // Extension point: additional options
  [key: string]: unknown;
}

export class MarkdownService {
  // Core normalization method
  normalizeMarkdown(markdown: string, options: MarkdownNormalizationOptions = {}): string {
    const {
      standardizeHeadings = true,
      enforceListFormatting = true,
      standardizeTables = true,
      sanitizeHTML = true,
      enforceCodeBlocks = true
    } = options;
    
    let normalizedMarkdown = markdown;
    
    if (standardizeHeadings) {
      normalizedMarkdown = this.standardizeHeadings(normalizedMarkdown);
    }
    
    if (enforceListFormatting) {
      normalizedMarkdown = this.enforceListFormatting(normalizedMarkdown);
    }
    
    // Additional normalization steps
    
    return normalizedMarkdown;
  }
  
  // Individual normalization methods with extension points
  private standardizeHeadings(markdown: string): string {
    // Implementation
    return markdown;
  }
  
  // Additional private methods
}
```

### Reusable Rendering Component

```typescript
// src/components/markdown/EnhancedMarkdown.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MarkdownService } from '../../services/markdown/MarkdownService';

export interface EnhancedMarkdownProps {
  content: string;
  normalize?: boolean;
  normalizationOptions?: MarkdownNormalizationOptions;
  onElementClick?: (element: string, text: string) => void;
  className?: string;
  // Extension point: additional props
  [key: string]: unknown;
}

const EnhancedMarkdown: React.FC<EnhancedMarkdownProps> = ({
  content,
  normalize = true,
  normalizationOptions = {},
  onElementClick,
  className = '',
  ...rest
}) => {
  const markdownService = new MarkdownService();
  
  // Apply normalization if enabled
  const processedContent = normalize 
    ? markdownService.normalizeMarkdown(content, normalizationOptions)
    : content;
  
  // Component implementation with rich rendering capabilities
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={/* Standard component set */}
        {...rest}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default EnhancedMarkdown;
```

## Phase 2: Navigation & Responsive UI (2-3 weeks)

The navigation phase improves horizontal scrolling with controls, keyboard navigation, and responsive layouts.

### Navigation System

```typescript
// src/hooks/useNavigationState.ts
export function useNavigationState(responseCount: number): [
  NavigationState,
  (index: number) => void,
  (ref: React.RefObject<HTMLElement>) => void
] {
  // Implementation of navigation state and handlers
}

// src/components/navigation/ResponsiveNavigationControls.tsx
const ResponsiveNavigationControls: React.FC<NavigationControlsProps> = ({
  currentIndex,
  totalItems,
  onNavigate,
  orientation = 'horizontal'
}) => {
  const { isMobile } = useResponsive();
  
  return (
    <div className="relative">
      {/* Mobile controls */}
      {isMobile && (
        <div className="mobile-navigation-controls">
          {/* Mobile-specific UI */}
        </div>
      )}
      
      {/* Desktop controls */}
      {!isMobile && (
        <div className="desktop-navigation-controls">
          {/* Desktop-specific UI */}
        </div>
      )}
    </div>
  );
};
```

### Consistent Response Presentation

```typescript
// src/components/response/ResponseCard.tsx
interface ResponseCardProps {
  response: Response;
  isActive: boolean;
  onTopicClick: (topic: string) => void;
  // Extension point for custom rendering options
  renderOptions?: Partial<{
    showMetadata: boolean;
    enableCodeCopy: boolean;
    renderMode: 'full' | 'compact' | 'preview';
  }>;
}

const ResponseCard: React.FC<ResponseCardProps> = ({
  response,
  isActive,
  onTopicClick,
  renderOptions = {}
}) => {
  const {
    showMetadata = false,
    enableCodeCopy = true,
    renderMode = 'full'
  } = renderOptions;
  
  return (
    <Card className={`response-card ${isActive ? 'active' : ''}`}>
      {/* Response header */}
      <div className="response-header">
        {/* Query display */}
      </div>
      
      {/* Response content with consistent markdown rendering */}
      <CardContent className="response-content">
        <EnhancedMarkdown
          content={response.response}
          onElementClick={(element, text) => {
            if (element === 'heading') {
              onTopicClick(text);
            }
          }}
          // Enable code copy button
          renderOptions={{
            enableCodeCopy
          }}
        />
      </CardContent>
      
      {/* Optional metadata display */}
      {showMetadata && (
        <div className="response-metadata">
          {/* Model info, timestamp, etc. */}
        </div>
      )}
    </Card>
  );
};
```

## Phase 3: Research Tools & Topic Analysis (3-4 weeks)

The research phase adds tools for topic extraction, search, and cross-referencing between responses.

### Topic Extraction & Organization

```typescript
// src/services/topic/TopicExtractionService.ts
export interface ExtractedTopic {
  id: string;
  text: string;
  level: number;
  position: number;
  sourceResponseId?: string;
  // Extension point for additional topic metadata
  metadata?: Record<string, unknown>;
}

export class TopicExtractionService {
  extractTopics(markdown: string, options?: TopicExtractionOptions): ExtractedTopic[] {
    // Implementation for extracting topics from markdown content
    return [];
  }
  
  // Additional methods for topic analysis and organization
}

// src/components/research/TopicExplorer.tsx
const TopicExplorer: React.FC<TopicExplorerProps> = ({
  responses,
  onTopicSelect,
  // Extension point for visualization options
  visualizationOptions = {}
}) => {
  const topicService = new TopicExtractionService();
  
  // Extract topics from all responses
  const allTopics = useMemo(() => {
    return responses.flatMap(response => 
      topicService.extractTopics(response.response)
    );
  }, [responses]);
  
  // Group and organize topics
  const organizedTopics = useMemo(() => {
    return topicService.organizeTopics(allTopics);
  }, [allTopics]);
  
  return (
    <div className="topic-explorer">
      {/* Topic visualization and navigation */}
    </div>
  );
};
```

### Search & Filtering

```typescript
// src/services/search/SearchService.ts
export interface SearchResult {
  responseIndex: number;
  matches: {
    text: string;
    context: string;
    isHeading: boolean;
    position: number;
  }[];
}

export class SearchService {
  searchResponses(
    responses: Response[],
    query: string,
    options?: SearchOptions
  ): SearchResult[] {
    // Implementation for searching across responses
    return [];
  }
}

// src/components/search/SearchInterface.tsx
const SearchInterface: React.FC<SearchInterfaceProps> = ({
  responses,
  onResultSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchService = new SearchService();
  
  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    
    const searchResults = searchService.searchResponses(
      responses,
      searchTerm,
      { caseSensitive: false, matchWholeWord: false }
    );
    
    setResults(searchResults);
  }, [searchTerm, responses]);
  
  return (
    <div className="search-interface">
      {/* Search input and results display */}
    </div>
  );
};
```

## Phase 4: Advanced Markdown Processing (2-3 weeks)

The markdown phase implements comprehensive normalization and rendering strategies for consistent display.

### Markdown Normalization Pipeline

```typescript
// src/services/markdown/processors/BaseProcessor.ts
export interface MarkdownProcessor {
  process(markdown: string): string;
  // Extension point for processor options
  setOptions(options: Record<string, unknown>): void;
}

// Sample processor implementation
export class HeadingProcessor implements MarkdownProcessor {
  private options: HeadingProcessorOptions = {
    enforceHierarchy: true,
    startWithH1: true
  };
  
  process(markdown: string): string {
    // Implementation for heading normalization
    return markdown;
  }
  
  setOptions(options: Partial<HeadingProcessorOptions>): void {
    this.options = { ...this.options, ...options };
  }
}

// Enhanced markdown service with processor pipeline
export class EnhancedMarkdownService {
  private processors: MarkdownProcessor[] = [];
  
  constructor() {
    // Register default processors
    this.registerProcessor(new HeadingProcessor());
    this.registerProcessor(new ListProcessor());
    this.registerProcessor(new CodeBlockProcessor());
    this.registerProcessor(new TableProcessor());
  }
  
  // Extension point for adding custom processors
  registerProcessor(processor: MarkdownProcessor): void {
    this.processors.push(processor);
  }
  
  process(markdown: string): string {
    // Run the markdown through all processors in sequence
    return this.processors.reduce(
      (processed, processor) => processor.process(processed),
      markdown
    );
  }
}
```

### Model-Specific Formatting Handlers

```typescript
// src/services/markdown/modelHandlers.ts
export interface ModelHandler {
  modelId: string | RegExp;
  preProcess(markdown: string): string;
  postProcess(markdown: string): string;
}

// Handler for Gemini models
export const geminiModelHandler: ModelHandler = {
  modelId: /^gemini/,
  
  preProcess(markdown: string): string {
    // Gemini-specific pre-processing
    return markdown;
  },
  
  postProcess(markdown: string): string {
    // Gemini-specific post-processing
    return markdown;
  }
};

// Handler for OpenRouter/Llama models
export const llamaModelHandler: ModelHandler = {
  modelId: /llama/i,
  
  preProcess(markdown: string): string {
    // Llama-specific pre-processing
    return markdown;
  },
  
  postProcess(markdown: string): string {
    // Llama-specific post-processing
    return markdown;
  }
};

// Model-aware markdown service
export class ModelAwareMarkdownService {
  private handlers: ModelHandler[] = [];
  private markdownService: EnhancedMarkdownService;
  
  constructor() {
    this.markdownService = new EnhancedMarkdownService();
    
    // Register default handlers
    this.registerHandler(geminiModelHandler);
    this.registerHandler(llamaModelHandler);
  }
  
  // Extension point for adding custom model handlers
  registerHandler(handler: ModelHandler): void {
    this.handlers.push(handler);
  }
  
  // Process markdown with model-specific handling
  processForModel(markdown: string, modelId: string): string {
    // Find the appropriate handler for this model
    const handler = this.handlers.find(h => 
      typeof h.modelId === 'string' 
        ? h.modelId === modelId
        : h.modelId.test(modelId)
    );
    
    if (!handler) {
      // No specific handler, use standard processing
      return this.markdownService.process(markdown);
    }
    
    // Apply model-specific processing pipeline
    let processed = handler.preProcess(markdown);
    processed = this.markdownService.process(processed);
    return handler.postProcess(processed);
  }
}
```

## Phase 5: User Experience Refinements (2-3 weeks)

The UX phase adds visual polish, animations, transitions, and accessibility improvements.

### Responsive Design System

```typescript
// src/hooks/useResponsive.ts
export function useResponsive(
  customBreakpoints?: Record<string, number>
): Record<string, boolean> {
  // Implementation for responsive breakpoints detection
  return {
    isMobile: false,
    isTablet: false,
    isDesktop: true
  };
}

// src/components/layout/ResponsiveContainer.tsx
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  mobileLayout = 'stack',
  tabletLayout = 'grid',
  desktopLayout = 'flex'
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  let layoutClass = '';
  if (isMobile) layoutClass = `mobile-${mobileLayout}`;
  else if (isTablet) layoutClass = `tablet-${tabletLayout}`;
  else layoutClass = `desktop-${desktopLayout}`;
  
  return (
    <div className={`responsive-container ${layoutClass} ${className}`}>
      {children}
    </div>
  );
};
```

### Animated Transitions

```typescript
// src/components/ui/AnimatedTransition.tsx
const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  isVisible,
  transitionType = 'fade',
  duration = 300
}) => {
  // Implementation of animated transitions with CSS classes
  return (
    <div 
      className={`
        transition-${transitionType} 
        duration-${duration} 
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {children}
    </div>
  );
};

// src/components/response/ResponseList.tsx
const ResponseList: React.FC<ResponseListProps> = ({
  responses,
  activeIndex,
  onNavigate
}) => {
  return (
    <div className="response-list-container">
      {responses.map((response, index) => (
        <AnimatedTransition
          key={index}
          isVisible={index === activeIndex}
          transitionType="slide"
        >
          <ResponseCard
            response={response}
            isActive={index === activeIndex}
            onTopicClick={/* handler */}
          />
        </AnimatedTransition>
      ))}
    </div>
  );
};
```

## Phase 6: Performance Optimization (2 weeks)

The optimization phase improves performance for large response sets and complex markdown.

### Virtualized Response Rendering

```typescript
// src/components/response/VirtualizedResponseList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualizedResponseList: React.FC<VirtualizedResponseListProps> = ({
  responses,
  activeIndex,
  onNavigate
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: responses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400, // Estimated card height
    overscan: 1
  });
  
  return (
    <div 
      ref={parentRef}
      className="response-list-container"
    >
      <div
        className="response-list-inner"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: `${virtualItem.index * 100}%`,
              height: `${virtualItem.size}px`,
              width: '100%'
            }}
          >
            <ResponseCard
              response={responses[virtualItem.index]}
              isActive={virtualItem.index === activeIndex}
              onTopicClick={/* handler */}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Markdown Memoization

```typescript
// src/components/markdown/MemoizedMarkdown.tsx
const MemoizedMarkdown: React.FC<EnhancedMarkdownProps> = React.memo(
  EnhancedMarkdown,
  (prevProps, nextProps) => {
    // Custom comparison function for markdown content
    if (prevProps.content !== nextProps.content) {
      return false;
    }
    
    // Check other props for changes
    // Return true if nothing important changed
    return true;
  }
);

// Usage in response card
const ResponseCard: React.FC<ResponseCardProps> = ({
  response,
  isActive,
  onTopicClick
}) => {
  return (
    <Card>
      {/* Card header */}
      <CardContent>
        <MemoizedMarkdown
          content={response.response}
          onElementClick={/* handler */}
        />
      </CardContent>
    </Card>
  );
};
```

## Phase 7: Plugin Architecture (3-4 weeks)

The plugin phase establishes an extensible architecture for future enhancements.

### Plugin Registration System

```typescript
// src/plugins/types.ts
export interface Plugin {
  id: string;
  name: string;
  version: string;
  initialize(context: PluginContext): void;
  // Extension point for plugin lifecycle
  cleanup?(): void;
}

export interface PluginContext {
  registerComponent(id: string, component: React.ComponentType<any>): void;
  registerService(id: string, service: any): void;
  registerHook(id: string, hook: Function): void;
  getService<T>(id: string): T;
  // Extension point for plugin capabilities
}

// src/plugins/PluginManager.ts
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private components: Map<string, React.ComponentType<any>> = new Map();
  private services: Map<string, any> = new Map();
  private hooks: Map<string, Function> = new Map();
  
  // Register a plugin
  registerPlugin(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with ID ${plugin.id} is already registered`);
    }
    
    this.plugins.set(plugin.id, plugin);
    
    // Initialize plugin with context
    plugin.initialize(this.createContext());
  }
  
  // Create plugin context
  private createContext(): PluginContext {
    return {
      registerComponent: (id, component) => this.components.set(id, component),
      registerService: (id, service) => this.services.set(id, service),
      registerHook: (id, hook) => this.hooks.set(id, hook),
      getService: <T>(id: string): T => this.services.get(id) as T
    };
  }
  
  // Get a registered component
  getComponent<T = any>(id: string): React.ComponentType<T> | undefined {
    return this.components.get(id) as React.ComponentType<T> | undefined;
  }
  
  // Get a registered service
  getService<T>(id: string): T | undefined {
    return this.services.get(id) as T | undefined;
  }
}
```

### Sample Plugin Implementation

```typescript
// src/plugins/markdownExtensions/CodeHighlightPlugin.ts
import { Plugin, PluginContext } from '../types';
import { MarkdownService } from '../../services/markdown/MarkdownService';
import CodeHighlighter from './components/CodeHighlighter';

export class CodeHighlightPlugin implements Plugin {
  id = 'code-highlight-plugin';
  name = 'Code Syntax Highlighting';
  version = '1.0.0';
  
  initialize(context: PluginContext): void {
    // Register components
    context.registerComponent('code-highlighter', CodeHighlighter);
    
    // Get markdown service and extend it
    const markdownService = context.getService<MarkdownService>('markdown-service');
    
    // Add custom processor to the markdown service
    markdownService.registerProcessor({
      process(markdown: string): string {
        // Enhance code blocks with additional metadata for highlighting
        return markdown.replace(
          /```(\w+)\n([\s\S]*?)```/g,
          (match, lang, code) => {
            return `\`\`\`${lang}\n${code}\`\`\` <!-- highlight:true -->`;
          }
        );
      },
      setOptions() {}
    });
  }
}
```

## Implementation Roadmap

This plan is divided into logical phases that build on each other while delivering immediate value. Each phase can be developed and deployed independently.

### Phase 1: Foundation (Weeks 1-2)
- Implement core component architecture
- Create basic markdown normalization service
- Establish API client interfaces
- Enhance response rendering

### Phase 2: Navigation & UI (Weeks 3-5)
- Improve horizontal scrolling with controls
- Add keyboard navigation
- Create responsive layouts
- Implement card snapping and positioning

### Phase 3: Research Tools (Weeks 6-9)
- Build topic extraction service
- Implement search functionality
- Create topic explorer interface
- Add cross-referencing between responses

### Phase 4: Markdown Processing (Weeks 10-12)
- Implement comprehensive markdown normalization
- Create model-specific formatting handlers
- Add code syntax highlighting
- Improve table rendering

### Phase 5: UX Refinements (Weeks 13-15)
- Add animations and transitions
- Implement loading states
- Improve accessibility
- Create visual feedback mechanisms

### Phase 6: Performance (Weeks 16-17)
- Implement virtualized rendering
- Add response caching
- Optimize markdown processing
- Improve rendering performance

### Phase 7: Plugin System (Weeks 18-21)
- Create plugin registration system
- Implement plugin lifecycle management
- Build sample plugins
- Create plugin documentation

## Extension Points

The architecture is designed with numerous extension points:

1. **Component Props**: All components accept additional props for customization
2. **Service Registration**: Services can be extended or replaced at runtime
3. **Processor Pipeline**: Markdown processing can be augmented with custom processors
4. **Model Handlers**: Custom handlers can be added for new LLM models
5. **Plugin System**: Third-party plugins can extend any part of the application

## Conclusion

This enhancement plan provides a systematic approach to improving the Wabbit application while maintaining extensibility and following best practices. The phased implementation allows for continuous delivery of value while building toward a comprehensive research platform. Each phase addresses specific aspects of the application while laying groundwork for future enhancements. By focusing on a solid foundation and clear extension points, the plan ensures the application can evolve to meet changing requirements and incorporate new technologies.