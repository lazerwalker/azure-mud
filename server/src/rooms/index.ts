import northShowcaseHall from './northShowcaseHall'
import southShowcaseHall from './southShowcaseHall'
import eastShowcaseHall from './eastShowcaseHall'
import westShowcaseHall from './westShowcaseHall'
import { unconference, minetown, oracle, tower, castle, sokoban, astralPlane } from './unconfRooms'
import theater from './theater'
import { loungeDungeonRoomData } from './loungeDungeon'

export interface NoteWallData {
  roomWallDescription: string
  noteWallButton: string
  addNoteLinkText: string
  addNotePrompt: string
  noteWallDescription: string
}

export enum SpecialFeature {
  RainbowDoor = 'RAINBOW_DOOR',
  DullDoor = 'DULL_DOOR',
  FullRoomIndex = 'FULL_ROOM_INDEX',
  VendingMachine = 'VENDING_MACHINE'
}

export interface Room {
  // e.g. "kitchen"
  id: string

  // e.g. "GitHub HQ: Kitchen"
  displayName: string

  // e.g. "the kitchen"
  shortName: string

  description: string

  // If false, webRTC audio/video chat is blocked
  noMediaChat?: boolean

  // Indicates whether the room should let users place post-it notes
  // As we add more pieces of one-off functionality,
  // having a bunch of ad-hoc flags like this will probably get frustrating quickly.
  // We may want to eventually refactor to something resembling an ECS.
  hasNoteWall?: boolean
  noteWallData?: NoteWallData

  // If true, don't show the room in the side list
  hidden?: boolean

  specialFeatures?: SpecialFeature[]

  // The GUID for a corresponding ACS videochat room
  // This should hopefully eventually be auto-generated and mandatory
  // but hand-coding for testing purposes now
  chatGuid?: string

  script?: string
}

const indexRoomData: { [name: string]: Room } = {
  theater,
  northShowcaseHall,
  eastShowcaseHall,
  southShowcaseHall,
  westShowcaseHall,
  unconference,
  minetown,
  oracle,
  tower,
  castle,
  sokoban,
  astralPlane,
  kitchen: {
    id: 'kitchen',
    displayName: 'Kitchen',
    shortName: 'the kitchen',
    description: `A series of long picnic tables made of rustic wood abut a stainless steel kitchen island. There are empty samovars of coffee and tea sitting on the counter and a well-picked-over catering tray that, based on the crumbs, once contained pastries.<br/><br/>
    There is, however, a curious-looking vending machine labelled "Munxip's Magnifient Munchies" and a button you can press marked [[Get Random Food->generateFood]].
    <br/><br/>
      There are three tables you can sit at, labelled [[A->kitchenTableA]], [[B->kitchenTableB]], and [[C->kitchenTableC]]. You can also walk over to the [[lounge]], the [[bar]], the [[dance floor->danceFloor]], the [[@-sign statue->statue]] or grab a seat in the [[main theater area->theater]]. Finally, you can climb into the [[shipping container->shippingContainer]].`,
    hasNoteWall: true
  },
  kitchenTableA: {
    id: 'kitchenTableA',
    displayName: 'Kitchen Table A',
    shortName: 'table A in the kitchen',
    description: `A rustic wooden picnic table in the kitchen.
      From here, you can see tables [[B->kitchenTableB]] or [[C->kitchenTableC]], and the [[general kitchen area->kitchen]].`
  },
  kitchenTableB: {
    id: 'kitchenTableB',
    displayName: 'Kitchen Table B',
    shortName: 'table B in the kitchen',
    description: `A rustic wooden picnic table in the kitchen.
      From here, you can see tables [[A->kitchenTableA]] or [[C->kitchenTableC]], and the [[general kitchen area->kitchen]].`
  },
  kitchenTableC: {
    id: 'kitchenTableC',
    displayName: 'Kitchen Table C',
    shortName: 'table C in the kitchen',
    description: `A rustic wooden picnic table in the kitchen. For some reason this table and *only* this table contains a basket loaded with [[fortune cookies->getFortune]], and a sign next to it reading "Roguelike Celebration is not responsible for any consequences of taking advice from a cookie - so help yourself!"<br/><br/>
      From here, you can see tables [[A->kitchenTableA]] or [[B->kitchenTableB]], and the [[general kitchen area->kitchen]]`
  },
  bar: {
    id: 'bar',
    displayName: 'Bar',
    shortName: 'the bar',
    description: 'A beautiful long bar with hundreds of bottles spanning up to the ceiling. A friendly bartender will happily make you whatever you want. A laminated sign on the bartop advertises tonight\'s specials: [[the Tourist->item]] (a non-alcoholic drink with lots of fruit and a fun umbrella), [[the Berlin Interpretation->item]] (a mojito made with some sort of hyper-caffeinated soda), and [[the Walls Are Shifting->item]] (a Long Island Iced Tea).<br/>A self-serve table has two coolers packed to the brim with potions. One is loaded with [[colourful potions->drinkPolymorph]] of many shapes and hues, and the other with [[plain potions of clear liquid->drinkCancellation]]<br/><br/>You\'re a stone\'s throw away from the [[kitchen]], the [[@-sign statue->statue]], the [[dance floor->danceFloor]], and the [[North Showcase Hall->northShowcaseHall]]. You can also crawl into the [[shipping container->shippingContainer]].',
    chatGuid: 'b0720a25-7bd2-44f3-af6b-8e84328bdb58'
  },
  lounge: {
    id: 'lounge',
    displayName: 'Lounge',
    shortName: 'the lounge',
    description: 'A chill space to hang away from the hustle and bustle of the main space. Comfy chairs, TVs showing the latest scores in some incomprehensible splort, and a fridge full of La Croix.<br/><br/>From here, you can get to the [[drawing room->loungeDungeonDrawingRoom]], the [[dance floor->danceFloor]], or the [[kitchen]].'
  },
  statue: {
    id: 'statue',
    displayName: '@-sign Statue',
    shortName: 'the statue',
    description: `A memorial to countless adventurers who have helped build this social space.<br/><br/>A plaque on the statue shows a list of <a href="https://github.com/lazerwalker/azure-mud/graphs/contributors" target="_blank" rel="noreferrer">code contributors</a>.<br/>There's also a suggestion wall for people to add comments about the social space.
      From here, you can reach the [[kitchen]], the [[bar]], the [[theater]], or the [[North Showcase Hall->northShowcaseHall]]. You can also climb into the [[shipping container->shippingContainer]].`,
    hasNoteWall: true
  },
  danceFloor: {
    id: 'danceFloor',
    displayName: 'Dance Floor',
    shortName: 'the dance floor',
    description: 'The ping-pong table has been pushed to the side for a makeshift dance floor. Colourful skeletons raise and lower their arms to the beat of chiptune music coming from a DJ booth near the wall. The DJ smoothly transitions between old favourites and requests from years past.<br/><iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/511460973&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/funkip" title="Funkip ♥" target="_blank" style="color: #cccccc; text-decoration: none;">Funkip ♥</a> · <a href="https://soundcloud.com/funkip/roguelike-celebration-2018-saturday-night" title="Roguelike Celebration 2018" target="_blank" style="color: #cccccc; text-decoration: none;">Roguelike Celebration 2018</a></div><br/><iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/699462760&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/funkip" title="Funkip ♥" target="_blank" style="color: #cccccc; text-decoration: none;">Funkip ♥</a> · <a href="https://soundcloud.com/funkip/rand-gen-mem" title="💖 Roguelike Celebration 2019 Mix" target="_blank" style="color: #cccccc; text-decoration: none;">💖 Roguelike Celebration 2019 Mix</a></div><br/><br/>From here, you can reach the [[lounge]], the [[kitchen]], or the [[bar]].'
  },
  shippingContainer: {
    id: 'shippingContainer',
    displayName: 'Shipping Container',
    shortName: 'the shipping container',
    description: `
      It's not quite clear why there's a shipping container in the middle of the space. Seems pretty chill, though? Somebody's set up a makeshift bench.<br/><br/>
      After you climb out, you can get back to the [[bar]], the [[theater]], the [[kitchen]], or the [[@-sign statue->statue]].`
  },
  entryway: {
    id: 'entryway',
    displayName: 'Registration Desk',
    shortName: 'the registration desk',
    description: 'A big banner reads \'Welcome to Roguelike Celebration 2020!\' Once you\'ve got your bearings about you, you can move to the [[foyer]].',
    hidden: true
  },
  foyer: {
    id: 'foyer',
    displayName: 'Haunted Foyer',
    shortName: 'the haunted foyer',
    description: `A grand opulent foyer leading into the theater. A chill runs down your spine as you walk in; something just feels <em>off</em> about this place.<br/><br/>
    You can see a [[swag table->swag]] in the corner, and can also leave to the [[theater]] or the [[west showcase hall->westShowcaseHall]].`,
    specialFeatures: [SpecialFeature.RainbowDoor, SpecialFeature.DullDoor]
  },
  swag: {
    id: 'swag',
    displayName: 'Swag Table',
    shortName: 'the swag table',
    description: `A table covered in a giant messy pile of mismatched swag. At the top of the pile, you see items such as [[Roguelike Celebration socks->item]], [[a +1 longbow->item]], [[an unidentified scroll->item]], and (surprisingly!) [[a tiny puppy->item]].<br/><br/>
    There are also a whole bunch of absolutely beautiful <a href="https://roguelike-celebration.myshopify.com/" target="_blank" rel="noreferrer">conference t-shirts</a> (actual physical shirts!) available <a href="https://roguelike-celebration.myshopify.com/" target="_blank" rel="noreferrer">for sale</a>.
    <br/><br/>
    From here, you can walk back to the rest of the [[foyer]].`
  },
  atelier: {
    id: 'atelier',
    displayName: 'Artists\' Atelier',
    shortName: 'the artists\' atelier',
    description: `A bright sun-lit space for an artist to work. In the corner of the room are crates full of [[fresh pixels->item]] of all colors, waiting to be placed on a canvas. A screen on one wall shows a rotating slideshow of works by <a href=https://christen.carrd.co/ target=_blank>Christen Alqueza</a>, who also made the overlays and background for the livestream. In the middle of the room is a giant contraption made of various [[pieces of scrap metal->item]]; you can't honestly tell whether it's intended to be art or just leftover scrap.<br/><br/>
    From here, you can get to the [[west showcase hall->westShowcaseHall]], the [[engineer's work room->workbench]], or the [[proc-gen study->study]].`
  },
  study: {
    id: 'study',
    displayName: 'Procedural Generation Study',
    shortName: 'the proc-gen study',
    description: `A comfy and cozy library that is curiously shaped like a hexagon. One side of the room has a couple of well-worn leather armchairs, while the other four walls are filled top-to-bottom with books. The majority of them are apparent gibberish, but many of them contain insightful writings about the art of procedural content generation.<br/><br/>
    From here, you can get to the the [[engineer's workbench->workbench]] or the [[artists' atelier->atelier]].`,
    hasNoteWall: true,
    noteWallData: {
      roomWallDescription: 'There is a chalkboard that says "BOOKMARKS" on the top.',
      noteWallButton: 'Add a link',
      addNoteLinkText: 'add a link',
      addNotePrompt: 'What would you like to link to?',
      noteWallDescription: 'Links to slides, videos, files, and articles of interest.'
    }
  },
  workbench: {
    id: 'workbench',
    displayName: 'Engineer\'s Workbench',
    shortName: 'the engineer\'s workbench',
    description: `A cluttered workspace that clearly belongs to someone who loves to tinker. A dim hum fills the room from server racks sitting in the corner, and there are blinking lights coming from every crevice. A blueprint sitting on the workbench outlines intricate plans for something called an 'entity-component system'.<br/><br/>
    From here, you can get to the [[proc-gen study->study]] or the [[artists' atelier->atelier]].`
  },
  hiddenPortalRoom: {
    id: 'hiddenPortalRoom',
    displayName: 'Portal Room',
    shortName: 'the portal room',
    description: `In the center of the room is a shimmering portal. Next to the portal is a pedestal with an open book. To your right is a table with a sign hung behind it, reading "Lending Table" in flowery wizard script. On the table you can see [[a wand of digging->item]], [[a Proof of Stremf->item]], [[a pair of seven league boots->item]], and [[Planepacked->item]], the legendary limestone statue.<br/><br/>
      Once you've finished here, you can [[leap into the shimmering portal->statue]]`,
    specialFeatures: [SpecialFeature.FullRoomIndex],
    hidden: true
  },
  potionRoom: {
    id: 'potionRoom',
    displayName: 'The (Improved) Bar',
    shortName: 'the (improved) bar',
    description: 'A bar that looks very similar to the other one. Just behind the bar lies {{cauldron}}. Behind the bar are numerous ingredients: {{beetles}}, {{saffron}}, and {{redLiquid}}. Below the cauldron is {{lever}}.'
  }
}

export const roomData: { [name: string]: Room } = {
  ...indexRoomData,
  ...loungeDungeonRoomData
}

type Item = {
  itemId: string
  description: string
  shortDescription: string
  script: string // Storyboard
  [key: string]: any
}

// TODO: The main missing thing is a mapping from actions to which object is responsible for it
// Do we need a direct mapping, or can we wire things up in a way that any object can listen to an event?
// Does this require a rigid taxonomy of verbs?
// e.g. "pour X in Y" ("use X on Y", etc) has a concept of direct/indirect object?
// separately, how do we handle synonyms?

/*
items have list of synonyms
there's a list of verbs with synonyms
list of prepositions to blindly accept

parser:
[verb] [noun-direct]
[verb] [noun-direct] [preposition] [noun-indirect]

"pour beetles", "pour into cauldron", and "pour beetles into cauldron" should all work

To think about: "pour into the cauldron" should work

Parse a sentence:
- Normalize verbs/nouns based on synonym lists
  - noun synonyms are a property on each object. TODO: how to handle overlap?
  - verb synonyms need to live in a separate list somewhere
- For nouns, find full item object state
- Set Storyboard state: "verb", "directObject", "indirectObject", "preposition"
- Do a Storyboard bag pass

*/

export const items: { [id: string]: Item } = {
  cauldron: {
    itemId: 'cauldron',
    description: 'a large cast-iron black cauldron with a fire roaring under it. Inside it is a {color} liquid slowly simmering. There is a big spoon you can use to <<stir->stir cauldron>> it. {clickableAction}',
    shortDescription: 'cauldron',
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
      calculateNewColor: {directObject.color}
      printLocal: {action}
      printAction: "pours the {action.directObject.shortDescription} into the cauldron. {color isnt oldcolor ? 'The liquid sputters and turns {color}' : 'There is no visible change to the liquid'}"
    
      ## resetColor
      [action.verb is "pull" and action.directObject.itemId is "lever"]
      printLocal: "You pull the lever and the liquid swirls away, replaced with a new clear liquid."
      calculateNewColor: clear
      `
  },
  beetles: {
    itemId: 'beetles',
    description: 'a glass jar filed with <<brilliantly blue crushed beetles->take beetles>>',
    shortDescription: 'blue beetles',
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
    description: 'a paper bundle containing a few threads of <<saffron->take saffron>>',
    shortDescription: 'yellow saffron',
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
    description: 'a small vial with a strange viscous <<red liquid->take redLiquid>>',
    shortDescription: 'viscous red liquid',
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
    description: '<<a big lever->pull lever>>',
    shortDescription: 'viscous red liquid',
    isColorant: true,
    script: `
    `
  }
}
