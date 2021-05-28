import * as React from 'react'
import { Room } from '../room'
import {
  moveToRoom,
  getNetworkMediaChatStatus, pickUpItem, dropItem
} from '../networking'
import NameView from './NameView'
import { DispatchContext, UserMapContext } from '../App'
import { StopVideoChatAction, ShowModalAction, ItemMapAction, Action } from '../Actions'
import { FaVideo } from 'react-icons/fa'

import '../../style/room.css'
import { Modal } from '../modals'
import { SpecialFeature } from '../../server/src/rooms'
import { RainbowGateRoomView } from './feature/RainbowGateViews'
import { DullDoorRoomView } from './feature/DullDoorViews'
import { FullRoomIndexRoomView } from './feature/FullRoomIndexViews'
import { linkActions } from '../linkActions'
import { useContext } from 'react'
import { useMediaChatContext } from '../videochat/mediaChatContext'
import { attemptActionOnItem, dispatchStoryboardAction, parse, TextInput } from '../storyboard'
import { MinimalUser } from '../../server/src/user'
import { keyPathify } from 'storyboard-engine'

const VIDEO_CHAT_MAX_SIZE = 8

interface Props {
  room: Room;
  userId: string;
  roomData: { [roomId: string]: Room };
  itemData: { [itemId: string]: any };
  self: MinimalUser
}

export default function RoomView (props: Props) {
  const dispatch = React.useContext(DispatchContext)
  const { leaveCall } = useMediaChatContext()

  const { room, roomData, self, itemData } = props
  if (self.item) {
    const heldItem = itemData[self.item]
    delete heldItem.player;
    (self as any).holding = heldItem
  }

  React.useEffect(() => {
    // useEffect can't take an async function, so let's create and run an anonymous one
    (async () => {
      console.log('In useEffect')
      const newItemData = { ...itemData }
      const action: TextInput = {
        verb: 'enter',
        directObject: self.id, // TODO: How will this be used?
        indirectObject: room.id
      }

      // TODO: Might need to defer this? That's what we did before
      await dispatchStoryboardAction(action, {
        itemData: newItemData,
        player: self,
        dispatch
      })
    })()
    // TODO: Does props.room change for any reason other than a new room?
  }, [room.id])

  const dropHeldItem = async () => {
    dropItem()

    // TODO: We want to be able to trigger this from within actions
    // I don't know how to expose this into Storyboard.ts without moving everything there.
    // But what does that mean?

    const newItemData = { ...props.itemData }
    const action: TextInput = {
      verb: 'drop',
      directObject: (self as any).holding,
      indirectObject: room.id
    }
    await dispatchStoryboardAction(action, {
      itemData: newItemData,
      player: self,
      dispatch
    })
  }

  // This is very silly.
  // Since we're manually setting raw HTML, we can't get refs to add proper click handlers
  // Instead, we just hijack ALL clicks in the description, and check if they're for a link
  const descriptionClick = async (e) => {
    const roomId =
      e.target && e.target.getAttribute && e.target.getAttribute('data-room')
    if (roomId) {
      moveToRoom(roomId)
      return
    }

    const itemName = e.target && e.target.getAttribute && e.target.getAttribute('data-item')
    if (itemName) {
      console.log('Picking up item?', itemName)
      pickUpItem(itemName)
    }

    const action = e.target && e.target.getAttribute && e.target.getAttribute('data-action')
    if (action) {
      // TODO: Once the new event/object system is mature, deprecate old linkActions
      if (linkActions[action]) {
        linkActions[action]()
      } else {
        const parsedAction = parse(action, itemData)
        console.log(action, parsedAction, itemData)

        if (parsedAction.verb === 'take') {
          await pickUpItem(parsedAction.directObject.itemId);
          // TODO: This feels insecure, but we need to update the held item
          (self as any).holding = itemData[parsedAction.directObject.itemId]
        }

        await dispatchStoryboardAction(action, {
          itemData: itemData,
          player: self,
          dispatch
        })
      }
    }
  }

  const joinVideoChat = async () => {
    dispatch(ShowModalAction(Modal.MediaSelector))
  }

  const leaveVideoChat = () => {
    dispatch(StopVideoChatAction())
    leaveCall()
  }

  const showNoteWall = () => {
    dispatch(ShowModalAction(Modal.NoteWall))
  }

  let noteWallView
  if (room && room.hasNoteWall) {
    if (room.noteWallData) {
      noteWallView = <div>{room.noteWallData.roomWallDescription} <button onClick={showNoteWall}>{room.noteWallData.noteWallButton}</button></div>
    } else {
      noteWallView = <div>One of the walls has space for attendees to put up sticky notes. <button onClick={showNoteWall}>View note wall</button></div>
    }
  }

  let videoChatButton
  if (room && !room.noMediaChat) {
    if (getNetworkMediaChatStatus()) {
      videoChatButton = (
        <button onClick={leaveVideoChat} id='join-video-chat'>
          Leave Video Chat
        </button>
      )
    } else if (room.videoUsers && room.videoUsers.length >= VIDEO_CHAT_MAX_SIZE) {
      // Maybe make it more transparent? I think this is probably fine, but I'm no UI expert!
      videoChatButton = (
        <button id='join-video-chat'>
          Video Chat Is Full (limit {VIDEO_CHAT_MAX_SIZE})
        </button>
      )
    } else {
      videoChatButton = (
        <button onClick={joinVideoChat} id='join-video-chat'>
          Join Video Chat {room.videoUsers && room.videoUsers.length > 0 ? `(${room.videoUsers.length})` : ''}
        </button>
      )
    }
  }

  // TODO: Don't hard-code order of features
  /* eslint-disable jsx-a11y/click-events-have-key-events */
  /* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
  /* eslint-disable jsx-a11y/no-static-element-interactions */
  return (
    <div id="room">
      <h1 id="room-name">{room ? room.name : 'Loading...'}{videoChatButton}</h1>
      <div
        id="static-room-description"
        onClick={descriptionClick}
        dangerouslySetInnerHTML={{
          __html: room
            ? parseDescription(room.description, roomData, itemData, self)
            : 'Loading current room...'
        }}
      />
      {room && room.id === 'theater' ? <StreamEmbed /> : null }
      {room && room.specialFeatures && room.specialFeatures.includes(SpecialFeature.RainbowDoor) ? <RainbowGateRoomView /> : ''}
      {room && room.specialFeatures && room.specialFeatures.includes(SpecialFeature.DullDoor) ? <DullDoorRoomView /> : ''}
      {room && room.specialFeatures && room.specialFeatures.includes(SpecialFeature.FullRoomIndex) ? <FullRoomIndexRoomView /> : ''}
      {room ? <PresenceView users={room.users} userId={props.userId} videoUsers={room.videoUsers} roomId={room.id} dropHeldItem={dropHeldItem}/> : ''}
      {noteWallView}
    </div>
  )
}

const HeldItemView = (props: {dropHeldItem: () => void}) => {
  const { userMap, myId } = useContext(UserMapContext)
  const user = userMap[myId]

  if (user.item) {
    return <span>You are holding {user.item}. <button className='link-styled-button' onClick={props.dropHeldItem}>Drop it</button>.</span>
  } else {
    return null
  }
}

const PresenceView = (props: { users?: string[]; userId?: string, videoUsers: string[], roomId: string, dropHeldItem: () => void }) => {
  const { userMap, myId } = React.useContext(UserMapContext)

  let { users, userId, videoUsers, dropHeldItem } = props

  // Shep: Issue 43, reminder to myself that this is the code making sure users don't appear in their own client lists.
  if (users && userId) {
    users = users.filter((u) => u !== userId)
  }

  if (users) {
    // TODO: This should happen in the reducer
    let names

    if (users.length === 0) {
      return <div id="dynamic-room-description">You are all alone here. <HeldItemView dropHeldItem={dropHeldItem}/></div>
    }

    if (props.roomId === 'theater') {
      return <div id="dynamic-room-description">There are {users.length} other people sitting in here.</div>
    }

    const userViews = users.map((u, idx) => {
      const user = userMap[u]
      if (!user) { return <span /> }
      const id = `presence-${idx}`
      return (
        <span key={`room-presence-${id}`}>
          <NameView userId={u} id={id} key={id} />
          {videoUsers && videoUsers.includes(u) ? <FaVideo /> : null}
          {user.item ? ` (holding ${user.item})` : null}
        </span>
      )
    })

    if (users.length === 1) {
      names = userViews[0]
    } else if (users.length === 2) {
      names = (
        <span>
          {userViews[0]} and {userViews[1]}
        </span>
      )
    } else {
      names = (
        <span>
          {intersperse(userViews.slice(0, users.length - 1), ', ')}, and{' '}
          {userViews[userViews.length - 1]}
        </span>
      )
    }

    return (
      <div id="dynamic-room-description">
        Also here {users.length === 1 ? 'is' : 'are'} {names}. <HeldItemView dropHeldItem={dropHeldItem}/>
      </div>
    )
  } else {
    return <div id="dynamic-room-description" />
  }
}

// https://stackoverflow.com/questions/23618744/rendering-comma-separated-list-of-links
/* intersperse: Return an array with the separator interspersed between
 * each element of the input array.
 *
 * > _([1,2,3]).intersperse(0)
 * [1,0,2,0,3]
 */
function intersperse (arr, sep) {
  if (arr.length === 0) {
    return []
  }

  return arr.slice(1).reduce(
    function (xs, x, i) {
      return xs.concat([sep, x])
    },
    [arr[0]]
  )
}

function parseDescription (description: string, roomData: { [roomId: string]: Room }, itemData: { [itemId: string]: any }, player: any): string {
  const editedItemData = { ...itemData }

  // eslint-disable-next-line no-useless-escape
  const complexLinkRegex = /\[\[([^\]]*?)\-\>([^\]]*?)\]\]/g
  const simpleLinkRegex = /\[\[(.+?)\]\]/g

  const itemRegex = /\{\{(.+?)\}\}/g

  const itemVarRegex = /\{(.+?)\}/g
  const simpleItemActionRegex = /<<(.+?)>>/g
  const complexItemActionRegex = /<<([^>]*?)\-\>([^>]*?)>>/g

  description = description.replace(itemRegex, (match, itemId) => {
    /*
    This raises questions about server vs local item handling
    My current thoughts: we need to allow for secret item code that only runs on the server.
    I suspect we also want locally-running code.

    We need a global object of item state that includes all objects.
    Maybe local code will modify that, but the server will also modify that
    including making it so that item.description always exists as a string

    */

    // TODO: Do I need to deep-copy this?
    if (!editedItemData[itemId]) { return match }
    const item = { ...editedItemData[itemId] }
    console.log('ITEMS', itemId, item, player)
    item.player = player

    // TODO: add keypathing
    // also, should player.holding be an object, an ID, or change script to player.holding.description

    item.description = item.description.replace(itemVarRegex, (match, keypath) => {
      // TODO: keypathify this. Look to storyboard for examples
      console.log(`Trying to replace '${match}' with ${item[keypath]}`)
      return item[keypath] || match // TODO: this is only here for debug
      // return item[keypath]
    })

    item.description = item.description.replace(complexItemActionRegex, (match, description, action) => {
      return `<a class='action-link' href='#' data-action='${action}'>${description}</a>`
    })

    item.description = item.description.replace(simpleItemActionRegex, (match, action) => {
      console.log('We cound a simple action item regex', match, action)
      return `<a class='action-link' href='#' data-action='${action}'>${action}</a>`
    })

    // TODO: We repeat itemVarRegex to allow keypath vars within replaced text.
    // This one-off reordering is naive, and may need more generalization for arbitrary nesting
    item.description = item.description.replace(itemVarRegex, (match, keypath) => {
      const result = keyPathify(keypath, item)
      console.log(`Trying to replace '${match}' with ${result}`)
      return result || match // TODO: this is only here for debug
    })

    console.log(item.description)
    return `<span className="item">${item.description}</span>`
  })

  description = description.replace(complexLinkRegex, (match, text, roomId) => {
    const room = roomData[roomId]
    if (roomId === 'item') {
      return `<a class='room-link' href='#' data-item='${text}'>${text}</a>`
    } else if (room) {
      const userCount = room && room.users && room.users.length > 0 ? ` (${room.users.length})` : ''
      return `<a class='room-link' href='#' data-room='${roomId}'>${text}${userCount}</a>`
    } else if (linkActions[roomId]) {
      return `<a class='room-link' href='#' data-action='${roomId}'>${text}</a>`
    } else {
      console.log(`Dev warning: tried to link to room ${roomId}, which doesn't exist`)
    }
  })

  description = description.replace(simpleLinkRegex, (match, roomId) => {
    const room = roomData[roomId]
    if (!room) {
      console.log(`Dev warning: tried to link to room ${roomId}, which doesn't exist`)
    }
    const userCount = room && room.users && room.users.length > 0 ? ` (${room.users.length})` : ''
    return `<a class='room-link' href='#' data-room='${roomId}'>${roomId}${userCount}</a>`
  })
  return description
}

export function StreamEmbed () {
  const streamRef = React.useRef<HTMLIFrameElement>(null)
  const captionsRef = React.useRef<HTMLIFrameElement>(null)

  return (
    <div id="iframes" style={{ margin: 'auto' }}>
      <iframe width="560" title="stream" ref={streamRef} height="315" src="https://www.youtube.com/embed/live_stream?channel=UCKv_QzXft4mD6TXmQBZtzIA" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
      <iframe id="captions" title="captions" ref={captionsRef} width="560" height="100" src="https://www.streamtext.net/player/?event=RoguelikeCelebration&chat=false&header=false&footer=false&indicator=false&ff=Consolas&fgc=93a1a1" frameBorder="0" allow="autoplay; encrypted-media;" allowFullScreen></iframe>
    </div>
  )
}
