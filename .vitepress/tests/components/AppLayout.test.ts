import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import AppLayout from "@theme/AppLayout.vue";

describe("AppLayout", () => {
  it("renders correctly", () => {
    const wrapper = shallowMount(AppLayout);
    expect(wrapper.html()).toMatchSnapshot();
    wrapper.unmount();
  });
});
