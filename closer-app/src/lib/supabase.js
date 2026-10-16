import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && key)
export const supabase = supabaseConfigured ? createClient(url, key) : null

// Broadcast keeps this MVP table-free. The room code is a shared channel name,
// not authentication; use an unpredictable code and do not put private data in it.
export function createRoomChannel(roomCode, onState, onStatus, getCurrentState) {
  if (!supabase) return null

  const channel = supabase.channel(`closer-room:${roomCode}`, {
    config: { broadcast: { self: false } },
  })

  channel
    .on('broadcast', { event: 'game-state' }, ({ payload }) => {
      if (payload?.roomCode === roomCode) onState?.(payload)
    })
    .on('broadcast', { event: 'state-request' }, async ({ payload }) => {
      if (payload?.roomCode !== roomCode) return
      const state = getCurrentState?.()
      if (state) {
        await channel.send({
          type: 'broadcast',
          event: 'game-state',
          payload: state,
        })
      }
    })
    .subscribe(async (status) => {
      onStatus?.(status)
      // Ask a partner who is already in the room to share the current game state.
      // Broadcast is ephemeral, so this is a lightweight join handshake, not durable storage.
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'state-request',
          payload: { roomCode },
        })
      }
    })

  return channel
}

export async function broadcastState(channel, state) {
  if (!channel || !state?.roomCode) return
  await channel.send({
    type: 'broadcast',
    event: 'game-state',
    payload: state,
  })
}
