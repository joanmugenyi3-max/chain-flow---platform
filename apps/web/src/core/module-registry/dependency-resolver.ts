// ─────────────────────────────────────────────────────────────────────────────
// Dependency Resolver
// Validates and resolves module dependency trees.
// ─────────────────────────────────────────────────────────────────────────────

import type { ModuleManifest, ModuleRegistryMap } from './types';

export interface DependencyValidationResult {
  valid: boolean;
  /** IDs of dependencies that are declared in the manifest but not registered */
  missingFromRegistry: string[];
  /** IDs of dependencies that are registered but not currently enabled for this tenant */
  notEnabled: string[];
}

export interface TopologicalSortResult {
  /** Modules in dependency-safe activation order (deps first) */
  sorted: string[];
  /** Detected cycles (non-empty means there is a cycle) */
  cycles: string[][];
}

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Validate that all declared dependencies of `moduleId` exist in the registry
 * and are included in the tenant's enabled set.
 */
export function validateDependencies(
  moduleId: string,
  registry: ModuleRegistryMap,
  enabledIds: Set<string>
): DependencyValidationResult {
  const manifest = registry.get(moduleId);
  if (!manifest) {
    return { valid: false, missingFromRegistry: [moduleId], notEnabled: [] };
  }

  const missingFromRegistry: string[] = [];
  const notEnabled: string[] = [];

  for (const dep of manifest.dependencies) {
    if (!registry.has(dep)) {
      missingFromRegistry.push(dep);
    } else if (!enabledIds.has(dep)) {
      notEnabled.push(dep);
    }
  }

  return {
    valid: missingFromRegistry.length === 0 && notEnabled.length === 0,
    missingFromRegistry,
    notEnabled,
  };
}

// ── Full dependency tree ──────────────────────────────────────────────────────

/**
 * Recursively collect all transitive dependencies of `moduleId`.
 * Returns a flat Set of all required module IDs (not including `moduleId` itself).
 */
export function resolveDependencies(
  moduleId: string,
  registry: ModuleRegistryMap,
  visited = new Set<string>()
): Set<string> {
  if (visited.has(moduleId)) return visited;
  visited.add(moduleId);

  const manifest = registry.get(moduleId);
  if (!manifest) return visited;

  for (const dep of manifest.dependencies) {
    resolveDependencies(dep, registry, visited);
  }

  visited.delete(moduleId); // return only deps, not self
  return visited;
}

/**
 * Get the full ordered activation list for a set of module IDs.
 * Returns them in topological order (deps before dependents).
 */
export function getActivationOrder(
  moduleIds: string[],
  registry: ModuleRegistryMap
): TopologicalSortResult {
  const sorted: string[] = [];
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(id: string, path: string[]): void {
    if (inStack.has(id)) {
      const cycleStart = path.indexOf(id);
      cycles.push(path.slice(cycleStart));
      return;
    }
    if (visited.has(id)) return;

    inStack.add(id);
    const manifest = registry.get(id);
    if (manifest) {
      for (const dep of manifest.dependencies) {
        dfs(dep, [...path, dep]);
      }
    }
    inStack.delete(id);
    visited.add(id);
    sorted.push(id);
  }

  for (const id of moduleIds) {
    dfs(id, [id]);
  }

  return { sorted, cycles };
}

// ── Reverse dependency lookup ─────────────────────────────────────────────────

/**
 * Find all modules that directly depend on `moduleId`.
 * Used when deactivating a module to warn about dependents that will break.
 */
export function getDirectDependents(
  moduleId: string,
  registry: ModuleRegistryMap
): ModuleManifest[] {
  return Array.from(registry.values()).filter(m =>
    m.dependencies.includes(moduleId)
  );
}

/**
 * Find all modules (direct + transitive) that would break if `moduleId` is disabled.
 */
export function getAllDependents(
  moduleId: string,
  registry: ModuleRegistryMap
): string[] {
  const result = new Set<string>();

  function collectDependents(id: string): void {
    for (const manifest of registry.values()) {
      if (manifest.id !== id && manifest.dependencies.includes(id) && !result.has(manifest.id)) {
        result.add(manifest.id);
        collectDependents(manifest.id);
      }
    }
  }

  collectDependents(moduleId);
  return Array.from(result);
}

// ── Plan gate check ───────────────────────────────────────────────────────────

/**
 * Given a list of module IDs and an enabled set, return those that are
 * missing their dependencies (for UI warnings).
 */
export function findModulesWithMissingDeps(
  enabledIds: string[],
  registry: ModuleRegistryMap
): Array<{ moduleId: string; missingDeps: string[] }> {
  const enabledSet = new Set(enabledIds);
  const results: Array<{ moduleId: string; missingDeps: string[] }> = [];

  for (const id of enabledIds) {
    const manifest = registry.get(id);
    if (!manifest) continue;

    const missingDeps = manifest.dependencies.filter(dep => !enabledSet.has(dep));
    if (missingDeps.length > 0) {
      results.push({ moduleId: id, missingDeps });
    }
  }

  return results;
}
