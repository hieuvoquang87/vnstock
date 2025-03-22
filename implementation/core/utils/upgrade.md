# Upgrade Utilities

**Original Python Implementation**: [vnstock/core/utils/upgrade.py](/vnstock/core/utils/upgrade.py)

## Overview

The Upgrade Utilities module provides functionality for managing version upgrades and migrations in the vnstock library. It helps ensure smooth transitions between library versions by handling any necessary data migrations, configuration changes, or API adaptations.

## Purpose

The Upgrade Utilities module serves several key purposes:

1. **Version Detection**: Identifies current and target versions
2. **Data Migration**: Migrates data structures between versions
3. **Configuration Updates**: Adjusts configuration for compatibility with new versions
4. **Deprecation Handling**: Provides warnings for deprecated features
5. **Breaking Change Notification**: Alerts users to breaking changes

## Key Components

### Version Management

```typescript
/**
 * Check if an upgrade is needed
 * @param currentVersion Current library version
 * @returns Whether an upgrade is needed
 */
export function isUpgradeNeeded(currentVersion: string): boolean {
  const latestVersion = getLatestVersion();
  return compareVersions(currentVersion, latestVersion) < 0;
}

/**
 * Get the upgrade path between versions
 * @param fromVersion Starting version
 * @param toVersion Target version (defaults to latest)
 * @returns Array of version steps to apply in order
 */
export function getUpgradePath(
  fromVersion: string,
  toVersion?: string
): string[] {
  // Implementation details omitted for brevity
  return [];
}
```

### Migration Utilities

```typescript
/**
 * Apply upgrades from one version to another
 * @param currentConfig Current configuration object
 * @param fromVersion Current version
 * @param toVersion Target version (defaults to latest)
 * @returns Updated configuration object
 */
export function migrateConfig(
  currentConfig: VNStockConfig,
  fromVersion: string,
  toVersion?: string
): VNStockConfig {
  const upgradePath = getUpgradePath(fromVersion, toVersion);

  // Apply each migration step in sequence
  let config = { ...currentConfig };

  for (const version of upgradePath) {
    config = applyMigration(config, version);
  }

  return config;
}
```

## Usage Examples

### Checking for Updates

```typescript
import { isUpgradeNeeded } from 'vnstock/core/utils/upgrade';

// Check if the current version needs an upgrade
const needsUpgrade = isUpgradeNeeded('1.2.0');

if (needsUpgrade) {
  console.log('An upgrade is available for vnstock');
}
```

### Migrating Configuration

```typescript
import { migrateConfig } from 'vnstock/core/utils/upgrade';

// Current configuration and version
const currentConfig = {
  /* ... */
};
const currentVersion = '1.2.0';

// Migrate to the latest version
const updatedConfig = migrateConfig(currentConfig, currentVersion);

// Use the updated configuration
initialize(updatedConfig);
```

## Implementation Notes

When using the Upgrade Utilities:

1. Check for updates when initializing your application
2. Apply migrations when upgrading to a new library version
3. Review deprecated feature warnings to prepare for future updates
4. Test your application after migrations to ensure compatibility

# Upgrade Utilities Implementation

## Overview

The Upgrade Utilities module provides functionality for managing version upgrades and migrations in the vnstock library. It ensures smooth transitions between library versions by handling data migrations, configuration changes, and API adaptations. This module is essential for maintaining backward compatibility and enabling users to upgrade to new versions without disrupting their existing applications.

## Purpose

The Upgrade Utilities module serves several key purposes:

1. **Version Detection**: Identifies current and target versions of the library
2. **Data Migration**: Migrates data structures between versions
3. **Configuration Updates**: Adjusts configuration settings for compatibility with new versions
4. **Deprecation Handling**: Provides warnings for deprecated features
5. **Breaking Change Notification**: Alerts users to breaking changes that require attention

## TypeScript Implementation

The Upgrade Utilities module consists of functions for managing version upgrades and migrations. Here's how the key components can be implemented in TypeScript:

### Version Comparison Functions

```typescript
/**
 * Represents a semantic version with major, minor, and patch components
 */
export interface Version {
  major: number;
  minor: number;
  patch: number;
}

/**
 * Parses a version string into a Version object
 * @param versionStr Version string in format "x.y.z"
 * @returns Parsed Version object
 */
export function parseVersion(versionStr: string): Version {
  const parts = versionStr.split('.').map((part) => parseInt(part, 10));
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

/**
 * Compares two versions
 * @param v1 First version
 * @param v2 Second version
 * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: Version, v2: Version): -1 | 0 | 1 {
  if (v1.major !== v2.major) {
    return v1.major < v2.major ? -1 : 1;
  }
  if (v1.minor !== v2.minor) {
    return v1.minor < v2.minor ? -1 : 1;
  }
  if (v1.patch !== v2.patch) {
    return v1.patch < v2.patch ? -1 : 1;
  }
  return 0;
}
```

### Upgrade Detection and Path

```typescript
/**
 * Upgrade information for a specific version
 */
export interface UpgradeInfo {
  /** Version that this upgrade applies to */
  fromVersion: string;
  /** Target version after the upgrade */
  toVersion: string;
  /** Whether this upgrade contains breaking changes */
  hasBreakingChanges: boolean;
  /** Features deprecated in this upgrade */
  deprecations: string[];
  /** Description of the upgrade */
  description: string;
}

/**
 * Checks if an upgrade is needed between the current and target versions
 * @param currentVersion Current version string
 * @param targetVersion Target version string
 * @returns True if upgrade is needed, false otherwise
 */
export function isUpgradeNeeded(
  currentVersion: string,
  targetVersion: string
): boolean {
  const current = parseVersion(currentVersion);
  const target = parseVersion(targetVersion);
  return compareVersions(current, target) === -1;
}

/**
 * Gets the upgrade path between two versions
 * @param currentVersion Current version string
 * @param targetVersion Target version string
 * @returns Array of upgrade steps to perform
 */
export function getUpgradePath(
  currentVersion: string,
  targetVersion: string
): UpgradeInfo[] {
  if (!isUpgradeNeeded(currentVersion, targetVersion)) {
    return [];
  }

  // Get all available upgrades
  const allUpgrades = getAvailableUpgrades();

  // Filter upgrades that apply between the current and target versions
  return allUpgrades
    .filter((upgrade) => {
      const from = parseVersion(upgrade.fromVersion);
      const to = parseVersion(upgrade.toVersion);
      const current = parseVersion(currentVersion);
      const target = parseVersion(targetVersion);

      // Include upgrade if it's after current version and before or equal to target version
      return (
        compareVersions(current, from) <= 0 && compareVersions(to, target) <= 0
      );
    })
    .sort((a, b) => {
      // Sort by fromVersion
      const fromA = parseVersion(a.fromVersion);
      const fromB = parseVersion(b.fromVersion);
      return compareVersions(fromA, fromB);
    });
}
```

### Migration Function

```typescript
/**
 * Configuration migration function
 */
export type MigrationFunction = (config: any) => any;

/**
 * Migration registry mapping versions to migration functions
 */
const migrations: Record<string, MigrationFunction> = {
  '1.0.0': migrateFrom1_0_0To1_1_0,
  '1.1.0': migrateFrom1_1_0To1_2_0,
  '1.2.0': migrateFrom1_2_0To2_0_0,
  '2.0.0': migrateFrom2_0_0To2_1_0,
};

/**
 * Migrates configuration from one version to another
 * @param config Configuration object to migrate
 * @param fromVersion Starting version
 * @param toVersion Target version
 * @returns Migrated configuration object
 */
export function migrateConfig(
  config: any,
  fromVersion: string,
  toVersion: string
): any {
  if (!isUpgradeNeeded(fromVersion, toVersion)) {
    return config;
  }

  // Get the upgrade path
  const upgradePath = getUpgradePath(fromVersion, toVersion);
  let migratedConfig = { ...config };

  // Apply each migration in sequence
  for (const upgrade of upgradePath) {
    const migrationFn = migrations[upgrade.fromVersion];
    if (migrationFn) {
      migratedConfig = migrationFn(migratedConfig);
      console.log(
        `Migrated config from ${upgrade.fromVersion} to ${upgrade.toVersion}`
      );
    }
  }

  return migratedConfig;
}

/**
 * Example migration function from v1.0.0 to v1.1.0
 */
function migrateFrom1_0_0To1_1_0(config: any): any {
  // Example: rename a config property
  const newConfig = { ...config };
  if (newConfig.oldApiKey) {
    newConfig.apiKey = newConfig.oldApiKey;
    delete newConfig.oldApiKey;
  }

  // Example: transform a data structure
  if (newConfig.dataSources?.vci?.options) {
    newConfig.dataSources.vci.settings = {
      ...newConfig.dataSources.vci.options,
      updatedFormat: true,
    };
    delete newConfig.dataSources.vci.options;
  }

  return newConfig;
}
```

## Usage Examples

### Checking for Required Upgrades

```typescript
import { isUpgradeNeeded, getUpgradePath } from 'vnstock/core/utils/upgrade';

// Check if upgrade is needed
const currentVersion = '1.0.0';
const latestVersion = '2.0.0';

if (isUpgradeNeeded(currentVersion, latestVersion)) {
  console.log('An upgrade is needed!');

  // Get the upgrade path
  const upgradePath = getUpgradePath(currentVersion, latestVersion);

  console.log(`Need to perform ${upgradePath.length} upgrade steps:`);
  for (const step of upgradePath) {
    console.log(`From ${step.fromVersion} to ${step.toVersion}`);
    console.log(`Description: ${step.description}`);
    if (step.hasBreakingChanges) {
      console.log('WARNING: This upgrade contains breaking changes!');
    }
    if (step.deprecations.length > 0) {
      console.log('Deprecated features:');
      step.deprecations.forEach((dep) => console.log(`- ${dep}`));
    }
  }
}
```

### Migrating Configuration

```typescript
import { migrateConfig } from 'vnstock/core/utils/upgrade';

// Example old configuration
const oldConfig = {
  oldApiKey: 'abc123',
  dataSources: {
    vci: {
      enabled: true,
      options: {
        timeout: 5000,
        retries: 3,
      },
    },
  },
};

// Migrate configuration from version 1.0.0 to 2.0.0
const newConfig = migrateConfig(oldConfig, '1.0.0', '2.0.0');

console.log('Migrated configuration:');
console.log(newConfig);
```

## Implementation Notes

- Always maintain backward compatibility where possible
- Provide clear warnings and guidance when breaking changes are introduced
- Consider using semantic versioning to clearly indicate when breaking changes occur
- Store version information in a consistent location (e.g., package.json for Node.js)
- Document all migrations thoroughly, especially for major version changes
- Consider adding a simulation mode that shows what would be changed without actually applying changes
- Add comprehensive logging during migrations to help debug issues
