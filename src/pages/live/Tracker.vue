<template>
  <div class="tracker-container">
    <h1 class="page-title">{{ $t("tracker_title") }}</h1>

    <!-- URL input section -->
    <div class="url-input-section">
      <input
        v-model="videoUrl"
        type="text"
        class="url-input"
        :placeholder="$t('enter_video_url')"
        @keyup.enter="updateVideoSource"
      />
      <q-btn
        @click="updateVideoSource"
        color="primary"
        :label="$t('play_button')"
        class="play-button"
      />
    </div>

    <!-- Video player container -->
    <div class="video-player-container">
      <vue3videoPlay
        v-if="currentVideoUrl"
        :src="currentVideoUrl"
        autoPlay
        loop="true"
        :width="'100%'"
        :height="'100%'"
        @error="handleVideoError"
        @play="handleVideoPlay"
        @ended="handleVideoEnded"
      ></vue3videoPlay>
    </div>

    <!-- Status message -->
    <div v-if="statusMessage" :class="['status-message', statusType]">
      {{ statusMessage }}
    </div>

    <!-- Page description -->
    <div class="tracker-description">
      <p>{{ $t("tracker_description") }}</p>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { Notify } from 'quasar';
import VideoPlay from 'vue3-video-play/dist/index.mjs';
import 'vue3-video-play/dist/style.css';

export default {
  name: 'LiveTracker',
  components: {
    vue3videoPlay: VideoPlay
  },
  setup() {
    const { t } = useI18n();
    const videoUrl = ref('http://skybureau.net:10000/mp4/car_large.mp4'); // Default test stream
    const currentVideoUrl = ref('');
    const statusMessage = ref('');
    const statusType = ref('');

    // Update video source when user clicks play button or presses Enter
    const updateVideoSource = async () => {
      if (!videoUrl.value.trim()) {
        showStatusMessage(t('url_cannot_be_empty'), 'error');
        return;
      }

      // Reset player status
      statusMessage.value = '';
      statusType.value = '';
      showStatusMessage(t('loading_video'), 'info');

      try {
        // Ensure DOM is fully rendered
        await nextTick();

        // Validate URL format
        try {
          new URL(videoUrl.value);
        } catch (urlError) {
          console.error('Invalid URL format:', urlError);
          showStatusMessage(t('invalid_url_format'), 'error');
          return;
        }

        // Update the current video URL to trigger component update
        currentVideoUrl.value = '';
        await nextTick();
        currentVideoUrl.value = videoUrl.value;
        showStatusMessage(t('video_ready'), 'success');

      } catch (error) {
        console.error('Failed to update video source:', error);
        showStatusMessage(t('update_source_failed'), 'error');
      }
    };

    // Handle video player events
    const handleVideoError = () => {
      showStatusMessage(t('video_playback_error'), 'error');
    };

    const handleVideoPlay = () => {
      showStatusMessage(t('video_started'), 'success');
    };

    const handleVideoEnded = () => {
      showStatusMessage(t('video_ended'), 'info');
    };

    // Show status message
    const showStatusMessage = (message, type = 'info') => {
      statusMessage.value = message;
      statusType.value = type;

      // Auto clear after 5 seconds
      setTimeout(() => {
        statusMessage.value = '';
        statusType.value = '';
      }, 5000);

      // Also show a notification
      const colorMap = {
        error: 'negative',
        success: 'positive',
        info: 'primary',
        warning: 'warning'
      };

      Notify.create({
        message,
        color: colorMap[type] || 'primary',
        timeout: 3000
      });
    };

    onMounted(() => {
      // Initialize with default URL
      setTimeout(() => {
        updateVideoSource();
      }, 500);
    });

    return {
      t,
      videoUrl,
      currentVideoUrl,
      statusMessage,
      statusType,
      updateVideoSource,
      handleVideoError,
      handleVideoPlay,
      handleVideoEnded
    };
  }
};
</script>

<style scoped>
.tracker-container {
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

.url-input-section {
  max-width: 1000px;
  margin: 0 auto 30px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.url-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.url-input:focus {
  border-color: var(--q-primary);
}

.play-button {
  white-space: nowrap;
  min-width: 100px;
}

.video-player-container {
  max-width: 1000px;
  margin: 0 auto 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-message {
  max-width: 1000px;
  margin: 0 auto 20px;
  padding: 10px 15px;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}

.status-message.error {
  background-color: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}

.status-message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #66bb6a;
}

.status-message.info {
  background-color: #e3f2fd;
  color: #1565c0;
  border: 1px solid #42a5f5;
}

.status-message.warning {
  background-color: #fff3e0;
  color: #e65100;
  border: 1px solid #ff9800;
}

.tracker-description {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f4f8;
  border-radius: 8px;
  line-height: 1.6;
}

/* Ensure video player is responsive */
.video-player-container {
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  position: relative;
  min-height: 500px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

/* Adjust video controls for better mobile experience */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .url-input-section {
    flex-direction: column;
  }

  .url-input {
    width: 100%;
  }

  .play-button {
    width: 100%;
  }

  .video-player-container,
  .tracker-description {
    padding: 10px;
  }
}
</style>
