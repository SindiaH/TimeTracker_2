import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskTreeNodeComponent } from './components/task-tree-node/task-tree-node.component';
import { TasksOverviewComponent } from './pages/tasks-overview/tasks-overview.component';
import { FormatDurationPipe } from './pipes/format-duration.pipe';
import { TasksRoutingModule } from './tasks-routing-module';

@NgModule({
  declarations: [TasksOverviewComponent, TaskTreeNodeComponent, TaskFormComponent, FormatDurationPipe],
  imports: [SharedModule, TasksRoutingModule],
})
export class TasksModule {}
