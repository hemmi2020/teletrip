import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Home from "../Home";

// Mock Header, Footer, Slider to avoid context/dependency issues
vi.mock("../components/Header", () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock("../components/Footer", () => ({
  default: () => <div data-testid="mock-footer">Footer</div>,
}));

vi.mock("../components/Slider", () => ({
  default: () => <div data-testid="mock-slider">Slider</div>,
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => {
      // Filter out framer-motion specific props
      const { initial, whileInView, viewport, transition, animate, exit, ...domProps } = props;
      return <div {...domProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

const mockDestinations = [
  { _id: "1", name: "Paris", country: "France", image: "https://example.com/paris.jpg", tag: "Popular" },
  { _id: "2", name: "Bali", country: "Indonesia", image: "https://example.com/bali.jpg", tag: "Trending" },
  { _id: "3", name: "New York", country: "USA", image: "https://example.com/ny.jpg", tag: "Top Rated" },
  { _id: "4", name: "Dubai", country: "UAE", image: "https://example.com/dubai.jpg", tag: "Luxury" },
  { _id: "5", name: "Tokyo", country: "Japan", image: "https://example.com/tokyo.jpg", tag: "Culture" },
];

function renderHome() {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe("Home page modifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch to return destination data
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true, data: mockDestinations }),
      })
    );
  });

  describe("View All button - Requirements 5.1, 5.2", () => {
    it('renders "View All" link that navigates to /destinations', async () => {
      renderHome();

      await waitFor(() => {
        const viewAllLinks = screen.getAllByTestId("view-all-destinations");
        expect(viewAllLinks.length).toBeGreaterThan(0);
        // Check that at least one link points to /destinations
        const link = viewAllLinks[0];
        expect(link.closest("a")).toHaveAttribute("href", "/destinations");
      });
    });

    it('"View All" link contains correct text', async () => {
      renderHome();

      await waitFor(() => {
        const viewAllLinks = screen.getAllByTestId("view-all-destinations");
        expect(viewAllLinks[0]).toHaveTextContent("View All");
      });
    });
  });

  describe("Carousel in destinations section - Requirements 6.1", () => {
    it("renders Carousel component in the destinations section", async () => {
      renderHome();

      await waitFor(() => {
        const carousels = screen.getAllByTestId("carousel-container");
        // At least one carousel should be present for destinations
        expect(carousels.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("fetches destinations from the API", async () => {
      renderHome();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/destinations")
        );
      });
    });
  });

  describe("Carousel in testimonials section - Requirements 7.1", () => {
    it("renders multiple Carousel components (destinations + testimonials)", async () => {
      renderHome();

      await waitFor(() => {
        const carousels = screen.getAllByTestId("carousel-container");
        // Should have at least 2 carousels: one for destinations (mobile), one for testimonials (mobile)
        // or desktop equivalents
        expect(carousels.length).toBeGreaterThanOrEqual(2);
      });
    });
  });
});
