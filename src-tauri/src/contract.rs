use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Bounds {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Owner {
    pub name: String,
    pub process_id: i64,
    pub bundle_id: String,
    pub path: String,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Platform {
    Macos,
    #[serde(rename = "win32")]
    Win32,
    Linux,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActiveWindowInfo {
    pub title: String,
    pub id: i64,
    pub bounds: Bounds,
    pub owner: Owner,
    #[serde(default)]
    pub url: String,
    #[serde(default)]
    pub memory_usage: u64,
    pub platform: Platform,
}

#[derive(Debug, Clone, Serialize)]
pub struct SecondInstancePayload {
    pub argv: Vec<String>,
    pub cwd: String,
}
