use tauri::AppHandle;

use crate::contract::ActiveWindowInfo;

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "macos")]
pub use macos::get_active_window;

#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "windows")]
pub use windows::get_active_window;

#[cfg(target_os = "linux")]
mod linux;
#[cfg(target_os = "linux")]
pub use linux::get_active_window;

#[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
pub async fn get_active_window(_app: AppHandle) -> Result<Option<ActiveWindowInfo>, String> {
    Ok(None)
}

#[tauri::command]
pub async fn activity_get_active_window(
    app: AppHandle,
) -> Result<Option<ActiveWindowInfo>, String> {
    get_active_window(app).await
}
