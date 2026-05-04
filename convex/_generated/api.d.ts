/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as debug from "../debug.js";
import type * as export_ from "../export.js";
import type * as followUps from "../followUps.js";
import type * as http from "../http.js";
import type * as leads from "../leads.js";
import type * as notes from "../notes.js";
import type * as pipelineMetrics from "../pipelineMetrics.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  analytics: typeof analytics;
  auth: typeof auth;
  debug: typeof debug;
  export: typeof export_;
  followUps: typeof followUps;
  http: typeof http;
  leads: typeof leads;
  notes: typeof notes;
  pipelineMetrics: typeof pipelineMetrics;
  seed: typeof seed;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
