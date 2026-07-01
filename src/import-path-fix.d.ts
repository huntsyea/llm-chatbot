/** Compatibility declarations for extensionless local component imports. */

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

declare module "./components/ModelSelector" {
  import ModelSelector from "./components/ModelSelector.tsx";
  export default ModelSelector;
}
