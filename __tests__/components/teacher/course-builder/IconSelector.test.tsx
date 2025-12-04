import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IconSelector from '@/components/teacher/course-builder/IconSelector';

describe('IconSelector', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render icon grid', () => {
    render(<IconSelector onSelect={mockOnSelect} />);

    // Check that icons are rendered
    expect(screen.getByText(/select an icon/i)).toBeInTheDocument();
    
    // Check for some specific icons
    const iconButtons = screen.getAllByRole('button');
    expect(iconButtons.length).toBeGreaterThan(0);
  });

  it('should display all available icons', () => {
    render(<IconSelector onSelect={mockOnSelect} />);

    // Should have 15 icons based on the component
    const iconButtons = screen.getAllByRole('button').filter(
      btn => !btn.textContent?.includes('Clear')
    );
    expect(iconButtons.length).toBe(15);
  });

  it('should call onSelect when icon is clicked', () => {
    render(<IconSelector onSelect={mockOnSelect} />);

    const iconButtons = screen.getAllByRole('button');
    const firstIcon = iconButtons[0];
    
    fireEvent.click(firstIcon);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(expect.any(String));
  });

  it('should highlight selected icon', () => {
    const { rerender } = render(
      <IconSelector onSelect={mockOnSelect} selectedIcon={null} />
    );

    const iconButtons = screen.getAllByRole('button');
    const firstIcon = iconButtons[0];
    
    // Click to select
    fireEvent.click(firstIcon);
    
    // Get the icon name from the callback
    const selectedIconName = mockOnSelect.mock.calls[0][0];
    
    // Re-render with selected icon
    rerender(
      <IconSelector onSelect={mockOnSelect} selectedIcon={selectedIconName} />
    );

    // Check that the selected icon has the selected styling
    expect(firstIcon).toHaveClass('ring-2');
  });

  it('should filter icons based on search', async () => {
    const user = userEvent.setup();
    render(<IconSelector onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText(/search icons/i);
    await user.type(searchInput, 'book');

    // Should show only book-related icons
    const iconButtons = screen.getAllByRole('button').filter(
      btn => !btn.textContent?.includes('Clear')
    );
    
    // The exact number depends on how many icons match "book"
    expect(iconButtons.length).toBeLessThan(15);
  });

  it('should show no results message when search has no matches', async () => {
    const user = userEvent.setup();
    render(<IconSelector onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText(/search icons/i);
    await user.type(searchInput, 'zzzznonexistent');

    expect(screen.getByText(/no icons found/i)).toBeInTheDocument();
  });

  it('should clear search when input is cleared', async () => {
    const user = userEvent.setup();
    render(<IconSelector onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText(/search icons/i);
    
    // Type search
    await user.type(searchInput, 'book');
    
    // Clear search
    await user.clear(searchInput);

    // Should show all icons again
    const iconButtons = screen.getAllByRole('button').filter(
      btn => !btn.textContent?.includes('Clear')
    );
    expect(iconButtons.length).toBe(15);
  });

  it('should show selected icon preview', () => {
    render(<IconSelector onSelect={mockOnSelect} selectedIcon="book" />);

    expect(screen.getByText(/selected icon/i)).toBeInTheDocument();
    expect(screen.getByText(/book/i)).toBeInTheDocument();
  });

  it('should allow clearing selected icon', () => {
    render(<IconSelector onSelect={mockOnSelect} selectedIcon="book" />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    expect(mockOnSelect).toHaveBeenCalledWith(null);
  });

  it('should be case-insensitive in search', async () => {
    const user = userEvent.setup();
    render(<IconSelector onSelect={mockOnSelect} />);

    const searchInput = screen.getByPlaceholderText(/search icons/i);
    
    // Search with uppercase
    await user.type(searchInput, 'BOOK');

    // Should still find book icons
    const iconButtons = screen.getAllByRole('button').filter(
      btn => !btn.textContent?.includes('Clear')
    );
    expect(iconButtons.length).toBeGreaterThan(0);
  });

  it('should render icon names correctly', () => {
    render(<IconSelector onSelect={mockOnSelect} />);

    // Check for some expected icon names
    expect(screen.getByText(/book/i)).toBeInTheDocument();
    expect(screen.getByText(/video/i)).toBeInTheDocument();
    expect(screen.getByText(/trophy/i)).toBeInTheDocument();
  });
});
