use active_win_pos_rs::get_active_window as get_window;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::AppHandle;

use crate::contract::{ActiveWindowInfo, Bounds, Owner, Platform};

pub async fn get_active_window(_app: AppHandle) -> Result<Option<ActiveWindowInfo>, String> {
    let win_opt = tauri::async_runtime::spawn_blocking(|| get_window().ok())
        .await
        .map_err(|e| format!("active-win join error: {e}"))?;

    let win = match win_opt {
        Some(w) => w,
        None => return Ok(None),
    };

    let process_path = win.process_path.clone();
    let bundle_path = app_bundle_path(&process_path);
    let bundle_id = bundle_path
        .as_deref()
        .and_then(read_bundle_identifier)
        .unwrap_or_default();
    let owner_path = bundle_path
        .as_ref()
        .map(|p| p.to_string_lossy().into_owned())
        .unwrap_or_else(|| process_path.to_string_lossy().into_owned());

    let url = match applescript_for_browser(&win.app_name, &bundle_id) {
        Some(script) => tauri::async_runtime::spawn_blocking(move || run_osascript(script))
            .await
            .ok()
            .flatten()
            .unwrap_or_default(),
        None => String::new(),
    };

    Ok(Some(ActiveWindowInfo {
        title: win.title,
        id: win.window_id.parse().unwrap_or(0),
        bounds: Bounds {
            x: win.position.x,
            y: win.position.y,
            width: win.position.width,
            height: win.position.height,
        },
        owner: Owner {
            name: win.app_name,
            process_id: win.process_id as i64,
            bundle_id,
            path: owner_path,
        },
        url,
        memory_usage: 0,
        platform: Platform::Macos,
    }))
}

fn app_bundle_path(process_path: &Path) -> Option<PathBuf> {
    for ancestor in process_path.ancestors() {
        if ancestor
            .extension()
            .and_then(|e| e.to_str())
            .map(|e| e.eq_ignore_ascii_case("app"))
            .unwrap_or(false)
        {
            return Some(ancestor.to_path_buf());
        }
    }
    None
}

fn read_bundle_identifier(bundle_path: &Path) -> Option<String> {
    let info_plist = bundle_path.join("Contents").join("Info.plist");
    let content = std::fs::read_to_string(&info_plist).ok()?;
    extract_plist_string(&content, "CFBundleIdentifier")
}

fn extract_plist_string(plist_xml: &str, key: &str) -> Option<String> {
    let key_marker = format!("<key>{key}</key>");
    let after_key = plist_xml.find(&key_marker)? + key_marker.len();
    let value_start = plist_xml[after_key..].find("<string>")? + after_key + "<string>".len();
    let value_end = plist_xml[value_start..].find("</string>")? + value_start;
    Some(plist_xml[value_start..value_end].trim().to_string())
}

fn applescript_for_browser(app_name: &str, bundle_id: &str) -> Option<&'static str> {
    let name = app_name.to_lowercase();
    let bundle = bundle_id.to_lowercase();

    if bundle == "com.apple.safari" || bundle == "com.apple.safaritechnologypreview" {
        return Some("tell application \"Safari\" to return URL of front document");
    }
    if bundle.starts_with("com.google.chrome") || name == "google chrome" {
        return Some(
            "tell application \"Google Chrome\" to return URL of active tab of front window",
        );
    }
    if bundle.starts_with("com.brave.browser") || name.contains("brave") {
        return Some(
            "tell application \"Brave Browser\" to return URL of active tab of front window",
        );
    }
    if bundle.starts_with("com.microsoft.edgemac") || name.contains("microsoft edge") {
        return Some(
            "tell application \"Microsoft Edge\" to return URL of active tab of front window",
        );
    }
    if bundle.starts_with("com.vivaldi.vivaldi") || name.contains("vivaldi") {
        return Some("tell application \"Vivaldi\" to return URL of active tab of front window");
    }
    if bundle.starts_with("com.operasoftware.opera") || name == "opera" {
        return Some("tell application \"Opera\" to return URL of active tab of front window");
    }
    if bundle == "company.thebrowser.browser" || name == "arc" {
        return Some("tell application \"Arc\" to return URL of active tab of front window");
    }

    None
}

fn run_osascript(script: &'static str) -> Option<String> {
    let output = Command::new("/usr/bin/osascript")
        .arg("-e")
        .arg(script)
        .output()
        .ok()?;
    if !output.status.success() {
        return None;
    }
    let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if stdout.is_empty() {
        None
    } else {
        Some(stdout)
    }
}
