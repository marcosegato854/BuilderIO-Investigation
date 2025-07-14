/* eslint-disable object-shorthand */
/* eslint-disable func-names */
import Hammer from 'hammerjs'

// TODO: this should be rewritten
export const mMap = window.mMap || {}

// eslint-disable-next-line import/no-mutable-exports
export let mouseIsMoving = false

const InputProcessor =
  typeof window.ModelInput != 'undefined' ? window.ModelInput : undefined

mMap.inputHandler = function (element, gate, myVR) {
  this.element = element
  this.doc = document
  this.gate = gate
  this.myVR = myVR

  this.currentMouseClient = {
    x: 0,
    y: 0,
  }
  this.prevMouseClient = {
    x: 0,
    y: 0,
  }
  this.deltaMouseClient = {
    x: 0,
    y: 0,
  }
  this.startMouse = {
    x: 0,
    y: 0,
  }
  this.lastTouch = new Date().getTime()
  this.mouseDownTable = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ]
  this.mouseDownCount = 0
  this.mouseIsDown = false
  this.rotation = null
  this.keyDown = []
  this.delta = {
    x: 0,
    y: 0,
  }
  this.movementFactor = {
    move_sides: 0,
    move_front: 0,
    turn_sides: 0,
    turn_front: 0,
  }
  this.toucher = new Hammer(element)
  this.canvasOffset = {
    x: document.body.offsetWidth - element.offsetWidth - element.offsetLeft,
    y: element.offsetTop,
  }
  this.previousScale = 1
  this.previousAngle = 0
  this.initialize()
  mMap.eventManager.initialize(this.myVR, this.gate)
}

mMap.eventManager = {
  eventProcessors: [],
  customInput: false,
  initialize: function (myVR, gate) {
    this.myVR = myVR
    this.gate = gate
    if (InputProcessor) {
      this.eventProcessors = [
        {
          id: mMap.inputHandler.prototype.SINGLE_TAP_EVENT,
          handler: InputProcessor.event_single_tap(),
        },
        {
          id: mMap.inputHandler.prototype.DOUBLE_TAP_EVENT,
          handler: InputProcessor.event_double_tap(),
        },
        {
          id: mMap.inputHandler.prototype.MOVE_EVENT,
          handler: InputProcessor.event_move(),
        },
        {
          id: mMap.inputHandler.prototype.ZOOM_EVENT,
          handler: InputProcessor.event_zoom(),
        },
        {
          id: mMap.inputHandler.prototype.ROTATE_EVENT,
          handler: InputProcessor.event_rotate(),
        },
        {
          id: mMap.inputHandler.prototype.TILT_EVENT,
          handler: InputProcessor.event_tilt(),
        },
        {
          id: mMap.inputHandler.prototype.NO_CONTACT_EVENT,
          handler: InputProcessor.event_no_contact(),
        },
        {
          id: mMap.inputHandler.prototype.CONTACT_EVENT,
          handler: InputProcessor.event_contact(),
        },
      ]
      this.customInput = true
    }
  },
  inputEvent: function (type, x, y, dX, dY, value) {
    // console.log(arguments)

    if (this.customInput) {
      // eslint-disable-next-line array-callback-return
      this.eventProcessors.map(function (e) {
        // eslint-disable-next-line eqeqeq
        if (e.id == type) e.handler(x, y, dX, dY, value)
      })
    } else {
      // manage events externally
      const gateResult = this.gate
        ? this.gate(-1, type, x, y, dX, dY, value)
        : {}
      if (this.gate && !gateResult) return
      const p = {
        x,
        y,
        dX,
        dY,
        value,
        ...gateResult,
      }
      // myVR.inputEvent DOCS
      // https://drop.myvr.net/files/2021.03/57586/Documentation/cpp-api/html/namespacemy_v_r_1_1m_map.html#a4964a03e2a7fbc19adc971bc561fe06e
      this.myVR.inputEvent(-1, type, p.x, p.y, p.dX, p.dY, p.value)
      // dispatch custom event
      this.myVR.callback(1, JSON.stringify({ action: 'input-event', type }))
    }
  },
}

mMap.inputHandler.prototype = {
  SINGLE_TAP_EVENT: 1, // !< A single tap has occured.
  DOUBLE_TAP_EVENT: 2, // !< A double tap has occured.
  MOVE_EVENT: 3, // !< A move gesture has occured.
  ZOOM_EVENT: 4, // !< A zoom gesture has occured.
  ROTATE_EVENT: 5, // !< A rotate gesture has occured.
  TILT_EVENT: 6, // !< A tilt gesture has occured.
  NO_CONTACT_EVENT: 7, // !< No contact left on the device.
  CONTACT_EVENT: 8, // !< A contact has occured.

  constructor: mMap.inputHandler,
  initialize: function () {
    this.element.addEventListener(
      'mousemove',
      this.onDocumentMouseMove(),
      false
    )
    this.element.addEventListener(
      'mousedown',
      this.onDocumentMouseDown(),
      false
    )
    this.element.addEventListener('mouseup', this.onDocumentMouseUp(), false)
    this.element.addEventListener('mouseout', this.onDocumentMouseUp(), false) // TODO Better handling of mouse in/out events
    this.element.addEventListener(
      'mousewheel',
      this.onDocumentMouseWheel(),
      false
    )
    this.element.addEventListener(
      'dblclick',
      this.onDocumentMouseDblClick(),
      false
    )
    // this.element.addEventListener("click", this.onDocumentMouseClick(), false);
    this.element.addEventListener(
      'DOMMouseScroll',
      this.onDocumentMouseWheel(),
      false
    )
    this.element.addEventListener('onkeydown', this.onDocumentKeyDown, false)
    this.element.addEventListener('onkeyup', this.onDocumentKeyUp, false)

    /* touch inputs */

    // The pinch and rotate recognizers are disabled by default because they would make the element blocking, but you can enable them by calling:
    this.toucher.get('pinch').set({
      enable: true,
    })
    this.toucher.get('rotate').set({
      enable: true,
    })

    this.element.addEventListener(
      'touchstart',
      this.onDocumentTouchStart(),
      false
    )
    this.element.addEventListener(
      'touchmove',
      this.onDocumentTouchMove(),
      false
    )
    this.toucher.on('tap', this.onDocumentTap())
    this.toucher.on('doubletap', this.onDocumentDoubleTap())
    this.toucher.on('pinchmove', this.onDocumentPinchMove())
    this.toucher.on('rotatemove', this.onDocumentRotateMove())

    /* key management */
    this.doc.onkeypress = this.onKeyPressed()
    this.doc.onkeydown = this.onKeyDown()
    this.doc.onkeyup = this.onKeyUp()
  },

  /* keyboard events */
  onKeyDown: function () {
    const where = this
    return function (event) {
      // // console.log("Key down");
      const keyCode = event.which || event.keyCode
      switch (keyCode) {
        case 97:
        case 65: // a A
          where.movementFactor.move_sides = 1
          break
        case 100:
        case 68: // d D
          where.movementFactor.move_sides = -1
          break
        case 119:
        case 87: // w W
          where.movementFactor.move_front = -1
          break
        case 115:
        case 83: // s S
          where.movementFactor.move_front = 1
          break
        default:
          break
      }
      // eslint-disable-next-line eqeqeq
      if (InputProcessor != undefined) {
        InputProcessor.key_pressed(
          where.movementFactor.move_sides,
          where.movementFactor.move_front
        )
      }
    }
  },
  onKeyUp: function () {
    const where = this
    return function (event) {
      // // console.log("Key up");
      const keyCode = event.which || event.keyCode
      switch (keyCode) {
        case 97:
        case 65: // a A
          if (where.movementFactor.move_sides > 0)
            where.movementFactor.move_sides = 0
          break
        case 100:
        case 68: // d D
          if (where.movementFactor.move_sides < 0)
            where.movementFactor.move_sides = 0
          break
        case 119:
        case 87: // w W
          if (where.movementFactor.move_front < 0)
            where.movementFactor.move_front = 0
          break
        case 115:
        case 83: // s S
          if (where.movementFactor.move_front > 0)
            where.movementFactor.move_front = 0
          break
        default:
          break
      }
      // eslint-disable-next-line eqeqeq
      if (InputProcessor != undefined) {
        InputProcessor.key_pressed(
          where.movementFactor.move_sides,
          where.movementFactor.move_front
        )
      }
    }
  },
  onKeyPressed: function () {
    const where = this
    return function (event) {
      // // console.log("Key pressed");
      const keyCode = event.which || event.keyCode
      switch (keyCode) {
        case 49: // 1
          where.describeLayers()
          // if(typeof process_key == "function")
          //   process_key(1);
          break
        case 50: // 2
          // where.viewLayer();
          // if(typeof process_key == "function")
          //   process_key(2);
          break
        case 51: // 3
          // where.hideLayer();
          //   if(typeof process_key == "function")
          //     process_key(3);
          break
        case 52: // 4
          if (typeof window.process_key == 'function') window.process_key(4)
          break
        default:
          break
      }
    }
  },

  /* touch event/gesture handlers */
  onDocumentTouchStart: function () {
    const where = this
    return function (event) {
      event.preventDefault()
      // eslint-disable-next-line no-param-reassign
      event.pointerType = 'touchstart'
      where.touchDown(event)
      where.previousScale = 1
      where.previousAngle = 0
      where.sendInputEvent(where.CONTACT_EVENT, 0)
    }
  },
  onDocumentTouchMove: function () {
    const where = this
    return function (event) {
      event.preventDefault()
      // eslint-disable-next-line no-param-reassign
      event.pointerType = 'touchmove'
      where.touchUpdate(event)

      // eslint-disable-next-line eqeqeq
      if (event.touches.length == 1) {
        where.sendInputEvent(where.MOVE_EVENT, 0)
        // eslint-disable-next-line eqeqeq
      } else if (event.touches.length == 2) {
        where.sendInputEvent(where.TILT_EVENT, 0)
      }
    }
  },
  onDocumentTouchEnd: function () {
    const where = this
    return function (event) {
      event.preventDefault()
      where.sendInputEvent(where.NO_CONTACT_EVENT, 0)
    }
  },
  onDocumentTap: function () {
    const where = this
    return function (event) {
      event.preventDefault()
      where.touchDown(event)
      where.sendInputEvent(where.SINGLE_TAP_EVENT, 0)
    }
  },
  onDocumentDoubleTap: function () {
    const where = this
    return function (event) {
      event.preventDefault()
      where.touchDown(event)
      where.sendInputEvent(where.DOUBLE_TAP_EVENT, 0)
    }
  },
  onDocumentPinchMove: function () {
    const where = this
    return function (event) {
      event.preventDefault()
      const scale = event.scale - where.previousScale
      where.previousScale = event.scale
      where.sendInputEvent(where.ZOOM_EVENT, 1 + scale)
    }
  },
  onDocumentRotateMove: function () {
    const where = this
    return function (event) {
      event.preventDefault()
      const delta = event.rotation - where.previousAngle
      where.previousAngle = event.rotation
      const DEG_TO_RAD = 0.01745329251
      where.sendInputEvent(where.ROTATE_EVENT, delta * DEG_TO_RAD)
    }
  },
  onDocumentKeyUp: function (e) {
    // eslint-disable-next-line no-param-reassign
    e = e || window.event
    this.keyDown[e.keyCode] = true
  },
  onDocumentKeyDown: function (e) {
    // eslint-disable-next-line no-param-reassign
    e = e || window.event
    this.keyDown[e.keyCode] = false
  },

  /* basic event handlers */
  onDocumentMouseWheel: function () {
    const where = this
    return function (event) {
      let rolled = 0
      if ('wheelDelta' in event) {
        rolled = event.wheelDelta / 120.0
      } else {
        // Firefox
        // The measurement units of the detail and wheelDelta properties are different.
        rolled = -event.detail / 3
      }
      where.mouseUpdate(event)
      where.sendInputEvent(where.CONTACT_EVENT, 0)
      where.sendInputEvent(where.ZOOM_EVENT, Math.pow(1.05, rolled))
      where.sendInputEvent(where.NO_CONTACT_EVENT, 0)
      event.preventDefault()
    }
  },
  onDocumentMouseMove: function () {
    const where = this
    return function (event) {
      // // console.log("Mouse is moving");

      // DRAG = mouseDown + mouseMove + mouseUp

      // set the flag to true only if previously was on false
      // to avoid useless assignments
      if (!mouseIsMoving) {
        // // console.log("setting mouseIsMoving = true");
        mouseIsMoving = true
      }

      if (where.mouseIsDown) {
        where.mouseUpdate(event)
        if (where.mouseDownTable[0]) {
          where.sendInputEvent(where.MOVE_EVENT, 0)
        } else if (where.mouseDownTable[1] || where.mouseDownTable[2]) {
          let x = where.currentMouseClient.x - where.startMouse.x
          let y = where.currentMouseClient.y - where.startMouse.y
          const len = Math.sqrt(x * x + y * y)
          x /= len
          y /= len
          const angle = Math.atan2(x, y)
          if (where.rotation == null) where.rotation = angle
          else {
            const delta = angle - where.rotation
            where.rotation = angle
            where.sendInputEvent(where.ROTATE_EVENT, delta)
          }
          where.sendInputEvent(where.TILT_EVENT, 0)
        }
        event.preventDefault()
      }
    }
  },
  onDocumentMouseDown: function () {
    const where = this
    return function (event) {
      // // console.log("Mouse down");

      // onClick = mouseDown + mouseUp

      // reset the movement flag
      // to make the onClick work when the mouse cursor is stationary
      mouseIsMoving = false

      // eslint-disable-next-line eqeqeq
      if (where.mouseDownTable[event.button] == false) {
        // eslint-disable-next-line no-plusplus
        where.mouseDownCount++
        where.mouseIsDown = true
        where.mouseDownTable[event.button] = true
        event.preventDefault()
        where.mouseDown(event)
        where.sendInputEvent(where.CONTACT_EVENT, 0)
      }
    }
  },
  onDocumentMouseUp: function () {
    const where = this
    return function (event) {
      // // console.log("Mouse up");
      // onClick is triggered after mouseUp
      // mouseUp doesn't change the mouseIsMovingFlag
      // so onClick won't get triggered after releasing the mouse btn (mouseUp)
      if (where.mouseDownTable[event.button]) {
        where.mouseDownTable[event.button] = false
        where.mouseUpdate(event)
        // eslint-disable-next-line no-plusplus
        where.mouseDownCount--
        // eslint-disable-next-line eqeqeq
        if (where.mouseDownCount == 0) {
          where.sendInputEvent(where.NO_CONTACT_EVENT, 0)
          where.mouseIsDown = false
        } else if (where.mouseDownCount < 0) where.mouseDownCount = 0
      }
      event.preventDefault()
    }
  },
  onDocumentMouseDblClick: function () {
    // double click to zoom has been disabled
    const where = this
    return function (event) {
      event.preventDefault()
      where.mouseDown(event)
      // where.sendInputEvent(where.DOUBLE_TAP_EVENT, 0);
    }
  },
  // onDocumentMouseClick: function () {
  // 	let where = this;
  // 	return function (event) {
  // 		// console.log("Mouse click");
  // 		event.preventDefault();
  // 		where.mouseDown(event);
  // 		where.deltaMouseClient.x = where.currentMouseClient.x;
  // 		where.deltaMouseClient.y = where.currentMouseClient.y;
  // 		where.sendInputEvent(where.SINGLE_TAP_EVENT, 0);
  // 		where.deltaMouseClient.x = 0;
  // 		where.deltaMouseClient.y = 0;
  // 	}
  // },
  sendInputEvent: function (event, value) {
    // var scaleX = this.element.width / this.element.clientWidth;
    // var scaleY = this.element.height / this.element.clientHeight;
    mMap.eventManager.inputEvent(
      event,
      this.currentMouseClient.x,
      this.currentMouseClient.y,
      this.deltaMouseClient.x,
      this.deltaMouseClient.y,
      value // don't touch it otherwise ZOOM will stop working
    )
  },
  mouseDown: function (event) {
    // gets trigerred everytime i click the mouse. Every left buttin click is individual meanwhile every right click is compounded
    // // console.log("TEST");
    const scaleX = this.element.width / this.element.clientWidth
    const scaleY = this.element.height / this.element.clientHeight
    this.currentMouseClient.x = scaleX * event.layerX
    this.currentMouseClient.y = this.element.height - scaleY * event.layerY
    this.prevMouseClient.x = this.currentMouseClient.x
    this.prevMouseClient.y = this.currentMouseClient.y
    this.deltaMouseClient.x = 0
    this.deltaMouseClient.y = 0
    this.startMouse.x = this.element.width / 2 // this.currentMouseClient.x;
    this.startMouse.y = this.element.height / 2 // this.currentMouseClient.y;
    this.rotation = null
  },
  mouseUpdate: function (event) {
    // // console.log("UPDATE");
    this.prevMouseClient.x = this.currentMouseClient.x
    this.prevMouseClient.y = this.currentMouseClient.y

    const scaleX = this.element.width / this.element.clientWidth
    const scaleY = this.element.height / this.element.clientHeight
    this.currentMouseClient.x = scaleX * event.layerX
    this.currentMouseClient.y = this.element.height - scaleY * event.layerY

    if (this.currentMouseClient.x >= this.element.width)
      this.currentMouseClient.x = this.element.width - 1
    if (this.currentMouseClient.y >= this.element.height)
      this.currentMouseClient.y = this.element.height - 1
    if (this.currentMouseClient.y < 0) this.currentMouseClient.y = 0

    this.deltaMouseClient.x = this.prevMouseClient.x - this.currentMouseClient.x
    this.deltaMouseClient.y = this.prevMouseClient.y - this.currentMouseClient.y
  },
  updateKey: function () {
    let deltaX = 0
    let deltaY = 0
    deltaY += this.keyDown[38] ? 1 : 0
    deltaY -= this.keyDown[40] ? 1 : 0
    deltaX -= this.keyDown[37] ? 1 : 0
    deltaX += this.keyDown[39] ? 1 : 0

    // eslint-disable-next-line eqeqeq
    if (deltaX != 0 || deltaY != 0) {
      mMap.eventManager.inputEvent(
        this.myVR.MOVE_EVENT,
        0,
        0,
        deltaX,
        deltaY,
        0
      )
    }
  },
  positionFromTouchEvent: function (event) {
    let x
    let y
    // eslint-disable-next-line eqeqeq
    if (event.pointerType == 'mouse') {
      x = event.pointers[0].layerX
      y = event.pointers[0].layerY
      // eslint-disable-next-line eqeqeq
    } else if (event.pointerType == 'touch') {
      x = event.pointers[0].clientX
      y = event.pointers[0].clientY
      x -= this.canvasOffset.x
      y -= this.canvasOffset.y
    }
    // eslint-disable-next-line eqeqeq
    if (event.pointerType == 'touchmove' || event.pointerType == 'touchstart') {
      x = event.touches[0].clientX
      y = event.touches[0].clientY
      x -= this.canvasOffset.x
      y -= this.canvasOffset.y
    }
    y = this.element.height - y

    const p = {
      x: x,
      y: y,
    }
    return p
  },
  touchDown: function (event) {
    const position = this.positionFromTouchEvent(event)
    this.currentMouseClient.x = position.x
    this.currentMouseClient.y = position.y
    this.prevMouseClient.x = this.currentMouseClient.x
    this.prevMouseClient.y = this.currentMouseClient.y
    this.deltaMouseClient.x = 0
    this.deltaMouseClient.y = 0
    this.startMouse.x = this.currentMouseClient.x
    this.startMouse.y = this.currentMouseClient.y
    this.rotation = null
  },
  touchUpdate: function (event) {
    this.prevMouseClient.x = this.currentMouseClient.x
    this.prevMouseClient.y = this.currentMouseClient.y

    const position = this.positionFromTouchEvent(event)
    this.currentMouseClient.x = position.x
    this.currentMouseClient.y = position.y

    if (this.currentMouseClient.x >= this.element.width)
      this.currentMouseClient.x = this.element.width - 1
    if (this.currentMouseClient.x < 0) this.currentMouseClient.x = 0
    if (this.currentMouseClient.y >= this.element.height)
      this.currentMouseClient.y = this.element.height - 1
    if (this.currentMouseClient.y < 0) this.currentMouseClient.y = 0

    this.deltaMouseClient.x = this.prevMouseClient.x - this.currentMouseClient.x
    this.deltaMouseClient.y = this.prevMouseClient.y - this.currentMouseClient.y
  },
  describeLayers: function () {
    const command = {
      executeOnLayer: {
        id: 1,
        query: {
          describeLayers: 1,
        },
      },
    }

    this.myVR.execute(0, JSON.stringify(command))
  },
}
