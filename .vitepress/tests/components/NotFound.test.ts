import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import NotFound from "@components/NotFound.vue";

describe("NotFound", () => {
  beforeEach(() => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders correctly", async () => {
    const wrapper = shallowMount(NotFound);
    await wrapper.vm.$nextTick();
    expect(wrapper.html()).toMatchSnapshot();
    wrapper.unmount();
  });

  it("renders the 404 heading", async () => {
    const wrapper = shallowMount(NotFound);
    await wrapper.vm.$nextTick();
    expect(wrapper.find("h1").text()).toBe("404");
    wrapper.unmount();
  });

  it("shows the requested path in the terminal trace", async () => {
    const path = "/does-not-exist";
    window.history.replaceState({}, "", path);

    const wrapper = shallowMount(NotFound);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(path);
    wrapper.unmount();
  });

  it("links back to the homepage", async () => {
    const wrapper = shallowMount(NotFound);
    await wrapper.vm.$nextTick();
    const homeLink = wrapper.find('a[href="/"]');
    expect(homeLink.exists()).toBe(true);
    wrapper.unmount();
  });
});
