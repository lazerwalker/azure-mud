import { AuthenticatedEndpointFunction, LogFn, Result } from '../endpoint'
import { globalPresenceMessage } from '../globalPresenceMessage'
import { User, getFullUser, minimizeUser } from '../user'
import DB from '../cosmosdb'

const banUser: AuthenticatedEndpointFunction = async (user: User, inputs: any, log: LogFn) => {
  const targetId = inputs.userId
  if (!targetId) {
    return {
      httpResponse: {
        status: 400,
        body: { error: 'You did not include a user to ban/unban' }
      }
    }
  }

  const target = await getFullUser(targetId)

  if (target.isMod) {
    return {
      httpResponse: {
        status: 403,
        body: { error: 'You cannot ban a mod!' }
      }
    }
  }

  const result: Result = {}

  if (target.isBanned) {
    target.isBanned = false
    await DB.banUser(target, false)
    result.messages = [
      {
        userId: user.id,
        target: 'playerUnbanned',
        arguments: [minimizeUser(target)]
      }
    ]
  } else {
    await disconnectAndBan(user, target, result)
  }

  result.httpResponse = {
    status: 200,
    body: {}
  }

  return result
}

export default banUser

// This was originally a modified version of the 'disconnect' endpoint
async function disconnectAndBan (user: User, target: User, result: Result) {
  target.isBanned = true
  await DB.banUser(target, true)

  // Below is basically the code for disconnect but with additional SignalR Messages
  await DB.setUserAsActive(target, false)

  result.groupManagementTasks = [
    {
      userId: target.id,
      groupId: target.roomId,
      action: 'remove'
    }
  ]

  result.messages = [
    {
      groupId: target.roomId,
      target: 'playerBanned',
      arguments: [minimizeUser(target)]
    },
    // It is janky but fine that if the mod is in the same room as the target they get this twice
    {
      userId: user.id,
      target: 'playerBanned',
      arguments: [minimizeUser(target)]
    },
    {
      userId: target.id,
      target: 'playerBanned',
      arguments: [minimizeUser(target)]
    },
    // Disconnect logic
    {
      groupId: target.roomId,
      target: 'playerDisconnected',
      arguments: [target.id]
    },
    {
      target: 'videoPresence',
      arguments: [target.roomId, await DB.updateVideoPresenceForUser(target, false)]
    },
    await globalPresenceMessage([target.roomId])
  ]
}
