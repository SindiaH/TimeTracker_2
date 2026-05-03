import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDuration',
  standalone: false,
})
export class FormatDurationPipe implements PipeTransform {
  transform(seconds: number | null | undefined): string {
    if (seconds === null || seconds === undefined || seconds <= 0 || Number.isNaN(seconds)) {
      return '';
    }
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const minutesPadded = minutes.toString().padStart(2, '0');
    return `${hours}:${minutesPadded}`;
  }
}
