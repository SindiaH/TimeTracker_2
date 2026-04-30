use active_win_pos_rs::get_active_window as get_window;
use tauri::AppHandle;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

use crate::contract::{ActiveWindowInfo, Bounds, Owner, Platform};

pub async fn get_active_window(app: AppHandle) -> Result<Option<ActiveWindowInfo>, String> {
    let win = match get_window() {
        Ok(w) => w,
        Err(_) => return Ok(None),
    };

    let process_name = win.process_name.to_lowercase();
    let url = if is_browser(&process_name) {
        get_browser_url(&app, win.process_id as u32)
            .await
            .unwrap_or_default()
    } else {
        String::new()
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
            bundle_id: String::new(),
            path: win.process_path.to_string_lossy().into_owned(),
        },
        url,
        memory_usage: 0,
        platform: Platform::Win32,
    }))
}

fn is_browser(process_name: &str) -> bool {
    let n = process_name;
    n.contains("chrome") || n.contains("firefox") || n.contains("edge")
}

async fn get_browser_url(app: &AppHandle, pid: u32) -> Result<String, String> {
    let sidecar = app
        .shell()
        .sidecar("timesapp-win-browser-url")
        .map_err(|e| format!("sidecar lookup failed: {e}"))?
        .args([pid.to_string()]);

    let (mut rx, _child) = sidecar
        .spawn()
        .map_err(|e| format!("sidecar spawn failed: {e}"))?;

    let mut stdout = String::new();
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line) => stdout.push_str(&String::from_utf8_lossy(&line)),
            CommandEvent::Terminated(_) => break,
            _ => {}
        }
    }

    Ok(stdout.trim().to_string())
}
