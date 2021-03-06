import { useEffect, useRef } from 'react'
import { AudioTrack as IAudioTrack } from 'twilio-video'

interface AudioTrackProps {
  track: IAudioTrack;
}

// TODO: Figure out what's up with activeSinkId

export default function AudioTrack ({ track }: AudioTrackProps) {
//   const { activeSinkId } = useAppState()
  const audioEl = useRef<HTMLAudioElement>()

  useEffect(() => {
    audioEl.current = track.attach()
    audioEl.current.setAttribute('data-cy-audio-track-name', track.name)
    document.body.appendChild(audioEl.current)
    return () => track.detach().forEach(el => el.remove())
  }, [track])

  //   useEffect(() => {
  //     audioEl.current?.setSinkId?.(activeSinkId)
  //   }, [activeSinkId])

  return null
}
