import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RsvpButtons } from './RsvpButtons'

describe('RsvpButtons', () => {
  it('renders default labels', () => {
    render(<RsvpButtons style="default" current={null} onRespond={vi.fn()} />)
    expect(screen.getByText('Going')).toBeInTheDocument()
    expect(screen.getByText('Maybe')).toBeInTheDocument()
    expect(screen.getByText("Can't Go")).toBeInTheDocument()
  })

  it('renders spooky labels', () => {
    render(<RsvpButtons style="spooky" current={null} onRespond={vi.fn()} />)
    expect(screen.getByText(/Dying to come/)).toBeInTheDocument()
  })

  it('highlights current rsvp with ring-2 class', () => {
    render(<RsvpButtons style="default" current="yes" onRespond={vi.fn()} />)
    const goingBtn = screen.getByText('Going').closest('button')
    expect(goingBtn?.className).toContain('ring-2')
  })

  it('calls onRespond with correct status', () => {
    const onRespond = vi.fn()
    render(<RsvpButtons style="default" current={null} onRespond={onRespond} />)
    fireEvent.click(screen.getByText('Going'))
    expect(onRespond).toHaveBeenCalledWith('yes')
  })

  it('calls onRespond with maybe', () => {
    const onRespond = vi.fn()
    render(<RsvpButtons style="default" current={null} onRespond={onRespond} />)
    fireEvent.click(screen.getByText('Maybe'))
    expect(onRespond).toHaveBeenCalledWith('maybe')
  })
})
