// Copyright 2017-2021 @axia/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
function convertArray(registry, {
  len,
  type
}) {
  return registry.createType('Si1TypeDef', {
    Array: {
      len,
      type: type.toNumber()
    }
  });
}

function convertBitSequence(registry, {
  bitOrderType,
  bitStoreType
}) {
  return registry.createType('Si1TypeDef', {
    BitSequence: {
      bitOrderType: bitOrderType.toNumber(),
      bitStoreType: bitStoreType.toNumber()
    }
  });
}

function convertCompact(registry, {
  type
}) {
  return registry.createType('Si1TypeDef', {
    Compact: {
      type: type.toNumber()
    }
  });
}

function convertComposite(registry, {
  fields
}) {
  return registry.createType('Si1TypeDef', {
    Composite: {
      fields: convertFields(registry, fields)
    }
  });
}

function convertFields(registry, fields) {
  return fields.map(({
    docs,
    name,
    type,
    typeName
  }) => registry.createType('Si1Field', {
    docs,
    name,
    type: type.toNumber(),
    typeName
  }));
}

function convertPhantom(registry, path) {
  console.warn(`Converting phantom type ${path.map(p => p.toString()).join('::')} to empty tuple`);
  return registry.createType('Si1TypeDef', {
    Tuple: []
  });
}

function convertPrimitive(registry, prim) {
  return registry.createType('Si1TypeDef', {
    Primitive: prim.toString()
  });
}

function convertSequence(registry, {
  type
}) {
  return registry.createType('Si1TypeDef', {
    Sequence: {
      type: type.toNumber()
    }
  });
}

function convertTuple(registry, types) {
  return registry.createType('Si1TypeDef', {
    Tuple: types.map(t => t.toNumber())
  });
}

function convertVariant(registry, {
  variants
}) {
  return registry.createType('Si1TypeDef', {
    Variant: {
      variants: variants.map(({
        discriminant,
        docs,
        fields,
        name
      }, index) => registry.createType('Si1Variant', {
        docs,
        fields: convertFields(registry, fields),
        index: discriminant.isSome ? discriminant.unwrap().toNumber() : index,
        name
      }))
    }
  });
}

function convertDef(registry, {
  def,
  path
}) {
  if (def.isArray) {
    return convertArray(registry, def.asArray);
  } else if (def.isBitSequence) {
    return convertBitSequence(registry, def.asBitSequence);
  } else if (def.isCompact) {
    return convertCompact(registry, def.asCompact);
  } else if (def.isComposite) {
    return convertComposite(registry, def.asComposite);
  } else if (def.isPhantom) {
    return convertPhantom(registry, path);
  } else if (def.isPrimitive) {
    return convertPrimitive(registry, def.asPrimitive);
  } else if (def.isSequence) {
    return convertSequence(registry, def.asSequence);
  } else if (def.isTuple) {
    return convertTuple(registry, def.asTuple);
  } else if (def.isVariant) {
    return convertVariant(registry, def.asVariant);
  }

  throw new Error(`Cannot convert type ${def.toString()}`);
}

export function toV1(registry, types) {
  return types.map((t, index) => registry.createType('PortableType', {
    // offsets are +1 from v0
    id: index + 1,
    type: {
      def: convertDef(registry, t),
      docs: [],
      params: t.params.map(p => registry.createType('Si1TypeParameter', {
        type: p.toNumber()
      })),
      path: t.path.map(p => p.toString())
    }
  }));
}