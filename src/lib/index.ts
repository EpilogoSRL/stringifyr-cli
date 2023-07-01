import { Stringifyr as _Stringifyr } from "./stringifyr/Stringifyr";
import { StringifyrDOM as _StringifyrDOM } from "./entry/StringifyrDOM";
import { StringifyrReact as _StringifyrReact } from "./entry/StringifyrReact";

export const Stringifyr = _Stringifyr;
export const StringifyrDOM = _StringifyrDOM;
export const StringifyrReact = _StringifyrReact;

export default {
  Stringifyr: _Stringifyr,
  StringifyrDOM: _StringifyrDOM,
  StringifyrReact: _StringifyrReact,
};
