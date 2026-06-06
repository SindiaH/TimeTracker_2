import { CdkDropList } from '@angular/cdk/drag-drop';
import { Directive, effect, inject, OnInit } from '@angular/core';
import { ComponentBase } from '@core/base/component-base';
import { TreeDropConnectionService } from '@modules/tasks/services/tree-drop-connection.service';

@Directive({
  selector: '[cdkDropList][appTreeDrop]',
  standalone: false,
})
export class TreeDropDirective extends ComponentBase implements OnInit {
  private readonly cdkDropList = inject(CdkDropList);
  private readonly registry = inject(TreeDropConnectionService);

  constructor() {
    super();
    effect(() => {
      this.cdkDropList.connectedTo = this.registry.ids() as string[];
    });
  }

  ngOnInit(): void {
    const id = this.cdkDropList.id;
    this.registry.register(id);
    this.destroyRef.onDestroy(() => this.registry.unregister(id));
  }
}
