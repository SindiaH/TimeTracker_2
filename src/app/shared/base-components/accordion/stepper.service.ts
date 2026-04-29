import { signal } from '@angular/core';

export class StepperService {
  readonly step = signal<number>(0);
  readonly minStep = signal<number>(0);
  readonly maxStep = signal<number>(0);

  constructor(minStep: number, maxStep: number, firstOpened: number = 0) {
    this.step.set(firstOpened);
    this.minStep.set(minStep);
    this.maxStep.set(maxStep);
  }

  setStep(index: number): void {
    this.step.set(index);
  }

  nextStep(): void {
    this.step.update((value) => value + 1);
  }

  prevStep(): void {
    this.step.update((value) => value - 1);
  }

  close(): void {
    this.step.set(this.minStep() - 1);
  }
}
