use std::fs;
use std::path::PathBuf;

use serde_json::Value;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

const STORE_FILE: &str = "appSettings.json";
const STORE_KEY: &str = "app-settings";
const BACKUP_SUFFIX: &str = ".bak";

pub fn run_legacy_migration(app: &AppHandle) {
    let legacy_path = match legacy_settings_path() {
        Some(p) => p,
        None => return,
    };

    let backup_path = legacy_path.with_extension("json.bak");
    if backup_path.exists() {
        log::info!("legacy migration: already done (backup exists at {:?})", backup_path);
        return;
    }
    if !legacy_path.exists() {
        log::info!("legacy migration: no legacy file at {:?}, skipping", legacy_path);
        return;
    }

    let raw = match fs::read_to_string(&legacy_path) {
        Ok(s) => s,
        Err(e) => {
            log::warn!("legacy migration: read failed: {e}");
            return;
        }
    };

    let mut value: Value = match serde_json::from_str(&raw) {
        Ok(v) => v,
        Err(e) => {
            log::warn!("legacy migration: parse failed, keeping legacy file: {e}");
            return;
        }
    };

    if !validate_shape(&value) {
        log::warn!("legacy migration: required fields missing, keeping legacy file");
        return;
    }

    if let Some(obj) = value.as_object_mut() {
        obj.remove("windowPosition");
    }

    let store = match app.store(STORE_FILE) {
        Ok(s) => s,
        Err(e) => {
            log::warn!("legacy migration: store init failed: {e}");
            return;
        }
    };

    store.set(STORE_KEY, value);
    if let Err(e) = store.save() {
        log::warn!("legacy migration: store save failed: {e}");
        return;
    }

    let bak_name = format!(
        "{}{}",
        legacy_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("appSettings.json"),
        BACKUP_SUFFIX
    );
    let bak = legacy_path.with_file_name(bak_name);
    if let Err(e) = fs::rename(&legacy_path, &bak) {
        log::warn!("legacy migration: rename to backup failed: {e}");
        return;
    }

    log::info!("legacy migration: completed, backup at {:?}", bak);
}

fn validate_shape(v: &Value) -> bool {
    let obj = match v.as_object() {
        Some(o) => o,
        None => return false,
    };
    ["version", "autoTracking", "windowOptions", "sqlLiteConfig", "syncConfig"]
        .iter()
        .all(|k| obj.contains_key(*k))
}

#[cfg(target_os = "macos")]
fn legacy_settings_path() -> Option<PathBuf> {
    let home = std::env::var_os("HOME")?;
    Some(
        PathBuf::from(home)
            .join("Library/Application Support/TimeTrack/appSettings.json"),
    )
}

#[cfg(target_os = "windows")]
fn legacy_settings_path() -> Option<PathBuf> {
    let appdata = std::env::var_os("APPDATA")?;
    Some(PathBuf::from(appdata).join("TimeTrack").join("appSettings.json"))
}

#[cfg(target_os = "linux")]
fn legacy_settings_path() -> Option<PathBuf> {
    let home = std::env::var_os("HOME")?;
    Some(
        PathBuf::from(home)
            .join(".config/TimeTrack/appSettings.json"),
    )
}

#[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
fn legacy_settings_path() -> Option<PathBuf> {
    None
}
