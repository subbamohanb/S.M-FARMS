import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const credentialsDir = resolve(root, "credentials");
const keystorePath = resolve(credentialsDir, "sm-farms-release.jks");
const propertiesPath = resolve(credentialsDir, "sm-farms-signing.properties");
const gradlePath = resolve(root, "android/app/build.gradle");

if (!existsSync(resolve(root, "android"))) {
  throw new Error("android/ is missing. Run: pnpm exec expo prebuild --platform android --no-install");
}
if (existsSync(keystorePath) || existsSync(propertiesPath)) {
  throw new Error("Signing files already exist. Back them up before replacing them.");
}

mkdirSync(credentialsDir, { recursive: true, mode: 0o700 });
const password = randomBytes(32).toString("hex");
const keytool = spawnSync("keytool", [
  "-genkeypair",
  "-keystore", keystorePath,
  "-storetype", "PKCS12",
  "-alias", "smfarms_release",
  "-keyalg", "RSA",
  "-keysize", "4096",
  "-validity", "10000",
  "-storepass", password,
  "-keypass", password,
  "-dname", "CN=S.M FARMS, OU=Mobile, O=S.M FARMS, L=India, ST=Telangana, C=IN",
], { stdio: "inherit" });
if (keytool.status !== 0) throw new Error("keytool failed to generate the keystore");

writeFileSync(propertiesPath, `SM_FARMS_KEYSTORE_PASSWORD=${password}\nSM_FARMS_KEY_PASSWORD=${password}\n`, { mode: 0o600 });
chmodSync(keystorePath, 0o600);

let gradle = readFileSync(gradlePath, "utf8");
if (!gradle.includes("sm-farms-signing.properties")) {
  gradle = gradle.replace(
    "def enableMinifyInReleaseBuilds = (findProperty('android.enableMinifyInReleaseBuilds') ?: false).toBoolean()",
    `def enableMinifyInReleaseBuilds = (findProperty('android.enableMinifyInReleaseBuilds') ?: false).toBoolean()\n\ndef localSigningPropertiesFile = rootProject.file("../credentials/sm-farms-signing.properties")\ndef localSigningProperties = new Properties()\nif (localSigningPropertiesFile.exists()) {\n    localSigningPropertiesFile.withInputStream { localSigningProperties.load(it) }\n}\ndef localKeystoreFile = rootProject.file("../credentials/sm-farms-release.jks")`,
  );
  gradle = gradle.replace(
    `        debug {\n            storeFile file('debug.keystore')\n            storePassword 'android'\n            keyAlias 'androiddebugkey'\n            keyPassword 'android'\n        }\n    }`,
    `        debug {\n            storeFile file('debug.keystore')\n            storePassword 'android'\n            keyAlias 'androiddebugkey'\n            keyPassword 'android'\n        }\n        releaseLocal {\n            if (!localKeystoreFile.exists() || !localSigningPropertiesFile.exists()) {\n                throw new GradleException("Missing local release signing files. Run setup-local-signing.mjs.")\n            }\n            storeFile localKeystoreFile\n            storePassword localSigningProperties.getProperty('SM_FARMS_KEYSTORE_PASSWORD')\n            keyAlias 'smfarms_release'\n            keyPassword localSigningProperties.getProperty('SM_FARMS_KEY_PASSWORD')\n        }\n    }`,
  );
  gradle = gradle.replace("signingConfig signingConfigs.debug\n            def enableShrinkResources", "signingConfig signingConfigs.releaseLocal\n            def enableShrinkResources");
  writeFileSync(gradlePath, gradle);
}

console.log(`Created ${keystorePath}`);
console.log(`Created protected signing properties at ${propertiesPath}`);
console.log("Keep both files backed up securely; the password is intentionally not printed.");
