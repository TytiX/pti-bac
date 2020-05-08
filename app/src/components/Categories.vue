<template>
  <div>
    <b-button-group>
      <b-button @click="random()" class="mt-3 mb-3">Random All</b-button>
      <b-button @click="random('classic')" class="mt-3 mb-3">Random Classic</b-button>
      <b-button @click="random('original')" class="mt-3 mb-3">Random Original</b-button>
      <b-button @click="random('hard')" class="mt-3 mb-3">Random Hard</b-button>
      <b-button @click="random('fun')" class="mt-3 mb-3">Random Fun</b-button>
    </b-button-group>

    <b-list-group>
      <b-list-group-item v-for="category of randomCategories" :key="`rand-${category.id}`">
        {{ category.name }}
      </b-list-group-item>
    </b-list-group>

    <div class="button-footer">
      <b-button variant="success"
        @click="$emit('add-categories', {categories: randomCategories, action: 'Add'})">
        Add
      </b-button>
      <b-button variant="warning"
        @click="$emit('add-categories', {categories: randomCategories, action: 'Set'})">
        Set
      </b-button>
    </div>

  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import { Category } from '@/models';

@Component
export default class Categories extends Vue {
  // categories: Category[] = [];
  randomCategories: Category[] = [];
  mounted() {
    // this.$feather.service('categories').find().then( (categories: Category[]) => {
    //   this.categories = categories;
    // });
  }
  random(...types: string[]) {
    this.$feather.service('categories').find({
      query: {
        random: 5,
        types
      }
    }).then( (categories: Category[]) => {
      this.randomCategories = categories;
    });
  }
}
</script>

<style lang="scss" scoped>
.button-footer>* {
    margin: .25rem;
}
.button-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  padding: 0.75rem;
  border-bottom-right-radius: calc(0.3rem - 1px);
  border-bottom-left-radius: calc(0.3rem - 1px);
}
</style>
