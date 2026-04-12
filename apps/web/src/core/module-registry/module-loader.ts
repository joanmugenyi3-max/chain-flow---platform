// ─────────────────────────────────────────────────────────────────────────────
// Module Loader — Self-Registration Engine
// Modules call registerModule() to declare themselves at startup.
// The UI/logic never hardcodes module lists — they query this registry.
// ─────────────────────────────────────────────────────────────────────────────

import type { ModuleManifest, ModuleRegistryMap } from './types';

// ── In-memory registry ────────────────────────────────────────────────────────

const _registry: ModuleRegistryMap = new Map<string, ModuleManifest>();
let _sealed = false;

// ── Registration API ──────────────────────────────────────────────────────────

/**
 * Register a module manifest.
 * Safe to call multiple times with the same id — subsequent calls are no-ops
 * (to support HMR without duplicates).
 *
 * Throws if the registry has been sealed (after `sealRegistry()` is called).
 */
export function registerModule(manifest: ModuleManifest): void {
  if (_sealed) {
    throw new Error(
      `[ModuleLoader] Registry is sealed — cannot register "${manifest.id}" after startup.`
    );
  }
  if (_registry.has(manifest.id)) return; // idempotent
  _registry.set(manifest.id, manifest);
}

/**
 * Remove a module from the registry.
 * Intended for use in tests and dev tooling only.
 */
export function unregisterModule(id: string): void {
  _registry.delete(id);
}

/**
 * Seal the registry to prevent further registrations.
 * Call once all modules have been bootstrapped at app startup.
 */
export function sealRegistry(): void {
  _sealed = true;
}

export function isSealed(): boolean {
  return _sealed;
}

/** Reset registry — test use only */
export function _resetRegistry(): void {
  _registry.clear();
  _sealed = false;
}

// ── Query API ─────────────────────────────────────────────────────────────────

/** All registered manifests, sorted by navOrder */
export function getRegisteredModules(): ModuleManifest[] {
  return Array.from(_registry.values()).sort((a, b) => a.navOrder - b.navOrder);
}

/** Single manifest by id */
export function getRegisteredModule(id: string): ModuleManifest | undefined {
  return _registry.get(id);
}

/** Whether a module id is registered */
export function isModuleRegistered(id: string): boolean {
  return _registry.has(id);
}

/** Snapshot of the live registry as a plain Map (do not mutate) */
export function getRegistrySnapshot(): ReadonlyMap<string, ModuleManifest> {
  return _registry;
}

// ── Bulk bootstrap ────────────────────────────────────────────────────────────

/**
 * Register multiple manifests at once.
 * Used by the central registry.ts to self-register all known modules at startup.
 *
 * @param manifests - Array of module manifests to register
 * @param seal      - If true, seal the registry after registration (default: false)
 */
export function bootstrapModules(manifests: ModuleManifest[], seal = false): void {
  for (const m of manifests) {
    registerModule(m);
  }
  if (seal) sealRegistry();
}
