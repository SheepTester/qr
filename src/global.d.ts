declare interface VirtualKeyboard extends EventTarget {
  overlaysContent: boolean
  boundingRect: DOMRect
  addEventListener(
    type: 'geometrychange',
    listener: (event: Event) => any,
    options?: boolean | AddEventListenerOptions
  ): void
  removeEventListener(
    type: 'geometrychange',
    listener: (event: Event) => any,
    options?: boolean | EventListenerOptions
  ): void
}

declare interface Navigator {
  virtualKeyboard?: VirtualKeyboard
}
