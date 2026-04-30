import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ButtonsSectionComponent } from './sections/buttons-section/buttons-section.component';
import { ContainersSectionComponent } from './sections/containers-section/containers-section.component';
import { DateSectionComponent } from './sections/date-section/date-section.component';
import { DialogsSectionComponent } from './sections/dialogs-section/dialogs-section.component';
import { InfoSectionComponent } from './sections/info-section/info-section.component';
import { InputsSectionComponent } from './sections/inputs-section/inputs-section.component';
import { ListsSectionComponent } from './sections/lists-section/lists-section.component';
import { NavigationSectionComponent } from './sections/navigation-section/navigation-section.component';
import { PaginationSectionComponent } from './sections/pagination-section/pagination-section.component';
import { TogglesSectionComponent } from './sections/toggles-section/toggles-section.component';
import { ShowcasePageComponent } from './showcase-page/showcase-page.component';
import { ShowcaseRoutingModule } from './showcase-routing-module';

@NgModule({
  declarations: [
    ShowcasePageComponent,
    ButtonsSectionComponent,
    InputsSectionComponent,
    TogglesSectionComponent,
    DateSectionComponent,
    ContainersSectionComponent,
    NavigationSectionComponent,
    ListsSectionComponent,
    PaginationSectionComponent,
    DialogsSectionComponent,
    InfoSectionComponent,
  ],
  imports: [SharedModule, ShowcaseRoutingModule],
})
export class ShowcaseModule {}
