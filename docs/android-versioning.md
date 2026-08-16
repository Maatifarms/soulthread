# SoulGuide Android Versioning Scheme

This document defines the versioning convention for the SoulGuide Android application (`in.soulthread.guide`).

## Versioning Structure

Every Android release is defined by two distinct values in the app's `build.gradle` configuration:

### 1. `versionName` (Human-Readable Release Version)
* **Format**: Semantic Versioning (`MAJOR.MINOR.PATCH`)
* **Usage**: The version displayed to users in the app settings, on the Play Store, or on local builds.
* **Rules**:
  * **MAJOR**: Incremented for breaking database changes, massive UI updates, or platform rebuilds.
  * **MINOR**: Incremented for new feature iterations or major improvements.
  * **PATCH**: Incremented for bug fixes and minor optimizations.
* **Current Version**: `"1.1.0"`

### 2. `versionCode` (Monotonically Increasing Build Number)
* **Format**: A single positive integer (`INTEGER`)
* **Usage**: Used by Google Play Console and the Android OS to determine upgrade precedence. An APK/AAB with a higher `versionCode` can upgrade an installed version with a lower code.
* **Rules**:
  * Must be incremented by exactly `1` for every single release build.
  * Must never decrease or be reused.
* **Current Code**: `2`

## Next Release Execution Table (Examples)

| Release Type | Current Version | Current Code | Target Version | Target Code |
| :--- | :--- | :--- | :--- | :--- |
| Patch Build | `1.1.0` | `2` | `1.1.1` | `3` |
| Minor Build | `1.1.0` | `2` | `1.2.0` | `3` |
| Major Build | `1.1.0` | `2` | `2.0.0` | `3` |
