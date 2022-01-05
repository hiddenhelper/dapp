<template>
  <div class="ui two column middle aligned center aligned grid" style="padding: 0px 1rem">
    <div class="column">
      <table style="white-space: nowrap; margin-left: auto; margin-right: auto">
        <tr>
          <td style="padding: 1rem">
            <router-link to="/">
              <img style="height: 7rem" src="/images/logo.svg" />
            </router-link>
          </td>
          <td
            style="
              padding: 1rem;
              color: #9a9a9a;
              text-align: left;
              font-size: 4rem;
              font-weight: bold;
              line-height: 1;
            "
          >
            WELCOME TO THE
            <BR />
            <span style="color: #525252">
              DOMANI ÐAPP.
              <div
                class="ui tiny text"
                style="
                  display: inline;
                  color: #db2828;
                  font-size: 2rem;
                  vertical-align: top;
                  margin-left: -1rem;
                "
              >
                {{ dappVersion }}
              </div>
            </span>
          </td>
        </tr>

        <tr style="text-align: left; height: 400px">
          <td>&nbsp;</td>
          <!-- FORM -->
          <td style="padding: 1rem; vertical-align: top">
            <form :id="formId" class="ui form">
              <fieldset :disabled="inProgress" style="margin 0px; padding: 0px; border-style: none">
                <!-- User ID (email) -->
                <div class="required field">
                  <div class="ui left icon input">
                    <i class="at icon"></i>
                    <input
                      v-model="fields.userId"
                      tabindex="1"
                      type="email"
                      XXid="userId"
                      name="userId"
                      placeholder="E-mail Address"
                    />
                  </div>
                </div>

                <!-- Password -->
                <PasswordField
                  :class="{
                    disabled: !passwordEnabled
                  }"
                  v-model="fields.pwd"
                  :tab-index="passwordEnabled ? 1 : -1"
                  :name="'password'"
                  :placeholder="'Password'"
                  :show-hide-button="true"
                  :required="false"
                  :auto-complete="'current-password'"
                />

                <div class="ui basic segment" style="padding: 0px">
                  <div
                    class="ui big fast loader"
                    :class="{ active: inProgress }"
                    style="color: #29fd2e"
                  ></div>

                  <table
                    class="basic segment"
                    style="width: 100%; color: #9a9a9a; margin-top: 2rem"
                  >
                    <tr>
                      <td rowspan="3" width="95%" style="padding: 0px">
                        <div
                          class="_logInButton"
                          :class="{
                            submit: !inProgress
                          }"
                        >
                          <img
                            class="ui spaced loading image"
                            :class="{ disabled: inProgress }"
                            src="/images/buttons/logIn.svg"
                            alt="LOG IN"
                            style="
                              height: 80px;
                              vertical-align: middle;
                              margin: 0px;
                              xbackground-color: red;
                            "
                          />
                        </div>
                      </td>
                      <td width="5%" style="padding: 0px">don't have an account yet?</td>
                    </tr>
                    <tr>
                      <td width="5%" style="padding: 0px; vertical-align: bottom">
                        <router-link
                          class="_signUpLink"
                          :disabled="inProgress"
                          :event="inProgress ? '' : 'click'"
                          style="font-size: 1.3rem"
                          :style="{ cursor: inProgress ? 'default' : '' }"
                          to="/register"
                        >
                          <span class="ui text" :class="{ disabled: inProgress }"> SIGN UP </span>
                        </router-link>
                      </td>
                    </tr>
                    <tr>
                      <td width="5%" style="padding: 0px">&nbsp;</td>
                    </tr>
                  </table>

                  <div style="text-align: center">
                    <span class="ui grey small text">
                      By using the DOMANI ÐAPP you acknowledge having read the<br />
                      <a
                        class="_darkGrey"
                        href="docs/DEXTF_Dapp_Beta_Disclaimer_v0.1.pdf"
                        target="disclaimer"
                        v-text="'Disclaimer'"
                      />
                      and agree with the
                      <a
                        class="_darkGrey"
                        href="docs/DEXTF_TC_v0.1.pdf"
                        target="tc"
                        v-text="'Terms and Conditions'"
                      />
                    </span>
                  </div>
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
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import PasswordField from '../components/PasswordField.vue'

export default {
  name: 'LoginUser',
  components: { PasswordField },
  data() {
    return {
      fields: {
        userId: '',
        pwd: ''
      },
      serverErrors: undefined,
      inProgress: false
    }
  },
  computed: {
    formId() {
      return `form${this._uid}`
    },
    dappVersion() {
      if (this.$store.state.environment == 'prod') {
        return undefined
      } else if (this.$store.state.environment == 'ropsten') {
        return 'ropsten'
      } else {
        return this.$store.state.environment + ' ' + process.env.VUE_APP_VERSION
      }
      return ''
    },
    formIsValid() {
      // Make this computed property reactive using some Vue's data
      const fieldsNotEmpty = !!this.fields.userId && !!this.fields.pwd
      let formsRulesValid = false
      if (fieldsNotEmpty) {
        // Check the form's rules
        formsRulesValid = $(`#${this.formId}`).form('is valid')
      }
      // console.log('Not empty:', fieldsNotEmpty, '|', 'Rules:', formsRulesValid)
      return fieldsNotEmpty && formsRulesValid
    },
    userIdIsValid() {
      // Make this computed property reactive using some Vue's data
      const userIdNotEmpty = !!this.fields.userId
      let userIdValid = false
      if (userIdNotEmpty) {
        // Check the form's rule
        userIdValid = $(`#${this.formId}`).form('is valid', 'userId')
      }
      return userIdNotEmpty && userIdValid
    },
    passwordEnabled() {
      return this.userIdIsValid
    }
  },
  mounted() {
    // Initilize Semantic UI jquery:

    const loginMethod = this.logIn

    // Form's rules
    $(`#${this.formId}`).form({
      on: 'blur',
      fields: {
        userId: 'email',
        password: 'empty'
      },
      onSuccess: (event, fields) => {
        event.preventDefault()
        loginMethod()
      }
    })

    // Dismissable block closes when using the close icon
    $('.message .close').on('click', () => {
      $('#serverErrorsMsg').transition('fade')
    })
  },
  beforeDestroy() {
    $('.message .close').off('click')
  },
  methods: {
    logIn() {
      // TO TEST ----
      /*
      this.serverMessages = ['sdfsdfsdfsdsdf']
      this.inProgress = true
      $('#serverMessages').transition('fade')
      */
      // ------------

      if (this.inProgress || !this.formIsValid) {
        return
      }

      console.time(this.$options.name + '.logIn')
      $('#serverErrorsMsg').transition('hide')

      this.serverErrors = undefined
      this.inProgress = true

      this.$store
        .dispatch('login', this.fields)
        .then(() => {
          this.$router.push({ name: 'command-centre' })
        })
        .catch((err) => {
          this.serverErrors = err.response.data.errors
          // Dismissable block fades-in when there are errors
          $('#serverErrorsMsg').transition('fade')
        })
        .finally(() => {
          console.timeEnd(this.$options.name + '.logIn')
          this.inProgress = false
        })
    }
  }
}
</script>

<style scoped>
._logInButton {
  cursor: pointer;
}
._logInButton.disabled {
  cursor: default;
}

._signUpLink,
._signUpLink:hover {
  color: #9a9a9a;
  font-weight: bold;
}

/*--------------
  Semantic UI overrides
  ---------------*/

/* Should be done in our version of Semantic UI */
.message {
  border-style: none !important;
  border-radius: 0px !important;
  box-shadow: none !important;
}
</style>
