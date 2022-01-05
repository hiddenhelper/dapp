<template>
  <div class="ui very padded segment" style="background-color: transparent; margin: 0">
    <h2 class="ui header" style="margin-bottom: 2rem">
      Connect as Fund Manager
      <div class="sub header" style="margin-top: 0.8rem">Enter you email and password</div>
    </h2>

    <form :id="connectionFormId" class="ui form">
      <fieldset
        :disabled="busy"
        style="margin: 0px; padding-left: 0px; padding-right: 0px !important; border-style: none"
      >
        <div class="ui grid">
          <div class="sixteen wide column a">
            <div class="_muted" style="font-size: 1.2rem">
              Don't have an account yet?
              <div
                class="ui tertiary button primary"
                :class="{ disabled: busy }"
                style="margin: 0 !important; font-size: 16px"
                @click="signUp()"
              >
                Sign up
              </div>
            </div>
          </div>

          <div class="sixteen wide column b">
            <!-- User ID (email) -->
            <div class="required field">
              <div class="ui left icon input">
                <i class="at icon"></i>
                <input
                  v-model="credentials.userId"
                  tabindex="1"
                  type="email"
                  XXid="userId"
                  name="userId"
                  placeholder="E-mail Address"
                  autocomplete="username"
                />
              </div>
            </div>
          </div>

          <div class="sixteen wide column c">
            <!-- Password -->
            <PasswordField
              :class="{
                disabled: !passwordEnabled
              }"
              v-model="credentials.pwd"
              :tab-index="passwordEnabled ? 1 : -1"
              :name="'password'"
              :placeholder="'Password'"
              :show-hide-button="true"
              :required="false"
              :big="false"
              :auto-complete="'current-password'"
            />
          </div>

          <div class="four wide column d">
            <div
              class="ui button primary fluid"
              :class="{
                disabled: busy || !formIsValid,
                submit: !busy,
                loading: busy
              }"
              style="margin-top: 2rem; width: 8rem"
            >
              Log in
            </div>
          </div>

          <div class="twelve wide column e" style="padding: 0px 1rem 0px 0px">
            <div class="ui error message"></div>
            <div :id="errorsMessageId" class="ui hidden negative message" style="margin-top: 0">
              <i class="close icon"></i>
              <div class="header">Server Error{{ errors.length > 1 ? 's' : '' }}</div>
              <ul class="list">
                <li v-for="(error, index) in errors" :key="index">
                  <p>{{ error }}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </fieldset>
    </form>
  </div>
</template>

<script>
import PasswordField from './PasswordField.vue'

export default {
  name: 'EmailConnectorPanel',
  components: { PasswordField },
  props: {
    errors: {
      type: Array,
      required: true
    },
    busy: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      credentials: {
        userId: '',
        pwd: ''
      },
      errorMessage: ''
    }
  },
  computed: {
    formIsValid() {
      // Make this computed property reactive using some Vue's data
      const fieldsNotEmpty = !!this.credentials.userId && !!this.credentials.pwd
      let formsRulesValid = false
      if (fieldsNotEmpty) {
        // Check the form's rules
        formsRulesValid = $('#' + this.connectionFormId).form('is valid')
      }
      // console.log('Not empty:', fieldsNotEmpty, '|', 'Rules:', formsRulesValid)
      return fieldsNotEmpty && formsRulesValid
    },
    userIdIsValid() {
      // Make this computed property reactive using some Vue's data
      const userIdNotEmpty = !!this.credentials.userId
      let userIdValid = false
      if (userIdNotEmpty) {
        // Check the form's rule
        userIdValid = $('#' + this.connectionFormId).form('is valid', 'userId')
      }
      return userIdNotEmpty && userIdValid
    },
    passwordEnabled() {
      return this.userIdIsValid
    },
    connectionFormId() {
      return 'connectionForm' + this._uid
    },
    errorsMessageId() {
      return 'errorsMessage' + this._uid
    }
  },
  watch: {
    errors(v) {
      const el = $('#' + this.errorsMessageId)
      if (v && v.length > 0) {
        // Dismissable block fades-in when there are errors
        el.transition('fade')
        // and fades out after 3 seconds (if still visible)
        /*
        setTimeout(() => {
          if (el.transition('is visible')) {
            el.transition('fade')
          }
        }, 3000)
        */
      } else {
        el.transition('hide')
      }
    }
  },
  created() {},
  mounted() {
    // Initilize Semantic UI jquery:
    const connectEmailMethod = this.connectEmail

    // Form's rules
    $('#' + this.connectionFormId).form({
      on: 'blur',
      fields: {
        userId: 'email',
        password: 'empty'
      },
      onSuccess: (event, fields) => {
        event.preventDefault()
        connectEmailMethod()
      }
    })

    // Dismissable block closes when using the close icon
    $('#' + this.errorsMessageId + ' .close').on('click', () => {
      $('#' + this.errorsMessageId).transition('fade')
    })
  },
  beforeDestroy() {
    this.log(`${this.$options.name}.beforeDestroy`)
    $('#' + this.errorsMessageId + ' .close').off('click')
  },
  methods: {
    connectEmail() {
      this.$emit('connectEmail', {
        userId: this.credentials.userId,
        pwd: this.credentials.pwd
      })
    },
    signUp() {
      this.$emit('switchToSignUp')
    }
  }
}
</script>

<style scoped>
.ui.grid > .column {
  padding-top: 0 !important;
  padding-bottom: 0.8rem !important;
}

.ui.grid > .column:first-child {
  margin-top: 1rem !important;
}

.ui.grid > .column:last-child {
  height: 6rem;
}

.a {
  xbackground-color: pink;
}
.b {
  xbackground-color: yellow;
}
.c {
  xbackground-color: blue;
}
.d {
  xbackground-color: red;
}
.e {
  xbackground-color: green;
}

.message {
  border-style: none !important;
  border-radius: 0px !important;
  box-shadow: none !important;
}
</style>