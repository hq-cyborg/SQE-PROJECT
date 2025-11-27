import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

import store from "@/redux/store";
import Invoice from "@/pages/Invoice";
import { Table as MockTable } from "@/test/mocks/antd";

// -------------------------
// Mock modules
// -------------------------
vi.mock("axios");

vi.mock("antd", () => ({
  Table: MockTable,
  Tag: ({ children }) => <span>{children}</span>, // mock Tag if needed
}));

// -------------------------
// Browser mocks
// -------------------------
window.matchMedia =
  window.matchMedia ||
  function () {
    return { matches: false, addListener: () => {}, removeListener: () => {} };
  };

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock;

// -------------------------
// Tests
// -------------------------
describe("Invoice page (REAL RENDER)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    axios.post.mockResolvedValue({
      data: {
        success: true,
        results: [
          {
            _id: "1",
            number: "INV-1001",
            client: { name: "John Doe" },
            date: "2024-01-01",
            expiredDate: "2024-01-30",
            total: 500,
            credit: 200,
            currency: "USD",
            status: "paid",
            paymentStatus: "partial",
          },
        ],
      },
    });
  });

  const renderPage = () =>
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Invoice />
        </BrowserRouter>
      </Provider>
    );

  it("renders InvoiceDataTableModule with real columns", async () => {
    renderPage();
    expect(await screen.findByText(/Number/i)).toBeInTheDocument();
    expect(await screen.findByText(/Client/i)).toBeInTheDocument();
    expect(await screen.findByText(/Date/i)).toBeInTheDocument();
    expect(await screen.findByText(/Total/i)).toBeInTheDocument();
  });
});
