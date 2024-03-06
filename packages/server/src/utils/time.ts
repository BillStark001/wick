import * as dayjs from 'dayjs';

import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

const TimeRegex = /(-?\d+(?:\.\d+)?)(mic|ms|mil|s|m|min|h|d|w|mn|mon|q|y)/gi;

const TimeDeltaDict: Record<string, ((d: duration.Duration) => number)> = {
  'mic': (d) => d.asMilliseconds() * 1000,
  'ms': (d) => d.asMilliseconds(),
  's': (d) => d.asSeconds(),
  'd': (d) => d.asDays()
};

export const createDurationStr = (delta: duration.Duration): string => {
  let res = '';
  for (const k in TimeDeltaDict) {
    const resF = TimeDeltaDict[k](delta);
    if (resF) {
      res += `${resF}${k}`;
    }
  }
  return res || '0s';
}

export const parseDuration = (inputString: string): duration.Duration => {
  let sp = dayjs.duration(0, 'seconds');
  TimeRegex.lastIndex = 0;

  inputString.replace(/\s+/g, '').match(TimeRegex)?.forEach((match) => {
    const parts = TimeRegex.exec(match);
    if (parts) {
      const time = parseFloat(parts[1]);
      const unit = parts[2].toLowerCase();
      let _sp = dayjs.duration(0, 'seconds');

      switch (unit) {
        case "mic":
          _sp = dayjs.duration(time / 1000, 'milliseconds');
          break;
        case "ms":
        case "mil":
          _sp = dayjs.duration(time, 'milliseconds');
          break;
        case "s":
          _sp = dayjs.duration(time, 'seconds');
          break;
        case "m":
        case "min":
          _sp = dayjs.duration(time, 'minutes');
          break;
        case "h":
          _sp = dayjs.duration(time, 'hours');
          break;
        case "d":
          _sp = dayjs.duration(time, 'days');
          break;
        case "w":
          _sp = dayjs.duration(time, 'weeks');
          break;
        case "mn":
        case "mon":
          _sp = dayjs.duration(time * 30, 'days');
          break;
        case "q":
          _sp = dayjs.duration(time * 90, 'days');
          break;
        case "y":
          _sp = dayjs.duration(time * 365, 'days');
          break;
      }

      sp = sp.add(_sp);
    }
  });

  return sp;
}