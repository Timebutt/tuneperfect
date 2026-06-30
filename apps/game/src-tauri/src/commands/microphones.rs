use crate::audio::device::device_display_name;
use crate::error::AppError;
use cpal::traits::{DeviceTrait, HostTrait};
use serde::Serialize;

#[derive(Debug, Serialize, specta::Type)]
pub struct Microphone {
    /// Stable device ID (cpal `DeviceId` serialized via `Display`). Preferred for
    /// persisting a mic selection. `None` if the backend can't report an ID.
    id: Option<String>,
    name: String,
    channels: u16,
}

#[tauri::command]
#[specta::specta]
pub fn get_microphones() -> Result<Vec<Microphone>, AppError> {
    let mut microphones = Vec::new();

    let host = cpal::default_host();
    let devices = host.devices()?;
    for device in devices {
        let Ok(config) = device.default_input_config() else {
            continue;
        };
        let Ok(description) = device.description() else {
            continue;
        };

        microphones.push(Microphone {
            id: device.id().ok().map(|id| id.to_string()),
            name: device_display_name(&description),
            channels: config.channels(),
        });
    }

    Ok(microphones)
}

#[derive(Debug, Serialize, specta::Type)]
pub struct OutputDevice {
    /// Stable device ID (cpal `DeviceId` serialized via `Display`). Used to
    /// persist the user's output device selection.
    id: Option<String>,
    name: String,
    channels: u16,
}

#[tauri::command]
#[specta::specta]
pub fn get_output_devices() -> Result<Vec<OutputDevice>, AppError> {
    let mut devices = Vec::new();

    let host = cpal::default_host();
    let output_devices = host.output_devices()?;
    for device in output_devices {
        let Ok(config) = device.default_output_config() else {
            continue;
        };
        let Ok(description) = device.description() else {
            continue;
        };

        devices.push(OutputDevice {
            id: device.id().ok().map(|id| id.to_string()),
            name: device_display_name(&description),
            channels: config.channels(),
        });
    }

    Ok(devices)
}
