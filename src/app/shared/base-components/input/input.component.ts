import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ComponentBase } from '@core/base/component-base';

export type InputAppearance = 'fill' | 'outline';
export type InputType = 'password' | 'number' | 'text' | 'text-area' | 'email';
export type InputValue = string | number | null | undefined;

@Component({
  selector: 'app-input',
  standalone: false,
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent extends ComponentBase implements OnInit, OnDestroy {
  readonly control = input.required<FormControl<InputValue>>();
  readonly appearance = input<InputAppearance>('outline');
  readonly type = input<InputType>('text');
  readonly labelText = input<string | null>(null);
  readonly placeholder = input<string | null>(null);
  readonly errorText = input<string | null>(null);
  readonly errorRequiredText = input<string>('Pflichtfeld');
  readonly errorMaxLengthText = input<string>('Eingabe zu lang');
  readonly errorMinLengthText = input<string>('Eingabe zu kurz');
  readonly errorPatternText = input<string>('Eingabe ungültig');
  readonly prefixIcon = input<string | null>(null);
  readonly showClearButton = input<boolean>(false);
  readonly displayOnly = input<boolean>(false);
  readonly disabled = input<boolean | undefined>(undefined);
  readonly subscriptSizingDynamic = input<boolean>(false);
  readonly max = input<number | null>(null);
  readonly min = input<number | null>(null);
  readonly step = input<number | null>(null);
  readonly rows = input<number>(3);

  readonly keyupEvent = output<KeyboardEvent>();
  readonly clearEvent = output<void>();
  readonly changed = output<InputValue>();

  protected readonly changeSubject = new Subject<InputValue>();
  private readonly currentValue = signal<InputValue>(undefined);

  protected readonly readonlyValue = computed<string>(() => {
    const value = this.currentValue();
    if (this.type() === 'password') {
      return '••••••••';
    }
    return value ? value.toString() : '';
  });

  constructor() {
    super();
    effect(() => {
      const controlValue = this.control().value;
      untracked(() => this.currentValue.set(controlValue));
    });

    effect(() => {
      const disabled = this.disabled();
      untracked(() => {
        if (disabled === undefined) return;
        const control = this.control();
        if (disabled && !control.disabled) {
          control.disable();
        } else if (!disabled && control.disabled) {
          control.enable();
        }
      });
    });
  }

  ngOnInit(): void {
    this.changeSubject.pipe(debounceTime(300), distinctUntilChanged(), this.takeUntilDestroyed()).subscribe((value) => {
      this.currentValue.set(value);
      this.changed.emit(value);
    });
    this.control()
      .valueChanges.pipe(this.takeUntilDestroyed())
      .subscribe((value) => this.changeSubject.next(value));
  }

  ngOnDestroy(): void {
    this.changeSubject.complete();
  }

  protected clearValue(): void {
    this.control().setValue(null);
    this.clearEvent.emit();
  }
}
