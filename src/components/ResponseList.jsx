import React, { useRef, useEffect } from 'react';
import { useChatState } from './ChatContext';
import ResponseColumn from './ResponseColumn';

const ResponseList = () => {
  const { responses, isLoading } = useChatState();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [responses]);

  return (
    <div className="overflow-x-auto min-w-max pr-4">
      <div 
        ref={scrollContainerRef}
        className="space-x-4 flex pb-4"
        style={{ height: "calc(100vh - 15rem)", minHeight: "400px" }}
      >
        {responses.map((response, index) => (
          <ResponseColumn key={index} response={response} columnIndex={index} />
        ))}
        {isLoading && (
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="text-center p-4">Loading...</div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResponseList;
