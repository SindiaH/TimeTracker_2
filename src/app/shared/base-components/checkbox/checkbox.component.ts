import { ChangeDetectionStrategy, Component, effect, input, OnInit, output, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ComponentBase } from '@core/base/component-base';

export type CheckboxLabelPosition = 'before' | 'after';

@Component({
  selector: 'app-checkbox',
  standalone: false,
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent extends ComponentBase implements OnInit {
  readonly control = input<FormControl<boolean | null> | undefined>(undefined);
  readonly checked = input<boolean | undefined>(undefined);
  readonly disabled = input<boolean>(false);
  readonly indeterminate = input<boolean>(false);
  readonly labelPosition = input<CheckboxLabelPosition>('after');

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

  protected valueChanged($event: MatCheckboxChange): void {
    this.changed.emit($event.checked);
    this.control()?.setValue($event.checked);
  }
}
