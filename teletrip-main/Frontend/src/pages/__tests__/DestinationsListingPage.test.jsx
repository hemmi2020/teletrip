import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { truncateDescription } from '../DestinationsListingPage';

// Mock Header and Footer to avoid context dependency issues
vi.mock('../../components/Header', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));
vi.mock('../../components/Footer', () => ({
  default: () => <div data-testid="mock-footer">Footer</div>,
}));

import DestinationsListingPage from '../DestinationsListingPage';

/**
 * Property 5: Description Truncation
 * For any destination description string, the rendered card SHALL display at most
 * 120 characters. If the original exceeds 120 characters, the displayed text SHALL
 * be truncated with an ellipsis indicator.
 *
 * Validates: Requirements 4.4
 */
describe('truncateDescription', () => {
  it('returns strings shorter than 120 characters unchanged', () => {
    const short = 'A beautiful coastal city with stunning views.';
    expect(truncateDescription(short)).toBe(short);
    expect(truncateDescription(short).length).toBeLessThanOrEqual(120);
  });

  it('returns a string of exactly 120 characters unchanged', () => {
    const exact = 'a'.repeat(120);
    expect(truncateDescription(exact)).toBe(exact);
    expect(truncateDescription(exact).length).toBe(120);
  });

  it('truncates strings longer than 120 characters and appends ellipsis', () => {
    const long = 'a'.repeat(200);
    const result = truncateDescription(long);
    expect(result).toBe('a'.repeat(120) + '...');
    expect(result.length).toBe(123); // 120 chars + 3 for "..."
  });

  it('returns empty string for empty input', () => {
    expect(truncateDescription('')).toBe('');
  });

  it('returns empty string for null input', () => {
    expect(truncateDescription(null)).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(truncateDescription(undefined)).toBe('');
  });

  it('truncates at exactly 120 characters boundary (121 char input)', () => {
    const boundary = 'b'.repeat(121);
    const result = truncateDescription(boundary);
    expect(result).toBe('b'.repeat(120) + '...');
  });

  it('respects a custom maxLength parameter', () => {
    const text = 'Hello World! This is a test string.';
    const result = truncateDescription(text, 10);
    expect(result).toBe('Hello Worl...');
  });
});


/**
 * Property 6: Featured Destinations Ordering
 * For any list of destinations containing a mix of featured and non-featured items,
 * the DestinationsListingPage SHALL render all featured destinations in a section
 * that appears before the main grid of non-featured destinations.
 *
 * Validates: Requirements 4.6
 */
describe('Featured Destinations Ordering (Property 6)', () => {
  const renderPage = () =>
    render(
      <HelmetProvider>
        <MemoryRouter>
          <DestinationsListingPage />
        </MemoryRouter>
      </HelmetProvider>
    );

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders featured section before the main grid when there are featured destinations', async () => {
    const destinations = [
      { _id: '1', name: 'Paris', country: 'France', image: 'paris.jpg', isFeatured: true, description: 'City of Light', continent: 'Europe', isActive: true },
      { _id: '2', name: 'Tokyo', country: 'Japan', image: 'tokyo.jpg', isFeatured: false, description: 'Modern metropolis', continent: 'Asia', isActive: true },
      { _id: '3', name: 'Rome', country: 'Italy', image: 'rome.jpg', isFeatured: true, description: 'Eternal City', continent: 'Europe', isActive: true },
      { _id: '4', name: 'Sydney', country: 'Australia', image: 'sydney.jpg', isFeatured: false, description: 'Harbour city', continent: 'Oceania', isActive: true },
    ];

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: destinations }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('featured-section')).toBeInTheDocument();
    });

    const featuredSection = screen.getByTestId('featured-section');
    const mainGrid = screen.getByTestId('destinations-grid');

    // Featured section should appear before the main grid in the DOM
    expect(featuredSection.compareDocumentPosition(mainGrid) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('does not render featured section when there are no featured destinations', async () => {
    const destinations = [
      { _id: '1', name: 'Tokyo', country: 'Japan', image: 'tokyo.jpg', isFeatured: false, description: 'Modern metropolis', continent: 'Asia', isActive: true },
      { _id: '2', name: 'Sydney', country: 'Australia', image: 'sydney.jpg', isFeatured: false, description: 'Harbour city', continent: 'Oceania', isActive: true },
    ];

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: destinations }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('destinations-grid')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('featured-section')).not.toBeInTheDocument();
  });

  it('renders only featured section when all destinations are featured', async () => {
    const destinations = [
      { _id: '1', name: 'Paris', country: 'France', image: 'paris.jpg', isFeatured: true, description: 'City of Light', continent: 'Europe', isActive: true },
      { _id: '2', name: 'Rome', country: 'Italy', image: 'rome.jpg', isFeatured: true, description: 'Eternal City', continent: 'Europe', isActive: true },
      { _id: '3', name: 'Barcelona', country: 'Spain', image: 'barcelona.jpg', isFeatured: true, description: 'Gaudi city', continent: 'Europe', isActive: true },
    ];

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: destinations }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('featured-section')).toBeInTheDocument();
    });

    // No main grid should be rendered since all destinations are featured
    expect(screen.queryByTestId('destinations-grid')).not.toBeInTheDocument();
  });

  it('correctly separates mixed featured and non-featured destinations', async () => {
    const destinations = [
      { _id: '1', name: 'Paris', country: 'France', image: 'paris.jpg', isFeatured: true, description: 'City of Light', continent: 'Europe', isActive: true },
      { _id: '2', name: 'Tokyo', country: 'Japan', image: 'tokyo.jpg', isFeatured: false, description: 'Modern metropolis', continent: 'Asia', isActive: true },
      { _id: '3', name: 'Rome', country: 'Italy', image: 'rome.jpg', isFeatured: true, description: 'Eternal City', continent: 'Europe', isActive: true },
      { _id: '4', name: 'Sydney', country: 'Australia', image: 'sydney.jpg', isFeatured: false, description: 'Harbour city', continent: 'Oceania', isActive: true },
      { _id: '5', name: 'New York', country: 'USA', image: 'ny.jpg', isFeatured: false, description: 'Big Apple', continent: 'North America', isActive: true },
    ];

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: destinations }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('featured-section')).toBeInTheDocument();
    });

    const featuredSection = screen.getByTestId('featured-section');
    const mainGrid = screen.getByTestId('destinations-grid');

    // Featured section should contain Paris and Rome (the featured ones)
    expect(featuredSection).toHaveTextContent('Paris');
    expect(featuredSection).toHaveTextContent('Rome');
    expect(featuredSection).not.toHaveTextContent('Tokyo');
    expect(featuredSection).not.toHaveTextContent('Sydney');
    expect(featuredSection).not.toHaveTextContent('New York');

    // Main grid should contain Tokyo, Sydney, and New York (non-featured)
    expect(mainGrid).toHaveTextContent('Tokyo');
    expect(mainGrid).toHaveTextContent('Sydney');
    expect(mainGrid).toHaveTextContent('New York');
    expect(mainGrid).not.toHaveTextContent('Paris');
    expect(mainGrid).not.toHaveTextContent('Rome');
  });
});


/**
 * Property 7: Continent Filter Correctness
 * For any selected continent value, applying the filter SHALL display only
 * destinations whose continent matches, hiding all others.
 *
 * Validates: Requirements 4.7
 */
describe('Continent Filter Correctness (Property 7)', () => {
  const renderPage = () =>
    render(
      <HelmetProvider>
        <MemoryRouter>
          <DestinationsListingPage />
        </MemoryRouter>
      </HelmetProvider>
    );

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const multiContinentDestinations = [
    { _id: '1', name: 'Paris', country: 'France', image: 'paris.jpg', isFeatured: false, description: 'City of Light', continent: 'Europe', isActive: true },
    { _id: '2', name: 'Rome', country: 'Italy', image: 'rome.jpg', isFeatured: false, description: 'Eternal City', continent: 'Europe', isActive: true },
    { _id: '3', name: 'Tokyo', country: 'Japan', image: 'tokyo.jpg', isFeatured: false, description: 'Modern metropolis', continent: 'Asia', isActive: true },
    { _id: '4', name: 'Bangkok', country: 'Thailand', image: 'bangkok.jpg', isFeatured: false, description: 'Temple city', continent: 'Asia', isActive: true },
    { _id: '5', name: 'Sydney', country: 'Australia', image: 'sydney.jpg', isFeatured: false, description: 'Harbour city', continent: 'Oceania', isActive: true },
    { _id: '6', name: 'New York', country: 'USA', image: 'ny.jpg', isFeatured: false, description: 'Big Apple', continent: 'North America', isActive: true },
  ];

  it('selecting a continent filters to show only matching destinations', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: multiContinentDestinations }),
    });

    renderPage();

    // Wait for destinations to load
    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    // All destinations should be visible initially
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Sydney')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();

    // Select "Asia" from the continent filter dropdown
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'Asia');

    // Only Asian destinations should be visible
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Bangkok')).toBeInTheDocument();

    // Non-Asian destinations should be hidden
    expect(screen.queryByText('Paris')).not.toBeInTheDocument();
    expect(screen.queryByText('Rome')).not.toBeInTheDocument();
    expect(screen.queryByText('Sydney')).not.toBeInTheDocument();
    expect(screen.queryByText('New York')).not.toBeInTheDocument();
  });

  it('selecting "All Continents" (empty value) shows all destinations', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: multiContinentDestinations }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');

    // First filter to Asia
    await user.selectOptions(select, 'Asia');
    expect(screen.queryByText('Paris')).not.toBeInTheDocument();

    // Then select "All Continents" to clear the filter
    await user.selectOptions(select, '');

    // All destinations should be visible again
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Rome')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('Bangkok')).toBeInTheDocument();
    expect(screen.getByText('Sydney')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it('destinations from other continents are hidden when a filter is active', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: multiContinentDestinations }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');

    // Filter to Europe
    await user.selectOptions(select, 'Europe');

    // European destinations visible
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Rome')).toBeInTheDocument();

    // All other continents hidden
    expect(screen.queryByText('Tokyo')).not.toBeInTheDocument();
    expect(screen.queryByText('Bangkok')).not.toBeInTheDocument();
    expect(screen.queryByText('Sydney')).not.toBeInTheDocument();
    expect(screen.queryByText('New York')).not.toBeInTheDocument();

    // Switch to North America
    await user.selectOptions(select, 'North America');

    // Only North American destinations visible
    expect(screen.getByText('New York')).toBeInTheDocument();

    // All others hidden
    expect(screen.queryByText('Paris')).not.toBeInTheDocument();
    expect(screen.queryByText('Rome')).not.toBeInTheDocument();
    expect(screen.queryByText('Tokyo')).not.toBeInTheDocument();
    expect(screen.queryByText('Bangkok')).not.toBeInTheDocument();
    expect(screen.queryByText('Sydney')).not.toBeInTheDocument();
  });
});
