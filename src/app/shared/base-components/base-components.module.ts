import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MaterialComponentsModule } from '@shared/material-components/material-components.module';
import { ButtonComponent } from '@shared/base-components/button/button.component';
import { IconComponent } from '@shared/base-components/icon/icon.component';
import { LinkComponent } from '@shared/base-components/link/link.component';
import { InfoComponent } from '@shared/base-components/info/info.component';
import { TextReadonlyComponent } from '@shared/base-components/text-readonly/text-readonly.component';
import { ProgressIndicatorComponent } from '@shared/base-components/progress-indicator/progress-indicator.component';
import { LoadMoreComponent } from '@shared/base-components/load-more/load-more.component';
import { PaginatorComponent } from '@shared/base-components/paginator/paginator.component';
import { CheckboxComponent } from '@shared/base-components/checkbox/checkbox.component';
import { ToggleComponent } from '@shared/base-components/toggle/toggle.component';
import { RadioButtonComponent } from '@shared/base-components/radio-button/radio-button.component';
import { ButtonToggleComponent } from '@shared/base-components/button-toggle/button-toggle.component';
import { ChipComponent } from '@shared/base-components/chip/chip.component';
import { InputComponent } from '@shared/base-components/input/input.component';
import { InputSelectComponent } from '@shared/base-components/input-select/input-select.component';
import { InputSelectSearchComponent } from '@shared/base-components/input-select-search/input-select-search.component';
import { SearchComponent } from '@shared/base-components/search/search.component';
import { DatePickerComponent } from '@shared/base-components/date-picker/date-picker.component';
import { DateRangePickerComponent } from '@shared/base-components/date-range-picker/date-range-picker.component';
import { PanelComponent } from '@shared/base-components/panel/panel.component';
import { PanelEditableComponent } from '@shared/base-components/panel-editable/panel-editable.component';
import { AccordionComponent } from '@shared/base-components/accordion/accordion.component';
import { ExpansionPanelComponent } from '@shared/base-components/accordion/expansion-panel/expansion-panel.component';
import { TabGroupComponent } from '@shared/base-components/tab-group/tab-group.component';
import { ListComponent } from '@shared/base-components/list/list.component';
import { ListItemComponent } from '@shared/base-components/list/list-item/list-item.component';
import { ListSelectableComponent } from '@shared/base-components/list-selectable/list-selectable.component';
import { MenuComponent } from '@shared/base-components/menu/menu.component';
import { MenuItemComponent } from '@shared/base-components/menu/menu-item/menu-item.component';
import { MenuLinkComponent } from '@shared/base-components/menu/menu-link/menu-link.component';
import { DialogComponent } from '@shared/base-components/dialog/dialog.component';
import { BottomSheetComponent } from '@shared/base-components/bottom-sheet/bottom-sheet.component';
import { SideSheetComponent } from '@shared/base-components/side-sheet/side-sheet.component';

const COMPONENTS = [
  ButtonComponent,
  IconComponent,
  LinkComponent,
  InfoComponent,
  TextReadonlyComponent,
  ProgressIndicatorComponent,
  LoadMoreComponent,
  PaginatorComponent,
  CheckboxComponent,
  ToggleComponent,
  RadioButtonComponent,
  ButtonToggleComponent,
  ChipComponent,
  InputComponent,
  InputSelectComponent,
  InputSelectSearchComponent,
  SearchComponent,
  DatePickerComponent,
  DateRangePickerComponent,
  PanelComponent,
  PanelEditableComponent,
  AccordionComponent,
  ExpansionPanelComponent,
  TabGroupComponent,
  ListComponent,
  ListItemComponent,
  ListSelectableComponent,
  MenuComponent,
  MenuItemComponent,
  MenuLinkComponent,
  DialogComponent,
  BottomSheetComponent,
  SideSheetComponent,
];

@NgModule({
  declarations: COMPONENTS,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive, MaterialComponentsModule],
  exports: [...COMPONENTS, ReactiveFormsModule, RouterLink, RouterLinkActive, MaterialComponentsModule],
})
export class BaseComponentsModule {}
