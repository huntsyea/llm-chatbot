/**
 * This file provides path mapping for TypeScript to properly resolve JSX file
 * imports with TypeScript file imports.
 *
 * The issue is that the compiler is still looking for .jsx files when we want
 * it to find .tsx files instead.
 */

// Fix main component imports
declare module "./App" {
  import App from "./App.tsx";
  export default App;
}

declare module "./components/ChatInterface" {
  import ChatInterface from "./components/ChatInterface.tsx";
  export default ChatInterface;
}

declare module "./components/InputArea" {
  import InputArea from "./components/InputArea.tsx";
  export default InputArea;
}

declare module "./components/ResponseList" {
  import ResponseList from "./components/ResponseList.tsx";
  export default ResponseList;
}

declare module "./components/ResponseColumn" {
  import ResponseColumn from "./components/ResponseColumn.tsx";
  export default ResponseColumn;
}

declare module "./components/ChatMessage" {
  import ChatMessage from "./components/ChatMessage.tsx";
  export default ChatMessage;
}

declare module "./components/ModelSelector" {
  import ModelSelector from "./components/ModelSelector.tsx";
  export default ModelSelector;
}
