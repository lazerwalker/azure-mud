import { v4 as uuid } from 'uuid'

import { AuthenticatedEndpointFunction, LogFn, Message } from '../endpoint'
import { minimizeUser, updateUserProfile, User } from '../user'
import generators from '../generators'
import allowedItems from '../allowedItems'

const pickUpItem: AuthenticatedEndpointFunction = async (user: User, inputs: any, log: LogFn) => {
  let item: string
  let privateActionString: string

  const oldItem = user.item

  if (inputs.list) {
    const generator = generators[inputs.list]

    if (!generator) {
      return {
        httpResponse: {
          status: 400,
          body: { error: `You included an invalid list: ${inputs.list}` }
        }
      }
    }

    item = generator.generate()
    privateActionString = generator.actionString(item)
    log(privateActionString)
  } else if (inputs.item) {
    item = inputs.item
    // if (!allowedItems.includes(item)) {
    //   return {
    //     httpResponse: {
    //       status: 400,
    //       body: { error: 'You included an invalid item' }
    //     }
    //   }
    // }
  } else if (inputs.drop) {
    item = undefined
  } else {
    return {
      httpResponse: {
        status: 400,
        body: { error: 'Include an item or list!' }
      }
    }
  }

  const actionString = (item ? `picks up ${item}.` : `drops ${oldItem}.`)

  const newProfile = await updateUserProfile(user.id, { item })

  const messages: Message[] = [
    {
      groupId: user.roomId,
      target: 'emote',
      arguments: [uuid(), user.id, actionString]
    },
    {
      target: 'usernameMap',
      arguments: [{ [user.id]: minimizeUser(newProfile) }]
    }
  ]

  if (privateActionString) {
    messages.unshift({
      userId: user.id,
      target: 'privateItemPickup',
      arguments: [privateActionString]
    })
  }

  return {
    messages,
    httpResponse: { status: 200 }
  }
}

export default pickUpItem
