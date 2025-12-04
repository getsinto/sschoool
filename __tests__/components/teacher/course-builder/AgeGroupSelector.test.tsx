import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AgeGroupSelector from '@/components/teacher/course-builder/AgeGroupSelector';

describe('AgeGroupSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all age group options', () => {
    render(
      <AgeGroupSelector
        selectedGroups={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('3-5 years')).toBeInTheDocument();
    expect(screen.getByText('6-8 years')).toBeInTheDocument();
    expect(screen.getByText('9-12 years')).toBeInTheDocument();
    expect(screen.getByText('13-15 years')).toBeInTheDocument();
    expect(screen.getByText('16-18 years')).toBeInTheDocument();
    expect(screen.getByText('Adults')).toBeInTheDocument();
  });

  it('should display label and description', () => {
    render(
      <AgeGroupSelector
        selectedGroups={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Target Age Groups *')).toBeInTheDocument();
    expect(screen.getByText(/select all age groups/i)).toBeInTheDocument();
  });

  it('should call onChange when age group is selected', () => {
    render(
      <AgeGroupSelector
        selectedGroups={[]}
        onChange={mockOnChange}
      />
    );

    const ageGroupButton = screen.getByText('3-5 years').closest('button');
    fireEvent.click(ageGroupButton!);

    expect(mockOnChange).toHaveBeenCalledWith(['3-5']);
  });

  it('should allow multiple selections', () => {
    const { rerender } = render(
      <AgeGroupSelector
        selectedGroups={[]}
        onChange={mockOnChange}
      />
    );

    // Select first age group
    const firstButton = screen.getByText('3-5 years').closest('button');
    fireEvent.click(firstButton!);
    expect(mockOnChange).toHaveBeenCalledWith(['3-5']);

    // Re-render with first selection
    rerender(
      <AgeGroupSelector
        selectedGroups={['3-5']}
        onChange={mockOnChange}
      />
    );

    // Select second age group
    const secondButton = screen.getByText('6-8 years').closest('button');
    fireEvent.click(secondButton!);
    expect(mockOnChange).toHaveBeenCalledWith(['3-5', '6-8']);
  });

  it('should deselect age group when clicked again', () => {
    render(
      <AgeGroupSelector
        selectedGroups={['3-5', '6-8']}
        onChange={mockOnChange}
      />
    );

    const ageGroupButton = screen.getByText('3-5 years').closest('button');
    fireEvent.click(ageGroupButton!);

    expect(mockOnChange).toHaveBeenCalledWith(['6-8']);
  });

  it('should show visual feedback for selected groups', () => {
    render(
      <AgeGroupSelector
        selectedGroups={['3-5', '9-12']}
        onChange={mockOnChange}
      />
    );

    const selectedButton = screen.getByText('3-5 years').closest('button');
    const unselectedButton = screen.getByText('6-8 years').closest('button');

    expect(selectedButton).toHaveClass('border-blue-500', 'bg-blue-50');
    expect(unselectedButton).toHaveClass('border-gray-200', 'bg-white');
  });

  it('should display error message when provided', () => {
    render(
      <AgeGroupSelector
        selectedGroups={[]}
        onChange={mockOnChange}
        error="Please select at least one age group"
      />
    );

    expect(screen.getByText('Please select at least one age group')).toBeInTheDocument();
  });

  it('should show selection count when groups are selected', () => {
    render(
      <AgeGroupSelector
        selectedGroups={['3-5', '6-8', '9-12']}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('3 age groups selected')).toBeInTheDocument();
  });

  it('should show singular text for single selection', () => {
    render(
      <AgeGroupSelector
        selectedGroups={['3-5']}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('1 age group selected')).toBeInTheDocument();
  });

  it('should not show selection count when error is present', () => {
    render(
      <AgeGroupSelector
        selectedGroups={['3-5']}
        onChange={mockOnChange}
        error="Some error"
      />
    );

    expect(screen.queryByText('1 age group selected')).not.toBeInTheDocument();
  });

  it('should render checkmark icon for selected groups', () => {
    const { container } = render(
      <AgeGroupSelector
        selectedGroups={['3-5']}
        onChange={mockOnChange}
      />
    );

    // Check that selected button has checkmark styling
    const selectedButton = screen.getByText('3-5 years').closest('button');
    const checkbox = selectedButton?.querySelector('.bg-blue-500');
    expect(checkbox).toBeInTheDocument();
  });

  it('should handle empty selection', () => {
    render(
      <AgeGroupSelector
        selectedGroups={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText(/age group.*selected/i)).not.toBeInTheDocument();
  });

  it('should display descriptions for each age group', () => {
    render(
      <AgeGroupSelector
        selectedGroups={[]}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Pre-school')).toBeInTheDocument();
    expect(screen.getByText('Early elementary')).toBeInTheDocument();
    expect(screen.getByText('Upper elementary')).toBeInTheDocument();
    expect(screen.getByText('Middle school')).toBeInTheDocument();
    expect(screen.getByText('High school')).toBeInTheDocument();
    expect(screen.getByText('18+ years')).toBeInTheDocument();
  });
});
