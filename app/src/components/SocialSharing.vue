<template>
  <div>

    <div class="social">
      <facebook :url="url" scale="2"></facebook>
      <twitter :url="url" :title="title" scale="2"></twitter>
      <linkedin :url="url" scale="2"></linkedin>
      <telegram :url="url" scale="2"></telegram>
      <whats-app :url="url" :title="title" scale="2"></whats-app>
      <pinterest :url="url" scale="2"></pinterest>
      <reddit :url="url" :title="title" scale="2"></reddit>
      <email :url="url" :subject="title" scale="2"></email>
    </div>

    <b-input-group class="mt-3">
      <b-form-input id="url-to-copy" :value="url"></b-form-input>
      <b-input-group-append>
        <b-button class="copy-btn"
          v-b-tooltip.click="'Copier!'"
          data-clipboard-target="#url-to-copy"
          @mouseleave="diableTooltip"
          variant="info">
          <b-icon icon="clipboard"></b-icon>
        </b-button>
      </b-input-group-append>
    </b-input-group>

  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import ClipboardJS from 'clipboard';
import {
  Facebook,
  Twitter,
  Linkedin,
  Pinterest,
  Reddit,
  Telegram,
  WhatsApp,
  Email
} from 'vue-socialmedia-share';

@Component({
  components: {
    Facebook,
    Twitter,
    Linkedin,
    Pinterest,
    Reddit,
    Telegram,
    WhatsApp,
    Email
  }
})
export default class SocialSharing extends Vue {
  url = '';
  title = 'Viens jouez au petit bac';

  mounted() {
    this.url = window.location.href;

    const clip = new ClipboardJS('.copy-btn');
    clip.on('success', (e) => {
      // console.log('Action:', e.action);
      // console.log('Text:', e.text);
      // console.log('Trigger:', e.trigger);

      e.clearSelection();
    });

    clip.on('error', function(e) {
      // console.error('Action:', e.action);
      // console.error('Trigger:', e.trigger);
    });
  }

  diableTooltip() {
    this.$root.$emit('bv::hide::tooltip');
  }

}
</script>

<style lang="scss" scoped>
.social > span {
  padding: 1em;
}
</style>
