#[tauri::command]
pub async fn system_get_hostname() -> Result<String, String> {
    Ok(gethostname::gethostname().to_string_lossy().into_owned())
}
