import { ChangeDetectionStrategy, Component, effect, input, OnInit, output, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ComponentBase } from '@core/base/component-base';

export type ToggleLabelPosition = 'before' | 'after';

@Component({
  selector: 'app-toggle',
  standalone: false,
  templateUrl: './toggle.component.html',
  styleUrl: './toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleComponent extends ComponentBase implements OnInit {
  readonly control = input<FormControl<boolean | null> | undefined>(undefined);
  readonly checked = input<boolean | undefined>(undefined);
  readonly disabled = input<boolean>(false);
  readonly labelPosition = input<ToggleLabelPosition>('after');

  readonly changed = output<boolean>();

  protected readonly checkedValue = signal<boolean>(false);

  constructor() {
    super();
    effect(() => {
      const checked = this.checked();
      if (checked !== undefined) {
        this.checkedValue.set(checked);
      }
    });
    effect(() => {
      const control = this.control();
      if (control !== undefined) {
        this.checkedValue.set(control.value ?? false);
      }
    });
  }

  ngOnInit(): void {
    const control = this.control();
    if (control !== undefined) {
      control.valueChanges.pipe(this.takeUntilDestroyed()).subscribe((value) => {
        this.checkedValue.set(value ?? false);
      });
    }
  }

  protected valueChanged($event: MatSlideToggleChange): void {
    this.changed.emit($event.checked);
    this.control()?.setValue($event.checked);
  }
}
