import { globalPresenceMessage } from '../globalPresenceMessage'
import { userHeartbeatReceived } from '../heartbeat'
import { roomData } from '../rooms'
import { items } from '../items'
import setUpRoomsForUser from '../setUpRoomsForUser'
import { RoomResponse } from '../types'
import { User, isMod, minimizeUser } from '../user'
import { AuthenticatedEndpointFunction, LogFn, Result } from '../endpoint'
import DB from '../cosmosdb'
import Redis from '../redis'

const connect: AuthenticatedEndpointFunction = async (user: User, inputs: any, log: LogFn) => {
  log('We have a user!', user.id)
  const result: Result = {}

  if (user.roomId === undefined) {
    log('Setting default roomId')
    user.roomId = 'entryway'
  }

  await DB.setCurrentRoomForUser(user, user.roomId)
  await userHeartbeatReceived(user)

  const users = await DB.getAllUsers()
  const userMap = {}
  users.forEach(u => {
    userMap[u.id] = minimizeUser(u)
  })

  const response: RoomResponse = {
    roomId: user.roomId,
    presenceData: await DB.allRoomOccupants(),
    // TODO: Fetch this from the DB
    itemData: await items(),
    users: userMap,
    roomData,
    // TODO: Have a function to delete the keys we don't need
    profile: user
  }

  if (roomData[user.roomId].hasNoteWall) {
    response.roomNotes = await Redis.getRoomNotes(user.roomId)
  }

  result.httpResponse = {
    status: 200,
    body: response
  }

  result.groupManagementTasks = [
    ...setUpRoomsForUser(user.id, user.roomId),
    {
      userId: user.id,
      groupId: user.roomId,
      action: 'add'
    }
  ]

  if (await isMod(user.id)) {
    result.groupManagementTasks.push({
      userId: user.id,
      groupId: 'mods',
      action: 'add'
    })
  }

  log('Setting messages')

  const minimalUser = minimizeUser(user)

  result.messages = [
    {
      groupId: user.roomId,
      target: 'playerConnected',
      arguments: [minimalUser]
    },
    {
      target: 'usernameMap',
      arguments: [{ [user.id]: minimalUser }]
    },
    await globalPresenceMessage([user.roomId])
  ]

  log('Finished the thing')
  log(result)

  return result
}

export default connect
