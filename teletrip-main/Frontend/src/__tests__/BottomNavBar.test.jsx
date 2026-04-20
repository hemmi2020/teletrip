import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BottomNavBar from "../components/BottomNavBar";

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/home" }),
  useNavigate: () => vi.fn(),
}));

// Mock CartSystem's useCart hook and UserDataContext
vi.mock("../components/CartSystem", () => {
  const React = require("react");
  return {
    useCart: () => ({
      getTotalItems: () => 0,
    }),
    UserDataContext: React.createContext({ user: null, setUser: () => {} }),
  };
});

describe("BottomNavBar - Requirements 1.1, 1.2, 1.3, 1.4, 1.5", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders exactly 4 tab buttons (Req 1.3)", () => {
    render(<BottomNavBar />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("displays tab labels Home, Search, Account, Cart and no Bookings (Req 1.1, 1.2, 1.3)", () => {
    render(<BottomNavBar />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.queryByText("Bookings")).not.toBeInTheDocument();
  });

  it("each tab button has the flex-1 class for equal width (Req 1.4)", () => {
    render(<BottomNavBar />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button.className).toContain("flex-1");
    });
  });

  it("nav element has the md:hidden class (Req 1.5)", () => {
    render(<BottomNavBar />);
    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("md:hidden");
  });
});
