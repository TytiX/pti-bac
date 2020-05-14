<template>
  <div>
    <h3>{{ $t('correction') }}</h3>

    <b-container class="container-correction">
      <b-row v-for="category of categories" :key="category.id" class="cborder">
        <b-col class="header" cols="4">{{category.name}}</b-col>
        <b-col cols="8">
          <b-row v-for="user of users" :key="user.id" class="cborder">
            <b-col>{{user.name}}</b-col>
            <b-col>{{ correction[category.id][user.id].word }}</b-col>
            <b-col cols="1">

              <!-- Checkbox if not my word -->
              <b-form-checkbox
                v-if="user.id !== userId"
                v-model="correction[category.id][user.id].validations[userId]"
                @change="ckeck(category, user)">
              </b-form-checkbox>
            </b-col>
            <b-col cols="1">
              <!-- validation icon if majority validate -->
              <b-icon
                :icon="wordValidation(correction[category.id][user.id].validations)"
                class="icon-transition"></b-icon>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-container>

    <b-form-checkbox class="mt-3" v-model="validate" name="check-button" button>
      <b-icon v-if="validate" icon="check" animation="throb"></b-icon> {{ $t('validate') }}
    </b-form-checkbox>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import { Category, User, Correction, WordValidation } from '@/models';

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

  ckeck(category: Category, user: User) {
    this.correction[category.id][user.id].validations[this.userId] = !this.correction[category.id][user.id].validations[this.userId];

    this.$emit('check-word', this.correction);
  }

  @Watch('validate')
  confirmCorrection() {
    this.$emit('confirm-correction', this.validate);
  }

  wordValidation(wordValidation: WordValidation) {
    const oks = Object.values(wordValidation).filter(v => v);
    return oks.length > (this.users.length-1) / 2? 'check' : 'x';
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

.icon-transition {
  transition: transform .3s ease-in;
}
</style>
