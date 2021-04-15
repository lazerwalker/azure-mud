import React, { useContext } from 'react'
import { nie } from '../utils'

export const MediaChatContext = React.createContext<MediaChatContextProps>({
  prepareForMediaChat: async () => console.log('Not implemented'),

  cameras: [],
  mics: [],

  setCurrentCamera: nie,
  setCurrentMic: nie,

  currentMic: undefined,
  currentCamera: undefined,

  localStreamView: React.createElement('div'),

  joinCall: nie,
  leaveCall: () => console.log('Not implemented'),

  callParticipants: undefined,

  cameraEnabled: false,
  micEnabled: false,

  setCameraEnabled: (enabled: boolean) => console.log('Not implemented'),
  setMicEnabled: (enabled: boolean) => console.log('Not implemented')
})

type MediaChatContextProps = {
    // Request media permissions, also do any token handshaking needed
    prepareForMediaChat: () => Promise<any>

    cameras: DeviceInfo[]
    mics: DeviceInfo[]

    currentCamera?: DeviceInfo
    currentMic?: DeviceInfo

    setCurrentCamera: (deviceId: string) => void
    setCurrentMic: (deviceId: string) => void

    localStreamView: React.ReactNode

    joinCall: (room: string) => void
    leaveCall: () => void
    // Object referencing active call? Maybe just a bool?

    callParticipants?: Participant[]

    cameraEnabled: boolean
    micEnabled: boolean

    setCameraEnabled: (enabled: boolean) => void
    setMicEnabled: (enabled: boolean) => void
}

export type Participant = {
    userId: string
    muted: boolean
    streamView: React.ReactNode
}

export type DeviceInfo = {
    id: string
    name: string
}

export const useMediaChatContext = () => useContext(MediaChatContext)