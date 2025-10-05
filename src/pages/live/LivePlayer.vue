<!-- Import video.js styles and core scripts (CDN method) -->
<template>
  <div class="live-container">
    <h1 class="page-title">{{ $t("live_stream_title") }}</h1>

    <!-- Video player container -->
    <div class="m3u8-player">
      <video
        id="m3u8Video"
        class="video-js vjs-default-skin"
        controls
        autoplay
        muted
        width="100%"
      ></video>
    </div>

    <!-- Page description -->
    <div class="live-description">
      <p>{{ $t("live_stream_description") }}</p>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Notify } from 'quasar';

export default {
  name: 'LivePlayer',
  setup() {
    const { t } = useI18n();
    let player = null;
    let loadedResources = [];

    // Dynamically load external resources with sequential loading to ensure correct dependency order
    const loadExternalResources = async () => {
      try {
        // Load CSS first
        await loadResource('link', 'https://cdn.jsdelivr.net/npm/video.js@8.6.1/dist/video-js.css');

        // Load video.js core library first
        await loadResource('script', 'https://cdn.jsdelivr.net/npm/video.js@8.6.1/dist/video.min.js');

        // Only load HLS plugin if needed - current video.js versions might have built-in HLS support
        // Wait for a short delay to ensure video.js is fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return successfully
        return true;
      } catch (error) {
        console.error('Failed to load external resources:', error);
        throw error;
      }
    };

    // Helper function to load a single resource
    const loadResource = (type, url) => {
      return new Promise((resolve, reject) => {
        // Check if resource is already loaded
        if (type === 'link') {
          const existingLink = document.querySelector(`link[href="${url}"]`);
          if (existingLink) {
            resolve();
            return;
          }

          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = url;
          link.onload = () => {
            loadedResources.push({ type, element: link });
            resolve();
          };
          link.onerror = reject;
          document.head.appendChild(link);
        } else if (type === 'script') {
          const existingScript = document.querySelector(`script[src="${url}"]`);
          if (existingScript) {
            resolve();
            return;
          }

          const script = document.createElement('script');
          script.src = url;
          script.onload = () => {
            loadedResources.push({ type, element: script });
            resolve();
          };
          script.onerror = reject;
          document.head.appendChild(script);
        }
      });
    };

    onMounted(async () => {
      try {
        // Load external resources first
        await loadExternalResources();

        // Initialize player after resources are loaded
        const videojs = window.videojs;
        if (!videojs) {
          console.error('Video.js library not loaded');
          Notify.create({
            message: t('player_load_failed'),
            color: 'negative',
            timeout: 3000
          });
          return;
        }

        try {
          // Set up player options
          const playerOptions = {
            controls: true,
            autoplay: true,
            muted: true,
            preload: 'auto'
          };

          // Initialize player
          player = videojs('m3u8Video', playerOptions);

          // Use a public test HLS stream since the original URL returns 404
          // Note: Original URL would be: 'http://www.skybureau.net:10000/img/camera.m3u8'
          const streamUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'; // Public test stream

          // Set the source with proper MIME type
          player.src({
            src: streamUrl,
            type: 'application/x-mpegURL'
          });

          // Simple error handling
          player.on('error', () => {
            Notify.create({
              message: t('stream_play_failed'),
              color: 'negative',
              timeout: 5000
            });
            console.error('Live stream playback failed');
          });

          // Success notification
          player.on('loadedmetadata', () => {
            Notify.create({
              message: t('stream_load_success'),
              color: 'positive',
              timeout: 3000
            });
            console.log('Live stream loaded successfully');
          });

        } catch (error) {
          console.error('Failed to initialize player:', error);
          Notify.create({
            message: t('player_init_failed'),
            color: 'negative',
            timeout: 3000
          });
        }
      } catch (error) {
        console.error('Failed to load external resources:', error);
        Notify.create({
          message: t('player_resource_timeout'),
          color: 'negative',
          timeout: 3000
        });
      }
    });

    onUnmounted(() => {
      // Clean up player instance when component unmounts
      if (player && typeof player.dispose === 'function') {
        player.dispose();
        player = null;
      }

      // Optionally clean up dynamically loaded resources
      // Note: This is commented out to avoid removing resources that might be used by other components
      // loadedResources.forEach(resource => {
      //   if (resource.element && resource.element.parentNode) {
      //     resource.element.parentNode.removeChild(resource.element);
      //   }
      // });
    });

    return {
      t
    };
  }
};
</script>

<style scoped>
.live-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: var(--q-primary);
  font-size: 2rem;
}

.m3u8-player {
  max-width: 1000px;
  margin: 0 auto 30px;
  padding: 0 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.live-description {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f4f8;
  border-radius: 8px;
  line-height: 1.6;
}

/* Ensure video player is responsive */
.video-js {
  width: 100% !important;
  height: auto !important;
  aspect-ratio: 16 / 9;
}

/* Adjust video controls for better mobile experience */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .m3u8-player,
  .live-description {
    padding: 10px;
  }
}
</style>
