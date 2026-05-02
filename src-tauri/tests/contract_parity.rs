//! Contract parity test (ADR-30001): every IPC command and event listed here
//! MUST exist on both sides — the Rust `invoke_handler!` / `app.emit(...)` and
//! the TypeScript contract files. CI runs this via `cargo test --test contract_parity`.

use std::fs;
use std::path::PathBuf;

const COMMANDS: &[&str] = &[
    "activity_get_active_window",
    "idle_get_system_idle_time",
    "system_get_hostname",
];

const EVENTS: &[&str] = &["app:deep-link", "app:second-instance"];

fn read_relative(rel: &str) -> String {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push(rel);
    fs::read_to_string(&path).unwrap_or_else(|e| panic!("could not read {}: {e}", path.display()))
}

#[test]
fn rust_invoke_handler_lists_every_command() {
    let lib_rs = read_relative("src/lib.rs");
    for cmd in COMMANDS {
        assert!(
            lib_rs.contains(cmd),
            "command `{cmd}` not registered in src-tauri/src/lib.rs invoke_handler!",
        );
    }
}

#[test]
fn rust_emits_every_event() {
    let lib_rs = read_relative("src/lib.rs");
    for ev in EVENTS {
        let needle = format!("\"{ev}\"");
        assert!(
            lib_rs.contains(&needle),
            "event `{ev}` not emitted from src-tauri/src/lib.rs",
        );
    }
}

#[test]
fn ts_contract_lists_every_command() {
    let ts = read_relative("../src/app/shared/desktop/ipc-contract.ts");
    for cmd in COMMANDS {
        assert!(
            ts.contains(cmd),
            "command `{cmd}` missing from ipc-contract.ts DesktopCommands",
        );
    }
}

#[test]
fn ts_contract_lists_every_event() {
    let ts = read_relative("../src/app/shared/desktop/ipc-contract.ts");
    for ev in EVENTS {
        let needle = format!("'{ev}'");
        assert!(
            ts.contains(&needle),
            "event `{ev}` missing from ipc-contract.ts DesktopEvents",
        );
    }
}

#[test]
fn ts_constants_match_canonical_names() {
    let ts = read_relative("../src/app/core/constants/desktop-ipc.ts");
    for cmd in COMMANDS {
        assert!(
            ts.contains(cmd),
            "command `{cmd}` missing from desktop-ipc.ts DESKTOP_COMMANDS",
        );
    }
    for ev in EVENTS {
        assert!(
            ts.contains(ev),
            "event `{ev}` missing from desktop-ipc.ts DESKTOP_EVENTS",
        );
    }
}
