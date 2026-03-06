import { supabase } from '../supabase'

export async function uploadEventCover(
  file: File,
  userId: string,
  eventId: string
): Promise<string> {
  const rawExt = file.name.split('.').pop()?.toLowerCase() ?? ''
  const ext = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'].includes(rawExt) ? rawExt : 'jpg'
  const path = `${userId}/${eventId}.${ext}`
  const { error } = await supabase.storage
    .from('event-covers')
    .upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('event-covers').getPublicUrl(path)
  return data.publicUrl
}

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const rawExt = file.name.split('.').pop()?.toLowerCase() ?? ''
  const ext = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'].includes(rawExt) ? rawExt : 'jpg'
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
