#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct TauriCmdArgs {
    cmd: String,
}

#[tauri::command]
fn tauri(args: TauriCmdArgs) {
    match args.cmd.as_str() {
        "create" => {}
        "close" => {}
        _ => {}
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_cors_fetch::init())
        .invoke_handler(tauri::generate_handler![tauri])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
