import {
  ENUM_FIELDS,
  ENUM_KEYED_MAPS,
  FREE_KEY_MAPS,
  NULLABLE_FIELDS,
  resolveRecord,
  type Backend,
  type RegistryEntry,
} from "./javaContract";
import type { JavaType } from "./javaRecords";

/**
 * Walks a TypeScript fixture along the pte-api `overview` records, reporting every drift between
 * the two (missing or extra key, wrong JSON kind, undocumented null, unknown enum value). Test
 * support only: never exported from the package barrels.
 */

export interface WalkResult {
  problems: string[];
  /** Qualified names of every record the walk reached. */
  visited: Set<string>;
  /** Component ids (`Record.component`) that were null in the fixture. */
  nullSeen: Set<string>;
}

const INTEGER_TYPES = new Set(["long", "int", "short", "Long", "Integer", "Short"]);
const DECIMAL_TYPES = new Set(["double", "float", "Double", "Float", "BigDecimal", "java.math.BigDecimal"]);
const BOXED_TYPES = new Set(["Long", "Integer", "Short", "Double", "Float", "Boolean"]);
const BOOLEAN_TYPES = new Set(["boolean", "Boolean"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INSTANT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameMembers(actual: readonly string[], expected: readonly string[]): boolean {
  return [...actual].sort().join("|") === [...expected].sort().join("|");
}

/** Short description of a Java type's JSON shape, used to compare facade and response components. */
export function jsonKind(type: JavaType): string {
  if (INTEGER_TYPES.has(type.name)) return "integer";
  if (DECIMAL_TYPES.has(type.name)) return "decimal";
  if (BOOLEAN_TYPES.has(type.name)) return "boolean";
  if (type.name === "String" || type.name === "UUID" || type.name === "Instant") return "string";
  if (type.name === "Map") return "map";
  if (type.name === "List" || type.name === "[]") return "list";
  return type.name;
}

export function walkResponse(backend: Backend, rootName: string, fixture: unknown): WalkResult {
  const result: WalkResult = { problems: [], visited: new Set(), nullSeen: new Set() };
  const root = backend.registry.get(rootName);
  if (!root) {
    result.problems.push(`Java record ${rootName} was not found in the backend sources`);
    return result;
  }
  walkRecord(backend, root, fixture, rootName, result);
  // One line per distinct problem: a bad record inside a 12-bucket series would repeat 12 times.
  result.problems = [...new Set(result.problems.map((problem) => problem.replace(/\[\d+\]/g, "[]")))];
  return result;
}

function walkRecord(backend: Backend, entry: RegistryEntry, value: unknown, path: string, result: WalkResult): void {
  const name = entry.record.qualifiedName;
  if (!isPlainObject(value)) {
    result.problems.push(`${path}: expected an object for ${name}, got ${JSON.stringify(value)}`);
    return;
  }
  result.visited.add(name);
  const javaKeys = entry.record.components.map((component) => component.name);
  for (const key of javaKeys.filter((javaKey) => !(javaKey in value))) {
    result.problems.push(`${path}: Java ${name} has component "${key}" that the TS contract/fixture lacks`);
  }
  for (const key of Object.keys(value).filter((fixtureKey) => !javaKeys.includes(fixtureKey))) {
    result.problems.push(`${path}: TS contract/fixture has key "${key}" that Java ${name} lacks`);
  }
  for (const component of entry.record.components) {
    if (!(component.name in value)) continue;
    walkValue(backend, entry, component.type, value[component.name], `${path}.${component.name}`, `${name}.${component.name}`, result);
  }
}

function walkValue(
  backend: Backend,
  from: RegistryEntry,
  type: JavaType,
  value: unknown,
  path: string,
  fieldId: string,
  result: WalkResult,
): void {
  if (BOXED_TYPES.has(type.name) && !NULLABLE_FIELDS.has(fieldId)) {
    result.problems.push(`${fieldId}: boxed Java type ${type.name} can be null but is not in NULLABLE_FIELDS`);
  }
  if (value === null) {
    if (NULLABLE_FIELDS.has(fieldId)) result.nullSeen.add(fieldId);
    else result.problems.push(`${path}: null, but ${fieldId} is not documented as nullable`);
    return;
  }
  if (type.name === "DashboardSection") return walkSection(backend, from, type, value, path, result);
  if (type.name === "List") return walkList(backend, from, type, value, path, fieldId, result);
  if (type.name === "Map") return walkMap(backend, value, path, fieldId, result);

  const record = resolveRecord(backend, type.name, from);
  if (record) return walkRecord(backend, record, value, path, result);

  const javaEnum = backend.enums.get(type.name);
  const enumName = javaEnum ? type.name : ENUM_FIELDS[fieldId];
  const allowed = enumName ? backend.enums.get(enumName)?.constants : undefined;
  const problem = checkScalar(type.name, value, allowed);
  if (problem) result.problems.push(`${path}: ${problem}`);
}

function walkSection(
  backend: Backend,
  from: RegistryEntry,
  type: JavaType,
  value: unknown,
  path: string,
  result: WalkResult,
): void {
  const section = backend.registry.get("DashboardSection");
  if (!section) {
    result.problems.push("Java record DashboardSection was not found");
    return;
  }
  if (!isPlainObject(value)) {
    result.problems.push(`${path}: expected a DashboardSection object`);
    return;
  }
  result.visited.add("DashboardSection");
  const javaKeys = section.record.components.map((component) => component.name);
  if (!sameMembers(Object.keys(value), javaKeys)) {
    result.problems.push(`${path}: section keys ${Object.keys(value).join(",")} differ from Java ${javaKeys.join(",")}`);
  }
  const statuses = backend.enums.get("SectionStatus")?.constants ?? [];
  if (typeof value.status !== "string" || !statuses.includes(value.status)) {
    result.problems.push(`${path}.status: "${String(value.status)}" is not a Java SectionStatus (${statuses.join(",")})`);
    return;
  }
  if (value.status !== "OK") {
    if (value.data !== null) result.problems.push(`${path}: ${value.status} section must carry data: null`);
    return;
  }
  if (value.data === null || value.data === undefined) {
    result.problems.push(`${path}: an OK section must carry data`);
    return;
  }
  walkValue(backend, from, type.args[0], value.data, `${path}.data`, `${path}.data`, result);
}

function walkList(
  backend: Backend,
  from: RegistryEntry,
  type: JavaType,
  value: unknown,
  path: string,
  fieldId: string,
  result: WalkResult,
): void {
  if (!Array.isArray(value)) {
    result.problems.push(`${path}: expected an array for ${fieldId}`);
    return;
  }
  value.forEach((item, index) => {
    walkValue(backend, from, type.args[0], item, `${path}[${index}]`, fieldId, result);
  });
}

function walkMap(backend: Backend, value: unknown, path: string, fieldId: string, result: WalkResult): void {
  if (!isPlainObject(value)) {
    result.problems.push(`${path}: expected an object for map ${fieldId}`);
    return;
  }
  for (const [key, count] of Object.entries(value)) {
    if (typeof count !== "number" || !Number.isInteger(count)) {
      result.problems.push(`${path}.${key}: expected an integer count, got ${JSON.stringify(count)}`);
    }
  }
  const enumName = ENUM_KEYED_MAPS[fieldId];
  if (enumName) {
    const constants = backend.enums.get(enumName)?.constants ?? [];
    if (!sameMembers(Object.keys(value), constants)) {
      result.problems.push(`${path}: keys ${Object.keys(value).join(",")} differ from Java ${enumName} (${constants.join(",")})`);
    }
  } else if (!FREE_KEY_MAPS.has(fieldId)) {
    result.problems.push(`${fieldId}: a Map component the contract test does not classify (enum-keyed or free)`);
  }
}

function checkScalar(typeName: string, value: unknown, allowed: readonly string[] | undefined): string | null {
  if (INTEGER_TYPES.has(typeName)) {
    return typeof value === "number" && Number.isInteger(value) ? null : `expected an integer, got ${JSON.stringify(value)}`;
  }
  if (DECIMAL_TYPES.has(typeName)) {
    return typeof value === "number" && Number.isFinite(value) ? null : `expected a JSON number, got ${JSON.stringify(value)}`;
  }
  if (BOOLEAN_TYPES.has(typeName)) {
    return typeof value === "boolean" ? null : `expected a boolean, got ${JSON.stringify(value)}`;
  }
  if (typeName === "UUID") {
    return typeof value === "string" && UUID_PATTERN.test(value) ? null : `expected a UUID string, got ${JSON.stringify(value)}`;
  }
  if (typeName === "Instant") {
    return typeof value === "string" && INSTANT_PATTERN.test(value) ? null : `expected an ISO-8601 instant, got ${JSON.stringify(value)}`;
  }
  if (typeName === "String" || allowed) {
    if (typeof value !== "string") return `expected a string, got ${JSON.stringify(value)}`;
    if (allowed && !allowed.includes(value)) return `"${value}" is not one of ${allowed.join(",")}`;
    return null;
  }
  return `unsupported Java type ${typeName}`;
}

