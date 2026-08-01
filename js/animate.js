/**
 * el: HTMLElement
 * pos: {x: number, y: number}
 * duration: number in milliseconds
 */
export async function translate({el, pos, duration}) {
  return el.animate(
      [
        {
          left: pos.x,
          top: pos.y,
        }
      ],
      {
        duration,
        fill: 'forwards',
      }
    ).finished;
}

export async function rotate({el, degrees, duration}) {
  return el.animate(
    [{transform: `rotate(${degrees}deg)`}],
    {
      duration,
      fill: 'forwards',
    }
  ).finished;
}

export async function fadeAndScale({el, opacity, scale, duration}) {
  return el.animate(
    [{
      opacity,
      scale,
    }],
    {
      duration,
      fill: 'forwards',
    }
  ).finished;
}
