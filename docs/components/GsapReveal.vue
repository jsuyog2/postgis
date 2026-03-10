<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const props = defineProps({
  animation: {
    type: String,
    default: 'fade-up', // fade-up, fade-in, scale-up
  },
  duration: {
    type: Number,
    default: 0.8,
  },
  delay: {
    type: Number,
    default: 0,
  },
});

const revealContainer = ref(null);

onMounted(() => {
  if (!revealContainer.value) return;

  let yOffset = 0;
  let scale = 1;
  let opacity = 0;

  if (props.animation === 'fade-up') {
    yOffset = 40;
  } else if (props.animation === 'scale-up') {
    scale = 0.9;
  }

  gsap.fromTo(
    revealContainer.value,
    {
      y: yOffset,
      scale: scale,
      opacity: opacity,
    },
    {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: props.duration,
      delay: props.delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: revealContainer.value,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    }
  );
});
</script>

<template>
  <div ref="revealContainer" class="gsap-reveal-container">
    <slot />
  </div>
</template>

<style scoped>
.gsap-reveal-container {
  opacity: 0; /* Hidden initially before GSAP takes over */
  will-change: transform, opacity;
}
</style>
