function getCoordsFromTouch(event: TouchEvent): Point {
  const touch = event.touches[0] || event;
  // we assume that canvas is places in very top left corner, no offset
  return { x: touch.pageX, y: touch.pageY };
}

export default function attachListeners(
  node: HTMLCanvasElement,
  onPointerDown: (pointer: Point) => void,
  onPointerMove: (pointer: Point) => void,
  onPointerUp: (pointer: Point) => void,
  onPointerLeave: VoidFunction,
  onWheel: (zoom: number) => void
) {
  // we assume that canvas is places in very top left corner, no offset
  // so we do not have to subtract left top corner of the listening node

  node.addEventListener("touchstart", (e) => {
    e.preventDefault(); // to prevent duplicated event because of mouse event, on Edge browser a tap triggers both touch and mouse events
    const pointer = getCoordsFromTouch(e);
    onPointerDown(pointer);
  });
  node.addEventListener("touchmove", (e) => {
    e.preventDefault(); // to prevent duplicated event because of mouse event, on Edge browser a tap triggers both touch and mouse events
    const pointer = getCoordsFromTouch(e);
    onPointerMove(pointer);
  });
  node.addEventListener("touchend", (e) => {
    e.preventDefault(); // to prevent duplicated event because of mouse event, on Edge browser a tap triggers both touch and mouse events
    const pointer = getCoordsFromTouch(e);
    onPointerUp(pointer);
  });

  node.addEventListener("mousedown", (e) => {
    onPointerDown({ x: e.clientX, y: e.clientY });
  });
  node.addEventListener("mousemove", (e) => {
    onPointerMove({ x: e.clientX, y: e.clientY });
  });
  node.addEventListener("mouseup", (e) => {
    onPointerUp({ x: e.clientX, y: e.clientY });
  });
  node.addEventListener("mouseleave", () => {
    onPointerLeave()
  })
  node.addEventListener("wheel", (e) => {
    console.log(e.deltaX, e.deltaMode, e.deltaY, e.deltaZ)
    onWheel(e.deltaY)
  })
}
