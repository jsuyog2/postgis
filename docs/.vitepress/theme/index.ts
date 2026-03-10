// docs/.vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme';
import { h, onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vitepress';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import CSS
import './custom.css';

// Import Custom components
import GsapReveal from '../../components/GsapReveal.vue';

// Import Lucide Icons (We can globally register a few common ones if needed later)
import { 
  Map, 
  Layers, 
  Box, 
  Zap, 
  Plug, 
  Beaker,
  AlertTriangle,
  Info
} from 'lucide-vue-next';

import type { App } from 'vue';

export default {
  ...DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      // Optional: Inject slots like 'home-hero-before' if needed
    });
  },
  enhanceApp({ app, router, siteData }: { app: App, router: any, siteData: any }) {
    // Register custom components globally
    app.component('GsapReveal', GsapReveal);

    // Register Lucide Icons globally so they can be used in Markdown
    app.component('IconMap', Map);
    app.component('IconLayers', Layers);
    app.component('IconBox', Box);
    app.component('IconZap', Zap);
    app.component('IconPlug', Plug);
    app.component('IconBeaker', Beaker);
    app.component('IconAlertTriangle', AlertTriangle);
    app.component('IconInfo', Info);
  },
  setup() {
    const route = useRoute();

    // Re-initialize GSAP ScrollTrigger on route changes
    onMounted(() => {
      gsap.registerPlugin(ScrollTrigger);
    });

    watch(
      () => route.path,
      () => {
        nextTick(() => {
          ScrollTrigger.refresh();
        });
      }
    );
  }
};
