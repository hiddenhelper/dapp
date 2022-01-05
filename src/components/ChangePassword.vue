<template>
  <div
    :id="id"
    class="ui inverted"
    :class="{ modal: modal, container: !modal }"
    style="background: #1e1e1e !important"
  >
    <!-- <i v-if="modal" class="close icon"></i> -->
    <div v-if="modal" class="header" style="background: transparent">Change Password</div>
    <div class="image content" style="background: transparent">
      <div v-if="modal" class="ui image">
        <img src="/images/misc/login-keys@140x140.svg" />
      </div>
      <div class="description" style="width: 100%">
        <div v-if="message" class="ui header">
          {{ message }}
        </div>

        <!-- FORM -->
        <form id="changePasswordForm" class="ui form">
          <fieldset :disabled="workInProgress" style="margin 0; padding: 0; border-style: none">
            <div class="ui basic segment">
              <PasswordField
                v-model="currentPassword"
                :name="'currentPassword'"
                :label="'Current Password'"
                :show-hide-button="true"
                :auto-complete="'current-password'"
              />

              <div class="ui section divider"></div>

              <div class="ui accordion" style="margin-top: 0.8rem; margin-bottom: 1.2rem">
                <div class="active title" style="color: rgb(33, 133, 208); padding: 0px">
                  <i class="large blue info circle icon"></i>
                  <!-- <span>Password Policy</span> -->
                  <span>Password Hints</span>
                </div>
                <div class="content" style="padding: 0px">
                  <div class="ui one column grid" style="margin: 0 0.5rem">
                    <div
                      class="column"
                      style="
                        margin: 0.5rem 0;
                        padding: 0.2rem;
                        border-left: 2px solid rgb(33, 133, 208);
                      "
                    >
                      Choose a strong password and don't reuse it for other accounts.
                    </div>
                    <div
                      class="column"
                      style="
                        margin: 0.5rem 0;
                        padding: 0.2rem;
                        border-left: 2px solid rgb(33, 133, 208);
                      "
                    >
                      Try to use <u>8 characters</u> or more, with a mix of
                      <u>lowercase/uppercase letters</u>, <u>numbers</u> and <u>symbols</u> from
                      this list:
                      <span style="font-family: 'Courier New'">
                        !#%&amp;',:;&lt;=&gt;@_`~$^.()[]|{}*+?/&nbsp;-\&quot;
                      </span>
                    </div>

                    <!--
                    <div
                      class="column"
                      style="
                        margin: 0.5rem 0;
                        padding: 0.2rem;
                        border-left: 2px solid rgb(33, 133, 208);
                      "
                    >
                      Use <u>15 characters</u> or more, including at least one
                      <u>lowercase</u> letter, one <u>uppercase</u> letter, one
                      <u>number</u> and one <u>special character</u>
                      from this list:
                      <span style="font-family: 'Courier New';">
                        !#%&amp;',:;&lt;=&gt;@_`~$^.()[]|{}*+?/&nbsp;-\&quot;
                      </span>
                    </div>
                    -->
                    <div
                      class="column"
                      style="
                        margin: 0.5rem 0;
                        padding: 0.2rem;
                        border-left: 2px solid rgb(33, 133, 208);
                      "
                    >
                      Spaces are allowed, except at the beginning/end of the password
                      (leading/trailing spaces will be automatically trimmed).
                    </div>
                    <div
                      class="column"
                      style="
                        margin: 0.5rem 0;
                        padding: 0.2rem;
                        border-left: 2px solid rgb(33, 133, 208);
                      "
                    >
                      Avoid using your name or the word <i>DOMANI</i>.
                    </div>
                  </div>
                </div>
              </div>

              <PasswordField
                :class="{ disabled: !newPasswordEnabled }"
                v-model="newPassword"
                :tab-index="newPasswordEnabled ? 1 : -1"
                :name="'newPassword'"
                :label="'New Password'"
                :strength="passwordStrength"
                :show-hide-button="true"
                :show-character-count="true"
                :show-strength="true"
                :auto-complete="'new-password'"
              />

              <PasswordField
                :class="{
                  disabled: !confirmPasswordEnabled
                }"
                v-model="confirmPassword"
                :tab-index="confirmPasswordEnabled ? 1 : -1"
                :name="'confirmPassword'"
                :label="'Confirm New Password'"
                :show-hide-button="true"
                :show-character-count="true"
                style="margin-top: 1rem"
              />
              <!-- 
              <div
                class="ui positive right labeled icon submit button"
                :class="{
                  disabled: workInProgress || !formIsValid,
                  loading: workInProgress
                }"
                tabindex="1"
              >
                Change
                <i class="checkmark icon"></i>
              </div> -->
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
      </div>
    </div>

    <div class="actions" style="background: transparent">
      <div
        class="ui right labeled icon button primary"
        :class="{
          disabled: workInProgress || !formIsValid,
          loading: workInProgress
        }"
        tabindex="1"
        @keyup.enter.stop="changePassword('enter')"
        @keyup.space.stop="changePassword('space')"
        @click="changePassword('click')"
      >
        Change
        <i class="checkmark icon"></i>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import zxcvbn from 'zxcvbn'
import PasswordField from './PasswordField.vue'

const USE_POLICY = false

// Regular expression to check these rules:
// (?=.*[a-z])      The string must contain at least 1 lowercase alphabetical character
// (?=.*[A-Z])      The string must contain at least 1 uppercase alphabetical character
// (?=.*[0-9])      The string must contain at least 1 numeric character
// (?=.*[!#%&\',:;<=>@_`~\\$\\^\\.\\(\\)\\[\\]\\|\\{\\}\\*\\+\\?\\/ \\-\\\\\"]) The string must contain at least one special character in !#%&',:;<=>@_`~$^.()[]|{}*+?/ -\" (double escaping reserved RegEx characters to avoid conflict)
// (?=.{15,})       The string must be 15 characters or longer
const STRONG_REGEX = new RegExp(
  '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!#%&\',:;<=>@_`~\\$\\^\\.\\(\\)\\[\\]\\|\\{\\}\\*\\+\\?\\/ \\-\\\\"])(?=.{15,})'
)

export default {
  name: 'ChangePassword',
  components: { PasswordField },
  props: {
    id: {
      type: String,
      required: true
    },
    user: {
      type: Object,
      required: true
    },
    modal: {
      type: Boolean,
      required: false,
      default: false
    },
    message: {
      type: String,
      required: false,
      default: ''
    },
    forbiddenWords: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      serverErrors: null
    }
  },
  computed: {
    formIsValid() {
      // Make this computed property reactive using some Vue's data
      const fieldsNotEmpty = !!this.currentPassword && !!this.newPassword && !!this.confirmPassword
      let formsRulesValid = false
      if (fieldsNotEmpty) {
        // Check the form's rules
        formsRulesValid = $('#changePasswordForm').form('is valid')
      }
      // console.log('Not empty:', fieldsNotEmpty, '|', 'Rules:', formsRulesValid)
      return fieldsNotEmpty && formsRulesValid
    },
    newPasswordIsValid() {
      // Make this computed property reactive using some Vue's data
      const newPwdNotEmpty = !!this.newPassword
      let newPasswordValid = false
      if (newPwdNotEmpty) {
        // Check the form's rule
        newPasswordValid = $('#changePasswordForm').form('is valid', 'newPassword')
      }

      return newPwdNotEmpty && newPasswordValid
    },
    newPasswordEnabled() {
      return this.currentPassword.trim().length > 0
    },
    confirmPasswordEnabled() {
      return this.newPasswordEnabled && this.newPasswordIsValid
    },
    passwordStrength() {
      // if (this.newPasswordIsValid) {
      if (this.newPassword) {
        var result = zxcvbn(this.newPassword, this.forbiddenWords)
        // console.log(result)
        return result.score
      }
      return -1
    }
  },
  created() {},
  mounted() {
    // Initilize Semantic UI jquery (THE ORDER IS EXTREMELY IMPORTANT TO AVOID):

    // Initialize accordion
    $('.ui.accordion').accordion()

    // Custom rule to validate new password
    $.fn.form.settings.rules.securePassword = this.validatePassword

    // Form's rules
    const methodToCallOnSubmit = this.changePassword
    $('#changePasswordForm').form({
      on: 'change',
      inline: false,
      fields: {
        currentPassword: {
          identifier: 'currentPassword',
          rules: [
            {
              type: 'empty',
              prompt: 'Please enter the Current Password'
            }
          ]
        },
        newPassword: {
          identifier: 'newPassword',
          depends: 'currentPassword',
          rules: [
            {
              type: 'different[currentPassword]',
              prompt: 'The New Password must be different than the Current Password'
            },
            {
              type: 'securePassword',
              prompt: 'Please enter a valid New Password'
            }
          ]
        },
        confirmPassword: {
          identifier: 'confirmPassword',
          depends: 'newPassword',
          rules: [
            {
              type: 'match[newPassword]',
              prompt: 'Passwords do not match'
            }
          ]
        }
      },
      onSuccess: function (event, fields) {
        event.preventDefault()
        methodToCallOnSubmit('onSuccess')
      }
    })

    // Dismissable block fades-out when using the close icon
    $('.message .close').on('click', () => {
      $('#serverErrorsMsg').transition('fade')
    })
  },
  beforeDestroy() {
    $('.message .close').off('click')
  },
  methods: {
    validatePassword(value) {
      if (value) {
        const lowerVal = value.toLowerCase()
        const found = this.forbiddenWords.find((w) => lowerVal.includes(w))
        if (!found) {
          if (USE_POLICY) {
            return STRONG_REGEX.test(value)
          } else {
            return true
          }
        }
      }
      return false
    },
    async changePassword(caller) {
      // console.log('changePassword', caller)

      // tomorrow I need to cascade another modal in case of errors

      if (this.workInProgress || !this.formIsValid) {
        return
      }

      console.time(this.$options.name + '.changePassword')
      $('#serverErrorsMsg').transition('hide')

      this.serverErrors = undefined
      this.$store.dispatch('setWorkInProgress', true)

      const credentials = {
        userId: this.user.userId,
        currentPwd: this.currentPassword,
        newPwd: this.newPassword
      }

      let error = false

      await axios
        .post(this.$store.state.APIs.changePassword, credentials)
        .then(({ data }) => {
          if (data.errors && data.errors.length > 0) {
            this.serverErrors = data.errors
            error = true
          } else {
            this.$store.state.user.isFundManager = true
            this.$emit('changed')
            $('changePasswordForm').form('clear')
          }
        })
        .catch(({ error }) => {
          console.error('error', error)
          this.serverErrors = ['Internal server error!']
          error = true
        })
        .finally(() => {
          console.timeEnd(this.$options.name + '.changePassword')
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

<style scoped></style>
