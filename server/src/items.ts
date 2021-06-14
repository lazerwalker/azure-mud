/** STORYBOARD TODO
 * - Why isn't clickableItem working?
 * - Confirm client side is working 100% as expected
 * - Update description from database
 * - Send new description from client to db (or dispatch event on server?)
 * - Insert new todo items here as they come in
 * - Test multiplayer
 * - Fix grammar issues
 */

export type Item = {
  // These fields are considered immutable
  // Anything else can be modified and read from the DB
  readonly itemId: string
  readonly script: string // Storyboard data as a string
  readonly rawDescription: string
  readonly rawShortDescription: string

  description?: string
  shortDescription?: string
  [key: string]: any
}

type ItemMap = { [id: string]: Item }

export async function items (): Promise<ItemMap> {
  const itemMap: ItemMap = {}
  Object.values(itemDefinitions).forEach(item => {
    // TODO: Try to fetch these from the DB and only set to raw as a fallback
    item.description = item.rawDescription
    item.shortDescription = item.rawShortDescription

    itemMap[item.itemId] = item
  })

  return itemMap
}

const itemDefinitions: ItemMap = {
  cauldron: {
    itemId: 'cauldron',
    rawDescription: 'a large cast-iron black cauldron with a fire roaring under it. Inside it is a {color} liquid slowly simmering. There is a big spoon you can use to <<stir->stir cauldron>> it. {clickableAction}',
    rawShortDescription: 'cauldron',
    color: 'clear',
    script: `
      ## showPourEnter
      [action.verb is "enter" and player.holding.isColorant]
      set clickableAction to "<<Pour in {player.holding.shortDescription}->pour {player.holding.itemId}>>"

      ## showPourTake
      [action.verb is "take" and action.directObject.isColorant]
      set clickableAction to "<<Pour in {player.holding.shortDescription}->pour {player.holding.itemId}>>"

      ## resetStir
      [action.verb is "drop" and action.directObject.isColorant]
      unset clickableAction

      ## pour
      [action.verb is "pour" and action.directObject.isColorant]
      calculateNewColor: {action.directObject.color}

      -- TODO: I would love if we could do conditionals within strings, and include this as a single code path, a la modern React code
      [if color isnt oldcolor]
        printAction: "pours the {action.directObject.shortDescription} into the cauldron. The liquid sputters and turns {color}."
      [if color is oldcolor]
        printAction: "pours the {action.directObject.shortDescription} into the cauldron. There is no visible change to the liquid."
      dropItem: {action.directObject.itemId}

      ## resetColor
      [action.verb is "pull" and action.directObject.itemId is "lever"]
      printLocal: "You pull the lever and the liquid swirls away, replaced with a new clear liquid."
      calculateNewColor: clear
      `
  },
  beetles: {
    itemId: 'beetles',
    rawDescription: 'a glass jar filed with <<brilliantly blue crushed beetles->take beetles>>',
    rawShortDescription: 'blue beetles',
    isColorant: true,
    color: 'blue',
    script: `
      ## takeBlueBeetles
      [action.verb is "take" and action.directObject.itemId is "beetles" and cauldron.color is "blue"]
      printLocal: This must have been the same blue used to color the liquid in the cauldron.
    `
  },
  saffron: {
    itemId: 'saffron',
    rawDescription: 'a paper bundle containing a few threads of <<saffron->take saffron>>',
    rawShortDescription: 'yellow saffron',
    isColorant: true,
    color: 'yellow',
    script: `
    ## takeSaffron
    [action.verb is "take" and action.directObject.itemId is "saffron" and cauldron.color is "yellow"]
    printLocal: This must have been the same yellow used to color the liquid in the cauldron.
    `
  },
  redLiquid: {
    itemId: 'redLiquid',
    rawDescription: 'a small vial with a strange viscous <<red liquid->take redLiquid>>',
    rawShortDescription: 'viscous red liquid',
    isColorant: true,
    color: 'red',
    script: `
    ## takeRedLiquid
    [action.verb is "take" and action.directObject.itemId is "redLiquid" and cauldron.color is "red"]
    printLocal: This must have been the same blue used to color the liquid in the cauldron.
    `
  },
  lever: {
    itemId: 'lever',
    rawDescription: '<<a big lever->pull lever>>',
    rawShortDescription: 'viscous red liquid',
    isColorant: true,
    script: `
    `
  }
}
