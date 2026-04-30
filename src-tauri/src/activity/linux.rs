use active_win_pos_rs::get_active_window as get_window;
use tauri::AppHandle;

use crate::contract::{ActiveWindowInfo, Bounds, Owner, Platform};

pub async fn get_active_window(_app: AppHandle) -> Result<Option<ActiveWindowInfo>, String> {
    let win = match get_window() {
        Ok(w) => w,
        Err(_) => return Ok(None),
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
        url: String::new(),
        memory_usage: 0,
        platform: Platform::Linux,
    }))
}
