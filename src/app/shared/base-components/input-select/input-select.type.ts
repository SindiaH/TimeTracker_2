export type SelectItemHighlightedInfo = {
  prefix?: string;
  suffix?: string;
  value?: string;
};

export interface ISelectItem {
  id?: string | number;
  name?: string;
  icon?: string;
  highlightedInfo?: SelectItemHighlightedInfo;
}
