import { MinimalUser } from '../server/src/user'
import { Action, CommandMessageAction } from './Actions'
import { dropItem, sendChatMessage } from './networking'

import { Dispatch } from 'react'
import { Game } from 'storyboard-engine'
import { v4 as uuidv4 } from 'uuid'

export type TextInput = {
  verb: string
  directObject: any,
  indirectObject?: any,
  preposition?: string
}

export function parse (input: string, itemData): TextInput|undefined {
  // Currently the world's most naive parser
  let [verb, directObjectId, preposition, indirectObjectId] = input.split(' ')

  if (verb) verb = verb.toLowerCase()
  if (preposition) preposition = preposition.toLowerCase()

  const directObject = itemData[directObjectId]
  const indirectObject = itemData[indirectObjectId]
  return { verb, directObject, preposition, indirectObject }
}

export async function attemptActionOnItem (params: { action?: TextInput, itemState: any, script: string, itemData: any, player: MinimalUser, dispatch: Dispatch<Action>}): Promise<any> {
  const { action, itemState, script, itemData, player, dispatch } = params

  itemState.player = player
  if (itemState.player.holding && itemState.player.holding.player) {
    delete itemState.player.holding.player
  }

  console.log('Attempting action!', action)
  console.log('Item state', JSON.stringify(itemState, null, 2))
  return new Promise((resolve, reject) => {
    // TODO: Thin out itemData so it only includes available objects in the current room
    if (!script || script.trim() === '') {
      console.log(script)
      reject(new Error(`Story not included for ${itemState.itemId}`))
      return
    }

    try {
      const game = new Game(script, { ...itemData, ...itemState, player })
      console.log('Made game', game)
      if (!game || !game.valid) {
        console.log('No game, returning')
        return
      }

      game.addOutput('printLocal', (text, passageId) => {
        console.log('Printing local', text)
        dispatch(CommandMessageAction(text))
        game.completePassage(passageId)
      })

      game.addOutput('printAction', (text, passageId) => {
        console.log('Printing action', text)
        sendChatMessage(uuidv4(), `/me ${text}`)
        game.completePassage(passageId)
      })

      game.addOutput('dropItem', (itemId, passageId) => {
        dropItem()
      })

      game.addOutput('calculateNewColor', (inputColor, passageId) => {
        console.log('Calculating color', inputColor)
        const currentColor = game.state.color
        let newColor = currentColor

        if (inputColor === 'clear') {
          newColor = 'clear'
        } else {
          const map = {
            'blue-yellow': 'green',
            'blue-red': 'purple',
            'red-yellow': 'orange'
          }

          const colorString = [currentColor, inputColor].sort().join('-')

          if (currentColor === 'clear') {
            console.log('Was clear')
            newColor = inputColor
          } else if (inputColor !== currentColor) {
            newColor = map[colorString] || 'brown'
          }
        }

        game.receiveInput('color', newColor)
        game.receiveInput('oldcolor', currentColor)
        game.completePassage(passageId)
      })

      game.stateListener = (state) => {
        if (state.player && state.player.holding) {
          delete state.player.holding.player
        }

        console.log('New state', state)
        resolve(state)

        // TODO: Actually stop things!
        // game.stop()
      }

      game.start()

      if (action) {
        // We don't unset the action
        // This is fine as long as Storyboard objects are short-lived
        // If these eventually become stateful, weird things may happen
        game.receiveInput('action', action)
      }
    } catch (e) {
      console.log("Couldn't create game. Error: ", e)
      reject(e)
    }
  })
}
