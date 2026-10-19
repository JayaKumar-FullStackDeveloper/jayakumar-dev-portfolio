import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Banner,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  SegmentedControl,
  StatusBadge,
  Switch,
  inputClass,
} from './ui';

describe('Button', () => {
  it('renders an accessible button and fires onClick', () => {
    const onClick = jest.fn();
    render(<Button variant="primary" onClick={onClick}>Publish</Button>);
    userEvent.click(screen.getByRole('button', { name: 'Publish' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is a type=button by default so it never submits a form by accident', () => {
    render(<Button>Cancel</Button>);
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('type', 'button');
  });

  it('does not fire when disabled', () => {
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>Save</Button>);
    userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is disabled and marked busy while loading', () => {
    render(<Button loading>Saving</Button>);
    const button = screen.getByRole('button', { name: 'Saving' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});

describe('Field', () => {
  it('connects the label to its control', () => {
    render(
      <Field id="title" label="Title">
        <input id="title" className={inputClass} />
      </Field>
    );
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  it('announces a required field without relying on the asterisk', () => {
    render(
      <Field id="title" label="Title" required>
        <input id="title" />
      </Field>
    );
    expect(screen.getByLabelText(/Title.*\(required\)/)).toBeInTheDocument();
  });

  it('shows the hint, and swaps it for the error when there is one', () => {
    const { rerender } = render(
      <Field id="url" label="URL" hint="https only">
        <input id="url" />
      </Field>
    );
    expect(screen.getByText('https only')).toBeInTheDocument();
    rerender(
      <Field id="url" label="URL" hint="https only" error="Enter a full URL">
        <input id="url" aria-describedby="url-error" />
      </Field>
    );
    expect(screen.queryByText('https only')).not.toBeInTheDocument();
    expect(screen.getByText('Enter a full URL')).toHaveAttribute('id', 'url-error');
    expect(screen.getByLabelText('URL')).toHaveAccessibleDescription('Enter a full URL');
  });
});

describe('StatusBadge', () => {
  it.each([
    [{ status: 'published' }, 'Published'],
    [{ status: 'draft' }, 'Draft'],
    [{ status: 'archived' }, 'Archived'],
  ])('labels a %j project', (project, label) => {
    render(<StatusBadge project={project} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('shows "In trash" for a deleted project whatever its status', () => {
    render(<StatusBadge project={{ status: 'published', deletedAt: {} }} />);
    expect(screen.getByText('In trash')).toBeInTheDocument();
  });

  it('accepts a bare status key', () => {
    render(<StatusBadge status="archived" />);
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });
});

describe('Banner, EmptyState, ErrorState', () => {
  it('uses an alert role for errors and status otherwise', () => {
    const { rerender } = render(<Banner tone="error">Broke</Banner>);
    expect(screen.getByRole('alert')).toHaveTextContent('Broke');
    rerender(<Banner tone="success">Done</Banner>);
    expect(screen.getByRole('status')).toHaveTextContent('Done');
  });

  it('dismisses a banner', () => {
    const onDismiss = jest.fn();
    render(<Banner onDismiss={onDismiss}>Hello</Banner>);
    userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('renders an empty state with its actions', () => {
    render(<EmptyState title="No projects yet" actions={<button type="button">Add project</button>}>Create one.</EmptyState>);
    expect(screen.getByRole('heading', { name: 'No projects yet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add project' })).toBeInTheDocument();
  });

  it('offers a retry on an error state', () => {
    const onRetry = jest.fn();
    render(<ErrorState title="Couldn't load" onRetry={onRetry} />);
    userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('Switch and SegmentedControl', () => {
  it('toggles a switch and exposes its state', () => {
    const onChange = jest.fn();
    render(<Switch checked={false} onChange={onChange} label="Active" />);
    const toggle = screen.getByRole('switch', { name: 'Active' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    userEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('moves the selection with the arrow keys', () => {
    const onChange = jest.fn();
    render(
      <SegmentedControl
        ariaLabel="Range"
        value="7"
        onChange={onChange}
        options={[
          { value: '7', label: '7 days' },
          { value: '30', label: '30 days' },
        ]}
      />
    );
    expect(screen.getByRole('radio', { name: '7 days' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyDown(screen.getByRole('radio', { name: '7 days' }), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenCalledWith('30');
  });
});

describe('ConfirmDialog', () => {
  const setup = (props = {}) => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <>
        <button type="button">Opener</button>
        <ConfirmDialog
          open
          title="Move to trash?"
          description="You can restore it later."
          confirmLabel="Move to trash"
          tone="danger"
          onConfirm={onConfirm}
          onCancel={onCancel}
          {...props}
        />
      </>
    );
    return { onConfirm, onCancel };
  };

  it('is a named modal dialog with a description', () => {
    setup();
    const dialog = screen.getByRole('dialog', { name: 'Move to trash?' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('You can restore it later.');
  });

  it('renders nothing when closed', () => {
    render(<ConfirmDialog open={false} title="x" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('puts focus on the safest button, Cancel', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('names the destructive action instead of saying OK', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Move to trash' })).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const { onCancel } = setup();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('keeps Tab focus inside the dialog', () => {
    setup();
    const confirm = screen.getByRole('button', { name: 'Move to trash' });
    confirm.focus();
    userEvent.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    userEvent.tab({ shift: true });
    expect(confirm).toHaveFocus();
  });

  it('confirms when the confirm button is used', () => {
    const { onConfirm } = setup();
    userEvent.click(screen.getByRole('button', { name: 'Move to trash' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('requires the typed slug before a permanent delete can be confirmed', () => {
    const { onConfirm } = setup({ confirmText: 'old-site', confirmLabel: 'Delete permanently' });
    const confirm = screen.getByRole('button', { name: 'Delete permanently' });
    expect(confirm).toBeDisabled();
    userEvent.type(screen.getByLabelText(/to confirm/), 'old-sit');
    expect(confirm).toBeDisabled();
    userEvent.type(screen.getByLabelText(/to confirm/), 'e');
    expect(confirm).toBeEnabled();
    userEvent.click(confirm);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('returns focus to the element that opened it', () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Open</button>
          <ConfirmDialog open={open} title="Sure?" onConfirm={() => setOpen(false)} onCancel={() => setOpen(false)} />
        </>
      );
    }
    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open' });
    opener.focus();
    fireEvent.click(opener);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
