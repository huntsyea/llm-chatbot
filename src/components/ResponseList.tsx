import React, { useRef, useEffect, useState } from "react";
import { useChatState, useChatDispatch } from "../hooks/useChatContext";
import ChatResponseCard from "./ChatResponseCard";
import ResponseSkeleton from "./ResponseSkeleton";
import CardCarousel from "./CardCarousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ResponseList component displays all chat responses in a carousel
 *
 * This component manages the display of response cards in a carousel with
 * consistent width matching the input area, mouse scroll navigation, and
 * improved arrow UI.
 *
 * @returns React component for displaying responses
 */
const ResponseList: React.FC = () => {
  const { responses, isLoading, isLoadingTopic, activeIndex } = useChatState();
  const dispatch = useChatDispatch();
  const prevResponsesLength = useRef<number>(responses.length);

  const setActiveIndex = (index: number) => {
    dispatch({ type: "SET_ACTIVE_INDEX", payload: index });
  };

  const canScrollLeft = activeIndex > 0;
  const canScrollRight =
    activeIndex < responses.length + (isLoading || isLoadingTopic ? 1 : 0) - 1;

  useEffect(() => {
    if (responses.length > prevResponsesLength.current) {
      setActiveIndex(responses.length - 1);
      prevResponsesLength.current = responses.length;
    }
  }, [responses.length]);

  useEffect(() => {
    if ((isLoading || isLoadingTopic) && activeIndex !== responses.length) {
      setActiveIndex(responses.length);
    }
  }, [isLoading, isLoadingTopic, responses.length, activeIndex]);

  const carouselItems = [
    ...responses.map((response, index) => (
      <div
        key={index}
        className="w-full h-full px-4"
        aria-label={`Response ${index + 1} of ${responses.length}${isLoading || isLoadingTopic ? " plus loading" : ""}`}
      >
        <div className="w-full h-full shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <ChatResponseCard response={response} />
        </div>
      </div>
    )),
    ...(isLoading || isLoadingTopic
      ? [
          <div
            key="loading"
            className="w-full h-full px-4"
            aria-label={
              isLoadingTopic ? "Loading topic response" : "Loading response"
            }
          >
            <div className="w-full h-full shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <ResponseSkeleton />
            </div>
          </div>,
        ]
      : []),
  ];

  return (
    <div
      className="container-1200 px-4 sm:px-6 lg:px-8 relative"
      role="region"
      aria-label="Response cards"
      style={{ height: "calc(100vh - 14rem)" }}
    >
      {/* Navigation buttons positioned outside the carousel */}
      {canScrollLeft && (
        <button
          onClick={() => setActiveIndex(activeIndex - 1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-20 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          aria-label="Previous response"
        >
          <ChevronLeft className="h-6 w-6 text-primary" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => setActiveIndex(activeIndex + 1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-20 bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          aria-label="Next response"
        >
          <ChevronRight className="h-6 w-6 text-primary" />
        </button>
      )}

      {/* Carousel container */}
      <div className="w-full h-full relative py-6">
        <CardCarousel
          items={carouselItems}
          activeIndex={activeIndex}
          onChangeIndex={setActiveIndex}
          onDragStart={(index, clientX) => {
            const newIndex = clientX > 0 && index > 0 ? index - 1 : index + 1;
            setActiveIndex(newIndex);
          }}
          className="w-full h-full"
          ariaLabel="Response cards carousel"
        />
      </div>

      {/* Scroll progress indicators */}
      {carouselItems.length > 1 && (
        <div className="flex justify-center mt-6 mb-2 space-x-3" role="tablist">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              className="w-3 h-3 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              style={{
                backgroundColor: `var(--primary)`,
                opacity: activeIndex === index ? 1 : 0.3,
                transition: "opacity 0.3s ease, transform 0.2s ease",
                transform: activeIndex === index ? "scale(1.2)" : "scale(1)",
              }}
              onClick={() => setActiveIndex(index)}
              aria-label={`Go to ${index < responses.length ? `response ${index + 1}` : "loading"}`}
              role="tab"
              aria-selected={activeIndex === index}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponseList;