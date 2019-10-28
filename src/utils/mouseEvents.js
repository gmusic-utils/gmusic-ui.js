const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function mouseEvent(element, name, point) {
  const rect = element.getBoundingClientRect();
  let x = rect.right + 5;
  let y = rect.top + 5;
  if (point) {
    x = point.x || rnd(rect.right, rect.left);
    y = point.y || rnd(rect.top, rect.bottom);
  }
  const event = document.createEvent('MouseEvents');
  event.initMouseEvent(name, true, true, window, 0, x, y, x, y, false, false, false, false, 0, null);
  element.dispatchEvent(event);
  return { x, y };
}

// Mouse click events order: down, up, click
// https://www.w3.org/TR/uievents/#events-mouseevent-event-order
function click(element) {
  const point = mouseEvent(element, 'mousedown', true);
  mouseEvent(element, 'mouseup', point);
  mouseEvent(element, 'click', point);
  return point;
}

function dbclick(element) {
  const point = click(element);
  mouseEvent(element, 'dbclick', point);
}

export {
  mouseEvent,
  click,
  dbclick,
};
