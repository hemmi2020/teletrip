import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Mock Header and Footer to avoid context dependency issues
vi.mock('../../components/Header', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));
vi.mock('../../components/Footer', () => ({
  default: () => <div data-testid="mock-footer">Footer</div>,
}));

// Mock react-router-dom's useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ slug: 'paris-france' }),
    useNavigate: () => vi.fn(),
  };
});

import DestinationPage from '../DestinationPage';

/**
 * Property 4: SEO Metadata Application
 * For any destination with non-empty seo.metaTitle and seo.metaDescription,
 * rendering DestinationPage SHALL set the document title and meta description
 * tag accordingly.
 *
 * Validates: Requirements 3.4
 */
describe('SEO Metadata Application (Property 4)', () => {
  const mockDestination = {
    _id: '1',
    name: 'Paris',
    country: 'France',
    slug: 'paris-france',
    heroImage: 'https://example.com/paris-hero.jpg',
    gallery: ['https://example.com/gallery1.jpg'],
    longDescription: 'Paris is the capital of France.',
    highlights: ['Eiffel Tower', 'Louvre Museum'],
    tag: 'Popular',
    seo: {
      metaTitle: 'Visit Paris, France - Best Travel Guide | Telitrip',
      metaDescription: 'Discover the best of Paris with our comprehensive travel guide. Find hotels, attractions, and more.',
      ogImage: 'https://example.com/paris-og.jpg',
    },
    isFeatured: true,
    continent: 'Europe',
    isActive: true,
  };

  const renderPage = () => {
    const helmetContext = {};
    return render(
      <HelmetProvider context={helmetContext}>
        <MemoryRouter>
          <DestinationPage />
        </MemoryRouter>
      </HelmetProvider>
    );
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets document title to seo.metaTitle when provided', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mockDestination }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    // react-helmet-async renders title in a <title> tag within the document
    const helmet = document.querySelector('title');
    expect(helmet).not.toBeNull();
    expect(helmet.textContent).toBe('Visit Paris, France - Best Travel Guide | Telitrip');
  });

  it('sets meta description tag to seo.metaDescription when provided', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mockDestination }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).not.toBeNull();
    expect(metaDescription.getAttribute('content')).toBe(
      'Discover the best of Paris with our comprehensive travel guide. Find hotels, attractions, and more.'
    );
  });

  it('sets OG title and description from SEO metadata', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mockDestination }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle).not.toBeNull();
    expect(ogTitle.getAttribute('content')).toBe('Visit Paris, France - Best Travel Guide | Telitrip');

    const ogDescription = document.querySelector('meta[property="og:description"]');
    expect(ogDescription).not.toBeNull();
    expect(ogDescription.getAttribute('content')).toBe(
      'Discover the best of Paris with our comprehensive travel guide. Find hotels, attractions, and more.'
    );

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage).not.toBeNull();
    expect(ogImage.getAttribute('content')).toBe('https://example.com/paris-og.jpg');
  });

  it('falls back to name + country for title when seo.metaTitle is empty', async () => {
    const destinationNoSeo = {
      ...mockDestination,
      seo: { metaTitle: '', metaDescription: '', ogImage: '' },
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: destinationNoSeo }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    const helmet = document.querySelector('title');
    expect(helmet).not.toBeNull();
    expect(helmet.textContent).toBe('Paris, France | Telitrip');
  });

  it('does not render meta description when seo.metaDescription is empty', async () => {
    const destinationNoDesc = {
      ...mockDestination,
      seo: { metaTitle: 'Some Title', metaDescription: '', ogImage: '' },
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: destinationNoDesc }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toBeNull();
  });
});


/**
 * Property 3: Destination Page Content Completeness
 * For any destination data with heroImage, name, country, longDescription,
 * highlights, and gallery, rendering DestinationPage SHALL produce output
 * containing all elements in the DOM.
 *
 * Validates: Requirements 3.3
 */
describe('Destination Page Content Completeness (Property 3)', () => {
  const mockDestination = {
    _id: '1',
    name: 'Tokyo',
    country: 'Japan',
    slug: 'tokyo-japan',
    heroImage: 'https://example.com/tokyo-hero.jpg',
    gallery: [
      'https://example.com/gallery1.jpg',
      'https://example.com/gallery2.jpg',
      'https://example.com/gallery3.jpg',
    ],
    longDescription: 'Tokyo is a vibrant metropolis blending ancient traditions with cutting-edge technology.',
    highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Mount Fuji Day Trip'],
    tag: 'Trending',
    seo: {
      metaTitle: 'Visit Tokyo, Japan | Telitrip',
      metaDescription: 'Explore Tokyo travel guide.',
      ogImage: 'https://example.com/tokyo-og.jpg',
    },
    isFeatured: true,
    continent: 'Asia',
    isActive: true,
  };

  const renderPage = () => {
    return render(
      <HelmetProvider>
        <MemoryRouter>
          <DestinationPage />
        </MemoryRouter>
      </HelmetProvider>
    );
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the hero image with the correct src', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mockDestination }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });

    const heroImg = screen.getByAltText('Tokyo, Japan');
    expect(heroImg).toBeInTheDocument();
    expect(heroImg).toHaveAttribute('src', 'https://example.com/tokyo-hero.jpg');
  });

  it('displays name and country as heading', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mockDestination }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });

    // Name is rendered as h1
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Tokyo');

    // Country is displayed
    expect(screen.getByText('Japan')).toBeInTheDocument();
  });

  it('renders long description as body content', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mockDestination }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Tokyo is a vibrant metropolis blending ancient traditions with cutting-edge technology.')
    ).toBeInTheDocument();
  });

  it('renders all highlights as list items', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mockDestination }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });

    expect(screen.getByText('Shibuya Crossing')).toBeInTheDocument();
    expect(screen.getByText('Senso-ji Temple')).toBeInTheDocument();
    expect(screen.getByText('Mount Fuji Day Trip')).toBeInTheDocument();
  });

  it('renders gallery images', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mockDestination }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });

    // Gallery images are rendered (desktop sidebar + mobile section)
    const galleryImages = screen.getAllByAltText(/Tokyo gallery/);
    // Each gallery image appears twice (desktop grid + mobile scroll)
    expect(galleryImages.length).toBeGreaterThanOrEqual(mockDestination.gallery.length);
    expect(galleryImages[0]).toHaveAttribute('src', 'https://example.com/gallery1.jpg');
  });

  it('renders "Search Hotels" CTA button', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mockDestination }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Tokyo')).toBeInTheDocument();
    });

    const ctaButton = screen.getByRole('button', { name: /search hotels/i });
    expect(ctaButton).toBeInTheDocument();
  });

  it('shows "Destination not found" with link to /destinations on 404', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, message: 'Destination not found' }),
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Destination not found')).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: /browse destinations/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/destinations');
  });
});
