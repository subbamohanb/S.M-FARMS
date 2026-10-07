# S.M FARMS Expo and EAS setup

This directory is a separate Expo mobile app configuration for the S.M FARMS storefront. It is independent from the existing React/Vite web app in the parent directory.

## Configuration created

The app is identified as `S.M FARMS`, with Expo slug `sm-farms` and Android application ID `com.smfarms.store`. The `eas.json` file contains a `preview` profile that builds an installable Android APK using `distribution: internal` and `android.buildType: apk`. The `production` profile is configured for an Android App Bundle (`.aab`) rather than an APK.

## Exact setup steps

Run these commands from the mobile directory:

```bash
cd /home/ubuntu/sm-farms-store/mobile
```

Install dependencies and verify the Expo configuration:

```bash
pnpm install
pnpm exec expo config --type public --json
pnpm exec tsc --noEmit
```

Authenticate with the Expo account that should own the EAS project. This is the one step that requires the user’s Expo credentials and must be completed interactively or with a securely supplied token:

```bash
npx eas-cli@latest login
npx eas-cli@latest whoami
```

Initialize EAS for this app. When prompted, select the authenticated Expo account and allow EAS to create a new project. Do not reuse another app’s project unless the Android package identifier is intentionally shared:

```bash
npx eas-cli@latest init
```

EAS will add the project linkage, normally under `extra.eas.projectId` in the Expo configuration. Review the generated change before committing it.

Build the installable preview APK:

```bash
npx eas-cli@latest build --platform android --profile preview
```

When the build finishes, EAS prints an APK URL. Open that URL on an Android device, or download the APK to a computer and transfer it to the device. Android may require permission to install apps from the browser or file manager used to open the APK.

For a production Play Store artifact, use:

```bash
npx eas-cli@latest build --platform android --profile production
```

That command produces an Android App Bundle, which is the normal Google Play submission format. It does not produce the directly installable preview APK.

## Important security notes

Never commit an Expo access token, Android keystore, service-account key, or other credentials to this repository. If non-interactive CI is needed, create an Expo token in the Expo account and provide it through the CI secret store as `EXPO_TOKEN`; do not place it in `.env`, source files, or `eas.json`.

The preview profile is intended for internal testing. Before production distribution, confirm the final application ID, app signing ownership, privacy policy, notification permissions, and store metadata in the Expo account and Google Play Console.

## Local Android APK build without Expo EAS

This project uses `app.config.ts` as its Expo configuration; an `app.json` file is intentionally not required. Do not maintain conflicting values in both files. The Android package, app name, icon, splash screen, and permissions are defined in `app.config.ts`, while build profiles are defined in `eas.json`.

A local APK can be produced without EAS when the machine has a compatible JDK, Android SDK, Android build tools, and Gradle access. Expo's prebuild step generates the native Android project locally:

```bash
cd /home/ubuntu/sm-farms-store/mobile
pnpm install
pnpm exec expo prebuild --platform android --clean
cd android
./gradlew assembleRelease
```

The resulting APK is normally located at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

For a debug APK suitable only for development, use:

```bash
cd /home/ubuntu/sm-farms-store/mobile
pnpm exec expo prebuild --platform android
cd android
./gradlew assembleDebug
```

The debug output is normally located at `android/app/build/outputs/apk/debug/app-debug.apk`.

If the Android SDK is not configured, set `ANDROID_HOME` or `ANDROID_SDK_ROOT` to the SDK directory and ensure the required platform and build-tools packages are installed. A release APK generated locally must also be signed with a release keystore before distribution. Never commit the keystore or its passwords. For a quick local device test, the debug APK avoids release-signing setup, but it is not appropriate for production distribution.

The local build path is separate from EAS: it does not require an Expo account, EAS project ID, or Expo token, but it does require the native Android toolchain on the build machine. The current sandbox has not been verified to contain the Android SDK or a configured release keystore, so the commands above are the correct reproducible procedure rather than a claim that a local APK has already been produced here.

## Local release signing setup

A local PKCS#12 keystore has been generated at `credentials/sm-farms-release.jks` with alias `smfarms_release`. Its password is stored only in the protected file `credentials/sm-farms-signing.properties`; it is intentionally not printed or committed. The Android Gradle project reads these values through `android/app/build.gradle` and uses the `releaseLocal` signing configuration for the `release` build type.

The signing files are ignored by Git. Back up the keystore and its password file together in a secure password manager or encrypted storage. Losing either the keystore or its password prevents updates from being signed with the same identity. Never upload either file to a public repository or paste its contents into chat.

If `android/` is regenerated by Expo prebuild, recreate the local signing setup with:

```bash
cd /home/ubuntu/sm-farms-store/mobile
pnpm exec expo prebuild --platform android --no-install
node scripts/setup-local-signing.mjs
```

Then build the signed release APK:

```bash
cd /home/ubuntu/sm-farms-store/mobile
./android/gradlew -p android assembleRelease --no-daemon
```

The expected output is `android/app/build/outputs/apk/release/app-release.apk`. The current sandbox generated and validated the keystore metadata and configured Gradle, but the Gradle signing-report process was terminated unexpectedly under resource pressure; rerun the build on a machine with a complete Android SDK and sufficient memory.

### Keystore rotation guidance

Treat the keystore as the long-term identity of this Android application. Do not rotate it merely because a new release is being built. An APK signed with a different key generally cannot update an already-installed application signed with the original key; users may need to uninstall the old app, and a Play-distributed app can become unupdatable unless the supported Play App Signing key-upgrade process is used.

Rotation is appropriate only when the original key is compromised, irretrievably lost, or a controlled Play App Signing upgrade is planned. Before rotating, make an encrypted backup of the current keystore and password, record its alias and certificate fingerprint, and confirm the distribution channel’s key-rotation procedure. Generate the replacement with `node scripts/setup-local-signing.mjs` after moving the old files to secure archival storage, then update the local signing references and verify the new certificate fingerprint with `keytool -list -v`. Do not delete the old key until all existing installations and release/update requirements have been assessed.

For a standalone APK shared outside Google Play, a new signing key requires users to remove the old installation before installing the new APK. For a Google Play app using Play App Signing, follow Google’s key-upgrade workflow rather than replacing local upload credentials arbitrarily. The practical default is therefore to keep the generated keystore unchanged, maintain encrypted backups, and rotate only as part of a documented incident or store-supported migration.
