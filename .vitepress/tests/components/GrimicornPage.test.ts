import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount, type VueWrapper } from "@vue/test-utils";
import GrimicornPage from "@components/GrimicornPage.vue";

const FIXED_TIME = new Date("2026-01-01T00:00:00.000Z");

type GrimicornWrapper = VueWrapper<InstanceType<typeof GrimicornPage>>;

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const RAVE_FILTER = "saturate(1.7) contrast(1.08)";
const RAVE_RAINBOW_DURATION = "1.8s";
const RAVE_GLOW_DURATION = "1s";
const DEFAULT_FILTER = "none";
const DEFAULT_RAINBOW_DURATION = "7s";
const DEFAULT_GLOW_DURATION = "3.5s";
const RAVE_ON_TOAST_MESSAGE = "🦄 RAVE MODE — dark, dead, AND lively";
const RAVE_OFF_TOAST_MESSAGE = "rave mode off — back to merely dark";

function pressKey(key: string) {
  window.dispatchEvent(new KeyboardEvent("keydown", { key }));
}

async function pressSequence(wrapper: GrimicornWrapper, keys: string[]) {
  keys.forEach(pressKey);
  await wrapper.vm.$nextTick();
}

function getPageFilter(wrapper: GrimicornWrapper) {
  return wrapper.element.style.filter;
}

function getRainbowDuration(wrapper: GrimicornWrapper) {
  return wrapper.element.style.getPropertyValue("--gx-rainbow-dur");
}

function getGlowDuration(wrapper: GrimicornWrapper) {
  return wrapper.element.style.getPropertyValue("--gx-glow-dur");
}

function findToast(wrapper: GrimicornWrapper) {
  return wrapper
    .findAll(".fixed")
    .find((element) =>
      element.classes().some((className) => className.includes("rounded-full")),
    );
}

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

  it("opens the sidebar github link safely in a new tab", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();
    const githubLink = wrapper.find(
      'a[href="https://github.com/grimicorn-agent"][target]',
    );
    expect(githubLink.exists()).toBe(true);
    expect(githubLink.attributes("target")).toBe("_blank");
    expect(githubLink.attributes("rel")).toBe("noopener noreferrer");
    wrapper.unmount();
  });

  it("toggles rave mode and applies its CSS-variable and toast side effects when the full Konami sequence is entered", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();

    await pressSequence(wrapper, KONAMI_SEQUENCE);

    expect(getPageFilter(wrapper)).toBe(RAVE_FILTER);
    expect(getRainbowDuration(wrapper)).toBe(RAVE_RAINBOW_DURATION);
    expect(getGlowDuration(wrapper)).toBe(RAVE_GLOW_DURATION);

    const toast = findToast(wrapper);
    expect(toast?.classes()).toContain("opacity-100");
    expect(toast?.text()).toBe(RAVE_ON_TOAST_MESSAGE);

    wrapper.unmount();
  });

  it("completes the sequence when the b/a keys arrive uppercase", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();

    const uppercaseTail = [...KONAMI_SEQUENCE.slice(0, -2), "B", "A"];
    await pressSequence(wrapper, uppercaseTail);

    expect(getPageFilter(wrapper)).toBe(RAVE_FILTER);

    wrapper.unmount();
  });

  it("does not toggle rave mode on a partial Konami sequence", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();

    await pressSequence(wrapper, KONAMI_SEQUENCE.slice(0, -1));

    expect(getPageFilter(wrapper)).toBe(DEFAULT_FILTER);
    expect(findToast(wrapper)?.classes()).toContain("opacity-0");

    wrapper.unmount();
  });

  it("does not toggle rave mode when the sequence contains a wrong key", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();

    const wrongSequence = [...KONAMI_SEQUENCE.slice(0, -1), "z"];
    await pressSequence(wrapper, wrongSequence);

    expect(getPageFilter(wrapper)).toBe(DEFAULT_FILTER);
    expect(findToast(wrapper)?.classes()).toContain("opacity-0");

    wrapper.unmount();
  });

  it("resets the match position on a wrong key, requiring the full sequence again", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();

    await pressSequence(wrapper, [...KONAMI_SEQUENCE.slice(0, 4), "x"]);
    expect(getPageFilter(wrapper)).toBe(DEFAULT_FILTER);

    await pressSequence(wrapper, KONAMI_SEQUENCE.slice(4));
    expect(getPageFilter(wrapper)).toBe(DEFAULT_FILTER);

    await pressSequence(wrapper, KONAMI_SEQUENCE);
    expect(getPageFilter(wrapper)).toBe(RAVE_FILTER);

    wrapper.unmount();
  });

  it("restarts the match at position 1 when the wrong key matches the sequence's first key", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();

    // "ArrowUp", "ArrowUp", "ArrowUp" — the third press is wrong (position 2
    // expects "ArrowDown"), but since it equals KONAMI_SEQUENCE[0] the match
    // position should restart at 1, not 0.
    await pressSequence(wrapper, ["ArrowUp", "ArrowUp", "ArrowUp"]);
    expect(getPageFilter(wrapper)).toBe(DEFAULT_FILTER);

    await pressSequence(wrapper, KONAMI_SEQUENCE.slice(1));
    expect(getPageFilter(wrapper)).toBe(RAVE_FILTER);

    wrapper.unmount();
  });

  it("toggleRave applies rave CSS variables and toast, and reverts them on a second toggle", async () => {
    const wrapper = shallowMount(GrimicornPage);
    await wrapper.vm.$nextTick();

    const colorfulButton = wrapper.find(".colorful-btn");
    expect(colorfulButton.exists()).toBe(true);

    await colorfulButton.trigger("click");

    expect(getPageFilter(wrapper)).toBe(RAVE_FILTER);
    expect(getRainbowDuration(wrapper)).toBe(RAVE_RAINBOW_DURATION);
    expect(getGlowDuration(wrapper)).toBe(RAVE_GLOW_DURATION);
    expect(findToast(wrapper)?.text()).toBe(RAVE_ON_TOAST_MESSAGE);

    await colorfulButton.trigger("click");

    expect(getPageFilter(wrapper)).toBe(DEFAULT_FILTER);
    expect(getRainbowDuration(wrapper)).toBe(DEFAULT_RAINBOW_DURATION);
    expect(getGlowDuration(wrapper)).toBe(DEFAULT_GLOW_DURATION);
    expect(findToast(wrapper)?.text()).toBe(RAVE_OFF_TOAST_MESSAGE);

    wrapper.unmount();
  });
});
