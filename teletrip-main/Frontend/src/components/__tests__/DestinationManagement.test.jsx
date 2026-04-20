import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DestinationManagement from '../DestinationManagement';

// Mock @hello-pangea/dnd to avoid drag-and-drop complexity in unit tests
vi.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children }) => <div>{children}</div>,
  Droppable: ({ children }) => children({
    innerRef: vi.fn(),
    droppableProps: {},
    placeholder: null,
  }),
  Draggable: ({ children }) => children(
    {
      innerRef: vi.fn(),
      draggableProps: {},
      dragHandleProps: {},
    },
    { isDragging: false }
  ),
}));

const mockDestinations = [
  {
    _id: 'dest1',
    name: 'Paris',
    country: 'France',
    image: 'https://example.com/paris.jpg',
    tag: 'Popular',
    isFeatured: true,
    isActive: true,
    order: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'dest2',
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://example.com/tokyo.jpg',
    tag: 'Trending',
    isFeatured: false,
    isActive: true,
    order: 1,
    createdAt: '2024-02-01T00:00:00.000Z',
  },
];

describe('DestinationManagement', () => {
  let mockShowToast;

  beforeEach(() => {
    mockShowToast = vi.fn();
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-admin-token');

    // Default fetch mock: returns destinations on admin endpoint
    global.fetch = vi.fn((url) => {
      if (url.includes('/destinations/admin')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockDestinations }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Form validation (Requirements 2.5)', () => {
    it('shows error messages when submitting form without required fields', async () => {
      render(<DestinationManagement showToast={mockShowToast} />);

      // Wait for initial data load
      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
      });

      // Open the Add modal
      fireEvent.click(screen.getByText('Add Destination'));

      // Submit without filling any fields
      fireEvent.click(screen.getByText('Create'));

      // Validation errors should appear
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Country is required')).toBeInTheDocument();
      expect(screen.getByText('Image URL is required')).toBeInTheDocument();
    });

    it('shows error only for missing fields when some are filled', async () => {
      render(<DestinationManagement showToast={mockShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Destination'));

      // Fill name only
      const nameInput = screen.getByPlaceholderText('e.g. Paris');
      fireEvent.change(nameInput, { target: { value: 'London' } });

      fireEvent.click(screen.getByText('Create'));

      // Name error should NOT appear, but country and image errors should
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
      expect(screen.getByText('Country is required')).toBeInTheDocument();
      expect(screen.getByText('Image URL is required')).toBeInTheDocument();
    });

    it('does not submit the form when validation fails', async () => {
      render(<DestinationManagement showToast={mockShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Add Destination'));
      fireEvent.click(screen.getByText('Create'));

      // fetch should only have been called once (for the initial admin load)
      const postCalls = global.fetch.mock.calls.filter(
        ([url, opts]) => opts && opts.method === 'POST'
      );
      expect(postCalls).toHaveLength(0);
    });
  });

  describe('Inline toggle sends PUT request (Requirements 2.7, 2.8)', () => {
    it('sends PUT request when isFeatured toggle is clicked', async () => {
      render(<DestinationManagement showToast={mockShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
      });

      // Click the featured toggle for Paris (first toggle in the row)
      const featuredToggles = screen.getAllByLabelText('Toggle featured');
      fireEvent.click(featuredToggles[0]);

      await waitFor(() => {
        const putCalls = global.fetch.mock.calls.filter(
          ([url, opts]) => opts && opts.method === 'PUT' && url.includes('/destinations/dest1')
        );
        expect(putCalls).toHaveLength(1);
        const body = JSON.parse(putCalls[0][1].body);
        expect(body).toEqual({ isFeatured: false }); // Paris was featured, toggling to false
      });
    });

    it('sends PUT request when isActive toggle is clicked', async () => {
      render(<DestinationManagement showToast={mockShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Tokyo')).toBeInTheDocument();
      });

      // Click the active toggle for Tokyo (second row)
      const activeToggles = screen.getAllByLabelText('Toggle active');
      fireEvent.click(activeToggles[1]);

      await waitFor(() => {
        const putCalls = global.fetch.mock.calls.filter(
          ([url, opts]) => opts && opts.method === 'PUT' && url.includes('/destinations/dest2')
        );
        expect(putCalls).toHaveLength(1);
        const body = JSON.parse(putCalls[0][1].body);
        expect(body).toEqual({ isActive: false }); // Tokyo was active, toggling to false
      });
    });

    it('shows success toast after toggle update', async () => {
      render(<DestinationManagement showToast={mockShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
      });

      const featuredToggles = screen.getAllByLabelText('Toggle featured');
      fireEvent.click(featuredToggles[0]);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Featured status updated', 'success');
      });
    });
  });

  describe('Delete confirmation dialog (Requirements 2.9)', () => {
    it('shows confirmation dialog when delete button is clicked', async () => {
      render(<DestinationManagement showToast={mockShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
      });

      // Click the delete button for the first destination
      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);

      // Confirmation dialog should appear
      expect(screen.getByText('Delete Destination')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this destination? This action cannot be undone.')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      // There should be a Delete button in the dialog
      const dialogDeleteBtn = screen.getAllByText('Delete').find(
        btn => btn.closest('.fixed')
      );
      expect(dialogDeleteBtn).toBeInTheDocument();
    });

    it('closes confirmation dialog when Cancel is clicked', async () => {
      render(<DestinationManagement showToast={mockShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);

      // Dialog is visible
      expect(screen.getByText('Delete Destination')).toBeInTheDocument();

      // Click Cancel
      fireEvent.click(screen.getByText('Cancel'));

      // Dialog should be gone
      expect(screen.queryByText('Delete Destination')).not.toBeInTheDocument();
    });

    it('sends DELETE request when confirmed', async () => {
      render(<DestinationManagement showToast={mockShowToast} />);

      await waitFor(() => {
        expect(screen.getByText('Paris')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete');
      fireEvent.click(deleteButtons[0]);

      // Click the Delete button in the confirmation dialog
      const dialogDeleteBtn = screen.getAllByRole('button').find(
        btn => btn.textContent === 'Delete' && btn.closest('.fixed')
      );
      fireEvent.click(dialogDeleteBtn);

      await waitFor(() => {
        const deleteCalls = global.fetch.mock.calls.filter(
          ([url, opts]) => opts && opts.method === 'DELETE'
        );
        expect(deleteCalls).toHaveLength(1);
        expect(deleteCalls[0][0]).toContain('/destinations/dest1');
      });
    });
  });
});
