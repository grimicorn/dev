import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import GrimicornPage from "@components/GrimicornPage.vue";

const FIXED_TIME = new Date("2026-01-01T00:00:00.000Z");

describe("GrimicornPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders correctly", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
    wrapper.unmount();
  });

  it("shows the first tagline on initial render", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();
    const taglineEl = wrapper.find(".text-fg-muted span:last-child");
    expect(taglineEl.exists()).toBe(true);
    expect(taglineEl.text()).toBeTruthy();
    wrapper.unmount();
  });

  it("cycles to a different tagline after 2800ms", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();
    const initial = wrapper.find(".text-fg-muted span:last-child").text();

    await vi.advanceTimersByTimeAsync(2800);
    await wrapper.vm.$nextTick();

    const updated = wrapper.find(".text-fg-muted span:last-child").text();
    expect(updated).not.toBe(initial);
    wrapper.unmount();
  });

  it("populates the log stream on mount", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();
    const entries = wrapper.findAll(".border-l-2 div");
    expect(entries.length).toBe(6);
    wrapper.unmount();
  });

  it("appends a log entry after 2000ms", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();
    const countBefore = wrapper.findAll(".border-l-2 div").length;

    await vi.advanceTimersByTimeAsync(2000);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".border-l-2 div").length).toBe(countBefore + 1);
    wrapper.unmount();
  });

  it("toast is hidden on initial render", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();
    const toast = wrapper
      .findAll(".fixed")
      .find((el) => el.classes().some((c) => c.includes("rounded-full")));
    expect(toast?.classes()).toContain("opacity-0");
    wrapper.unmount();
  });
});
