import { Stringifyr as StringifyrGeneric } from "./stringifyr/Stringifyr";
import { StringifyrDOM } from "./entry/StringifyrDOM";
import { StringifyrReact } from "./entry/StringifyrReact";

export const Stringifyr = {
  Stringifyr: StringifyrGeneric,
  StringifyrDOM,
  StringifyrReact,
}

export default Stringifyr;
