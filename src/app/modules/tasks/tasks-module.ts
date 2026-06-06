import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskTreeNodeComponent } from './components/task-tree-node/task-tree-node.component';
import { TreeDropDirective } from './directives/tree-drop.directive';
import { TasksOverviewComponent } from './pages/tasks-overview/tasks-overview.component';
import { TasksTreeService } from './services/tasks-tree.service';
import { TreeDropConnectionService } from './services/tree-drop-connection.service';
import { TreeDropPriorityService } from './services/tree-drop-priority.service';
import { TasksRoutingModule } from './tasks-routing-module';

@NgModule({
  declarations: [TasksOverviewComponent, TaskTreeNodeComponent, TaskFormComponent, TreeDropDirective],
  imports: [SharedModule, TasksRoutingModule, DragDropModule],
  providers: [TasksTreeService, TreeDropConnectionService, TreeDropPriorityService],
})
export class TasksModule {}
