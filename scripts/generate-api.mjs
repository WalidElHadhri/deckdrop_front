// Generates types/api.ts and lib/api.ts from the backend's OpenAPI spec (openapi.json).
//
//   npm run generate:api            regenerate from the openapi.json snapshot
//   npm run generate:api -- --pull  download the spec from the running backend first
//
// Function names are chosen per endpoint in OPERATION_NAMES, keyed by "METHOD /path":
// springdoc's operationIds (e.g. "getById_4") are neither readable nor stable across
// backend changes. Endpoints missing from the map fall back to their operationId and
// print a warning, so new endpoints never block generation.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SPEC_PATH = path.join(ROOT, "openapi.json");
const TYPES_PATH = path.join(ROOT, "types", "api.ts");
const CLIENT_PATH = path.join(ROOT, "lib", "api.ts");
const ENUMS_PATH = path.join(ROOT, "lib", "api-enums.ts");

const OPERATION_NAMES = {
  // Auth
  "POST /api/auth/register": "register",
  "POST /api/auth/login": "login",
  "POST /api/auth/password-reset/request": "requestPasswordReset",
  "POST /api/auth/password-reset/confirm": "confirmPasswordReset",

  // Profile
  "GET /api/users/me": "getProfile",
  "PUT /api/users/me": "updateProfile",
  "PUT /api/users/me/password": "changePassword",

  // Addresses
  "GET /api/users/me/addresses": "listAddresses",
  "POST /api/users/me/addresses": "createAddress",
  "GET /api/users/me/addresses/{id}": "getAddress",
  "PUT /api/users/me/addresses/{id}": "updateAddress",
  "DELETE /api/users/me/addresses/{id}": "deleteAddress",

  // Games
  "GET /api/games": "listGames",
  "POST /api/games": "createGame",
  "GET /api/games/{id}": "getGame",
  "PUT /api/games/{id}": "updateGame",
  "DELETE /api/games/{id}": "deleteGame",
  "GET /api/games/slug/{slug}": "getGameBySlug",

  // Categories
  "GET /api/categories": "listCategories",
  "POST /api/categories": "createCategory",
  "GET /api/categories/{id}": "getCategory",
  "PUT /api/categories/{id}": "updateCategory",
  "DELETE /api/categories/{id}": "deleteCategory",

  // Products
  "GET /api/products": "searchProducts",
  "POST /api/products": "createProduct",
  "GET /api/products/{id}": "getProduct",
  "PUT /api/products/{id}": "updateProduct",
  "DELETE /api/products/{id}": "deleteProduct",
  "GET /api/games/{gameSlug}/products/{productSlug}": "getProductBySlug",

  // Card variants
  "GET /api/products/{productId}/yugioh-variants": "listYuGiOhVariants",
  "POST /api/products/{productId}/yugioh-variants": "createYuGiOhVariant",
  "GET /api/products/{productId}/yugioh-variants/{variantId}": "getYuGiOhVariant",
  "PUT /api/products/{productId}/yugioh-variants/{variantId}": "updateYuGiOhVariant",
  "DELETE /api/products/{productId}/yugioh-variants/{variantId}": "deleteYuGiOhVariant",
  "GET /api/products/{productId}/pokemon-variants": "listPokemonVariants",
  "POST /api/products/{productId}/pokemon-variants": "createPokemonVariant",
  "GET /api/products/{productId}/pokemon-variants/{variantId}": "getPokemonVariant",
  "PUT /api/products/{productId}/pokemon-variants/{variantId}": "updatePokemonVariant",
  "DELETE /api/products/{productId}/pokemon-variants/{variantId}": "deletePokemonVariant",
  "GET /api/products/{productId}/one-piece-variants": "listOnePieceVariants",
  "POST /api/products/{productId}/one-piece-variants": "createOnePieceVariant",
  "GET /api/products/{productId}/one-piece-variants/{variantId}": "getOnePieceVariant",
  "PUT /api/products/{productId}/one-piece-variants/{variantId}": "updateOnePieceVariant",
  "DELETE /api/products/{productId}/one-piece-variants/{variantId}": "deleteOnePieceVariant",

  // Cart
  "GET /api/cart": "getCart",
  "DELETE /api/cart": "clearCart",
  "POST /api/cart/items": "addCartItem",
  "PUT /api/cart/items/{itemId}": "updateCartItem",
  "DELETE /api/cart/items/{itemId}": "removeCartItem",

  // Shipping rates
  "GET /api/shipping-rates": "listShippingRates",
  "GET /api/shipping-rates/{country}": "getShippingRate",
  "PUT /api/admin/shipping-rates/{country}": "upsertShippingRate",
  "DELETE /api/admin/shipping-rates/{country}": "deleteShippingRate",

  // Orders
  "GET /api/orders": "listMyOrders",
  "GET /api/orders/{id}": "getMyOrder",
  "POST /api/orders/checkout": "checkout",
  "POST /api/orders/{id}/cancel": "cancelMyOrder",

  // Payments
  "GET /api/orders/{orderId}/payments": "listOrderPayments",
  "POST /api/orders/{orderId}/payments": "startPayment",
  "POST /api/orders/{orderId}/payments/paypal/capture": "capturePayPalPayment",
  "POST /api/payments/webhooks/stripe": "handleStripeWebhook",

  // Admin
  "GET /api/admin/overview": "getAdminOverview",
  "GET /api/admin/orders": "searchAdminOrders",
  "GET /api/admin/orders/{id}": "getAdminOrder",
  "POST /api/admin/orders/{id}/cancel": "cancelAdminOrder",
  "GET /api/admin/orders/{orderId}/payments": "listAdminOrderPayments",
  "POST /api/admin/orders/{id}/shipments": "createShipment",
  "PUT /api/admin/orders/{id}/shipments/{shipmentId}": "updateShipment",
  "POST /api/admin/orders/{id}/shipments/{shipmentId}/delivered": "markShipmentDelivered",
  "GET /api/admin/preorders": "listPreorderSummaries",
  "GET /api/admin/preorders/products/{productId}": "listPreorderItems",
  "POST /api/admin/preorders/products/{productId}/release": "releasePreorders",
};

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const RESERVED_ARGUMENT_NAMES = new Set(["body", "headers", "params", "options"]);

if (process.argv.includes("--pull")) await pullSpec();

const spec = JSON.parse(await readFile(SPEC_PATH, "utf8"));
const schemas = spec.components?.schemas ?? {};

const operations = collectOperations();
const parameterTypes = [];
const sections = groupByTag(operations).map(
  ([tag, ops]) => `// ---- ${tag} ----\n\n${ops.map((op) => renderOperation(op, parameterTypes)).join("\n")}`,
);

const banner =
  `// AUTO-GENERATED by scripts/generate-api.mjs from openapi.json (${spec.info?.title} ${spec.info?.version}).\n` +
  "// Do not edit by hand: run `npm run generate:api` instead.\n";

const typesSource = [
  banner,
  "// ---- Schemas ----\n",
  Object.entries(schemas)
    .map(([name, schema]) => renderNamedType(name, schema))
    .join("\n"),
  "// ---- Operation parameters ----\n",
  parameterTypes.map((type) => type.source).join("\n"),
].join("\n");

const exportedTypeNames = [...Object.keys(schemas), ...parameterTypes.map((type) => type.name)];
const referencedTypes = exportedTypeNames
  .filter((name) => operations.some((op) => new RegExp(`\\b${name}\\b`).test(op.typeText)))
  .sort();

const clientSource = [
  banner,
  'import { apiRequest, type RequestOptions } from "./api-client";',
  `import type {\n${referencedTypes.map((name) => `  ${name},`).join("\n")}\n} from "@/types/api";`,
  "",
  'export { API_BASE_URL, ApiError, type RequestOptions } from "./api-client";',
  "",
  sections.join("\n"),
].join("\n");

// Runtime lists of enum values (for form selects), named <Schema><Property>Values.
const enumConstants = Object.entries(schemas).flatMap(([schemaName, schema]) =>
  Object.entries(schema.properties ?? {}).flatMap(([property, propertySchema]) => {
    const values = propertySchema.enum ?? propertySchema.items?.enum;
    if (!values) return [];
    const constantName = `${schemaName}${property[0].toUpperCase()}${property.slice(1)}Values`;
    return [`export const ${constantName} = ${JSON.stringify(values)} as const;\n`];
  }),
);
const enumsSource = [banner, ...enumConstants].join("\n");

await mkdir(path.dirname(TYPES_PATH), { recursive: true });
await writeFile(TYPES_PATH, typesSource);
await writeFile(CLIENT_PATH, clientSource);
await writeFile(ENUMS_PATH, enumsSource);
console.log(
  `Generated ${path.relative(ROOT, TYPES_PATH)} (${exportedTypeNames.length} types), ` +
    `${path.relative(ROOT, CLIENT_PATH)} (${operations.length} functions) and ` +
    `${path.relative(ROOT, ENUMS_PATH)} (${enumConstants.length} enum value lists).`,
);

// ---- Spec ----------------------------------------------------------------

async function pullSpec() {
  try {
    process.loadEnvFile(path.join(ROOT, ".env.local"));
  } catch {
    // .env.local is optional; fall back to the default URL.
  }
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/v3/api-docs`);
  if (!response.ok) throw new Error(`GET ${baseUrl}/v3/api-docs failed with status ${response.status}`);
  await writeFile(SPEC_PATH, await response.text());
  console.log(`Pulled ${baseUrl}/v3/api-docs into openapi.json.`);
}

/** Resolves local "#/components/..." references (parameters, request bodies, responses). */
function deref(node) {
  let current = node;
  while (current?.$ref) {
    const target = current.$ref
      .replace(/^#\//, "")
      .split("/")
      .reduce((object, key) => object?.[key], spec);
    if (!target) throw new Error(`Unresolvable reference ${current.$ref}`);
    current = target;
  }
  return current;
}

function collectOperations() {
  const collected = [];
  for (const [route, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!operation) continue;

      const key = `${method.toUpperCase()} ${route}`;
      let name = OPERATION_NAMES[key];
      if (!name) {
        name = toCamelCase(operation.operationId ?? `${method} ${route}`);
        console.warn(`warning: no function name for "${key}"; using "${name}". Add it to OPERATION_NAMES.`);
      }

      // Operation-level parameters override path-level ones with the same name and location.
      const parameters = new Map();
      for (const parameter of [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])].map(deref)) {
        parameters.set(`${parameter.in}:${parameter.name}`, parameter);
      }

      collected.push({ key, method, route, operation, name, parameters: [...parameters.values()] });
    }
  }

  for (const key of Object.keys(OPERATION_NAMES)) {
    if (!collected.some((op) => op.key === key)) {
      console.warn(`warning: OPERATION_NAMES contains "${key}", which is no longer in the spec.`);
    }
  }
  const names = collected.map((op) => op.name);
  const duplicates = [...new Set(names.filter((name, index) => names.indexOf(name) !== index))];
  if (duplicates.length) throw new Error(`Duplicate function names: ${duplicates.join(", ")}`);

  return collected;
}

/** Customer-facing tags first (in spec order), then admin tags. */
function groupByTag(ops) {
  const tagOrder = (spec.tags ?? []).map((tag) => tag.name);
  const groups = new Map();
  for (const op of ops) {
    const tag = op.operation.tags?.[0] ?? "Other";
    groups.set(tag, [...(groups.get(tag) ?? []), op]);
  }
  const rank = (tag) => {
    const index = tagOrder.indexOf(tag);
    return (tag.startsWith("Admin") ? 1000 : 0) + (index === -1 ? tagOrder.length : index);
  };
  return [...groups.entries()].sort(([a], [b]) => rank(a) - rank(b));
}

// ---- Types ---------------------------------------------------------------

function renderNamedType(name, schema, description = schema.description) {
  const doc = renderDoc([description]);
  return isInterface(schema)
    ? `${doc}export interface ${name} ${renderObject(schema, "")}\n`
    : `${doc}export type ${name} = ${renderType(schema)};\n`;
}

function isInterface(schema) {
  return (
    !schema.$ref &&
    !schema.enum &&
    !schema.oneOf &&
    !schema.anyOf &&
    !schema.allOf &&
    !schema.additionalProperties &&
    !schema.nullable &&
    [schema.type ?? "object"].flat().every((type) => type === "object") &&
    Object.keys(schema.properties ?? {}).length > 0
  );
}

function renderType(schema, indent = "") {
  if (!schema || schema === true) return "unknown";
  if (schema.$ref) return schema.$ref.split("/").pop();

  const nullable = schema.nullable === true || [schema.type].flat().includes("null");
  let parts;
  if (schema.const !== undefined) {
    parts = [JSON.stringify(schema.const)];
  } else if (schema.enum) {
    parts = schema.enum.map((value) => JSON.stringify(value));
  } else if (schema.oneOf || schema.anyOf) {
    parts = (schema.oneOf ?? schema.anyOf).map((member) => renderType(member, indent));
  } else if (schema.allOf) {
    parts = [schema.allOf.map((member) => renderType(member, indent)).join(" & ")];
  } else {
    const types = [schema.type ?? (schema.properties || schema.additionalProperties ? "object" : "unknown")].flat();
    parts = types.filter((type) => type !== "null").map((type) => renderTypeKeyword(type, schema, indent));
  }
  if (nullable) parts.push("null");
  return [...new Set(parts)].join(" | ") || "unknown";
}

function renderTypeKeyword(type, schema, indent) {
  switch (type) {
    case "string":
      return "string";
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "array": {
      const item = renderType(schema.items, indent);
      return /^[\w$]+$/.test(item) ? `${item}[]` : `Array<${item}>`;
    }
    case "object":
      return renderObject(schema, indent);
    default:
      return "unknown";
  }
}

function renderObject(schema, indent) {
  const required = new Set(schema.required ?? []);
  const inner = `${indent}  `;
  const members = Object.entries(schema.properties ?? {}).map(
    ([name, property]) =>
      `${renderDoc([property.description], inner)}${inner}${IDENTIFIER.test(name) ? name : JSON.stringify(name)}` +
      `${required.has(name) ? "" : "?"}: ${renderType(property, inner)};`,
  );
  const extra = schema.additionalProperties;
  if (!members.length) return extra ? `Record<string, ${renderType(extra, indent)}>` : "Record<string, unknown>";
  if (extra) members.push(`${inner}[key: string]: unknown;`);
  return `{\n${members.join("\n")}\n${indent}}`;
}

function renderDoc(parts, indent = "") {
  const text = parts.filter(Boolean).join("\n\n").replaceAll("*/", "*\\/").trim();
  if (!text) return "";
  const lines = text.split("\n");
  if (lines.length === 1) return `${indent}/** ${lines[0]} */\n`;
  return `${indent}/**\n${lines.map((line) => `${indent} *${line ? ` ${line}` : ""}`).join("\n")}\n${indent} */\n`;
}

/** Builds an interface for an operation's query or header parameters. */
function renderParameterType(name, parameters, description) {
  const schema = { type: "object", properties: {}, required: [] };
  for (const parameter of parameters) {
    const notes = [
      parameter.description ?? parameter.schema?.description,
      parameter.example !== undefined && `@example ${JSON.stringify(parameter.example)}`,
      parameter.schema?.default !== undefined && `@default ${JSON.stringify(parameter.schema.default)}`,
    ];
    schema.properties[parameter.name] = { ...parameter.schema, description: notes.filter(Boolean).join("\n") };
    if (parameter.required) schema.required.push(parameter.name);
  }
  return { name, source: renderNamedType(name, schema, description) };
}

// ---- Client --------------------------------------------------------------

function renderOperation(op, parameterTypesOut) {
  const { method, route, operation, name, parameters } = op;
  const typeBase = name[0].toUpperCase() + name.slice(1);
  const byLocation = (location) => parameters.filter((parameter) => parameter.in === location);
  const pathParameters = byLocation("path").sort(
    (a, b) => route.indexOf(`{${a.name}}`) - route.indexOf(`{${b.name}}`),
  );
  const queryParameters = byLocation("query");
  const headerParameters = byLocation("header");

  const args = [];
  const pathVariables = new Map();
  for (const parameter of pathParameters) {
    let variable = toCamelCase(parameter.name);
    if (RESERVED_ARGUMENT_NAMES.has(variable)) variable = `${variable}Param`;
    pathVariables.set(parameter.name, variable);
    args.push({ name: variable, type: renderType(parameter.schema), required: true });
  }

  const requestFields = [];
  if (operation.requestBody) {
    const requestBody = deref(operation.requestBody);
    const media = requestBody.content?.["application/json"] ?? Object.values(requestBody.content ?? {})[0];
    args.push({ name: "body", type: renderType(media?.schema), required: requestBody.required === true });
    requestFields.push("body");
  }
  if (headerParameters.length) {
    const type = renderParameterType(`${typeBase}Headers`, headerParameters, `Header parameters of \`${name}\`.`);
    parameterTypesOut.push(type);
    args.push({ name: "headers", type: type.name, required: headerParameters.some((p) => p.required) });
    requestFields.push("headers");
  }
  if (queryParameters.length) {
    const type = renderParameterType(`${typeBase}Params`, queryParameters, `Query parameters of \`${name}\`.`);
    parameterTypesOut.push(type);
    args.push({ name: "params", type: type.name, required: queryParameters.some((p) => p.required) });
    requestFields.push("query: params");
  }
  args.push({ name: "options", type: "RequestOptions", required: false });

  // An optional argument followed by a required one must be passed explicitly (as undefined).
  let laterRequired = false;
  const signature = [...args]
    .reverse()
    .map((arg) => {
      const code = arg.required
        ? `${arg.name}: ${arg.type}`
        : `${arg.name}${laterRequired ? `: ${arg.type} | undefined` : `?: ${arg.type}`}`;
      laterRequired ||= arg.required;
      return code;
    })
    .reverse()
    .join(", ");

  const [, successResponse] =
    Object.entries(operation.responses ?? {}).find(([status]) => /^2\d\d$/.test(status)) ?? [];
  const responseContent = successResponse && deref(successResponse).content;
  const responseMedia = responseContent?.["application/json"] ?? Object.values(responseContent ?? {})[0];
  const returnType = responseMedia?.schema ? renderType(responseMedia.schema) : "void";

  const url = pathParameters.length
    ? `\`${route.replace(/\{([^}]+)\}/g, (_, param) => `\${encodeURIComponent(String(${pathVariables.get(param)}))}`)}\``
    : JSON.stringify(route);

  const isPublic = (operation.security ?? spec.security ?? []).length === 0;
  const forbidden = operation.responses?.["403"] && deref(operation.responses["403"]).description;
  const auth = isPublic
    ? "Public"
    : `Requires a bearer token (\`options.token\`)${forbidden ? `. ${forbidden}` : ""}`;
  const doc = renderDoc([operation.summary, operation.description, `\`${method.toUpperCase()} ${route}\` · ${auth}.`]);

  op.typeText = `${signature} ${returnType}`;
  const request = requestFields.length ? `{ ${requestFields.join(", ")} }` : "{}";
  return (
    `${doc}export function ${name}(${signature}): Promise<${returnType}> {\n` +
    `  return apiRequest<${returnType}>("${method.toUpperCase()}", ${url}, ${request}, options);\n` +
    "}\n"
  );
}

function toCamelCase(value) {
  return value
    .replace(/[^A-Za-z0-9]+(.)?/g, (_, next) => (next ? next.toUpperCase() : ""))
    .replace(/^./, (first) => first.toLowerCase());
}
