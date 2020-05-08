<template>
  <div>
    <!-- <div>{{numberToDraw}}</div> -->
    <b-input-group prepend="5" append="20" class="mt-3">
      <b-form-input v-b-tooltip :title="numberToDraw" v-model="numberToDraw" type="range" min="5" max="20"></b-form-input>
    </b-input-group>
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
      <b-button
        v-b-tooltip.hover title="Ajoute les categories aux existantes"
        variant="success"
        @click="$emit('add-categories', {categories: randomCategories, action: 'Add'})">
        Ajouter
      </b-button>
      <b-button
        v-b-tooltip.hover title="Remplace les categories par le tirrage"
        variant="warning"
        @click="$emit('add-categories', {categories: randomCategories, action: 'Set'})">
        Remplacer
      </b-button>
    </div>

  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import { Category } from '@/models';

@Component
export default class Categories extends Vue {
  randomCategories: Category[] = [];
  numberToDraw = 5;

  random(...types: string[]) {
    this.$feather.service('categories').find({
      query: {
        random: this.numberToDraw,
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
