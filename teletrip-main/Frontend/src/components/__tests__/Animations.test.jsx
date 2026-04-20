import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  NavLink: ({ children, to, className, ...props }) => (
    <a href={to} className={typeof className === "function" ? className({ isActive: false }) : className} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/home" }),
}));

// Mock CartSystem context
vi.mock("../CartSystem", () => ({
  UserDataContext: React.createContext({ user: null, setUser: vi.fn() }),
  useCart: () => ({
    getTotalItems: () => 0,
    items: [],
    getTotalPrice: () => 0,
  }),
  SlideOutCart: () => null,
  AuthModal: () => null,
}));

// Mock BottomNavBar
vi.mock("../BottomNavBar", () => ({
  default: () => null,
}));

// Mock HotelSearchForm
vi.mock("../HotelSearchForm", () => ({
  default: () => <div data-testid="mock-hotel-search-form">Search Form</div>,
}));

describe("Animation Tests", () => {
  describe("Header pill bounce animation", () => {
    it("applies header-pill-bounce class on mount", async () => {
      const { default: Header } = await import("../Header");

      render(
        <React.StrictMode>
          <Header />
        </React.StrictMode>
      );

      const pill = screen.getByTestId("header-pill");
      expect(pill).toHaveClass("header-pill-bounce");
    });
  });

  describe("Hero section staggered animations", () => {
    it("applies hero-animate-headline class to the headline", async () => {
      const { default: Slider } = await import("../Slider");

      render(<Slider />);

      const headline = screen.getByTestId("hero-headline");
      expect(headline).toHaveClass("hero-animate-headline");
    });

    it("applies hero-animate-subtitle class to the subtitle", async () => {
      const { default: Slider } = await import("../Slider");

      render(<Slider />);

      const subtitle = screen.getByTestId("hero-subtitle");
      expect(subtitle).toHaveClass("hero-animate-subtitle");
    });

    it("applies hero-animate-search class to the search form container", async () => {
      const { default: Slider } = await import("../Slider");

      render(<Slider />);

      const searchForm = screen.getByTestId("hero-search-form");
      expect(searchForm).toHaveClass("hero-animate-search");
    });

    it("defines correct staggered animation delays (0ms, 150ms, 300ms)", async () => {
      const { default: Slider } = await import("../Slider");

      render(<Slider />);

      // Verify the style tag contains the correct animation definitions with delays
      const styleElements = document.querySelectorAll("style");
      const animationStyles = Array.from(styleElements)
        .map((el) => el.textContent)
        .join("");

      // Headline: no delay (0ms)
      expect(animationStyles).toContain(".hero-animate-headline");
      expect(animationStyles).toMatch(
        /\.hero-animate-headline\s*\{[^}]*animation:\s*heroFadeInUp\s+600ms\s+ease-out\s+both/
      );

      // Subtitle: 150ms delay
      expect(animationStyles).toContain(".hero-animate-subtitle");
      expect(animationStyles).toMatch(
        /\.hero-animate-subtitle\s*\{[^}]*animation:\s*heroFadeInUp\s+600ms\s+ease-out\s+150ms\s+both/
      );

      // Search form: 300ms delay
      expect(animationStyles).toContain(".hero-animate-search");
      expect(animationStyles).toMatch(
        /\.hero-animate-search\s*\{[^}]*animation:\s*heroFadeInUp\s+600ms\s+ease-out\s+300ms\s+both/
      );
    });
  });
});
