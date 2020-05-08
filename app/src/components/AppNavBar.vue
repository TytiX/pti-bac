<template>
  <b-navbar toggleable="lg" type="dark" variant="dark">
    <b-navbar-brand v-if="!isHome" to="/">
        <b-icon icon="house-fill"></b-icon>
      </b-navbar-brand>
    <b-navbar-brand>{{title}}</b-navbar-brand>
    
    <b-navbar-nav class="ml-auto">
      <b-button v-if="isHome" v-b-modal.user-modal><b-icon icon="person"></b-icon></b-button>
    </b-navbar-nav>

    <b-modal id="user-modal"
      title="Change user name"
      @ok="handleOk">
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group
          :state="nameState"
          label="Name"
          label-for="name-input"
          invalid-feedback="Name is required">
          <b-form-input
            id="name-input"
            v-model="name"
            :state="nameState"
            required
          ></b-form-input>
        </b-form-group>
      </form>
    </b-modal>
  </b-navbar>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { BvModalEvent } from 'bootstrap-vue';

@Component
export default class AppNavBar extends Vue {
  @Prop({required: false, default: 'Pti Bac'})
  title!: string;
  isHome = true;

  name = '';
  nameState: boolean | null = null;

  mounted() {
    const user = this.$service.getUser();
    this.name = user.name || '';
  }

  @Watch('$route', { immediate: true, deep: true })
  routeChange() {
    switch(this.$route.path) {
      case '/':
        this.isHome = true;
        break;
      default:
        this.isHome = false;
        break;
    }
  }

  checkFormValidity() {
    const valid = (this.$refs.form as HTMLFormElement).checkValidity()
    this.nameState = valid
    return valid
  }
  handleOk(bvModalEvt: BvModalEvent) {
    // Prevent modal from closing
    bvModalEvt.preventDefault()
    // Trigger submit handler
    this.handleSubmit()
  }
  
  handleSubmit() {
    // Exit when the form isn't valid
    if (!this.checkFormValidity()) {
      return
    }
    this.$service.setName(this.name);
    // Hide the modal manually
    this.$nextTick(() => {
      this.$bvModal.hide('user-modal')
    })
  }

}
</script>
