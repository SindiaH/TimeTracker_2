const K_CG_EVENT_SOURCE_STATE_HID_SYSTEM_STATE: u32 = 1;
const K_CG_ANY_INPUT_EVENT_TYPE: u32 = !0u32;

#[link(name = "ApplicationServices", kind = "framework")]
extern "C" {
    fn CGEventSourceSecondsSinceLastEventType(state_id: u32, event_type: u32) -> f64;
}

pub fn get_idle_seconds() -> u64 {
    let secs = unsafe {
        CGEventSourceSecondsSinceLastEventType(
            K_CG_EVENT_SOURCE_STATE_HID_SYSTEM_STATE,
            K_CG_ANY_INPUT_EVENT_TYPE,
        )
    };
    secs.max(0.0) as u64
}
