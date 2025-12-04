import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryModal from '@/components/admin/categories/CategoryModal';

// Mock fetch
global.fetch = jest.fn();

describe('CategoryModal', () => {
  const mockOnSuccess = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render modal when open', () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create New Category')).toBeInTheDocument();
    expect(screen.getByLabelText(/category name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/color/i)).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    render(
      <CategoryModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText('Create New Category')).not.toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should validate required fields', async () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create category/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('should validate name length', async () => {
    const user = userEvent.setup();
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/category name/i);
    await user.type(nameInput, 'AB');

    const submitButton = screen.getByRole('button', { name: /create category/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it('should show icon preview when file is selected', async () => {
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const file = new File(['icon'], 'icon.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/category icon/i);

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(),
      onload: null as any,
      result: 'data:image/png;base64,mockbase64',
    };
    global.FileReader = jest.fn(() => mockFileReader) as any;

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Trigger onload
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: 'data:image/png;base64,mockbase64' } } as any);
    }

    await waitFor(() => {
      const preview = screen.getByAltText(/icon preview/i);
      expect(preview).toBeInTheDocument();
      expect(preview).toHaveAttribute('src', 'data:image/png;base64,mockbase64');
    });
  });

  it('should update category badge preview', async () => {
    const user = userEvent.setup();
    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/category name/i);
    await user.type(nameInput, 'Mathematics');

    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    });
  });

  it('should successfully create category', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '1', name: 'Mathematics' }),
    });

    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/category name/i);
    await user.type(nameInput, 'Mathematics');

    const descInput = screen.getByLabelText(/description/i);
    await user.type(descInput, 'Math courses');

    const colorInput = screen.getByLabelText(/color/i);
    fireEvent.change(colorInput, { target: { value: '#3B82F6' } });

    const submitButton = screen.getByRole('button', { name: /create category/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/categories',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle API errors', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Category already exists' }),
    });

    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/category name/i);
    await user.type(nameInput, 'Mathematics');

    const submitButton = screen.getByRole('button', { name: /create category/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/category already exists/i)).toBeInTheDocument();
    });

    expect(mockOnSuccess).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
    );

    render(
      <CategoryModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const nameInput = screen.getByLabelText(/category name/i);
    await user.type(nameInput, 'Mathematics');

    const submitButton = screen.getByRole('button', { name: /create category/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/creating/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});
