
import board_default_background from "../../assets/img/board-default-bg.png"
import row_icon_default_svg from "../../assets/svg/row-icon-default.svg"

import Constants from "./constants.js"

// ------------------------------------------------------------ DEFAULT VALUES FOR STORE SHIT

export const storeDefaults = Object.freeze({
  // user preferences
  userPrefs: {
    darkMode: false,  // site dark mode state
    language: 0       // current choosen language
  },
  // dev preferences, for us, stored on cookie, remove on production or make it unaccessible for non-admins
  devPrefs: {
    showState: false, // current show state of the devtools panel
    panelPosition: 3, // corner of the devtools panel (0:TL 1:TR 2:BL 3:BR)
    toolsMode: 0,
    devRender: false, // general purpose usage, toggleable in dev panel
    fakeOwner: false  // renders everything if you were the owner
  },
  // items, ALL
  items: [
    // lists
    {
      id: 5512,
      bid: 0,
      millistamp: Date.now(),
      
      type: Constants.ITEMTYPE.list,

      props: {
        icon: board_default_background,
        title: "first test",
        coords: [128, 256],
        size: [-1,-1],
      },

      style: {},
      content: []
    },
    {
      id: 1346,
      bid: 0,
      millistamp: Date.now(),
      
      type: Constants.ITEMTYPE.list,
      
      props: {
        title: "me voy a la barca quita",
        coords: [0, 0],
        size: [-1,-1],
      },

      style: {},
      content: [333]
    },
    {
      id: 43,
      bid: 0,
      millistamp: Date.now(),
      
      type: Constants.ITEMTYPE.list,
      
      props: {
        title: "un pollardo loco",
        coords: [-400,-324],
        size: [-1,-1], // this means auto
      },

      style: {},
      content: []
    },
    {
      id: 675,
      bid: 0,
      millistamp: Date.now(),
      
      type: Constants.ITEMTYPE.list,
      
      props: {
        title: "paja a la crema",
        coords: [-400,-24],
        size: [450, -1],
      },

      style: {},
      content: [543,544,545,546,547]
    },
    // tasks
    {
      id: 543,
      bid: 0,
      millistamp: Date.now(),
      
      type: Constants.ITEMTYPE.task,

      props: {
        icon: row_icon_default_svg,
        label: "unzip your pants",
      },

      style: {}
    },
    {
      id: 544,
      bid: 0,
      millistamp: Date.now(),
      
      type: Constants.ITEMTYPE.task,

      props: {
        icon: row_icon_default_svg,
        label: "pull your dick out",
      },

      style: {}
    },
    {
      id: 545,
      bid: 0,
      millistamp: Date.now(),
      
      type: Constants.ITEMTYPE.task,

      props: {
        label: "cover in cream",
      },

      style: {}
    },
    {
      id: 546,
      bid: 0,
      millistamp: Date.now(),
      
      type: Constants.ITEMTYPE.task,

      props: {
        label: "wrap in wc paper",
      },

      style: {}
    },
    {
      id: 547,
      bid: 0,
      millistamp: Date.now(),
      
      type: Constants.ITEMTYPE.task,

      props: {
        label: "fap like there's no tomorrow",
      },

      style: {}
    },
    {
      id: 333,
      bid: 0,
      millistamp: Date.now(),
      
      type: Constants.ITEMTYPE.task,

      props: {
        label: "me voy a lavar caquita",
      },

      style: {}
    }
  ]
})