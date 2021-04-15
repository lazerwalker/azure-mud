import { PublicUser, MinimalUser } from '../server/src/user'
import { Room } from './room'
import { Message, WhisperMessage } from './message'
import { RoomNote } from '../server/src/roomNote'
import { Modal } from './modals'
import { ServerSettings } from '../server/src/types'
import { DeviceInfo } from './videochat/mediaChatContext'

export type Action =
  | ReceivedMyProfileAction
  | ReceivedServerSettingsAction
  | UpdatedCurrentRoomAction
  | UpdatedRoomDataAction
  | UpdatedPresenceAction
  | UpdatedVideoPresenceAction
  | PlayerConnectedAction
  | PlayerDisconnectedAction
  | ChatMessageAction
  | CaptionMessageAction
  | ModMessageAction
  | DeleteMessageAction
  | LoadMessageArchiveAction
  | WhisperAction
  | ShoutAction
  | EmoteAction
  | DanceAction
  | PlayerEnteredAction
  | PlayerLeftAction
  | UserMapAction
  | ItemMapAction
  | ItemScriptsAction
  | PlayerBannedAction
  | PlayerUnbannedAction
  | UpdateProfileColorAction
  | P2PDataReceivedAction
  | P2PStreamReceivedAction
  | P2PConnectionClosedAction
  | P2PWaitingForConnectionsAction
  | ACSReceivedTokenAction
  | LocalMediaStreamOpenedAction
  | LocalMediaSelectedCameraAction
  | LocalMediaSelectedMicrophoneAction
  | MediaReceivedSpeakingDataAction
  | StopVideoChatAction
  | ErrorAction
  | SendMessageAction
  | SendCaptionAction
  | SetNameAction
  | StartWhisperAction
  | ShowProfileAction
  | ShowModalAction
  | AuthenticateAction
  | IsRegisteredAction
  | BanToggleAction
  | ModToggleAction
  | NoteAddAction
  | NoteRemoveAction
  | NoteUpdateLikesAction
  | NoteUpdateRoomAction
  | HideModalAction
  | HideProfileAction
  | ShowSideMenuAction
  | HideSideMenuAction
  | DeactivateAutoscrollAction
  | ActivateAutoscrollAction
  | SpaceIsClosedAction
  | SpaceOpenedOrClosedAction
  | CommandMessageAction

export enum ActionType {
  // Server-driven action
  ReceivedMyProfile = 'RECEIVED_MY_PROFILE',
  ReceivedServerSettings = 'RECEIVED_SERVER_SETTINGS',
  UpdatedCurrentRoom = 'UPDATED_CURRENT_ROOM',
  UpdatedRoomData = 'UPDATED_ROOM_DATA',
  UpdatedPresence = 'UPDATED_PRESENCE',
  UpdatedVideoPresence = 'UPDATED_VIDEO_PRESENCE',
  PlayerConnected = 'PLAYER_CONNECTED',
  PlayerDisconnected = 'PLAYER_DISCONNECTED',
  ChatMessage = 'CHAT_MESSAGE',
  CaptionMessage = 'CAPTION_MESSAGE',
  ModMessage = 'MOD_MESSAGE',
  DeleteMessage = 'DELETE_MESSAGE',
  Whisper = 'WHISPER',
  Shout = 'SHOUT',
  Emote = 'EMOTE',
  Dance = 'DANCE',
  PlayerEntered = 'PLAYER_ENTERED',
  PlayerLeft = 'PLAYER_LEFT',
  Error = 'ERROR',
  UserMap = 'USER_MAP',
  ItemMap = 'ITEM_MAP',
  ItemScripts = 'ITEM_SCRIPTS',
  PlayerBanned = 'PLAYER_BANNED',
  PlayerUnbanned = 'PLAYER_UNBANNED',
  UpdateProfileColor = 'UPDATE_PROFILE_COLOR',
  // WebRTC
  P2PDataReceived = 'P2P_DATA_RECEIVED',
  P2PStreamReceived = 'P2P_STREAM_RECEIVED',
  P2PConnectionClosed = 'P2P_CONNECTION_CLOSED',
  P2PWaitingForConnections = 'P2P_WAITING_FOR_CONNECTIONS',
  LocalMediaStreamOpened = 'LOCAL_MEDIASTREAM_OPENED',
  StopVideoChat = 'STOP_VIDEO_CHAT',
  LocalMediaMicrophoneListReceived = 'LOCAL_MEDIA_MICROPHONE_LIST_RECEIVED',
  LocalMediaCameraListReceived = 'LOCAL_MEDIA_CAMERA_LIST_RECEIVED',
  LocalMediaSelectedCamera = 'LOCAL_MEDIA_SELECTED_CAMERA',
  LocalMediaSelectedMicrophone = 'LOCAL_MEDIA_SELECTED_MICROPHONE',
  MediaReceivedSpeakingData = 'MEDIA_RECEIVED_SPEAKING_DATA',
  ACSReceivedToken = 'ACS_RECEIVED_TOKEN',
  // UI actions
  SendMessage = 'SEND_MESSAGE',
  SendCaption = 'SEND_CAPTION',
  SetName = 'SET_NAME',
  StartWhisper = 'START_WHISPER',
  ShowProfile = 'SHOW_PROFILE',
  HideProfile = 'HIDE_PROFILE',
  ShowModal = 'SHOW_MODAL',
  ShowSideMenu = 'SHOW_SIDE_MENU',
  HideSideMenu = 'HIDE_SIDE_MENU',
  DeactivateAutoscroll = 'DEACTIVATE_AUTOSCROLL',
  ActivateAutoscroll = 'ACTIVATE_AUTOSCROLL',
  //
  Authenticate = 'AUTHENTICATE',
  IsRegistered = 'IS_REGISTERED',
  BanToggle = 'BAN_TOGGLE',
  ModToggle = 'MOD_TOGGLE',
  LoadMessageArchive = 'LOAD_MESSAGE_ARCHIVE',
  // Note Wall
  NoteAdd = 'NOTE_ADD',
  NoteRemove = 'NOTE_REMOVE',
  NoteUpdateLikes = 'NOTE_UPDATE_LIKES',
  NoteUpdateRoom = 'NOTE_UPDATE_ROOM',
  HideModalAction = 'HIDE_MODAL',

  SpaceIsClosed = 'SPACE_IS_CLOSED',
  SpaceOpenedOrClosed = 'SPACE_OPENED_OR_CLOSED',

  CommandMessage = 'COMMAND_MESSAGE'
}

interface ReceivedMyProfileAction {
  type: ActionType.ReceivedMyProfile;
  value: PublicUser;
}

export const ReceivedMyProfileAction = (
  user: PublicUser
): ReceivedMyProfileAction => {
  return {
    type: ActionType.ReceivedMyProfile,
    value: user
  }
}

interface ReceivedServerSettingsAction {
  type: ActionType.ReceivedServerSettings;
  value: ServerSettings;
}

export const ReceivedServerSettingsAction = (
  serverSettings: ServerSettings
): ReceivedServerSettingsAction => {
  return {
    type: ActionType.ReceivedServerSettings,
    value: serverSettings
  }
}

interface UpdatedCurrentRoomAction {
  type: ActionType.UpdatedCurrentRoom;
  value: string;
}

export const UpdatedCurrentRoomAction = (
  roomId: string
): UpdatedCurrentRoomAction => {
  return {
    type: ActionType.UpdatedCurrentRoom,
    value: roomId
  }
}

interface UpdatedRoomDataAction {
  type: ActionType.UpdatedRoomData;
  value: { [roomId: string]: Room };
}

export const UpdatedRoomDataAction = (roomData: {
  [roomId: string]: Room;
}): UpdatedRoomDataAction => {
  return {
    type: ActionType.UpdatedRoomData,
    value: roomData
  }
}

interface UpdatedPresenceAction {
  type: ActionType.UpdatedPresence;
  value: { [roomId: string]: string[] };
}

export const UpdatedPresenceAction = (data: {
  [roomId: string]: string[];
}): UpdatedPresenceAction => {
  return {
    type: ActionType.UpdatedPresence,
    value: data
  }
}

interface UpdatedVideoPresenceAction {
  type: ActionType.UpdatedVideoPresence;
  value: {
    roomId: string,
    users: string[]
  }
}

export const UpdatedVideoPresenceAction = (roomId: string, users: string[]): UpdatedVideoPresenceAction => {
  return {
    type: ActionType.UpdatedVideoPresence,
    value: { roomId, users }
  }
}

interface PlayerConnectedAction {
  type: ActionType.PlayerConnected;
  value: MinimalUser;
}

export const PlayerConnectedAction = (
  user: MinimalUser
): PlayerConnectedAction => {
  return {
    type: ActionType.PlayerConnected,
    value: user
  }
}

interface PlayerDisconnectedAction {
  type: ActionType.PlayerDisconnected;
  value: string;
}

export const PlayerDisconnectedAction = (
  name: string
): PlayerDisconnectedAction => {
  return {
    type: ActionType.PlayerDisconnected,
    value: name
  }
}

interface ChatMessageAction {
  type: ActionType.ChatMessage;
  value: {
    messageId: string;
    name: string;
    message: string;
  };
}

export const ChatMessageAction = (
  messageId: string,
  name: string,
  message: string
): ChatMessageAction => {
  return {
    type: ActionType.ChatMessage,
    value: { messageId, name, message }
  }
}

interface CaptionMessageAction {
  type: ActionType.CaptionMessage;
  value: {
    messageId: string;
    name: string;
    message: string;
  };
}

export const CaptionMessageAction = (
  messageId: string,
  name: string,
  message: string
): CaptionMessageAction => {
  return {
    type: ActionType.CaptionMessage,
    value: { messageId, name, message }
  }
}

interface WhisperAction {
  type: ActionType.Whisper;
  value: {
    name: string;
    message: string;
  };
}

export const WhisperAction = (name: string, message: string): WhisperAction => {
  return {
    type: ActionType.Whisper,
    value: { name, message }
  }
}

interface ModMessageAction {
  type: ActionType.ModMessage;
  value: {
    name: string;
    message: string;
  };
}

export const ModMessageAction = (
  name: string,
  message: string
): ModMessageAction => {
  return {
    type: ActionType.ModMessage,
    value: { name, message }
  }
}

interface DeleteMessageAction {
  type: ActionType.DeleteMessage;
  value: {
    modId: string;
    targetMessageId: string;
  }
}

export const DeleteMessageAction = (
  modId: string,
  targetMessageId: string
): DeleteMessageAction => {
  return {
    type: ActionType.DeleteMessage,
    value: { modId, targetMessageId }
  }
}

export const ShoutAction = (messageId: string, name: string, message: string): ShoutAction => {
  return {
    type: ActionType.Shout,
    value: { messageId, name, message }
  }
}

interface ShoutAction {
  type: ActionType.Shout;
  value: {
    messageId: string;
    name: string;
    message: string;
  };
}

interface EmoteAction {
  type: ActionType.Emote;
  value: {
    messageId: string;
    name: string;
    message: string;
  }
}

export const EmoteAction = (messageId: string, name: string, message: string): EmoteAction => {
  return {
    type: ActionType.Emote,
    value: { messageId, name, message }
  }
}

interface DanceAction {
  type: ActionType.Dance;
  value: {
    messageId: string;
    name: string;
    message: string;
  }
}

export const DanceAction = (messageId: string, name: string, message: string): DanceAction => {
  return {
    type: ActionType.Dance,
    value: { messageId, name, message }
  }
}

interface PlayerEnteredAction {
  type: ActionType.PlayerEntered;
  value: {
    name: string;
    fromId: string;
    fromName: string;
  };
}

export const PlayerEnteredAction = (
  name: string,
  fromId: string,
  fromName: string
): PlayerEnteredAction => {
  return {
    type: ActionType.PlayerEntered,
    value: { name, fromId, fromName }
  }
}

interface PlayerLeftAction {
  type: ActionType.PlayerLeft;
  value: {
    name: string;
    toId: string;
    toName: string;
  };
}

export const PlayerLeftAction = (
  name: string,
  toId: string,
  toName: string
): PlayerLeftAction => {
  return {
    type: ActionType.PlayerLeft,
    value: { name, toId, toName }
  }
}

interface UserMapAction {
  type: ActionType.UserMap;
  value: { [userId: string]: MinimalUser };
}

export const UserMapAction = (map: {
  [userId: string]: MinimalUser;
}): UserMapAction => {
  return {
    type: ActionType.UserMap,
    value: map
  }
}

interface ItemMapAction {
  type: ActionType.ItemMap;
  value: { [itemId: string]: any };
}

// TODO: This should be itemData instead of itemMap
export const ItemMapAction = (map: {
  [itemId: string]: any;
}): ItemMapAction => {
  return {
    type: ActionType.ItemMap,
    value: map
  }
}

interface ItemScriptsAction {
  type: ActionType.ItemScripts;
  value: { [itemId: string]: any };
}

export const ItemScriptsAction = (map: {
  [itemId: string]: any;
}): ItemScriptsAction => {
  return {
    type: ActionType.ItemScripts,
    value: map
  }
}

interface PlayerBannedAction {
  type: ActionType.PlayerBanned;
  value: MinimalUser;
}

export const PlayerBannedAction = (user: MinimalUser): PlayerBannedAction => {
  return {
    type: ActionType.PlayerBanned,
    value: user
  }
}

interface PlayerUnbannedAction {
  type: ActionType.PlayerUnbanned;
  value: MinimalUser;
}

export const PlayerUnbannedAction = (user: MinimalUser): PlayerUnbannedAction => {
  return {
    type: ActionType.PlayerUnbanned,
    value: user
  }
}

interface UpdateProfileColorAction {
  type: ActionType.UpdateProfileColor,
  color: string
}

export const UpdateProfileColorAction = (color: string): UpdateProfileColorAction => {
  return {
    type: ActionType.UpdateProfileColor,
    color: color
  }
}

interface P2PDataReceivedAction {
  type: ActionType.P2PDataReceived;
  value: {
    peerId: string;
    data: string;
  };
}

export const P2PDataReceivedAction = (
  peerId: string,
  data: string
): P2PDataReceivedAction => {
  return {
    type: ActionType.P2PDataReceived,
    value: { peerId, data }
  }
}

interface P2PStreamReceivedAction {
  type: ActionType.P2PStreamReceived;
  value: string;
}

export const P2PStreamReceivedAction = (
  peerId: string
): P2PStreamReceivedAction => {
  return {
    type: ActionType.P2PStreamReceived,
    value: peerId
  }
}

interface P2PConnectionClosedAction {
  type: ActionType.P2PConnectionClosed;
  value: string;
}

export const P2PConnectionClosedAction = (
  peerId: string
): P2PConnectionClosedAction => {
  return {
    type: ActionType.P2PConnectionClosed,
    value: peerId
  }
}

interface P2PWaitingForConnectionsAction {
  type: ActionType.P2PWaitingForConnections;
}

export const P2PWaitingForConnectionsAction = (): P2PWaitingForConnectionsAction => {
  return {
    type: ActionType.P2PWaitingForConnections
  }
}
interface LocalMediaStreamOpenedAction {
  type: ActionType.LocalMediaStreamOpened;
  value: {
    streamId: string;
    videoDeviceId: string;
    audioDeviceId: string;
  };
}

export const LocalMediaStreamOpenedAction = (
  streamId: string,
  devices: { videoDeviceId: string; audioDeviceId: string }
): LocalMediaStreamOpenedAction => {
  const { videoDeviceId, audioDeviceId } = devices
  return {
    type: ActionType.LocalMediaStreamOpened,
    value: { streamId, videoDeviceId, audioDeviceId }
  }
}

interface LocalMediaMicrophoneListReceivedAction {
  type: ActionType.LocalMediaMicrophoneListReceived;
  value: DeviceInfo[];
}

export const LocalMediaMicrophoneListReceivedAction = (
  devices: DeviceInfo[]
): LocalMediaMicrophoneListReceivedAction => {
  return {
    type: ActionType.LocalMediaMicrophoneListReceived,
    value: devices
  }
}

interface LocalMediaCameraListReceivedAction {
  type: ActionType.LocalMediaCameraListReceived;
  value: DeviceInfo[];
}

export const LocalMediaCameraListReceivedAction = (
  devices: DeviceInfo[]
): LocalMediaCameraListReceivedAction => {
  return {
    type: ActionType.LocalMediaCameraListReceived,
    value: devices
  }
}

interface ACSReceivedTokenAction {
  type: ActionType.ACSReceivedToken
  value: string
}

export const ACSReceivedTokenAction = (token: string): ACSReceivedTokenAction => {
  return {
    type: ActionType.ACSReceivedToken,
    value: token
  }
}

interface LocalMediaSelectedCameraAction {
  type: ActionType.LocalMediaSelectedCamera;
  value: string;
}

export const LocalMediaSelectedCameraAction = (
  deviceId: string
): LocalMediaSelectedCameraAction => {
  return {
    type: ActionType.LocalMediaSelectedCamera,
    value: deviceId
  }
}

interface LocalMediaSelectedMicrophoneAction {
  type: ActionType.LocalMediaSelectedMicrophone;
  value: string;
}

export const LocalMediaSelectedMicrophoneAction = (
  deviceId: string
): LocalMediaSelectedMicrophoneAction => {
  return {
    type: ActionType.LocalMediaSelectedMicrophone,
    value: deviceId
  }
}
interface MediaReceivedSpeakingDataAction {
  type: ActionType.MediaReceivedSpeakingData;
  value: string[];
}

export const MediaReceivedSpeakingDataAction = (
  peerIds: string[]
): MediaReceivedSpeakingDataAction => {
  return {
    type: ActionType.MediaReceivedSpeakingData,
    value: peerIds
  }
}

interface StopVideoChatAction {
  type: ActionType.StopVideoChat;
}

export const StopVideoChatAction = (): StopVideoChatAction => {
  return { type: ActionType.StopVideoChat }
}

interface ErrorAction {
  type: ActionType.Error;
  value: string;
}

export const ErrorAction = (error: string): ErrorAction => {
  return {
    type: ActionType.Error,
    value: error
  }
}

// UI Actions

interface SendMessageAction {
  type: ActionType.SendMessage;
  value: string;
}

export const SendCaptionAction = (message: string): SendCaptionAction => {
  return {
    type: ActionType.SendCaption,
    value: message
  }
}
interface SendCaptionAction {
  type: ActionType.SendCaption;
  value: string;
}

export const SendMessageAction = (message: string): SendMessageAction => {
  return {
    type: ActionType.SendMessage,
    value: message
  }
}

interface SetNameAction {
  type: ActionType.SetName;
  value: string;
}

export const SetNameAction = (name: string): SetNameAction => {
  return {
    type: ActionType.SetName,
    value: name
  }
}

interface StartWhisperAction {
  type: ActionType.StartWhisper;
  value: string;
}

export const StartWhisperAction = (name: string): StartWhisperAction => {
  return { type: ActionType.StartWhisper, value: name }
}

interface HideProfileAction {
  type: ActionType.HideProfile;
}

export const HideProfileAction = (): HideProfileAction => {
  return { type: ActionType.HideProfile }
}

interface ShowProfileAction {
  type: ActionType.ShowProfile;
  value: PublicUser;
}

export const ShowProfileAction = (
  user: PublicUser
): ShowProfileAction => {
  return {
    type: ActionType.ShowProfile,
    value: user
  }
}

interface ShowModalAction {
  type: ActionType.ShowModal;
  value: Modal
}

export const ShowModalAction = (modal: Modal): ShowModalAction => {
  return {
    type: ActionType.ShowModal,
    value: modal
  }
}

interface HideModalAction {
  type: ActionType.HideModalAction;
}

export const HideModalAction = (): HideModalAction => {
  return { type: ActionType.HideModalAction }
}

interface AuthenticateAction {
  type: ActionType.Authenticate;
  value: { name: string; userId: string, provider: string };
}

interface ShowSideMenuAction {
  type: ActionType.ShowSideMenu;
}

export const ShowSideMenuAction = (): ShowSideMenuAction => {
  return { type: ActionType.ShowSideMenu }
}

interface HideSideMenuAction {
  type: ActionType.HideSideMenu;
}

export const HideSideMenuAction = (): HideSideMenuAction => {
  return { type: ActionType.HideSideMenu }
}

interface DeactivateAutoscrollAction {
  type: ActionType.DeactivateAutoscroll;
}

export const DeactivateAutoscrollAction = (): DeactivateAutoscrollAction => {
  return { type: ActionType.DeactivateAutoscroll }
}

interface ActivateAutoscrollAction {
  type: ActionType.ActivateAutoscroll;
}

export const ActivateAutoscrollAction = (): ActivateAutoscrollAction => {
  return { type: ActionType.ActivateAutoscroll }
}

export const AuthenticateAction = (
  userId: string | undefined,
  name: string | undefined,
  provider: string | undefined
): AuthenticateAction => {
  return { type: ActionType.Authenticate, value: { userId, name, provider } }
}

interface IsRegisteredAction {
  type: ActionType.IsRegistered;
}

export const IsRegisteredAction = (): IsRegisteredAction => {
  return { type: ActionType.IsRegistered }
}

interface BanToggleAction {
  type: ActionType.BanToggle;
  value: string;
}

export const BanToggleAction = (userId: string): BanToggleAction => {
  return { type: ActionType.BanToggle, value: userId }
}

interface ModToggleAction {
  type: ActionType.ModToggle;
  value: string;
}

export const ModToggleAction = (userId: string): ModToggleAction => {
  return { type: ActionType.ModToggle, value: userId }
}

interface LoadMessageArchiveAction {
  type: ActionType.LoadMessageArchive;
  messages: Message[];
  whispers: WhisperMessage[];
}

export const LoadMessageArchiveAction = (messages: Message[], whispers: WhisperMessage[]): LoadMessageArchiveAction => {
  return { type: ActionType.LoadMessageArchive, messages: messages, whispers: whispers }
}

interface NoteAddAction {
  type: ActionType.NoteAdd;
  value: { roomId: string, note: RoomNote };
}

export const NoteAddAction = (roomId: string, note: RoomNote): NoteAddAction => {
  return { type: ActionType.NoteAdd, value: { roomId, note } }
}

interface NoteRemoveAction {
  type: ActionType.NoteRemove;
  value: { roomId: string, noteId: string };
}

export const NoteRemoveAction = (roomId: string, noteId: string): NoteRemoveAction => {
  return { type: ActionType.NoteRemove, value: { roomId, noteId } }
}

interface NoteUpdateLikesAction {
  type: ActionType.NoteUpdateLikes;
  value: { roomId: string, noteId: string, likes: string[] };
}

export const NoteUpdateLikesAction = (roomId: string, noteId: string, likes: string[]): NoteUpdateLikesAction => {
  return { type: ActionType.NoteUpdateLikes, value: { roomId, noteId, likes } }
}

interface NoteUpdateRoomAction {
  type: ActionType.NoteUpdateRoom;
  value: { roomId: string, notes: RoomNote[] };
}

export const NoteUpdateRoomAction = (roomId: string, notes: RoomNote[]): NoteUpdateRoomAction => {
  return { type: ActionType.NoteUpdateRoom, value: { roomId, notes } }
}

interface SpaceIsClosedAction {
  type: ActionType.SpaceIsClosed;
}

export const SpaceIsClosedAction = (): SpaceIsClosedAction => {
  return { type: ActionType.SpaceIsClosed }
}

interface SpaceOpenedOrClosedAction {
  type: ActionType.SpaceOpenedOrClosed;
  value: boolean
}

export const SpaceOpenedOrClosedAction = (value: boolean): SpaceOpenedOrClosedAction => {
  return { type: ActionType.SpaceOpenedOrClosed, value }
}

interface CommandMessageAction {
  type: ActionType.CommandMessage;
  value: string
}

export const CommandMessageAction = (message: string): CommandMessageAction => {
  return {
    type: ActionType.CommandMessage,
    value: message
  }
}
