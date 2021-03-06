"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toV1 = toV1;

// Copyright 2017-2021 @axia/types authors & contributors
// SPDX-License-Identifier: Apache-2.0
function convertArray(registry, _ref) {
  let {
    len,
    type
  } = _ref;
  return registry.createType('Si1TypeDef', {
    Array: {
      len,
      type: type.toNumber()
    }
  });
}

function convertBitSequence(registry, _ref2) {
  let {
    bitOrderType,
    bitStoreType
  } = _ref2;
  return registry.createType('Si1TypeDef', {
    BitSequence: {
      bitOrderType: bitOrderType.toNumber(),
      bitStoreType: bitStoreType.toNumber()
    }
  });
}

function convertCompact(registry, _ref3) {
  let {
    type
  } = _ref3;
  return registry.createType('Si1TypeDef', {
    Compact: {
      type: type.toNumber()
    }
  });
}

function convertComposite(registry, _ref4) {
  let {
    fields
  } = _ref4;
  return registry.createType('Si1TypeDef', {
    Composite: {
      fields: convertFields(registry, fields)
    }
  });
}

function convertFields(registry, fields) {
  return fields.map(_ref5 => {
    let {
      docs,
      name,
      type,
      typeName
    } = _ref5;
    return registry.createType('Si1Field', {
      docs,
      name,
      type: type.toNumber(),
      typeName
    });
  });
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

function convertSequence(registry, _ref6) {
  let {
    type
  } = _ref6;
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

function convertVariant(registry, _ref7) {
  let {
    variants
  } = _ref7;
  return registry.createType('Si1TypeDef', {
    Variant: {
      variants: variants.map((_ref8, index) => {
        let {
          discriminant,
          docs,
          fields,
          name
        } = _ref8;
        return registry.createType('Si1Variant', {
          docs,
          fields: convertFields(registry, fields),
          index: discriminant.isSome ? discriminant.unwrap().toNumber() : index,
          name
        });
      })
    }
  });
}

function convertDef(registry, _ref9) {
  let {
    def,
    path
  } = _ref9;

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

function toV1(registry, types) {
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