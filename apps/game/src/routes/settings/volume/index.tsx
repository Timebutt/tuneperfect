import { createFileRoute, useNavigate } from "@tanstack/solid-router";
import { createMemo, createSignal, onMount } from "solid-js";

import Layout from "~/components/layout";
import Menu, { type MenuItem } from "~/components/menu";
import SettingsFooter from "~/components/settings-footer";
import TitleBar from "~/components/title-bar";
import { setAudioOutputDevice } from "~/lib/audio/context";
import { t } from "~/lib/i18n";
import { settingsStore } from "~/stores/settings";

export const Route = createFileRoute("/settings/volume/")({
  component: VolumeComponent,
});

const DEFAULT_DEVICE_ID = "";
// Stereo pair offsets up to 8 channels; Rust clamps if the device has fewer.
const CHANNEL_PAIR_OPTIONS = [0, 2, 4, 6];

function VolumeComponent() {
  const navigate = useNavigate();
  const onBack = () => {
    navigate({ to: "/settings" });
  };

  const [volume, setVolume] = createSignal(settingsStore.volume());
  const [outputDevices, setOutputDevices] = createSignal<MediaDeviceInfo[]>([]);

  onMount(async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setOutputDevices(devices.filter((d) => d.kind === "audiooutput" && d.deviceId !== "default"));
  });

  const saveVolume = () => {
    setAudioOutputDevice(volume().outputDeviceId);
    settingsStore.saveVolume(volume());
    onBack();
  };

  const deviceOptions = createMemo(() => [
    DEFAULT_DEVICE_ID,
    ...outputDevices().map((d) => d.deviceId),
  ]);

  const deviceName = (id: string | null) => {
    if (!id) return t("settings.sections.volume.outputDeviceDefault");
    return outputDevices().find((d) => d.deviceId === id)?.label || id;
  };

  const menuItems = createMemo<MenuItem[]>(() => [
    {
      type: "slider",
      label: t("settings.sections.volume.master"),
      value: () => Math.round(volume().master * 100),
      min: 0,
      max: 100,
      step: 1,
      onInput: (value: number) => {
        setVolume((prev) => ({ ...prev, master: Math.round(value) / 100 }));
      },
    },
    {
      type: "slider",
      label: t("settings.sections.volume.game"),
      value: () => Math.round(volume().game * 100),
      min: 0,
      max: 100,
      step: 1,
      onInput: (value: number) => {
        setVolume((prev) => ({ ...prev, game: Math.round(value) / 100 }));
      },
    },
    {
      type: "slider",
      label: t("settings.sections.volume.preview"),
      value: () => Math.round(volume().preview * 100),
      min: 0,
      max: 100,
      step: 1,
      onInput: (value: number) => {
        setVolume((prev) => ({ ...prev, preview: Math.round(value) / 100 }));
      },
    },
    {
      type: "slider",
      label: t("settings.sections.volume.menu"),
      value: () => Math.round(volume().menu * 100),
      min: 0,
      max: 100,
      step: 1,
      onInput: (value: number) => {
        setVolume((prev) => ({ ...prev, menu: Math.round(value) / 100 }));
      },
    },
    {
      type: "slider",
      label: t("settings.sections.volume.micPlaybackVolume"),
      value: () => Math.round(volume().micPlayback * 100),
      min: 0,
      max: 100,
      step: 1,
      onInput: (value: number) => {
        setVolume((prev) => ({ ...prev, micPlayback: Math.round(value) / 100 }));
      },
    },
    {
      type: "select-string",
      label: t("settings.sections.volume.outputDevice"),
      value: () => volume().outputDeviceId ?? DEFAULT_DEVICE_ID,
      options: deviceOptions(),
      onChange: (value: string) => {
        setVolume((prev) => ({ ...prev, outputDeviceId: value || null, outputChannelOffset: 0 }));
      },
      renderValue: (value) => deviceName(value),
    },
    {
      type: "select-number",
      label: t("settings.sections.volume.outputChannel"),
      value: () => volume().outputChannelOffset,
      options: CHANNEL_PAIR_OPTIONS,
      onChange: (value: number) => {
        setVolume((prev) => ({ ...prev, outputChannelOffset: value }));
      },
      renderValue: (value) => (value !== null ? `${value + 1}-${value + 2}` : "1-2"),
    },
    {
      type: "button",
      label: t("settings.save"),
      action: saveVolume,
    },
  ]);

  return (
    <Layout
      intent="secondary"
      header={
        <TitleBar title={t("settings.title")} description={t("settings.sections.volume.title")} onBack={onBack} />
      }
      footer={<SettingsFooter />}
    >
      <Menu items={menuItems()} onBack={onBack} />
    </Layout>
  );
}
