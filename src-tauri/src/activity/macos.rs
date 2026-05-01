use serde_json::Value;
use tauri::AppHandle;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

use crate::contract::{ActiveWindowInfo, Bounds, Owner, Platform};

pub async fn get_active_window(app: AppHandle) -> Result<Option<ActiveWindowInfo>, String> {
    let sidecar = app
        .shell()
        .sidecar("timesapp-mac-active-win")
        .map_err(|e| format!("sidecar lookup failed: {e}"))?;

    let (mut rx, _child) = sidecar
        .spawn()
        .map_err(|e| format!("sidecar spawn failed: {e}"))?;

    let mut stdout = String::new();
    let mut stderr = String::new();
    let mut exit_code: Option<i32> = None;
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line) => stdout.push_str(&String::from_utf8_lossy(&line)),
            CommandEvent::Stderr(line) => stderr.push_str(&String::from_utf8_lossy(&line)),
            CommandEvent::Terminated(payload) => {
                exit_code = payload.code;
                break;
            }
            _ => {}
        }
    }

    let trimmed = stdout.trim();
    if trimmed.is_empty() || trimmed == "null" {
        if exit_code.unwrap_or(0) != 0 || !stderr.trim().is_empty() {
            return Err(format!(
                "sidecar exited with code {:?}; stderr={:?}",
                exit_code,
                stderr.trim()
            ));
        }
        return Ok(None);
    }

    let v: Value = serde_json::from_str(trimmed).map_err(|e| {
        format!(
            "sidecar JSON invalid: {e}; exit={:?}; stdout={:?}; stderr={:?}",
            exit_code,
            trimmed,
            stderr.trim()
        )
    })?;
    parse_value(&v).map(Some)
}

fn parse_value(v: &Value) -> Result<ActiveWindowInfo, String> {
    let bounds = v
        .get("bounds")
        .ok_or_else(|| "missing bounds".to_string())?;
    let owner = v.get("owner").ok_or_else(|| "missing owner".to_string())?;

    Ok(ActiveWindowInfo {
        title: v
            .get("title")
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string(),
        id: v.get("id").and_then(Value::as_i64).unwrap_or(0),
        bounds: Bounds {
            x: bounds.get("x").and_then(Value::as_f64).unwrap_or(0.0),
            y: bounds.get("y").and_then(Value::as_f64).unwrap_or(0.0),
            width: bounds.get("width").and_then(Value::as_f64).unwrap_or(0.0),
            height: bounds.get("height").and_then(Value::as_f64).unwrap_or(0.0),
        },
        owner: Owner {
            name: owner
                .get("name")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string(),
            process_id: owner.get("processId").and_then(Value::as_i64).unwrap_or(0),
            bundle_id: owner
                .get("bundleId")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string(),
            path: owner
                .get("path")
                .and_then(Value::as_str)
                .unwrap_or("")
                .to_string(),
        },
        url: v
            .get("url")
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_string(),
        memory_usage: v
            .get("memoryUsage")
            .and_then(Value::as_u64)
            .unwrap_or(0),
        platform: Platform::Macos,
    })
}
