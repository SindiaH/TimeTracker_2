use user_idle::UserIdle;

pub fn get_idle_seconds() -> u64 {
    UserIdle::get_time()
        .map(|d| d.as_seconds())
        .unwrap_or(0)
}
