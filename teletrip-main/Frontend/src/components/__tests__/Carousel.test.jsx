import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Carousel, { computeNextIndex, computePrevIndex } from "../Carousel";

// Helper to create mock items
function createItems(count) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} data-testid={`item-${i}`}>
      Item {i}
    </div>
  ));
}

describe("Carousel Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock window.innerWidth to desktop by default
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Dot indicators", () => {
    it("renders correct number of dots for items that exceed itemsPerView", () => {
      const items = createItems(9);
      render(
        <Carousel
          items={items}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      const dots = screen.getByTestId("carousel-dots");
      // 9 items / 3 per view = 3 pages = 3 dots
      expect(dots.children).toHaveLength(3);
    });

    it("renders correct number of dots when items don't divide evenly", () => {
      const items = createItems(7);
      render(
        <Carousel
          items={items}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      const dots = screen.getByTestId("carousel-dots");
      // 7 items / 3 per view = ceil(7/3) = 3 pages = 3 dots
      expect(dots.children).toHaveLength(3);
    });

    it("does not render dots when showDots is false", () => {
      const items = createItems(6);
      render(
        <Carousel
          items={items}
          showDots={false}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      expect(screen.queryByTestId("carousel-dots")).not.toBeInTheDocument();
    });
  });

  describe("Arrow navigation", () => {
    it("advances to next page when next arrow is clicked", () => {
      const items = createItems(6);
      render(
        <Carousel
          items={items}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      // Initially shows items 0, 1, 2
      expect(screen.getByTestId("item-0")).toBeInTheDocument();
      expect(screen.getByTestId("item-1")).toBeInTheDocument();
      expect(screen.getByTestId("item-2")).toBeInTheDocument();

      // Click next
      fireEvent.click(screen.getByTestId("carousel-next"));

      // Now shows items 3, 4, 5
      expect(screen.getByTestId("item-3")).toBeInTheDocument();
      expect(screen.getByTestId("item-4")).toBeInTheDocument();
      expect(screen.getByTestId("item-5")).toBeInTheDocument();
    });

    it("goes to previous page when prev arrow is clicked", () => {
      const items = createItems(6);
      render(
        <Carousel
          items={items}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      // Click prev from first page wraps to last page
      fireEvent.click(screen.getByTestId("carousel-prev"));

      // Should wrap to last page (items 3, 4, 5)
      expect(screen.getByTestId("item-3")).toBeInTheDocument();
      expect(screen.getByTestId("item-4")).toBeInTheDocument();
      expect(screen.getByTestId("item-5")).toBeInTheDocument();
    });

    it("does not render arrows when showArrows is false", () => {
      const items = createItems(6);
      render(
        <Carousel
          items={items}
          showArrows={false}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      expect(screen.queryByTestId("carousel-prev")).not.toBeInTheDocument();
      expect(screen.queryByTestId("carousel-next")).not.toBeInTheDocument();
    });
  });

  describe("Auto-play and hover pause", () => {
    it("auto-advances after the specified interval", () => {
      const items = createItems(6);
      render(
        <Carousel
          items={items}
          autoPlayInterval={4000}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      // Initially on page 0
      expect(screen.getByTestId("item-0")).toBeInTheDocument();

      // Advance time by 4000ms
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      // Should now be on page 1
      expect(screen.getByTestId("item-3")).toBeInTheDocument();
    });

    it("pauses auto-play on mouse enter and resumes on mouse leave", () => {
      const items = createItems(6);
      render(
        <Carousel
          items={items}
          autoPlayInterval={4000}
          pauseOnHover={true}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      const container = screen.getByTestId("carousel-container");

      // Hover over carousel
      fireEvent.mouseEnter(container);

      // Advance time — should NOT advance because paused
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      // Still on page 0
      expect(screen.getByTestId("item-0")).toBeInTheDocument();

      // Mouse leave — should resume
      fireEvent.mouseLeave(container);

      // Advance time — should now advance
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      // Should be on page 1
      expect(screen.getByTestId("item-3")).toBeInTheDocument();
    });

    it("does not pause on hover when pauseOnHover is false", () => {
      const items = createItems(6);
      render(
        <Carousel
          items={items}
          autoPlayInterval={4000}
          pauseOnHover={false}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      const container = screen.getByTestId("carousel-container");

      // Hover over carousel
      fireEvent.mouseEnter(container);

      // Advance time — should still advance because pauseOnHover is false
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      // Should be on page 1
      expect(screen.getByTestId("item-3")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("renders nothing when items array is empty (0 items)", () => {
      const { container } = render(
        <Carousel
          items={[]}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      expect(container.innerHTML).toBe("");
    });

    it("renders single item without arrows or dots (1 item)", () => {
      const items = createItems(1);
      render(
        <Carousel
          items={items}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      // Item is rendered
      expect(screen.getByTestId("item-0")).toBeInTheDocument();

      // No arrows or dots
      expect(screen.queryByTestId("carousel-prev")).not.toBeInTheDocument();
      expect(screen.queryByTestId("carousel-next")).not.toBeInTheDocument();
      expect(screen.queryByTestId("carousel-dots")).not.toBeInTheDocument();
    });

    it("hides navigation when items count is less than itemsPerView", () => {
      const items = createItems(2); // 2 items, desktop shows 3
      render(
        <Carousel
          items={items}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      // Items are rendered
      expect(screen.getByTestId("item-0")).toBeInTheDocument();
      expect(screen.getByTestId("item-1")).toBeInTheDocument();

      // No arrows or dots since all items fit in view
      expect(screen.queryByTestId("carousel-prev")).not.toBeInTheDocument();
      expect(screen.queryByTestId("carousel-next")).not.toBeInTheDocument();
      expect(screen.queryByTestId("carousel-dots")).not.toBeInTheDocument();
    });

    it("does not auto-play when items count equals 1", () => {
      const items = createItems(1);
      render(
        <Carousel
          items={items}
          autoPlayInterval={4000}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      // Advance time
      act(() => {
        vi.advanceTimersByTime(8000);
      });

      // Still showing the single item
      expect(screen.getByTestId("item-0")).toBeInTheDocument();
    });

    it("does not auto-play when items fit within itemsPerView", () => {
      const items = createItems(2); // 2 items, desktop shows 3
      render(
        <Carousel
          items={items}
          autoPlayInterval={4000}
          itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        />
      );

      // Advance time
      act(() => {
        vi.advanceTimersByTime(8000);
      });

      // Still showing both items (no scrolling happened)
      expect(screen.getByTestId("item-0")).toBeInTheDocument();
      expect(screen.getByTestId("item-1")).toBeInTheDocument();
    });
  });

  describe("computeNextIndex / computePrevIndex helpers", () => {
    it("wraps from last page to first", () => {
      expect(computeNextIndex(2, 3)).toBe(0);
    });

    it("advances normally within range", () => {
      expect(computeNextIndex(0, 3)).toBe(1);
      expect(computeNextIndex(1, 3)).toBe(2);
    });

    it("wraps from first page to last on prev", () => {
      expect(computePrevIndex(0, 3)).toBe(2);
    });

    it("returns 0 for totalPages <= 0", () => {
      expect(computeNextIndex(0, 0)).toBe(0);
      expect(computePrevIndex(0, 0)).toBe(0);
    });
  });
});
