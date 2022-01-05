<template>
  <div class="user-profile-detail">
    <form
      class="ui form attached fluid segment"
      id="changeUserProfileDetailForm"
    >
      <h4 class="ui horizontal divider header left">User Information</h4>
      <div class="field ui toggle checkbox">
        <input
          type="checkbox"
          name="public"
          id="showUserInfo"
          v-model="showUserInfo"
        />
        <label for="showUserInfo">Show on Fund's Card</label>
      </div>
      <div class="field">
        <label>First Name</label>
        <input
          placeholder="First Name"
          type="text"
          name="firstName"
          id="firstName"
          v-model="firstName"
        />
      </div>
      <div class="field">
        <label>Family Name</label>
        <input
          placeholder="Family Name"
          type="text"
          name="familyName"
          id="familyName"
          v-model="familyName"
        />
      </div>

      <h4 class="ui horizontal divider header left">Company Information</h4>
      <fieldset
        :disabled="workInProgress"
        style="margin: 0; padding: 0; border-style: none"
      >
        <div class="field ui toggle checkbox">
          <input
            type="checkbox"
            name="public"
            id="showCompanyInfo"
            v-model="showCompanyInfo"
          />
          <label for="showCompanyInfo">Show on Fund's Card</label>
        </div>
        <div class="field">
          <label>Code</label>
          <input placeholder="Code" type="text" :value="code" readonly />
        </div>
        <div class="field">
          <label>Name</label>
          <input placeholder="Name" type="text" :value="companyName" readonly />
        </div>
        <div class="field">
          <label>Website</label>
          <input
            placeholder="Website"
            type="text"
            :value="companyWebsite"
            readonly
          />
        </div>
        <div class="ui error message"></div>
        <div id="serverErrorsMsg" class="ui hidden negative message">
          <i class="close icon"></i>
          <div class="header">
            Server Error{{ serverErrors && serverErrors.length > 1 ? 's' : '' }}
          </div>
          <ul class="list">
            <li v-for="(error, index) in serverErrors" :key="index">
              <p>{{ error }}</p>
            </li>
          </ul>
        </div>
      </fieldset>
    </form>
    <div class="actions" style="margin-top: 1em">
      <div
        class="ui positive right labeled icon button"
        :class="{
          disabled: workInProgress || !formIsValid || !formIsChanged,
          loading: workInProgress
        }"
        tabindex="1"
        @keyup.enter.stop="changeUserProfileDetail()"
        @keyup.space.stop="changeUserProfileDetail()"
        @click="changeUserProfileDetail()"
      >
        Change
        <i class="checkmark icon"></i>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'UserProfileDetails',
  data() {
    return {
      firstName: this.user.firstName,
      familyName: this.user.familyName,
      showUserInfo: this.user.showUserDetails,
      code: '',
      companyName: 'this.userCompany.name',
      companyWebsite: 'this.userCompany.website',
      showCompanyInfo: this.user.showCompanyDetails,
      serverErrors: null
    }
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  computed: {
    formIsValid() {
      const fieldsNotEmpty = !!this.firstName && !!this.familyName
      return fieldsNotEmpty
    },
    formIsChanged() {
      return (
        this.firstName !== this.$store.state.user.firstName ||
        this.familyName !== this.$store.state.user.familyName ||
        this.showUserInfo !== this.$store.state.user.showUserDetails ||
        this.showCompanyInfo !== this.$store.state.user.showCompanyDetails
      )
    },
    userCompany() {
      return this.$store.getters.getCompanyById(this.user.company)
    }
  },
  mounted() {
    this.code = this.userCompany.id
    this.companyName = this.userCompany.name
    this.companyWebsite = this.userCompany.website

    let here = this
    $('#changeUserProfileDetailForm').form({
      on: 'change',
      inline: false,
      fields: {
        firstName: {
          identifier: 'firstName',
          rules: [
            {
              type: 'empty',
              prompt: 'First Name is empty!'
            }
          ]
        },
        familyName: {
          identifier: 'familyName',
          rules: [
            {
              type: 'empty',
              prompt: 'Family Name is empty!'
            }
          ]
        }
      },
      onSuccess: function (event, fields) {
        event.preventDefault()
        // console.log(here.firstName, here.familyName)
      }
    })

    // Dismissable block fades-out when using the close icon
    $('.message .close').on('click', () => {
      $('#serverErrorsMsg').transition('fade')
    })
  },
  methods: {
    isEmptyText(val) {
      if (val.length === 0) return false
      return true
    },
    async changeUserProfileDetail() {
      if (this.workInProgress || !this.formIsValid) {
        return
      }

      $('#serverErrorsMsg').transition('hide')
      this.serverErrors = undefined
      this.$store.dispatch('setWorkInProgress', true)

      const apiParams = {
        userId: this.$store.state.user.userId,
        token: this.$store.state.user.token,
        firstName: this.firstName,
        familyName: this.familyName,
        showUserDetails: this.showUserInfo,
        showCompanyDetails: this.showCompanyInfo
      }

      console.time(this.$options.name + '.changeUserDetails')

      let error = false
      await axios
        .post(this.$store.state.APIs.changeUserDetails, apiParams)
        .then(({ data }) => {
          if (data.errors && data.errors.length > 0) {
            this.serverErrors = data.errors
            error = true
          } else {
            const newUserData = { ...this.$store.state.user, ...apiParams }
            this.$store.commit('SET_USER_DATA', newUserData)
          }
        })
        .catch(({ err }) => {
          console.error('Error', err)
          this.serverErrors = ['Internal Server Error!']
          error = true
        })
        .finally(() => {
          console.timeEnd(this.$options.name + '.changeUserDetails')
          this.$store.dispatch('setWorkInProgress', false)
        })

      if (error) {
        // Dismissable block fades-in when there are errors
        $('#serverErrorsMsg').transition('fade')
      }

      return !error
    }
  }
}
</script>

<style scoped>
/* / */
label[for] {
  cursor: pointer;
}

.user-profile-detail {
  max-width: 600px;
  padding: 1em;
}
</style>