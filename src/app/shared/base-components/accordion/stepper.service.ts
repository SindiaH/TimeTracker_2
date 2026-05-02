import { Signal, signal } from '@angular/core';

export class StepperService {
  private readonly _step = signal<number>(0);
  private readonly _minStep = signal<number>(0);
  private readonly _maxStep = signal<number>(0);

  readonly step: Signal<number> = this._step.asReadonly();
  readonly minStep: Signal<number> = this._minStep.asReadonly();
  readonly maxStep: Signal<number> = this._maxStep.asReadonly();

  constructor(minStep: number, maxStep: number, firstOpened: number = 0) {
    this._minStep.set(minStep);
    this._maxStep.set(maxStep);
    this._step.set(firstOpened);
  }

  setStep(index: number): void {
    this._step.set(index);
  }

  nextStep(): void {
    this._step.update((value) => value + 1);
  }

  prevStep(): void {
    this._step.update((value) => value - 1);
  }

  close(): void {
    this._step.set(this._minStep() - 1);
  }
}
