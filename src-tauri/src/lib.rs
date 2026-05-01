mod activity;
mod contract;
mod idle;
mod migration;
mod system;

#[cfg(desktop)]
use tauri::Manager;
use tauri::Emitter;

use crate::contract::SecondInstancePayload;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
                let payload = SecondInstancePayload {
                    argv: argv.clone(),
                    cwd,
                };
                let _ = app.emit("app:second-instance", payload);

                for arg in argv.iter().skip(1) {
                    if arg.starts_with("timesapp2://") {
                        let _ = app.emit("app:deep-link", normalize_deep_link(arg));
                    }
                }

                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.set_focus();
                }
            }))
            .plugin(tauri_plugin_window_state::Builder::default().build())
            .plugin(tauri_plugin_deep_link::init())
            .plugin(tauri_plugin_autostart::init(
                tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                None,
            ));
    }

    builder
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(if cfg!(debug_assertions) {
                    log::LevelFilter::Info
                } else {
                    log::LevelFilter::Warn
                })
                .build(),
        )
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                let handle = app.handle().clone();
                migration::run_legacy_migration(&handle);

                let deep_link = app.deep_link();
                let handle_for_deep_link = handle.clone();
                deep_link.on_open_url(move |event| {
                    for url in event.urls() {
                        let _ = handle_for_deep_link
                            .emit("app:deep-link", normalize_deep_link(url.as_str()));
                    }
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            activity::activity_get_active_window,
            idle::idle_get_system_idle_time,
            system::system_get_hostname,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(desktop)]
use tauri_plugin_deep_link::DeepLinkExt;

fn normalize_deep_link(raw: &str) -> String {
    raw.replacen('#', "?", 1)
}
