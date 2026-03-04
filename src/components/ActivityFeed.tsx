interface Props {
  eventId: string
  userId: string | undefined
}

export function ActivityFeed({ eventId, userId }: Props) {
  return (
    <div className="text-zinc-500 text-sm">
      Activity feed coming soon (eventId: {eventId}, userId: {userId ?? 'guest'})
    </div>
  )
}
