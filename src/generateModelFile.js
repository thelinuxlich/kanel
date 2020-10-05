import { forEach, map, filter, reject, propEq, uniq, pipe } from 'ramda';
import { recase } from '@kristiandupont/recase';
import generateInterface from './generateInterface';

/**
 * @typedef { import('extract-pg-schema').Table } Table
 * @typedef { import('extract-pg-schema').Type } Type
 * @typedef { Table & { isView: boolean } } Model
 */

/**
 * @param {Model} model
 * @param {import('./Config').TypeMap} typeMap
 * @param {string | any[]} userTypes
 * @param {import('./Casing').Casings} casings
 * @returns {string[]}
 */
const generateModelFile = (model, typeMap, userTypes, casings) => {
  const tc = recase(casings.sourceCasing, casings.typeCasing);
  const fc = recase(casings.sourceCasing, casings.filenameCasing);

  const lines = [];
  const { comment, tags } = model;
  const generateInitializer = !tags['fixed'] && !model.isView;
  const referencedIdTypes = pipe(
    // @ts-ignore
    filter((p) => Boolean(p.parent)),
    map((p) => p.parent.split('.')[0]),
    filter((p) => p !== model.name),
    uniq
    // @ts-ignore
  )(model.columns);
  forEach((referencedIdType) => {
    lines.push(
      `import { ${tc(referencedIdType)}Id } from './${fc(referencedIdType)}';`
    );
  }, referencedIdTypes);
  if (referencedIdTypes.length) {
    lines.push('');
  }
  const appliedUserTypes = uniq(
    map(
      (p) => p.type,
      filter((p) => userTypes.indexOf(p.type) !== -1, model.columns)
    )
  );
  forEach((importedType) => {
    lines.push(`import ${tc(importedType)} from './${fc(importedType)}';`);
  }, appliedUserTypes);
  if (appliedUserTypes.length) {
    lines.push('');
  }
  const overriddenTypes = map(
    (p) => p.tags.type,
    filter((p) => !!p.tags.type, model.columns)
  );
  forEach((importedType) => {
    lines.push(`import ${tc(importedType)} from '../${fc(importedType)}';`);
  }, overriddenTypes);
  if (overriddenTypes.length) {
    lines.push('');
  }

  const primaryColumns = filter((c) => c.isPrimary, model.columns);

  // If there's one and only one primary key, that's the identifier.
  const hasIdentifier = primaryColumns.length === 1;

  const columns = map(
    (c) => ({
      ...c,
      isIdentifier: hasIdentifier && c.isPrimary,
    }),
    model.columns
  );

  if (hasIdentifier) {
    const [{ type, tags }] = primaryColumns;
    const innerType = tags.type || typeMap[type] || tc(type);
    lines.push(
      `export type ${tc(model.name)}Id = ${innerType} & { __flavor?: '${
        model.name
      }' };`
    );
    lines.push('');
  }

  const interfaceLines = generateInterface(
    {
      name: model.name,
      properties: columns,
      considerDefaultValues: false,
      comment,
      exportAs: 'default',
    },
    typeMap,
    casings
  );
  lines.push(...interfaceLines);
  if (generateInitializer) {
    lines.push('');
    const initializerInterfaceLines = generateInterface(
      {
        name: `${tc(model.name)}Initializer`,
        modelName: model.name,
        properties: reject(propEq('name', 'createdAt'), columns),
        considerDefaultValues: true,
        comment,
        exportAs: true,
      },
      typeMap,
      casings
    );
    lines.push(...initializerInterfaceLines);
  }
  return lines;
};

export default generateModelFile;
