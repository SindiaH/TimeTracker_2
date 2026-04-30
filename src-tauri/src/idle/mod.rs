#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "macos")]
pub use macos::get_idle_seconds;

#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "windows")]
pub use windows::get_idle_seconds;

#[cfg(target_os = "linux")]
mod linux;
#[cfg(target_os = "linux")]
pub use linux::get_idle_seconds;

#[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
pub fn get_idle_seconds() -> u64 {
    0
}

#[tauri::command]
pub async fn idle_get_system_idle_time() -> Result<u64, String> {
    Ok(get_idle_seconds())
}
