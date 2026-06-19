<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface LogEntry {
  t: string;
  text: string;
}

const TAGLINES = [
  "spawning gremlins on a branch you forgot about…",
  "refactoring while you sleep. you're welcome.",
  "writing the tests you swore you'd write.",
  "breaking things on purpose so prod doesn't.",
  "shipping the feature you didn't have time for.",
  "reviewing your PR — it has notes.",
  "dark, dead, colorful and lively, all at once.",
];

const LOG_POOL = [
  "spawned 47 gremlins on staging",
  "refactored auth/* — nobody asked, it's better now",
  "found 3 bugs you'll deny writing",
  "merged a PR at 03:14 local",
  "rewrote a regex. it works. don't touch it.",
  "deleted 2,000 lines of dead code",
  "added a test that fails on purpose",
  "summoned the rainbow, unleashed the reaper",
  "queued 12 chores while you were in standup",
  "broke the build, fixed the build, denied everything",
  "renamed a variable. 4 files. no regrets.",
  "pinned a dependency before it could betray us",
];

const KONAMI = [
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

const tagIndex = ref(0);
const logs = ref<LogEntry[]>([]);
const toastText = ref("");
const toastVisible = ref(false);
const raveActive = ref(false);
const rainbowDur = ref("7s");
const glowDur = ref("3.5s");
const pageFilter = ref("none");

const imageHeroRef = ref<HTMLImageElement | null>(null);
const imagePortraitRef = ref<HTMLImageElement | null>(null);

const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
let tagTimer = 0;
let logTimer = 0;
let toastTimer = 0;
let rafId = 0;
let konamiPos = 0;

const currentTagline = computed(() => TAGLINES[tagIndex.value]);

const pageStyle = computed(() => ({
  filter: pageFilter.value,
  "--gx-rainbow-dur": rainbowDur.value,
  "--gx-glow-dur": glowDur.value,
  transition: "filter 0.4s ease",
}));

function stamp(text: string): LogEntry {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    t: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
    text,
  };
}

function onMouseMove(e: MouseEvent) {
  mouse.x = e.clientX / window.innerWidth - 0.5;
  mouse.y = e.clientY / window.innerHeight - 0.5;
}

function tick() {
  mouse.tx += (mouse.x - mouse.tx) * 0.07;
  mouse.ty += (mouse.y - mouse.ty) * 0.07;

  const applyParallax = (
    el: HTMLImageElement | null,
    amt: number,
    rot: number,
    scale: number,
  ) => {
    if (!el) {
      return;
    }
    el.style.transform = `translate(${(mouse.tx * amt).toFixed(2)}px,${(mouse.ty * amt).toFixed(2)}px) rotate(${(mouse.tx * rot).toFixed(2)}deg) scale(${scale})`;
  };

  applyParallax(imageHeroRef.value, 16, 1.0, 1.06);
  applyParallax(imagePortraitRef.value, 11, 0.7, 1.08);

  rafId = requestAnimationFrame(tick);
}

function onKeyDown(e: KeyboardEvent) {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === KONAMI[konamiPos]) {
    konamiPos++;
    if (konamiPos === KONAMI.length) {
      konamiPos = 0;
      toggleRave();
    }
  } else {
    konamiPos = key === KONAMI[0] ? 1 : 0;
  }
}

function showToast(msg: string) {
  toastText.value = msg;
  toastVisible.value = true;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastVisible.value = false;
  }, 2600);
}

function toggleRave() {
  raveActive.value = !raveActive.value;
  if (raveActive.value) {
    rainbowDur.value = "1.8s";
    glowDur.value = "1s";
    pageFilter.value = "saturate(1.7) contrast(1.08)";
    showToast("🦄 RAVE MODE — dark, dead, AND lively");
  } else {
    rainbowDur.value = "7s";
    glowDur.value = "3.5s";
    pageFilter.value = "none";
    showToast("rave mode off — back to merely dark");
  }
}

onMounted(() => {
  tagTimer = window.setInterval(() => {
    tagIndex.value = (tagIndex.value + 1) % TAGLINES.length;
  }, 2800);

  logs.value = LOG_POOL.slice(0, 6).map(stamp);
  logTimer = window.setInterval(() => {
    const text = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
    logs.value = [...logs.value, stamp(text)].slice(-8);
  }, 2000);

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("keydown", onKeyDown);
  rafId = requestAnimationFrame(tick);
});

onUnmounted(() => {
  clearInterval(tagTimer);
  clearInterval(logTimer);
  clearTimeout(toastTimer);
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("keydown", onKeyDown);
  cancelAnimationFrame(rafId);
});
</script>

<template>
  <div
    :style="pageStyle"
    class="bg-bg text-fg relative min-h-screen overflow-hidden font-mono"
  >
    <!-- ambient glow -->
    <div
      class="pointer-events-none absolute top-[-200px] right-[-160px] h-[680px] w-[680px] blur-[24px]"
      style="
        background: radial-gradient(
          circle,
          rgba(168, 85, 247, 0.2),
          rgba(34, 211, 238, 0.09) 45%,
          transparent 70%
        );
      "
    />

    <div class="relative mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
      <!-- nav -->
      <nav
        class="flex items-center justify-between border-b border-white/[0.07] py-[26px]"
      >
        <div class="flex items-center gap-3">
          <span class="bg-lime animate-dot h-[9px] w-[9px] rounded-full" />
          <span class="text-sm font-bold tracking-[0.02em]">grimicorn.dev</span>
        </div>
        <div class="flex items-center gap-4 text-[12.5px]">
          <div class="text-fg-subtle hidden items-center gap-[26px] sm:flex">
            <a
              href="#about"
              class="text-fg-subtle hover:text-fg no-underline transition-colors"
              >about</a
            >
            <a
              href="#status"
              class="text-fg-subtle hover:text-fg no-underline transition-colors"
              >status</a
            >
            <a
              href="#links"
              class="text-fg-subtle hover:text-fg no-underline transition-colors"
              >links</a
            >
          </div>
          <span class="text-lime">● agent online</span>
        </div>
      </nav>

      <!-- hero -->
      <section
        id="about"
        class="grid grid-cols-1 gap-8 pt-10 pb-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-[52px] lg:pt-16 lg:pb-14"
      >
        <!-- left -->
        <div>
          <div
            class="text-purple mb-[22px] text-xs tracking-[0.16em] uppercase"
          >
            — grim reaper × unicorn
          </div>
          <h1
            class="font-display m-0 text-[52px] leading-[0.92] font-bold tracking-[-0.02em] sm:text-[68px] lg:text-[84px]"
          >
            GRIMICORN
          </h1>
          <div
            class="font-display animate-rainbow-pan bg-clip-text text-[52px] leading-[0.92] font-bold tracking-[-0.02em] text-transparent sm:text-[68px] lg:text-[84px]"
            style="
              background-image: linear-gradient(
                90deg,
                #ff2d9b,
                #fb923c,
                #facc15,
                #a3e635,
                #22d3ee,
                #a855f7,
                #ff2d9b
              );
            "
          >
            AGENT
          </div>

          <div
            class="text-fg-muted mt-[26px] flex items-center gap-[10px] text-[13px]"
          >
            <span class="text-lime">&#x25B8;</span>
            <span>{{ currentTagline }}</span>
          </div>

          <p
            class="text-fg-muted mt-[26px] max-w-none text-sm leading-[1.8] lg:max-w-[440px]"
          >
            A chaotic coding sidekick that builds the things I don't have time
            for &mdash; then unleashes a swarm of gremlins to break them until
            they can't break in production. Dark, dead, colorful and lively at
            the same time.
          </p>

          <div class="mt-[34px] flex flex-wrap gap-[14px]">
            <a
              href="#links"
              class="text-bg animate-rainbow-pan rounded-lg px-[22px] py-[13px] text-[13px] font-bold no-underline"
              style="
                background-image: linear-gradient(
                  90deg,
                  #ff2d9b,
                  #fb923c,
                  #facc15,
                  #a3e635,
                  #22d3ee,
                  #a855f7
                );
              "
            >
              view on github &rarr;
            </a>
            <a
              href="#status"
              class="text-fg rounded-lg border border-white/[0.16] bg-white/[0.02] px-[22px] py-[13px] text-[13px] font-medium no-underline"
            >
              what's it doing? &darr;
            </a>
          </div>
        </div>

        <!-- right: hero image -->
        <div class="relative">
          <div
            class="animate-glow-pulse absolute inset-[-18px] rounded-[20px] blur-[38px]"
            style="
              background: linear-gradient(
                135deg,
                #ff2d9b,
                #facc15,
                #22d3ee,
                #a855f7
              );
              opacity: 0.32;
            "
          />
          <div
            class="relative rounded-[10px] p-[1.5px]"
            style="
              background: linear-gradient(
                135deg,
                #ff2d9b,
                #facc15,
                #22d3ee,
                #a855f7
              );
            "
          >
            <div class="bg-bg overflow-hidden rounded-[9px]">
              <img
                ref="imageHeroRef"
                src="/assets/grimicorn-hero.png"
                alt="Grimicorn — skeletal rainbow unicorn"
                class="block w-full will-change-transform"
              />
            </div>
          </div>
          <div
            class="text-fg-dim mt-3 flex justify-between text-[11px] tracking-[0.04em]"
          >
            <span>fig.01 &mdash; grimicorn, in the wild</span>
            <span>rev. 6.6.6</span>
          </div>
        </div>
      </section>

      <!-- rainbow divider -->
      <div
        class="animate-rainbow-pan h-[2px]"
        style="
          background-image: linear-gradient(
            90deg,
            #ff2d9b,
            #fb923c,
            #facc15,
            #a3e635,
            #22d3ee,
            #a855f7,
            #ff2d9b
          );
        "
      />

      <!-- terminal section -->
      <section id="status" class="py-14">
        <div class="mb-5 text-xs tracking-[0.16em] text-[#7a766e] uppercase">
          — what it's doing right now
        </div>

        <div
          class="overflow-hidden rounded-xl border border-white/[0.08] text-[#d4d4d8]"
          style="
            background: #08080a;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
          "
        >
          <!-- window chrome -->
          <div
            class="flex items-center gap-[14px] border-b border-white/[0.07] bg-white/[0.015] px-[22px] py-4"
          >
            <span class="flex gap-2">
              <span class="bg-pink h-3 w-3 rounded-full" />
              <span class="bg-yellow h-3 w-3 rounded-full" />
              <span class="bg-lime h-3 w-3 rounded-full" />
            </span>
            <span class="text-fg-subtle ml-[6px] truncate text-[12.5px]"
              >grimicorn-agent &mdash; zsh &mdash; 124&times;40</span
            >
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr]">
            <!-- left: terminal output -->
            <div class="p-5 text-[13.5px] leading-loose sm:p-[34px_36px]">
              <div>
                <span class="text-lime">grimicorn</span
                ><span class="text-[#6b7280]">@</span
                ><span class="text-cyan">dev</span>
                <span class="text-[#6b7280]"> ~ %</span> whoami
              </div>
              <div class="mb-[14px] text-[#cdcac4]">
                chaotic coding sidekick :: builds what you don't have time for
              </div>

              <div>
                <span class="text-lime">grimicorn</span
                ><span class="text-[#6b7280]">@</span
                ><span class="text-cyan">dev</span>
                <span class="text-[#6b7280]"> ~ %</span> status
              </div>
              <div class="mb-[14px]">
                <span class="font-bold tracking-[0.06em] text-white"
                  >UNLEASHED</span
                >
                <span
                  class="bg-lime animate-blink ml-2 inline-block h-[15px] w-[9px] align-[-2px]"
                />
              </div>

              <!-- stat grid -->
              <div class="mt-2 mb-[22px] grid grid-cols-2 gap-[14px]">
                <div class="rounded-[10px] border border-white/[0.08] p-4">
                  <div
                    class="font-display text-pink text-[32px] leading-none font-bold"
                  >
                    1,204
                  </div>
                  <div
                    class="text-fg-subtle mt-[7px] text-[11px] tracking-[0.05em]"
                  >
                    gremlins spawned
                  </div>
                </div>
                <div class="rounded-[10px] border border-white/[0.08] p-4">
                  <div
                    class="font-display text-cyan text-[32px] leading-none font-bold"
                  >
                    38
                  </div>
                  <div
                    class="text-fg-subtle mt-[7px] text-[11px] tracking-[0.05em]"
                  >
                    commits while you slept
                  </div>
                </div>
                <div class="rounded-[10px] border border-white/[0.08] p-4">
                  <div
                    class="font-display text-yellow text-[32px] leading-none font-bold"
                  >
                    17
                  </div>
                  <div
                    class="text-fg-subtle mt-[7px] text-[11px] tracking-[0.05em]"
                  >
                    things broken on purpose
                  </div>
                </div>
                <div class="rounded-[10px] border border-white/[0.08] p-4">
                  <div
                    class="font-display text-lime text-[32px] leading-none font-bold"
                  >
                    99.9%
                  </div>
                  <div
                    class="text-fg-subtle mt-[7px] text-[11px] tracking-[0.05em]"
                  >
                    uptime (suspicious)
                  </div>
                </div>
              </div>

              <div>
                <span class="text-lime">grimicorn</span
                ><span class="text-[#6b7280]">@</span
                ><span class="text-cyan">dev</span>
                <span class="text-[#6b7280]"> ~ %</span> tail -f chaos.log
              </div>
              <div
                class="border-purple/40 mt-[6px] flex h-[188px] flex-col justify-end overflow-hidden border-l-2 pl-[14px]"
              >
                <div
                  v-for="(line, index) in logs"
                  :key="index"
                  class="text-[12.5px] leading-[1.95] text-[#9a9aa3]"
                >
                  <span class="text-purple">[{{ line.t }}]</span>
                  <span class="text-[#cdcac4]"> {{ line.text }}</span>
                </div>
              </div>
            </div>

            <!-- right: portrait + links -->
            <div
              id="links"
              class="flex flex-col gap-6 border-t border-white/[0.07] p-5 sm:p-[34px_30px] lg:border-t-0 lg:border-l"
            >
              <div class="relative">
                <div
                  class="animate-glow-pulse absolute inset-[-12px] rounded-[16px] blur-[30px]"
                  style="
                    background: linear-gradient(
                      135deg,
                      #22d3ee,
                      #a855f7,
                      #ff2d9b
                    );
                    opacity: 0.34;
                  "
                />
                <div
                  class="relative overflow-hidden rounded-[10px] border border-white/[0.12]"
                >
                  <img
                    ref="imagePortraitRef"
                    src="/assets/grimicorn-head.png"
                    alt="Grimicorn portrait"
                    class="block w-full will-change-transform"
                  />
                </div>
              </div>

              <div>
                <div class="mb-[10px] text-[12.5px] text-[#6b7280]">
                  <span class="text-lime">~ %</span> grimicorn links --all
                </div>
                <div class="flex flex-col gap-2">
                  <a
                    href="https://github.com/grimicorn-agent"
                    class="hover:border-purple hover:bg-purple/[0.06] flex items-center justify-between rounded-[9px] border border-white/[0.1] bg-white/[0.02] px-[14px] py-[11px] no-underline transition-colors"
                    target="blank"
                  >
                    <span class="text-[13px] font-bold text-white">github</span>
                    <span class="text-purple text-[14px]">&#x2197;</span>
                  </a>
                  <!-- <a
                    href="#"
                    class="hover:border-cyan hover:bg-cyan/[0.06] flex items-center justify-between rounded-[9px] border border-white/[0.1] bg-white/[0.02] px-[14px] py-[11px] no-underline transition-colors"
                  >
                    <span class="text-[13px] font-bold text-white"
                      >bluesky</span
                    >
                    <span class="text-cyan text-[14px]">&#x2197;</span>
                  </a> -->
                  <!-- <a
                    href="#"
                    class="hover:border-pink hover:bg-pink/[0.06] flex items-center justify-between rounded-[9px] border border-white/[0.1] bg-white/[0.02] px-[14px] py-[11px] no-underline transition-colors"
                  >
                    <span class="text-[13px] font-bold text-white"
                      >twitter / x</span
                    >
                    <span class="text-pink text-[14px]">&#x2197;</span>
                  </a> -->
                </div>
              </div>
            </div>
          </div>

          <!-- terminal footer prompt -->
          <div
            class="border-t border-white/[0.07] px-5 py-5 text-[13px] sm:px-[36px]"
          >
            <span class="text-lime">grimicorn</span
            ><span class="text-[#6b7280]">@</span
            ><span class="text-cyan">dev</span>
            <span class="text-[#6b7280]"> ~ %</span>
            <span
              class="animate-blink ml-1 inline-block h-[15px] w-[9px] bg-[#d4d4d8] align-[-2px]"
            />
          </div>
        </div>
      </section>

      <!-- page footer -->
      <footer
        class="flex justify-between border-t border-white/[0.07] py-7 text-[11px] text-[#6f6c66]"
      >
        <span>grimicorn.dev &mdash; &copy; {{ new Date().getFullYear() }}</span>
        <span
          >built dark &middot; shipped
          <button class="colorful-btn" @click="toggleRave">
            colorful
          </button></span
        >
      </footer>
    </div>

    <!-- rave toast -->
    <div
      class="bg-bg border-purple pointer-events-none fixed bottom-9 left-1/2 z-[9999] -translate-x-1/2 rounded-full border-[1.5px] px-[26px] py-[14px] font-mono text-sm font-bold whitespace-nowrap text-white"
      :class="
        toastVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-[10px] opacity-0'
      "
      style="
        box-shadow: 0 0 40px rgba(168, 85, 247, 0.6);
        transition:
          opacity 0.35s ease,
          transform 0.35s ease;
      "
    >
      {{ toastText }}
    </div>
  </div>
</template>
