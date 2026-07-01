import React, { useRef, useCallback, useEffect } from "react";

/** Props for the CardCarousel component */
interface CardCarouselProps {
  /** Array of cards to display */
  items: React.ReactNode[];

  /** Currently active card index */
  activeIndex: number;

  /** Callback when active index changes */
  onChangeIndex: (newIndex: number) => void;

  /** Handler for completing a drag from a card */
  onDragStart?: (index: number, dragDistance: number) => void;

  /** Whether to enable autoplay */
  autoplay?: boolean;

  /** Autoplay interval in ms */
  autoplayInterval?: number;

  /** Custom class names */
  className?: string;

  /** Accessibility label */
  ariaLabel?: string;
}

type DraggableCarouselChildProps = {
  onDragStart?: (dragDistance: number) => void;
  "data-card-index"?: number;
};

/**
 * CardCarousel component - A modern carousel with stacking effect
 *
 * This component displays cards in a carousel with a stacking effect where
 * non-centered cards appear smaller and stacked to the sides.
 */
const CardCarousel: React.FC<CardCarouselProps> = ({
  items,
  activeIndex,
  onChangeIndex,
  onDragStart,
  autoplay = false,
  autoplayInterval = 5000,
  className = "",
  ariaLabel = "Card carousel",
}) => {
  // References
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Constants for animation
  const TRANSITION_DURATION = 400; // ms

  // Scale factors for card stacking
  const getCardStyle = useCallback(
    (index: number) => {
      const distance = index - activeIndex;
      const absDistance = Math.abs(distance);

      // Base styles that apply to all cards
      const style: React.CSSProperties = {
        position: "absolute",
        left: "50%",
        top: 0,
        width: "100%",
        height: "100%",
        transition: `transform ${TRANSITION_DURATION}ms cubic-bezier(0.25, 1, 0.5, 1), opacity ${TRANSITION_DURATION}ms ease, box-shadow ${TRANSITION_DURATION}ms ease`,
        willChange: "transform, opacity, box-shadow",
      };

      // Calculate transform based on distance from center
      let scale: number;
      let translateX: number;
      let zIndex: number;
      let opacity: number;
      let boxShadow: string;

      if (absDistance === 0) {
        // Center card
        scale = 1;
        translateX = -50;
        zIndex = 10;
        opacity = 1;
        boxShadow = "none";
      } else if (absDistance === 1) {
        // Adjacent cards
        scale = 0.85;
        translateX = distance < 0 ? -85 : -15; // Push to left or right
        zIndex = 5;
        opacity = 0.8;
        boxShadow =
          "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)";
      } else if (absDistance === 2) {
        // Cards two steps away
        scale = 0.7;
        translateX = distance < 0 ? -95 : -5; // Further to left or right
        zIndex = 3;
        opacity = 0.6;
        boxShadow =
          "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)";
      } else {
        // Cards three or more steps away
        scale = 0.6;
        translateX = distance < 0 ? -100 : 0; // Fully stacked
        zIndex = 1;
        opacity = 0.4;
        boxShadow = "none";

        // If it's more than 3 cards away, hide it
        if (absDistance > 3) {
          return {
            ...style,
            visibility: "hidden" as const,
            pointerEvents: "none" as React.CSSProperties["pointerEvents"],
          };
        }
      }

      // Apply all calculated transforms
      return {
        ...style,
        transform: `translateX(${translateX}%) scale(${scale})`,
        zIndex,
        opacity,
        boxShadow,
        pointerEvents: "auto" as const,
        borderRadius: absDistance === 0 ? "0" : "0.5rem",
      };
    },
    [activeIndex],
  );

  // Navigation functions
  const goToCard = useCallback(
    (index: number) => {
      const newIndex = Math.max(0, Math.min(items.length - 1, index));
      onChangeIndex(newIndex);
    },
    [items.length, onChangeIndex],
  );

  const goNext = useCallback(() => {
    if (activeIndex < items.length - 1) {
      goToCard(activeIndex + 1);
    }
  }, [activeIndex, goToCard, items.length]);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) {
      goToCard(activeIndex - 1);
    }
  }, [activeIndex, goToCard]);

  // Autoplay functionality
  const startAutoplay = useCallback(() => {
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
    }

    autoplayTimerRef.current = setTimeout(() => {
      if (activeIndex < items.length - 1) {
        goNext();
      } else {
        // Loop back to the first card
        goToCard(0);
      }
    }, autoplayInterval);
  }, [autoplayInterval, goNext, activeIndex, items.length, goToCard]);

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      const { deltaY } = event;
      if (Math.abs(deltaY) < 10) return; // Ignore small scrolls

      if (wheelTimerRef.current) {
        clearTimeout(wheelTimerRef.current);
      }

      wheelTimerRef.current = setTimeout(() => {
        if (deltaY > 0 && activeIndex < items.length - 1) {
          goNext();
        } else if (deltaY < 0 && activeIndex > 0) {
          goPrev();
        }
      }, 100);
    },
    [activeIndex, items.length, goNext, goPrev],
  );

  useEffect(() => {
    return () => {
      if (wheelTimerRef.current) {
        clearTimeout(wheelTimerRef.current);
      }
    };
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        default:
          break;
      }
    },
    [goPrev, goNext],
  );

  // Effect for autoplay
  useEffect(() => {
    if (autoplay) {
      startAutoplay();
    }

    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [autoplay, startAutoplay, activeIndex]);

  return (
    <div
      className={`card-carousel relative overflow-visible ${className}`}
      ref={carouselRef}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      tabIndex={0}
      role="region"
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      style={{
        height: "100%",
        touchAction: "pan-y", // Allow vertical scrolling
      }}
    >
      {items.map((item, index) => {
        const isValidElement =
          React.isValidElement<DraggableCarouselChildProps>(item);
        const enhancedItem = isValidElement
          ? React.cloneElement(item, {
              onDragStart: onDragStart
                ? (dragDistance: number) => onDragStart(index, dragDistance)
                : undefined,
              "data-card-index": index,
            })
          : item;

        return (
          <div
            key={index}
            className="card-carousel-item"
            style={getCardStyle(index)}
            {...(index !== activeIndex ? { inert: true } : {})}
            tabIndex={index === activeIndex ? 0 : -1}
            role="group"
            aria-roledescription="slide"
            aria-label={`Card ${index + 1} of ${items.length}`}
          >
            {enhancedItem}
          </div>
        );
      })}
    </div>
  );
};

export default CardCarousel;
