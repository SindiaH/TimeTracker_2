import { FormatDurationPipe } from '@modules/tasks/pipes/format-duration.pipe';

describe('FormatDurationPipe', () => {
  const pipe = new FormatDurationPipe();

  it('returns empty string for nullish or zero/negative input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(0)).toBe('');
    expect(pipe.transform(-30)).toBe('');
    expect(pipe.transform(Number.NaN)).toBe('');
  });

  it('truncates seconds to whole minutes and pads minutes', () => {
    expect(pipe.transform(60)).toBe('0:01');
    expect(pipe.transform(119)).toBe('0:01');
    expect(pipe.transform(120)).toBe('0:02');
  });

  it('formats hours and minutes without a 24-hour cap', () => {
    expect(pipe.transform(3600)).toBe('1:00');
    expect(pipe.transform(60 * 60 * 36 + 60 * 19)).toBe('36:19');
    expect(pipe.transform(60 * 60 * 213 + 60 * 2)).toBe('213:02');
  });
});
