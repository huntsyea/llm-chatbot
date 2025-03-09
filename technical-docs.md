# Wabbit Technical Documentation

## Project Overview

Wabbit is a modern web-based chatbot application built with React, TypeScript, and Vite that allows users to interact with large language models (LLMs) through both OpenRouter and Google Gemini APIs. The application provides a clean, intuitive interface for sending queries to various LLMs and viewing their responses in a carousel with animated transitions and stacking effects.

## Architecture

### Tech Stack

- **Frontend Framework**: React.js 18 with TypeScript
- **Build Tool**: Vite 6
- **Type System**: TypeScript 5.4
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API with TypeScript types
- **API Integration**: 
  - OpenRouter (LLM API gateway)
  - Google Gemini API (direct integration)
- **Markdown Rendering**: Enhanced markdown processing with react-markdown and remark-gfm
- **UI Animations**: CSS transitions and transforms for smooth carousel effects

### Component Structure

```
src/
├── api/                     # API integration
│   ├── openRouter.ts        # OpenRouter API client
│   └── gemini.ts            # Google Gemini API client
├── components/              # React components
│   ├── ui/                  # UI elements (based on shadcn/ui)
│   │   ├── button.tsx       # Button component
│   │   ├── card.tsx         # Card component
│   │   ├── dialog.tsx       # Dialog component
│   │   ├── input.tsx        # Input component
│   │   ├── label.tsx        # Label component
│   │   ├── radio-group.tsx  # Radio group component
│   │   ├── slider.tsx       # Slider component for model config
│   │   └── tabs.tsx         # Tabs component for model selection
│   ├── markdown/            # Markdown rendering components
│   │   └── EnhancedMarkdown.tsx # Reusable markdown component with interactive features
│   ├── CardCarousel.tsx     # Animated carousel with stacking effect
│   ├── ChatContext.tsx      # State management
│   ├── ChatInterface.tsx    # Main interface container
│   ├── ChatMessage.tsx      # Individual message component
│   ├── GeminiConfigDialog.tsx # Gemini model configuration dialog
│   ├── InputArea.tsx        # User input component
│   ├── ModelSelector.tsx    # LLM model selection with API tabs
│   ├── ResponseColumn.tsx   # Column for displaying responses
│   └── ResponseList.tsx     # Container for all responses
├── interfaces/              # Centralized type definitions
│   └── core.ts              # Core type interfaces
├── services/                # Application services
│   ├── api/                 # API service interfaces and implementations
│   │   ├── ApiClientInterface.ts # API client interface definitions
│   │   └── ApiClientRegistry.ts  # Registry for API clients
│   └── markdown/            # Markdown processing services
│       └── MarkdownService.ts    # Service for normalizing markdown
├── lib/                     # Utility functions
│   └── utils.ts             # Helper functions
├── assets/                  # Static assets
├── index.css                # Global CSS including Tailwind
├── main.tsx                 # Application entry point
├── App.tsx                  # Root component
├── vite-env.d.ts           # Vite environment type definitions
└── import-path-fix.d.ts    # Import path type declarations
```

## TypeScript Integration

The project implements TypeScript to provide type safety and improved development experience:

### Type Definitions

The application leverages a centralized type system with interfaces defined in dedicated files:

```typescript
// Core type definitions (src/interfaces/core.ts)
export interface Response {
  /** The original user query */
  query: string;
  
  /** The response content from the model */
  response: string;
  
  /** Identifier for the model that generated the response */
  model: string;
  
  /** Unix timestamp when the response was generated */
  timestamp: number;
  
  /** Extension point: additional metadata about the response */
  metadata?: Record<string, unknown>;
}

/**
 * Configuration options for API clients
 */
export interface ApiClientOptions {
  /** The model identifier to use for generation */
  model: string;
  
  /** Controls randomness in generation (0.0 to 1.0) */
  temperature?: number;
  
  /** Maximum number of tokens to generate */
  maxTokens?: number;
  
  /** Extension point: additional parameters for specific models */
  [key: string]: unknown;
}

/**
 * Base interface for all API clients
 */
export interface ApiClient {
  /**
   * Generate a response from the model
   */
  generateResponse(prompt: string, options: ApiClientOptions): Promise<string>;
  
  /**
   * Generate a response for a specific topic based on previous context
   */
  generateTopicResponse?(topic: string, previousContext: string, options: ApiClientOptions): Promise<string>;
}
```

### API Client Interfaces

The application defines standardized interfaces for API clients:

```typescript
// API Client interfaces (src/services/api/ApiClientInterface.ts)
export interface OpenRouterApiOptions extends ApiClientOptions {
  /** System prompt to set context for the model */
  systemPrompt?: string;
  
  /** Whether to use streaming for responses */
  stream?: boolean;
  
  /** Response format specification */
  responseFormat?: {
    type: string;
  };
}

export interface GeminiApiOptions extends ApiClientOptions {
  /** Limits tokens considered based on probability */
  topK?: number;
  
  /** Nucleus sampling threshold */
  topP?: number;
  
  /** Maximum number of tokens in response */
  maxOutputTokens?: number;
  
  /** Sequences that will stop generation */
  stopSequences?: string[];
  
  /** MIME type of the response */
  responseMimeType?: string;
}

/**
 * Registry for available API clients
 */
export interface ApiClientRegistry {
  /** Register a new API client factory */
  register: (name: string, factory: ApiClientFactory) => void;
  
  /** Get an API client by name */
  get: (name: string, apiKey: string) => ApiClient | undefined;
  
  /** Get all registered API client names */
  getAvailableClients: () => string[];
}
```

### UI Component Type Declarations

UI components use TypeScript interfaces for props:

```typescript
// CardCarousel component props
interface CardCarouselProps {
  /** Array of cards to display */
  items: React.ReactNode[];
  
  /** Currently active card index */
  activeIndex: number;
  
  /** Callback when active index changes */
  onChangeIndex: (newIndex: number) => void;
  
  /** Whether to enable autoplay */
  autoplay?: boolean;
  
  /** Autoplay interval in ms */
  autoplayInterval?: number;
  
  /** Custom class names */
  className?: string;
  
  /** Accessibility label */
  ariaLabel?: string;
}

// Shadcn UI component props
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

// New slider component for Gemini model configuration
interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  // Inherits Radix UI slider properties
}
```

### Enhanced Markdown Components

The application now includes enhanced markdown processing and rendering components:

```typescript
// Markdown normalization options (src/services/markdown/MarkdownService.ts)
export interface MarkdownNormalizationOptions {
  /** Convert inconsistent heading styles to standard format */
  standardizeHeadings?: boolean;
  
  /** Enforce consistent list formatting */
  enforceListFormatting?: boolean;
  
  /** Standardize table formatting */
  standardizeTables?: boolean;
  
  /** Remove or sanitize potentially unsafe HTML */
  sanitizeHTML?: boolean;
  
  /** Ensure code blocks use proper fencing and language tags */
  enforceCodeBlocks?: boolean;
  
  /** Extension point: additional normalization options */
  [key: string]: unknown;
}

// Enhanced Markdown component props (src/components/markdown/EnhancedMarkdown.tsx)
export interface EnhancedMarkdownProps {
  /** The markdown content to render */
  content: string;
  
  /** Whether to normalize the markdown before rendering */
  normalize?: boolean;
  
  /** Options for markdown normalization */
  normalizationOptions?: MarkdownNormalizationOptions;
  
  /** Callback for when an element in the markdown is clicked */
  onElementClick?: (element: string, text: string) => void;
  
  /** Additional CSS class names */
  className?: string;
  
  /** Whether to enable code block copy buttons */
  enableCodeCopy?: boolean;
  
  /** Extension point: additional props */
  [key: string]: unknown;
}
```

## Key Components

### 1. App Component (App.tsx)

The root component renders the application header with a logo and the main ChatInterface. It's implemented as a functional component with TypeScript:

```typescript
const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center">
      <header>
        {/* Header content */}
      </header>
      <main className="w-full flex-grow">
        <ChatInterface />
      </main>
    </div>
  );
};
```

### 2. CardCarousel Component (CardCarousel.tsx)

The CardCarousel component implements an animated, interactive carousel with a stacking effect for non-centered cards:

```typescript
const CardCarousel: React.FC<CardCarouselProps> = ({
  items,
  activeIndex,
  onChangeIndex,
  autoplay = false,
  autoplayInterval = 5000,
  className = '',
  ariaLabel = 'Card carousel'
}) => {
  // State for drag handling
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  
  // References for animation and interaction
  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastDragPosition = useRef(0);
  const dragStartTime = useRef(0);
  
  // Calculate card styles based on distance from active index
  const getCardStyle = useCallback((index: number) => {
    const distance = index - activeIndex;
    const absDistance = Math.abs(distance);
    
    // Apply transforms based on distance from center
    let scale = 1;
    let translateX = 0;
    const translateZ = 0;
    let zIndex = 0;
    let opacity = 1;
    
    if (absDistance === 0) {
      // Center card
      scale = 1;
      translateX = -50;
      zIndex = 10;
    } else if (absDistance === 1) {
      // Adjacent cards
      scale = 0.85;
      translateX = distance < 0 ? -85 : -15;
      zIndex = 5;
      opacity = 0.8;
    } else if (absDistance === 2) {
      // Cards two steps away
      scale = 0.7;
      translateX = distance < 0 ? -95 : -5;
      zIndex = 3;
      opacity = 0.6;
    } else {
      // Cards three or more steps away
      scale = 0.6;
      translateX = distance < 0 ? -100 : 0;
      zIndex = 1;
      opacity = 0.4;
    }
    
    // Apply transforms and transitions
    return {
      transform: `translateX(${translateX}%) scale(${scale}) translateZ(${translateZ}px)`,
      zIndex,
      opacity,
      transition: isDragging ? 'none' : 'transform 400ms cubic-bezier(0.25, 1, 0.5, 1), opacity 400ms ease'
    };
  }, [activeIndex, isDragging]);
  
  // Implement pointer/touch event handlers for drag interaction
  // Implement keyboard navigation for accessibility
  // Handle autoplay functionality if enabled
  
  return (
    <div className="card-carousel relative overflow-visible">
      {items.map((item, index) => (
        <div 
          key={index}
          className="card-carousel-item"
          style={getCardStyle(index)}
          aria-hidden={index !== activeIndex}
        >
          {item}
        </div>
      ))}
    </div>
  );
};
```

### 3. ResponseList Component (ResponseList.tsx)

The ResponseList component uses the CardCarousel to display response cards with navigation controls:

```typescript
const ResponseList: React.FC = () => {
  const { responses, isLoading } = useChatState();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  // Track whether we can navigate left/right
  const canScrollLeft = activeIndex > 0;
  const canScrollRight = activeIndex < responses.length - 1;
  
  // Auto-focus on new responses
  useEffect(() => {
    if (responses.length > prevResponsesLength.current) {
      setActiveIndex(responses.length - 1);
      prevResponsesLength.current = responses.length;
    }
  }, [responses.length]);
  
  return (
    <div className="container-1200 relative">
      {/* Navigation buttons */}
      {canScrollLeft && (
        <button 
          onClick={() => setActiveIndex(prev => prev - 1)}
          className="absolute left-2 top-1/2 z-20 rounded-full"
          aria-label="Previous response"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}
      
      {/* Main carousel container */}
      <CardCarousel
        items={responses.map((response) => (
          <ResponseColumn response={response} />
        ))}
        activeIndex={activeIndex}
        onChangeIndex={setActiveIndex}
      />
      
      {/* Indicator dots */}
      <div className="flex justify-center mt-4 space-x-2">
        {responses.map((_, index) => (
          <button
            key={index}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              opacity: activeIndex === index ? 1 : 0.3
            }}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};
```

### 4. ChatContext System (ChatContext.tsx)

The ChatContext implements state management with support for both APIs and model configuration:

```typescript
// Context creation with type safety
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Default Gemini configuration
const defaultGeminiConfig: GeminiApiOptions = {
  model: '',
  temperature: 0.7,
  topK: 40,
  topP: 0.9,
  maxOutputTokens: 2048,
};

// Initial state with Gemini-specific properties
const initialState: ChatState = {
  responses: [],
  currentQuery: '',
  isLoading: false,
  selectedModel: "meta-llama/llama-3-8b-instruct:free",
  isGeminiModel: false,
  geminiConfig: defaultGeminiConfig,
};

// Reducer with typed state and actions
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_RESPONSES':
      return { ...state, responses: action.payload as Response[] };
    case 'ADD_RESPONSE': 
      return { ...state, responses: [...state.responses, action.payload as Response] };
    case 'SET_MODEL':
      return { 
        ...state, 
        selectedModel: (action.payload as { model: string }).model, 
        isGeminiModel: (action.payload as { isGemini: boolean }).isGemini 
      };
    case 'SET_GEMINI_CONFIG':
      return { ...state, geminiConfig: action.payload as GeminiApiOptions };
    default:
      // Extension point: handle additional action types
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
}
```

### 5. API Integrations

The application supports multiple LLM providers through separate API clients and a unified registry:

#### API Client Registry (ApiClientRegistry.ts)

```typescript
export class ApiClientRegistryImpl implements ApiClientRegistry {
  /** Map of registered API client factories */
  private readonly factories: Map<string, ApiClientFactory> = new Map();
  
  /** Cache of instantiated API clients */
  private readonly instanceCache: Map<string, ApiClient> = new Map();
  
  /**
   * Register a new API client factory
   */
  register(name: string, factory: ApiClientFactory): void {
    if (this.factories.has(name)) {
      console.warn(`API client "${name}" is already registered. Overwriting previous registration.`);
    }
    
    this.factories.set(name, factory);
    
    // Clear cache for this client if it exists
    const cacheKey = this.buildCacheKey(name);
    if (this.instanceCache.has(cacheKey)) {
      this.instanceCache.delete(cacheKey);
    }
  }
  
  /**
   * Get an API client by name
   */
  get(name: string, apiKey: string): ApiClient | undefined {
    const factory = this.factories.get(name);
    
    if (!factory) {
      console.warn(`No API client registered with name "${name}"`);
      return undefined;
    }
    
    // Use cached instance if available
    const cacheKey = this.buildCacheKey(name, apiKey);
    if (this.instanceCache.has(cacheKey)) {
      return this.instanceCache.get(cacheKey);
    }
    
    // Create new instance
    try {
      const client = factory(apiKey);
      this.instanceCache.set(cacheKey, client);
      return client;
    } catch (error) {
      console.error(`Error creating API client "${name}":`, error);
      return undefined;
    }
  }
}

// Singleton instance
export const apiClientRegistry = new ApiClientRegistryImpl();
```

## Data Flow

The application implements a bifurcated data flow depending on which API is selected:

1. User enters a query in the InputArea component
2. The query triggers a type-safe event handler on Enter key press
3. The query is stored in ChatContext state via a typed dispatch call
4. Based on the `isGeminiModel` flag:
   - If true, a request is made to the Gemini API with model configuration
   - If false, a request is made to the OpenRouter API
5. The response is processed with type checking for structure
6. The response is added to the state with proper typing
7. The response text is processed by the MarkdownService for normalization
8. The UI updates with the new response using the EnhancedMarkdown component
9. The CardCarousel automatically focuses on the new response card
10. If a user clicks on a topic in a response, the appropriate API is called:
    - Gemini topics use `getGeminiTopicResponse`
    - OpenRouter topics use `getTopicSpecificResponse`

## UI Interaction Flow

The application provides a rich, interactive user experience:

1. **Card Navigation**: Users can navigate between response cards using:
   - Left/right arrow buttons
   - Keyboard arrow keys
   - Indicator dots at the bottom
   - Touch/mouse drag gestures
   
2. **Card Visualization**:
   - The active card is displayed at 100% scale in the center
   - Adjacent cards are scaled down to 85% and partially visible
   - Cards further away are scaled down more and stacked to the sides
   - Smooth animations occur during transitions between cards
   
3. **Interaction Feedback**:
   - Visual feedback during drag operations
   - Momentum-based scrolling based on drag velocity
   - Proper focus management for keyboard navigation
   - Accessibility attributes for screen readers

## Environment Configuration

The application requires API keys for both services:

```typescript
interface ImportMeta {
  readonly env: {
    readonly [key: string]: string | undefined;
    readonly VITE_OPENROUTER_API_KEY: string;
    readonly VITE_GEMINI_API_KEY: string;
    readonly MODE: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
  }
}
```

Example `.env` file:
```
# OpenRouter API Key
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

# Google Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your OpenRouter and Gemini API keys
   - OpenRouter key: https://openrouter.ai/keys
   - Gemini key: https://ai.google.dev/ (Google AI Studio)
4. Start the development server: `npm run dev`
5. Run type checking: `npx tsc --noEmit --jsx react`
6. Build for production: `npm run build`

## Supported Models

### OpenRouter Models
- Llama 3 8B
- Mistral 7B
- Phi-3 Medium 128K
- Phi-3 Mini 128K
- Gemma 2 9B
- Zephyr 7B
- Toppy M 7B
- Nous Capybara 7B
- OpenChat 3.5 7B

### Google Gemini Models
- Gemini 2.0 Flash
- Gemini 2.0 Flash-Lite
- Gemini 2.0 Pro (Experimental)
- Gemini 2.0 Flash Thinking (Experimental)
- LearnLM 1.5 Pro (Experimental)

## Architecture Decisions

### Centralized Type System

The application implements a centralized type system with clear interfaces:

1. **Core Types**: Fundamental types defined in `interfaces/core.ts`
2. **Service Interfaces**: Type definitions for service contracts
3. **Extension Points**: Index signatures allowing for future extension
4. **Type Re-exports**: Properly exported types using `export type`

### Multi-API Integration

The application architecture was designed to support multiple LLM providers simultaneously:

1. **API Abstraction**: Separate API client files with consistent interfaces
2. **Model Provider Detection**: The `isGeminiModel` flag routes requests appropriately
3. **Unified Response Format**: Common response structure regardless of provider
4. **Configuration Flexibility**: Model-specific settings for fine-tuning responses
5. **API Client Registry**: Dynamic registration and retrieval of API clients

### Enhanced Markdown Processing

The application implements a comprehensive markdown processing system:

1. **Normalization Service**: Standardize markdown from different LLM sources
2. **Configurable Processing**: Options for controlling normalization behavior
3. **Interactive Elements**: Clickable headings for topic exploration
4. **Enhanced Rendering**: Improved code blocks with syntax highlighting and copy functionality
5. **Consistent Styling**: Uniform appearance for tables, lists, and other elements

### Interactive UI Components

The application features modern, interactive UI components:

1. **Card Carousel**: Animated carousel with stacking effect and smooth transitions
2. **Drag Interaction**: Touch and mouse drag support with momentum-based scrolling
3. **Responsive Design**: Adapts to different screen sizes with appropriate scaling
4. **Accessibility**: Keyboard navigation, ARIA attributes, and screen reader support
5. **Visual Feedback**: Transitions, transforms, and opacity changes for visual hierarchy

### Component Architecture

The application follows a modular component architecture with clear separation of concerns:

1. **UI Components**: Reusable shadcn components with TypeScript interfaces
2. **API Integration**: Separate modules for different LLM providers
3. **State Management**: Central context for application state with extension points
4. **Presentation Components**: Focus on rendering and user interaction
5. **Configuration Components**: Dedicated UI for model parameter adjustments
6. **Service Layer**: Dedicated services for business logic and data processing

## Future Enhancement Opportunities

1. **Streaming Responses**: Implement streaming for real-time response generation
2. **Model Parameter Presets**: Save and load configuration presets for different use cases
3. **Image and Multimodal Support**: Leverage Gemini's vision capabilities
4. **Response Comparison**: Side-by-side comparison of different models' responses
5. **Client-Side Caching**: Implement response caching for performance improvement
6. **Conversation History**: Persistent chat sessions with history management
7. **Custom Model Deployment**: Support for custom fine-tuned models 
8. **Topic Analysis**: Enhanced topic extraction and suggestion system
9. **Responsive UI Improvements**: Further optimization for mobile and tablet devices
10. **Markdown Formatting Tools**: Add UI for formatting user input as markdown 
11. **Advanced Carousel Features**: Add pinch-to-zoom, rotation effects, and fullscreen mode 