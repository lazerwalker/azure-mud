import { Room } from './rooms'
import { User, MinimalUser, PublicUser } from './user'
import { RoomNote } from './roomNote'

export interface HappeningNowEntry {
  text: string,
  roomId?: string,
  externalLink?: string
}

function isHappeningNowEntry (obj: any): obj is HappeningNowEntry {
  return obj.text && (typeof obj.text === 'string' || obj.text instanceof String) &&
    obj.roomId ? (typeof obj.roomId === 'string' || obj.roomId instanceof String) : true &&
    obj.externalLink ? (typeof obj.externalLink === 'string' || obj.externalLink instanceof String) : true
}

export interface ServerSettings {
  movementMessagesHideThreshold: number;
  movementMessagesHideRoomIds: string[];
  happeningNowEntries: HappeningNowEntry[];
  spaceIsClosed: boolean
  webhookDeployKey?: string
}

export const DEFAULT_SERVER_SETTINGS: ServerSettings = {
  movementMessagesHideThreshold: 20,
  movementMessagesHideRoomIds: ['theater'],
  happeningNowEntries: [],
  spaceIsClosed: false
}

// There's 100% a more elegant way to do this, but I think this works and want to actually get this feature finally done.
export function toServerSettings (obj: any): ServerSettings | null {
  try {
    if (obj.movementMessagesHideThreshold === undefined || obj.movementMessagesHideRoomIds === undefined ||
        (obj.happeningNowEntries && obj.happeningNowEntries.every((e) => { isHappeningNowEntry(e) }))) {
      return null
    } else {
      return {
        movementMessagesHideThreshold: obj.movementMessagesHideThreshold,
        movementMessagesHideRoomIds: obj.movementMessagesHideRoomIds,
        happeningNowEntries: obj.happeningNowEntries ? obj.happeningNowEntries : [],
        spaceIsClosed: obj.spaceIsClosed ? obj.spaceIsOpen : false
      }
    }
  } catch (e) {
    return null
  }
}

export interface RoomResponse {
  roomId: string;
  presenceData?: { [roomId: string]: string[] };
  users?: { [userId: string]: MinimalUser };
  roomData?: { [roomId: string]: Room };
  itemData?: { [itemId: string]: any}
  profile?: PublicUser;
  roomNotes?: RoomNote[]
}

export interface ErrorResponse {
  error: string;
}

export interface ProfileResponse {
  user: User;
}

export enum ValidColors {
  Blue = 'Blue',
  Cyan = 'Cyan',
  Green = 'Green',
  Magenta = 'Magenta',
  Orange = 'Orange',
  Red = 'Red',
  Violet = 'Violet',
  Yellow = 'Yellow'
}
