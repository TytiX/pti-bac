<template>
  <div class="form-container">
    <b-form-group
      v-for="category of categories"
      :key="category.id"
      :label="category.name">
      <b-form-input
        v-model="currentWordState[category.id]"
        @change="wordChange(category.id)"
        v-on:keyup.enter="$event.target.nextElementSibling.focus()"
        trim></b-form-input>
    </b-form-group>
    <div class="button-container">
      <b-button @click="finish" variant="danger">Finish</b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

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

  wordChange(categoryId: number) {
    this.$emit('user-change', this.currentWordState[categoryId], this.categories[categoryId]);
  }

  finish() {
    this.$emit('finish', this.currentWordState)
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/main.scss';
</style>
