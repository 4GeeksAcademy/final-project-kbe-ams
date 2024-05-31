
import keqqu_white        from "../../assets/icon/keqqu-white.svg"
import keqqu_white_bg     from "../../assets/icon/keqqu-white-bg.svg"
import keqqu_black        from "../../assets/icon/keqqu-black.svg"
import keqqu_black_bg     from "../../assets/icon/keqqu-black-bg.svg"
import keqqu_light        from "../../assets/icon/keqqu-light.svg"
import keqqu_light_bg     from "../../assets/icon/keqqu-light-bg.svg"
import keqqu_dark        from "../../assets/icon/keqqu-dark.svg"
import keqqu_dark_bg     from "../../assets/icon/keqqu-dark-bg.svg"
import keqqu_purple       from "../../assets/icon/keqqu-purple.svg"
import keqqu_purple_bg    from "../../assets/icon/keqqu-purple-bg.svg"
import keqqu_yellow       from "../../assets/icon/keqqu-yellow.svg"
import keqqu_yellow_bg    from "../../assets/icon/keqqu-yellow-bg.svg"

const Constants= Object.freeze({

  LOGO: {
    white:      keqqu_white,
    whitebg:    keqqu_white_bg,
    black:      keqqu_black,
    blackbg:    keqqu_black_bg,
    light:      keqqu_light,    
    lightbg:    keqqu_light_bg,
    dark:       keqqu_dark, 
    darkbg:     keqqu_dark_bg,
    purple:     keqqu_purple,
    purplebg:   keqqu_purple_bg,
    yellow:     keqqu_yellow,
    yellowbg:   keqqu_yellow_bg
  },

  MOUSE_BTN_LEFT: 0,
  MOUSE_BTN_MIDDLE: 1,
  MOUSE_BTN_RIGHT: 2,

  COOKIE_SAMESITE_NONE: "None",
  COOKIE_SAMESITE_NONE_SECURE: "None; Secure",
  COOKIE_SAMESITE_LAX: "Lax",
  COOKIE_SAMESITE_STRICT: "Strict",

  SESSION_MODE_SIGNUP: 0,
  SESSION_MODE_LOGIN: 1,
  SESSION_MODE_LOGOUT: 2,
  SESSION_MODE_RECOVER: 3,
  SESSION_MODE_DELETED: 4,

  DEVPREFS_SHOWSTATE: "showState",
  DEVPREFS_PANELPOSITION: "panelPosition",
  DEVPREFS_DEVRENDER: "devRender",
  DEVPREFS_FAKEAUTH: "fakeAuth",
  DEVPREFS_FAKEOWNER: "fakeOwner",
  DEVPREFS_TOOLSMODE: "toolsMode",

  USERPREFS_DARKMODE: "darkMode",
  USERPREFS_LANGUAGE: "language",

  LANGUAGE_FILES: [
    "en-us",
    "es-es"
  ],

  SITENAME: "KeQQu",

  PAGE: {
    // globally available pages
    healthcheck:  0,
    404:          1,
    creamyfap:    2,
    // public pages
    landing:      3,
    signup:       4,
    login:        5,
    farewell:     6,
    recover:      7,
    // private pages
    logout:       8,
    settings:     9,
    dashboard:    10,
    workspace:    11,
    board:        12
  },

  PAGEURLS: {
    // globally available pages
    healthcheck:  "/healthcheck",
    404:          "/404",
    creamyfap:    "/creamyfap",
    // public pages
    landing:      "NA",
    signup:       "/signup",
    login:        "/login",
    // auth pages
    logout:       "/logout",
    recover:      "/recover",
    farewell:     "/farewell",
    settings:     "/settings",
    dashboard:    "/dashboard",
    workspace:    "/workspace",
    board:        "/board"
  },

  BOARD_SIZE_PIXELS: 1048576,

  CANVAS_DIRTY: {
    size:         0b0000_0000_0000_0001,
    origin:       0b0000_0000_0000_0010,
    coords:       0b0000_0000_0000_0100,
    zoom:         0b0000_0000_0000_1000,
    style:        0b0000_0000_0001_0000,
    background:   0b0000_0000_0010_0000,
    cursor:       0b0000_0000_0100_0000,

    transform:    0b0000_0000_0000_1111,
    display:      0b0000_0000_0111_0000,
    all:          0b0000_0000_0111_1111,

    upload:       0b0010_0000_0000_0000,  // require database upload
    data:         0b0100_0000_0000_0000   // require database reload
  },

  ITEMTYPE: {
    workspace:  0,  
    project:    1,  
    team:       2,  
    user:       3,  
    board:      4,  
    list:       5,  
    task:       6,  
    text:       7,  
    media:      8,  
    embed:      9
  },

  ITEMDATA: {
    coords: "coords",
    size: "size"
  },

  ITEM_DIRTY: {
    coords:       0b0000_0000_0000_0001,
    size:         0b0000_0000_0000_0010,
    style:        0b0000_0000_0000_0100,
    cursor:       0b0000_0000_0000_1000,

    transform:    0b0000_0000_0000_0011,
    display:      0b0000_0000_0000_1100,
    all:          0b0000_0000_0000_1111,

    upload:       0b0010_0000_0000_0000,  // require database upload
    data:         0b0100_0000_0000_0000   // require database reload
  }
})

export default Constants