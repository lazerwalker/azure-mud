import * as SignalR from '@aspnet/signalr'
import { v4 as uuid } from 'uuid'

import { RoomResponse, ErrorResponse, ServerSettings } from '../server/src/types'
import { Dispatch } from 'react'
import {
  Action,
  ErrorAction,
  PlayerConnectedAction,
  PlayerDisconnectedAction,
  ChatMessageAction,
  PlayerEnteredAction,
  WhisperAction,
  PlayerLeftAction,
  ShoutAction,
  EmoteAction,
  DanceAction,
  ShowProfileAction,
  UserMapAction,
  ModMessageAction,
  UpdatedCurrentRoomAction,
  UpdatedRoomDataAction,
  UpdatedPresenceAction,
  ReceivedMyProfileAction,
  DeleteMessageAction,
  NoteAddAction,
  NoteRemoveAction,
  NoteUpdateRoomAction,
  NoteUpdateLikesAction,
  HideModalAction,
  UpdatedVideoPresenceAction,
  SpaceOpenedOrClosedAction,
  PlayerBannedAction,
  PlayerUnbannedAction,
  ReceivedServerSettingsAction,
  ShowModalAction, CommandMessageAction, CaptionMessageAction, ItemMapAction, ItemScriptsAction
} from './Actions'
import { User } from '../server/src/user'
import { convertServerRoomData } from './room'
import { MESSAGE_MAX_LENGTH } from '../server/src/config'
import { Modal } from './modals'
import Config from './config'
import { receiveSignalData, startSignaling } from './webRTC'
const axios = require('axios').default

let myUserId: string
let myDispatch: Dispatch<Action>

let inMediaChat: boolean = false

export async function connect (userId: string, dispatch: Dispatch<Action>) {
  myUserId = userId
  myDispatch = dispatch

  const result: RoomResponse = await callAzureFunction('connect')

  console.log('/connect', result)
  dispatch(UpdatedCurrentRoomAction(result.roomId))
  dispatch(UserMapAction(result.users))
  dispatch(ItemMapAction(result.itemData))

  if (result.roomData) {
    dispatch(UpdatedRoomDataAction(convertServerRoomData(result.roomData)))
  }

  if (result.profile) {
    dispatch(ReceivedMyProfileAction(result.profile))
  }

  if (result.roomNotes) {
    dispatch(NoteUpdateRoomAction(result.roomId, result.roomNotes))
  }

  dispatch(UpdatedPresenceAction(result.presenceData))

  connectSignalR(userId, dispatch)
}

export async function getServerSettings (dispatch: Dispatch<Action>) {
  const result: ServerSettings = await callAzureFunctionGet('serverSettings')
  dispatch(ReceivedServerSettingsAction(result))
}

export async function updateServerSettings (serverSettings: ServerSettings) {
  const result = await callAzureFunction('serverSettings', serverSettings)
  if (result) {
    myDispatch(HideModalAction())
  }
}

// If isNewUser is true, a successful update will refresh the entire page instead of dismissing a modal
export async function updateProfile (user: Partial<User>, isNew: boolean) {
  const result = await callAzureFunction('updateProfile', { user, isNew })
  if (result.valid) {
    if (isNew) {
      window.location.reload()
    } else {
      myDispatch(ReceivedMyProfileAction(result.user))
      myDispatch(HideModalAction())
    }
  } else if (result.error) {
    alert(result.error)
  }
}

export async function updateProfileColor (userId: string, color: string) {
  const result = await callAzureFunction('updateProfileColor', { userId: userId, color: color })
}

export async function checkIsRegistered (): Promise<{registeredUsername: string, spaceIsClosed: boolean, isMod: string, isBanned: boolean}> {
  const result = await callAzureFunction('isRegistered')
  return { registeredUsername: result.registered, spaceIsClosed: result.spaceIsClosed, isMod: result.isMod, isBanned: result.isBanned }
}

export async function pickUpRandomItemFromList (listName: string) {
  await callAzureFunction('pickUpItem', { list: listName })
}

export async function pickUpItem (item: string) {
  await callAzureFunction('pickUpItem', { item })
}

export async function dropItem () {
  await callAzureFunction('pickUpItem', { drop: true })
}

export async function fetchAcsToken () {
  return await callAzureFunction('acsToken')
}

export async function fetchTwilioToken () {
  return await callAzureFunction('twilioToken')
}

export async function fetchCognitiveServicesKey () {
  return await callAzureFunction('cognitiveServicesKey')
}

// Post-it notes

export async function addNoteToWall (message: string) {
  if (message !== null && message.length > 0) {
    const id = uuid()
    await callAzureFunction('addRoomNote', { id, message })
  }
}

export async function deleteRoomNote (noteId: string) {
  await callAzureFunction('deleteRoomNote', { noteId })
}

export async function likeRoomNote (noteId: string) {
  await callAzureFunction('likeRoomNote', { noteId, like: true })
}

export async function unlikeRoomNote (noteId: string) {
  await callAzureFunction('likeRoomNote', { noteId, like: false })
}

//

export async function openOrCloseSpace (spaceIsClosed) {
  await callAzureFunction('openOrCloseSpace', { spaceIsClosed })
}

//

export async function moveToRoom (roomId: string) {
  const result: RoomResponse | ErrorResponse | any = await callAzureFunction(
    'moveRoom',
    {
      to: roomId
    }
  )

  console.log(result)

  if (result.error) {
    myDispatch(ErrorAction(result.error))
  } else {
    myDispatch(UpdatedCurrentRoomAction(result.roomId))

    if (result.roomNotes) {
      myDispatch(NoteUpdateRoomAction(result.roomId, result.roomNotes))
    }
  }
}

export async function sendChatMessage (id: string, text: string) {
  // If it's over the character limit
  if (text.length > MESSAGE_MAX_LENGTH) {
    console.log(`Sorry, can't send messages over ${MESSAGE_MAX_LENGTH} characters!`)
    return
  }

  const result: RoomResponse | Error | any = await callAzureFunction(
    'sendChatMessage',
    {
      id: id,
      text: text
    }
  )

  console.log(result)

  // If it's a /move command
  if (result && result.roomId) {
    myDispatch(UpdatedCurrentRoomAction(result.roomId))
  } else if (result && result.user) {
    myDispatch(ShowProfileAction(result.user))
  } else if (result && result.error) {
    myDispatch(ErrorAction(result.error))
  }
}

export async function sendCaption (id: string, text: string) {
  // TODO: This may or may not be problematic
  if (text.length > MESSAGE_MAX_LENGTH) {
    console.log(`Sorry, can't send messages over ${MESSAGE_MAX_LENGTH} characters!`)
    return
  }

  const result: RoomResponse | Error | any = await callAzureFunction(
    'sendCaption',
    {
      id: id,
      text: text
    }
  )

  console.log(result)

  if (result && result.error) {
    myDispatch(ErrorAction(result.error))
  }
}

export async function fetchProfile (userId: string) {
  const result = await callAzureFunction('fetchProfile', { userId })
  if (result.error) {
    console.log('Could not fetch profile', result.erroc)
  } else {
    myDispatch(ShowProfileAction(result.user))
  }
}

export async function toggleUserBan (userId: string) {
  const result = await callAzureFunction('banUser', { userId })
}

export async function toggleUserMod (userId: string) {
  const result = await callAzureFunction('toggleModStatus', { userId })
}

export async function deleteMessage (messageId: string) {
  const result = await callAzureFunction('deleteMessage', { messageId })
}

// WebRTC
// A note: the WebRTC handshake process generally avoids the Flux store / reducer
// The app store is only aware of actual video streams it has to present.

// This kicks off the whole peering process.
// Any connected WebRTC clients will start signaling, which happens over SignalR.
export async function startVideoChat () {
  inMediaChat = true
}

export async function sendSignalData (peerId: string, data: string) {
  return await callAzureFunction('sendSignalData', { peerId, data })
}

export async function setNetworkMediaChatStatus (isInMediaChat: boolean) {
  inMediaChat = isInMediaChat

  if (!isInMediaChat) {
    return await callAzureFunction('leaveVideoChat')
  }
}

export function getNetworkMediaChatStatus (): boolean {
  return inMediaChat
}

// Setup

async function connectSignalR (userId: string, dispatch: Dispatch<Action>) {
  const connection = new SignalR.HubConnectionBuilder()
    .withUrl(`${Config.SERVER_HOSTNAME}/api`)
    .configureLogging(SignalR.LogLevel.Debug)
    .build()

  connection.on('playerConnected', (user) => {
    console.log('Player joined!', user)

    dispatch(PlayerConnectedAction(user))
  })

  connection.on('playerDisconnected', (otherId) => {
    console.log('Player left!', otherId)
    dispatch(PlayerDisconnectedAction(otherId))
  })

  connection.on('presenceData', (data) => {
    dispatch(UpdatedPresenceAction(data))
  })

  // We use otherId/name basically interchangably here.
  connection.on('chatMessage', (messageId, otherId, message) => {
    console.log('Received chat', otherId, message)
    console.log(otherId, message, userId)
    if (otherId === userId) return

    dispatch(ChatMessageAction(messageId, otherId, message))
  })

  connection.on('caption', (messageId, otherId, message) => {
    console.log('Received caption', otherId, message)
    console.log(otherId, message, userId)
    if (otherId === userId) return

    dispatch(CaptionMessageAction(messageId, otherId, message))
  })

  connection.on('mods', (otherId, message) => {
    dispatch(ModMessageAction(otherId, message))
  })

  connection.on('deleteMessage', (modId, targetMessageId) => {
    dispatch(DeleteMessageAction(modId, targetMessageId))
  })

  connection.on('playerEntered', (name, fromId, fromName) => {
    if (name === userId) return
    dispatch(PlayerEnteredAction(name, fromId, fromName))
  })

  connection.on('myProfile', (profile) => {
    dispatch(ReceivedMyProfileAction(profile))
  })

  connection.on('serverSettings', (serverSettings) => {
    dispatch(ReceivedServerSettingsAction(serverSettings))
  })

  connection.on('whisper', (otherId, message) => {
    dispatch(WhisperAction(otherId, message))
  })

  connection.on('privateCommand', (message) => {
    dispatch(CommandMessageAction(message))
  })

  connection.on('privateItemPickup', (message) => {
    dispatch(CommandMessageAction(message))
  })

  connection.on('playerLeft', (name, toId, toName) => {
    if (name === userId) return
    dispatch(PlayerLeftAction(name, toId, toName))
  })

  connection.on('usernameMap', (map) => {
    console.log('Received map', map)
    dispatch(UserMapAction(map))
  })

  connection.on('playerBanned', (user) => {
    dispatch(PlayerBannedAction(user))
  })

  connection.on('playerUnbanned', (user) => {
    dispatch(PlayerUnbannedAction(user))
  })

  connection.on('clientDeployed', () => {
    dispatch(ShowModalAction(Modal.ClientDeployed))
  })

  connection.on('videoPresence', (roomId: string, users: string[]) => {
    console.log('Changed video presence')
    dispatch(UpdatedVideoPresenceAction(roomId, users))
  })

  connection.on('shout', (messageId, name, message) => {
    // We don't gate on your own userId here.
    // Because shouting can fail at the server level, we don't show it preemptively.
    dispatch(ShoutAction(messageId, name, message))
  })

  connection.on('emote', (messageId, name, message) => {
    dispatch(EmoteAction(messageId, name, message))
  })

  connection.on('dance', (messageId, name, message) => {
    dispatch(DanceAction(messageId, name, message))
  })

  // WebRTC

  connection.on('webrtcSignalData', (peerId, data) => {
    console.log('Received signaling data from', peerId)
    receiveSignalData(peerId, data, dispatch)
  })

  connection.on('webrtcPeerId', (peerId) => {
    if (peerId === userId) return
    if (!inMediaChat) return
    console.log('Starting signaling with', peerId)
    startSignaling(peerId, dispatch)
  })

  // Post-It Note Wall
  connection.on('noteAdded', (roomId, noteId, message, authorId) => {
    dispatch(NoteAddAction(roomId, { id: noteId, message, authorId }))
  })

  connection.on('noteRemoved', (roomId, noteId) => {
    dispatch(NoteRemoveAction(roomId, noteId))
  })

  connection.on('noteLikesUpdated', (roomId, noteId, likes) => {
    dispatch(NoteUpdateLikesAction(roomId, noteId, likes))
  })

  connection.on('spaceOpenedOrClosed', (status) => {
    dispatch(SpaceOpenedOrClosedAction(status))
  })

  connection.onclose(() => {
    console.log('disconnected')
    callAzureFunction('disconnect')
  })

  connection.on('ping', () => {
    console.log('Received heartbeat ping')
    callAzureFunction('pong')
  })

  window.addEventListener('beforeunload', (e) => {
    callAzureFunction('disconnect')
  })

  console.log('connecting...')
  return await connection
    .start()
    .then(() => {
      console.log('Connected!')
    })
    .catch(console.error)
}

async function callAzureFunctionGet (endpoint: string): Promise<any> {
  try {
    const r = await axios.get(
      `${Config.SERVER_HOSTNAME}/api/${endpoint}`,
      { withCredentials: true }
    )
    console.log(r)
    return r.data
  } catch (e) {
    console.log('Error', e)
    return undefined
  }
}

async function callAzureFunction (endpoint: string, body?: any): Promise<any> {
  try {
    const r = await axios.post(
      `${Config.SERVER_HOSTNAME}/api/${endpoint}`,
      body,
      { withCredentials: true }
    )
    console.log(r)
    return r.data
  } catch (e) {
    console.log('Error', e)
    return undefined
  }
}

export async function getLoginInfo () {
  try {
    console.log('Fetching')
    const r = await axios.post(`${Config.SERVER_HOSTNAME}/.auth/me`, null, {
      withCredentials: true
    })
    console.log(r)
    return r.data[0]
  } catch (e) {
    console.log(e)
    return undefined
  }
}
