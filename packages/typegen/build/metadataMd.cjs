"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = main;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _fs = _interopRequireDefault(require("fs"));

var _types = require("@axia-js/types");

var definitions = _interopRequireWildcard(require("@axia-js/types/interfaces/definitions"));

var _getStorage = require("@axia-js/types/metadata/decorate/storage/getStorage");

var _StorageKey = require("@axia-js/types/primitive/StorageKey");

var _staticAxlib = _interopRequireDefault(require("@axia-js/types-support/metadata/static-axlib"));

var _util = require("@axia-js/util");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const STATIC_TEXT = '\n\n(NOTE: These were generated from a static/snapshot view of a recent Axlib master node. Some items may not be available in older nodes, or in any customized implementations.)';
const DESC_CONSTANTS = `The following sections contain the module constants, also known as parameter types. These can only be changed as part of a runtime upgrade. On the api, these are exposed via \`api.consts.<module>.<method>\`. ${STATIC_TEXT}`;
const DESC_EXTRINSICS = `The following sections contain Extrinsics methods are part of the default Axlib runtime. On the api, these are exposed via \`api.tx.<module>.<method>\`. ${STATIC_TEXT}`;
const DESC_ERRORS = `This page lists the errors that can be encountered in the different modules. ${STATIC_TEXT}`;
const DESC_EVENTS = `Events are emitted for certain operations on the runtime. The following sections describe the events that are part of the default Axlib runtime. ${STATIC_TEXT}`;
const DESC_RPC = 'The following sections contain RPC methods that are Remote Calls available by default and allow you to interact with the actual node, query, and submit.';
const DESC_STORAGE = `The following sections contain Storage methods are part of the default Axlib runtime. On the api, these are exposed via \`api.query.<module>.<method>\`. ${STATIC_TEXT}`;
/** @internal */

function docsVecToMarkdown(docLines) {
  let indent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  const md = docLines.map(docLine => docLine.toString().trimStart().replace(/^r"/g, '').trimStart()).reduce((md, docLine) => // generate paragraphs
  !docLine.length ? `${md}\n\n` // empty line
  : /^[*-]/.test(docLine.trimStart()) && !md.endsWith('\n\n') ? `${md}\n\n${docLine}` // line calling for a preceding linebreak
  : `${md} ${docLine.replace(/^#{1,3} /, '#### ')} `, '').replace(/#### <weight>/g, '<weight>').replace(/<weight>(.|\n)*?<\/weight>/g, '').replace(/#### Weight:/g, 'Weight:'); // prefix each line with indentation

  return md && md.split('\n\n').map(line => `${' '.repeat(indent)}${line}`).join('\n\n');
}

function renderPage(page) {
  let md = `---\ntitle: ${page.title}\n---\n\n`;

  if (page.description) {
    md += `${page.description}\n\n`;
  } // index


  page.sections.forEach(section => {
    md += `- **[${(0, _util.stringCamelCase)(section.name)}](#${(0, _util.stringCamelCase)(section.name).toLowerCase()})**\n\n`;
  }); // contents

  page.sections.forEach(section => {
    md += '\n___\n\n\n';
    md += section.link ? `<h2 id="#${section.link}">${section.name}</h2>\n` : `## ${section.name}\n`;

    if (section.description) {
      md += `\n_${section.description}_\n`;
    }

    section.items.forEach(item => {
      md += ' \n';
      md += item.link ? `<h3 id="#${item.link}">${item.name}</h3>` : `### ${item.name}`;
      Object.keys(item).filter(key => !['link', 'name'].includes(key)).forEach(bullet => {
        md += `\n- **${bullet}**: ${// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        item[bullet] instanceof _types.Vec ? docsVecToMarkdown(item[bullet], 2).toString() : item[bullet]}`;
      });
      md += '\n';
    });
  });
  return md;
}

function sortByName(a, b) {
  // case insensitive (all-uppercase) sorting
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  return a.name.toString().toUpperCase().localeCompare(b.name.toString().toUpperCase());
}

function getSiName(lookup, type) {
  const typeDef = lookup.getTypeDef(type);
  return typeDef.lookupName || typeDef.type;
}
/** @internal */


function addRpc() {
  const sections = Object.keys(definitions).filter(key => Object.keys(definitions[key].rpc || {}).length !== 0);
  return renderPage({
    description: DESC_RPC,
    sections: sections.sort().reduce((all, _sectionName) => {
      const section = definitions[_sectionName];
      Object.keys(section.rpc).sort().forEach(methodName => {
        const method = section.rpc[methodName];
        const sectionName = method.aliasSection || _sectionName;
        const topName = method.aliasSection ? `${_sectionName}/${method.aliasSection}` : _sectionName;
        let container = all.find(_ref => {
          let {
            name
          } = _ref;
          return name === topName;
        });

        if (!container) {
          container = {
            items: [],
            name: topName
          };
          all.push(container);
        }

        const args = method.params.map(_ref2 => {
          let {
            isOptional,
            name,
            type
          } = _ref2;
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          return name + (isOptional ? '?' : '') + ': `' + type + '`';
        }).join(', ');
        const type = '`' + method.type + '`';
        const jsonrpc = method.endpoint || `${sectionName}_${methodName}`;
        container.items.push(_objectSpread({
          interface: '`' + `api.rpc.${sectionName}.${methodName}` + '`',
          jsonrpc: '`' + jsonrpc + '`',
          // link: jsonrpc,
          name: `${methodName}(${args}): ${type}`
        }, method.description && {
          summary: method.description
        }));
      });
      return all;
    }, []).sort(sortByName),
    title: 'JSON-RPC'
  });
}
/** @internal */


function addConstants(_ref3) {
  let {
    lookup,
    pallets
  } = _ref3;
  return renderPage({
    description: DESC_CONSTANTS,
    sections: pallets.sort(sortByName).filter(_ref4 => {
      let {
        constants
      } = _ref4;
      return !constants.isEmpty;
    }).map(_ref5 => {
      let {
        constants,
        name
      } = _ref5;
      const sectionName = (0, _util.stringLowerFirst)(name);
      return {
        items: constants.sort(sortByName).map(_ref6 => {
          let {
            docs,
            name,
            type
          } = _ref6;
          const methodName = (0, _util.stringCamelCase)(name);
          return _objectSpread({
            interface: '`' + `api.consts.${sectionName}.${methodName}` + '`',
            name: `${methodName}: ` + '`' + getSiName(lookup, type) + '`'
          }, docs.length && {
            summary: docs
          });
        }),
        name: sectionName
      };
    }),
    title: 'Constants'
  });
}
/** @internal */


function addStorage(_ref7) {
  let {
    lookup,
    pallets,
    registry
  } = _ref7;
  const {
    axlib
  } = (0, _getStorage.getStorage)(registry);
  const moduleSections = pallets.sort(sortByName).filter(moduleMetadata => !moduleMetadata.storage.isNone).map(moduleMetadata => {
    const sectionName = (0, _util.stringLowerFirst)(moduleMetadata.name);
    return {
      items: moduleMetadata.storage.unwrap().items.sort(sortByName).map(func => {
        let arg = '';

        if (func.type.isMap) {
          const {
            hashers,
            key
          } = func.type.asMap;
          arg = '`' + (hashers.length === 1 ? getSiName(lookup, key) : lookup.getSiType(key).def.asTuple.map(t => getSiName(lookup, t)).join(', ')) + '`';
        }

        const methodName = (0, _util.stringLowerFirst)(func.name);
        const outputType = (0, _StorageKey.unwrapStorageType)(registry, func.type, func.modifier.isOptional);
        return _objectSpread({
          interface: '`' + `api.query.${sectionName}.${methodName}` + '`',
          name: `${methodName}(${arg}): ` + '`' + outputType + '`'
        }, func.docs.length && {
          summary: func.docs
        });
      }),
      name: sectionName
    };
  });
  return renderPage({
    description: DESC_STORAGE,
    sections: moduleSections.concat([{
      description: 'These are well-known keys that are always available to the runtime implementation of any Axlib-based network.',
      items: Object.entries(axlib).map(_ref8 => {
        let [name, {
          meta
        }] = _ref8;
        const arg = meta.type.isMap ? '`' + getSiName(lookup, meta.type.asMap.key) + '`' : '';
        const methodName = (0, _util.stringLowerFirst)(name);
        const outputType = (0, _StorageKey.unwrapStorageType)(registry, meta.type, meta.modifier.isOptional);
        return {
          interface: '`' + `api.query.axlib.${methodName}` + '`',
          name: `${methodName}(${arg}): ` + '`' + outputType + '`',
          summary: meta.docs
        };
      }),
      name: 'axlib'
    }]).sort(sortByName),
    title: 'Storage'
  });
}
/** @internal */


function addExtrinsics(_ref9) {
  let {
    lookup,
    pallets
  } = _ref9;
  return renderPage({
    description: DESC_EXTRINSICS,
    sections: pallets.sort(sortByName).filter(_ref10 => {
      let {
        calls
      } = _ref10;
      return calls.isSome;
    }).map(_ref11 => {
      let {
        calls,
        name
      } = _ref11;
      const sectionName = (0, _util.stringCamelCase)(name);
      return {
        items: lookup.getSiType(calls.unwrap().type).def.asVariant.variants.sort(sortByName).map((_ref12, index) => {
          let {
            docs,
            fields,
            name
          } = _ref12;
          const methodName = (0, _util.stringCamelCase)(name);
          const args = fields.map(_ref13 => {
            let {
              name,
              type
            } = _ref13;
            return `${name.isSome ? name.toString() : `param${index}`}: ` + '`' + getSiName(lookup, type) + '`';
          }).join(', ');
          return _objectSpread({
            interface: '`' + `api.tx.${sectionName}.${methodName}` + '`',
            name: `${methodName}(${args})`
          }, docs.length && {
            summary: docs
          });
        }),
        name: sectionName
      };
    }),
    title: 'Extrinsics'
  });
}
/** @internal */


function addEvents(_ref14) {
  let {
    lookup,
    pallets
  } = _ref14;
  return renderPage({
    description: DESC_EVENTS,
    sections: pallets.sort(sortByName).filter(_ref15 => {
      let {
        events
      } = _ref15;
      return events.isSome;
    }).map(meta => ({
      items: lookup.getSiType(meta.events.unwrap().type).def.asVariant.variants.sort(sortByName).map(_ref16 => {
        let {
          docs,
          fields,
          name
        } = _ref16;
        const methodName = name.toString();
        const args = fields.map(_ref17 => {
          let {
            type
          } = _ref17;
          return '`' + getSiName(lookup, type) + '`';
        }).join(', ');
        return _objectSpread({
          interface: '`' + `api.events.${(0, _util.stringCamelCase)(meta.name)}.${methodName}.is` + '`',
          name: `${methodName}(${args})`
        }, docs.length && {
          summary: docs
        });
      }),
      name: (0, _util.stringCamelCase)(meta.name)
    })),
    title: 'Events'
  });
}
/** @internal */


function addErrors(_ref18) {
  let {
    lookup,
    pallets
  } = _ref18;
  return renderPage({
    description: DESC_ERRORS,
    sections: pallets.sort(sortByName).filter(_ref19 => {
      let {
        errors
      } = _ref19;
      return errors.isSome;
    }).map(moduleMetadata => ({
      items: lookup.getSiType(moduleMetadata.errors.unwrap().type).def.asVariant.variants.sort(sortByName).map(error => _objectSpread({
        interface: '`' + `api.errors.${(0, _util.stringCamelCase)(moduleMetadata.name)}.${error.name.toString()}.is` + '`',
        name: error.name.toString()
      }, error.docs.length && {
        summary: error.docs
      })),
      name: (0, _util.stringLowerFirst)(moduleMetadata.name)
    })),
    title: 'Errors'
  });
}
/** @internal */


function writeFile(name) {
  const writeStream = _fs.default.createWriteStream(name, {
    encoding: 'utf8',
    flags: 'w'
  });

  writeStream.on('finish', () => {
    console.log(`Completed writing ${name}`);
  });

  for (var _len = arguments.length, chunks = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    chunks[_key - 1] = arguments[_key];
  }

  chunks.forEach(chunk => {
    writeStream.write(chunk);
  });
  writeStream.end();
}

function main() {
  const registry = new _types.TypeRegistry();
  const metadata = new _types.Metadata(registry, _staticAxlib.default);
  registry.setMetadata(metadata);
  const latest = metadata.asLatest;
  writeFile('docs/axlib/rpc.md', addRpc());
  writeFile('docs/axlib/constants.md', addConstants(latest));
  writeFile('docs/axlib/storage.md', addStorage(latest));
  writeFile('docs/axlib/extrinsics.md', addExtrinsics(latest));
  writeFile('docs/axlib/events.md', addEvents(latest));
  writeFile('docs/axlib/errors.md', addErrors(latest));
}