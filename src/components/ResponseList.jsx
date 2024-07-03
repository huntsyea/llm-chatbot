import React, { useRef, useEffect } from "react";
import { useChatState } from "./ChatContext";
import ResponseColumn from "./ResponseColumn";

const ResponseList = () => {
  const { responses, isLoading } = useChatState();
  const scrollContainerRef = useRef(null);
  const prevResponsesLength = useRef(responses.length);

  useEffect(() => {
    if (scrollContainerRef.current && responses.length > prevResponsesLength.current) {
      const container = scrollContainerRef.current;
      const cards = container.querySelectorAll('.response-card');
      if (cards.length > 0) {
        const lastCard = cards[cards.length - 1];
        const containerWidth = container.clientWidth;
        const cardWidth = lastCard.offsetWidth;
        const scrollPosition = lastCard.offsetLeft - (containerWidth / 2) + (cardWidth / 2);
        
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
      prevResponsesLength.current = responses.length;
    }
  }, [responses]);

  return (
    <div className="w-full overflow-x-auto snap-x snap-mandatory relative no-scrollbar"
         ref={scrollContainerRef}>
      <div className="inline-flex"
           style={{
             paddingLeft: 'max(16px, calc((100% - 42rem) / 2))',
             paddingRight: 'max(16px, calc((100% - 42rem) / 2))'
           }}>
        {responses.map((response, index) => (
          <div key={index} className="flex-shrink-0 w-full max-w-2xl px-2 snap-center response-card">
            <ResponseColumn
              response={response}
              columnIndex={index}
            />
          </div>
        ))}
        {isLoading && (
          <div className="flex-shrink-0 w-full max-w-2xl px-2 snap-center flex items-center justify-center">
            <div className="text-center p-4">Loading...</div>
          </div>
        )}
        {/* Extra space to ensure last card can fully snap */}
        <div className="flex-shrink-0 w-full max-w-2xl px-2 snap-center" aria-hidden="true" />
      </div>
      {/* Scroll cue */}
      <div className="absolute top-0 right-0 bottom-0 w-16 pointer-events-none" />
    </div>
  );
};

export default ResponseList;