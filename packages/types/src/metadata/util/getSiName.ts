import type { SiLookupTypeId } from '../../interfaces';
import type { PortableRegistry } from "../PortableRegistry";

export function getSiName (lookup: PortableRegistry, type: SiLookupTypeId): string {
  const typeDef = lookup.getTypeDef(type);

  return typeDef.lookupName || typeDef.type;
}