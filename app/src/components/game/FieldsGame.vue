<template>
  <div class="form-container">
    <b-form-group
      v-for="category of categories"
      :key="category.id"
      :label="category.name">
      <b-form-input v-model="currentWordState[category.id]" trim></b-form-input>
    </b-form-group>
    <div class="button-container">
      <b-button @click="finish">Finish</b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import { Category, CategoryWord } from '@/models';

@Component
export default class FieldsGame extends Vue {
  @Prop({ required: true, default: () => {return [];} })
  categories!: Category[];

  currentWordState: CategoryWord = {};

  beforeMounted() {
    for (const category of this.categories) {
      this.$set(this.currentWordState, category.id, '');
    }
  }

  @Watch('currentWordState', { deep: true })
  wordChange() {
    this.$emit('user-change', this.currentWordState);
  }

  finish() {
    this.$emit('finish', this.currentWordState)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/main.scss';
</style>
