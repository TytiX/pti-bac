<template>
  <div>
    <h3>Correction</h3>

    <b-container class="container-correction">
      <b-row v-for="category of categories" :key="category.id" class="cborder">
        <b-col class="header" cols="4">{{category.name}}</b-col>
        <b-col cols="8">
          <b-row v-for="user of users" :key="user.id" class="cborder">
            <b-col>{{user.name}}</b-col>
            <b-col>{{ correction[category.id][user.id].word }}</b-col>
            <b-col>

              <div class="custom-control custom-checkbox custom-control-inline"
                v-for="userWord of users"
                :key="userWord.id">
                <input type="checkbox" class="custom-control-input"
                  :id="`validation-${category.id}-${user.id}-${userWord.id}`"
                  v-model="correction[category.id][user.id].validations[userWord.id]"
                  @click="ckeck(category, user, userWord)"
                  :disabled="userWord.id !== userId">
                <label class="custom-control-label" :for="`validation-${category.id}-${user.id}-${userWord.id}`"></label>
              </div>

            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-container>

    <b-form-checkbox class="mt-3" v-model="validate" name="check-button" button>
      <b-icon v-if="validate" icon="check" animation="throb"></b-icon> Validate
    </b-form-checkbox>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import { Category, User, Correction } from '@/models';

@Component
export default class CorrectionGame extends Vue {
  @Prop({required: true})
  categories!: Category[];
  @Prop({required: true})
  users!: User[];
  @Prop({required: true})
  correction!: Correction;

  validate = false;

  get userId() {
    return this.$service.getUser().id;
  }

  ckeck(category: Category, user: User, userWord: User) {
    this.correction[category.id][user.id].validations[userWord.id] = !this.correction[category.id][user.id].validations[userWord.id];

    this.$emit('check-word', this.correction);
  }

  @Watch('validate')
  confirmCorrection() {
    this.$emit('confirm-correction', this.validate);
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/custom-check.scss';

.cborder {
  border: 1px solid rgba(58, 58, 58, 0.781);
}
.container-correction .row {
  background-color: rgba(0, 132, 255, 0.1);
}
.container-correction .row>.col:not(.header), .container-correction .row>[class^=col-] {
    padding-top: .3rem;
    padding-bottom: .3rem;
}
.header {
  padding-top: .5rem;
}
</style>
