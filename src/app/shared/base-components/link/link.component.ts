import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StringDictionary } from '@shared/types/string-dictionary.type';

export type LinkVariant = 'basic' | 'raised' | 'flat' | 'stroked' | 'icon' | 'fab' | 'extended-fab';
export type LinkTarget = '_blank' | '_self' | '_parent' | '_top';

@Component({
  selector: 'app-link',
  standalone: false,
  templateUrl: './link.component.html',
  styleUrl: './link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkComponent {
  readonly variant = input<LinkVariant>('basic');
  readonly icon = input<string | null>(null);
  readonly tooltip = input<string | null>(null);
  readonly disabled = input<boolean>(false);
  readonly routerLinkUrl = input<string | undefined>(undefined);
  readonly queryParams = input<StringDictionary | undefined>(undefined);
  readonly routerLinkActiveClass = input<string | string[]>('');
  readonly routerLinkActiveExact = input<boolean>(false);
  readonly href = input<string | null>(null);
  readonly target = input<LinkTarget>('_self');
  readonly outlined = input<boolean>(true);
}
