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

        <tr v-if="false">
          <td>&nbsp;</td>
          <td style="padding: 0 1rem; vertical-align: top">
            <!-- Disclaimer -->
            <div
              class="ui message left aligned"
              style="white-space: normal; color: #525252; background-color: #f5f5f5"
            >
              <div class="header">IMPORTANT DISCLAIMER</div>
              <p style="text-align: left">
                NOTE: this is a <b>beta</b> version of the “DEXTF Ðapp software” (“the software”)
                with limited functionalities being released before the official launch -
                <a
                  class="_warning"
                  href="docs/DEXTF_Dapp_Beta_Disclaimer_v0.1.pdf"
                  target="disclaimer"
                  v-text="'read here'"
                />.
              </p>
            </div>

            <!-- T&C -->
            <div
              class="ui message left aligned"
              style="white-space: normal; color: #525252; background-color: #f5f5f5"
            >
              <div class="header">TERMS & CONDITIONS</div>
              <p style="text-align: left">
                Please
                <a
                  class="_warning"
                  href="docs/DEXTF_TC_v0.1.pdf"
                  target="tc"
                  v-text="'read these'"
                />
                User Service Terms and Conditions (“the Agreement”) carefully. Your use or access of
                the platform (as defined below) constitutes your consent to this Agreement. If you
                do not agree to be bound by this Agreement, please do not use or access our
                Services.
              </p>
            </div>
          </td>
        </tr>

        <tr style="text-align: left">
          <td>&nbsp;</td>
          <!-- FORM -->
          <td style="padding: 1rem; vertical-align: top">
            <form :id="formId" class="ui form">
              <fieldset :disabled="inProgress" style="margin 0px; padding: 0px; border-style: none">
                <!-- Ackowlegment -->
                <div v-show="false" id="acknowledged" class="required field">
                  <input
                    v-model="fields.acknowledged"
                    type="checkbox"
                    name="acknowledged"
                    style="display: none"
                  />
                  <div
                    class="ui basic fluid button"
                    :class="{ disabled: inProgress }"
                    style="
                      text-align: left;
                      line-height: 1.21428571em;
                      padding: 0.8rem 1rem;
                      border-radius: 0px !important;
                      border-left: 2px solid #9a9a9a !important;
                    "
                    :style="acknowledgementButtonStyle"
                    @click="fields.acknowledged = !fields.acknowledged"
                  >
                    <i class="icon" :class="acknowledgedIconClass"></i>
                    I acknowledge having read the Disclaimer and Terms & Conditions.
                  </div>
                </div>

                <!-- First Name -->
                <div id="firstName" class="required field">
                  <div class="ui left icon corner labeled input">
                    <i class="user icon"></i>
                    <input
                      v-model="fields.firstName"
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                    />
                  </div>
                </div>

                <!-- Last Name -->
                <div id="familyName" class="required field">
                  <div class="ui left icon corner labeled input">
                    <i class="user icon"></i>
                    <input
                      v-model="fields.familyName"
                      type="text"
                      name="familyName"
                      placeholder="Family Name"
                    />
                  </div>
                </div>

                <!-- Email -->
                <div id="email" class="required field">
                  <div class="ui left icon corner labeled input">
                    <i class="at icon"></i>
                    <input
                      v-model="fields.email"
                      type="email"
                      name="email"
                      placeholder="E-mail Address"
                    />
                  </div>
                </div>

                <!-- Phone -->
                <div id="phone" class="field">
                  <div class="ui left icon corner labeled input">
                    <i class="phone alternate icon"></i>
                    <input v-model="fields.phone" type="text" name="phone" placeholder="Phone" />
                  </div>
                </div>

                <!-- Country -->
                <div id="country" class="required field" :class="{ disabled: inProgress }">
                  <div id="country-drop-down" class="ui search selection dropdown">
                    <input type="hidden" name="country" />
                    <i class="dropdown icon"></i>
                    <div class="default text"></div>
                  </div>
                </div>

                <!-- Sign Up Reason(s) -->
                <div id="signUpReasons" class="field" :class="{ disabled: inProgress }">
                  <div id="reason-drop-down" class="ui multiple selection dropdown">
                    <input type="hidden" name="signUpReasons" />
                    <i class="dropdown icon"></i>
                    <div class="default text"></div>
                  </div>
                </div>

                <div class="ui left aligned basic segment" style="background-color: #f5f5f5">
                  <div v-show="false" class="ui toggle checkbox field">
                    <input v-model="fields.isFundManager" type="checkbox" name="isFundManager" />
                    <label style="color: #525252">Fund Manager with:</label>
                  </div>
                  <label v-show="true" style="color: #525252">
                    Fund Manager with:
                    <br />
                    &nbsp;
                  </label>

                  <!-- Company -->
                  <div
                    id="company"
                    class="required field"
                    :class="{ disabled: !fields.isFundManager }"
                  >
                    <input
                      type="text"
                      name="company"
                      v-model="fields.company"
                      placeholder="Company"
                    />
                  </div>

                  <!-- Website -->
                  <div class="field" :class="{ disabled: !fields.isFundManager }">
                    <input
                      type="text"
                      name="website"
                      v-model="fields.website"
                      placeholder="Website"
                    />
                  </div>
                </div>

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
                          class="_signUpButton"
                          :class="{
                            submit: !inProgress
                          }"
                        >
                          <img
                            class="ui spaced loading image"
                            :class="{ disabled: inProgress }"
                            src="/images/buttons/signUp.svg"
                            alt="SIGN UP"
                            style="
                              height: 80px;
                              vertical-align: middle;
                              margin: 0px;
                              xbackground-color: red;
                            "
                            @click="submitCount++"
                          />
                        </div>
                      </td>
                      <td with="5%" style="padding: 0px">already registered?</td>
                    </tr>
                    <tr>
                      <td width="5%" style="padding: 0px; vertical-align: bottom">
                        <router-link
                          class="_logInLink"
                          :disabled="inProgress"
                          :event="inProgress ? '' : 'click'"
                          style="font-size: 1.3rem"
                          :style="{ cursor: inProgress ? 'default' : '' }"
                          to="/login"
                        >
                          <span class="ui text" :class="{ disabled: inProgress }"> LOG IN </span>
                        </router-link>
                      </td>
                    </tr>
                    <tr>
                      <td width="5%" style="padding: 0px">&nbsp;</td>
                    </tr>
                  </table>
                </div>

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

                <div class="ui error message"></div>
                <div id="serverMessages" class="ui hidden negative message">
                  <i class="close icon"></i>
                  <div class="header">
                    {{ serverMessagesHeader }}
                  </div>
                  <ul class="list">
                    <li v-for="(msg, index) in serverMessages" :key="index">
                      <p>{{ msg }}</p>
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
export default {
  name: 'RegisterUser',
  data() {
    return {
      fields: {
        acknowledged: true,
        firstName: '',
        familyName: '',
        email: '',
        phone: '',
        country: '',
        signUpReasons: '',
        isFundManager: true,
        company: '',
        website: ''
      },
      countries: [],
      signUpReasons: [],
      serverMessagesHeader: '',
      serverMessages: undefined,
      inProgress: false,
      submitCount: 0
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
      const fieldsNotEmpty =
        this.fields.acknowledged === true &&
        !!this.fields.firstName &&
        !!this.fields.familyName &&
        !!this.fields.email &&
        !!this.fields.country &&
        (!this.fields.isFundManager || !!this.fields.company)
      let formsRulesValid = false
      if (fieldsNotEmpty) {
        // Check the form's rules
        formsRulesValid = $(`#${this.formId}`).form('is valid')
      }
      // console.log('Not empty:', fieldsNotEmpty, '|', 'Rules:', formsRulesValid)
      return fieldsNotEmpty && formsRulesValid
    },
    acknowledgementButtonStyle() {
      // Make this computed property reactive using some Vue's data
      if (this.submitCount > 0) {
        if (!this.fields.acknowledged) {
          return {
            'background-color': '#FFF6F6',
            color: '#9F3A38',
            '-webkit-box-shadow': '0 0 0 1px #E0B4B4 inset',
            'box-shadow': '0 0 0 1px #E0B4B4 inset'
          }
        }
      }
      return {}
    },
    acknowledgedIconClass() {
      /*
      unchecked > not acknowledged > "square outline"
      checked > acknowledged > "check square outline"
      */
      return {
        check: this.fields.acknowledged,
        square: true,
        outline: true
      }
    }
  },
  created() {
    this.initCountries()
    this.initSignUpReasons()
  },
  mounted() {
    // Initilize Semantic UI jquery:

    const signUpMethod = this.signUp

    // Form's rules
    /* TO TEST
    $(`#${this.formId}`).form({
      on: 'blur',
      onSuccess: (event, fields) => {
        event.preventDefault()
        signUpMethod()
      }
    })
    /*/
    $(`#${this.formId}`).form({
      on: 'blur',
      fields: {
        acknowledged: {
          identifier: 'acknowledged',
          rules: [
            {
              type: 'checked',
              prompt: 'Acknowledgement must be checked'
            }
          ]
        },
        firstName: {
          identifier: 'firstName',
          rules: [
            {
              type: 'empty'
            }
          ]
        },
        familyName: {
          identifier: 'familyName',
          rules: [
            {
              type: 'empty'
            }
          ]
        },
        email: {
          identifier: 'email',
          rules: [
            {
              type: 'email'
            }
          ]
        },
        country: {
          identifier: 'country',
          rules: [
            {
              type: 'empty',
              prompt: 'Country must have a value'
            }
          ]
        },
        company: {
          identifier: 'company',
          depends: 'isFundManager',
          rules: [
            {
              type: 'empty',
              prompt: 'Company must have a value'
            }
          ]
        },
        website: {
          identifier: 'website',
          depends: 'isFundManager',
          optional: true,
          rules: [
            {
              type: 'regExp[/^((https?)://)?(www.)?[a-z0-9]+.[a-z]+(/[a-zA-Z0-9#]+/?)*$/gm]'
            }
          ]
        }
      },
      onSuccess: (event, fields) => {
        event.preventDefault()
        signUpMethod()
      }
    })

    const countryChangedMethod = (value, text, $choice) => {
      if (this.fields.country != value) {
        this.fields.country = value
      }
    }
    const reasonChangedMethod = (value, text, $choice) => {
      if (this.fields.signUpReasons != value) {
        this.fields.signUpReasons = value
      }
    }

    $('#country-drop-down').dropdown({
      className: {
        icon: 'flag'
      },
      placeholder: 'Select Country',
      values: this.countries,
      onChange: countryChangedMethod
    })

    $('#reason-drop-down').dropdown({
      placeholder: 'Select Sign Up Reason(s)',
      values: this.signUpReasons,
      onChange: reasonChangedMethod
    })

    // Dismissable block closes when using the close icon
    $('.message .close').on('click', () => {
      $('#serverMessages').transition('fade')
    })
  },
  beforeDestroy() {
    $('.message .close').off('click')
  },
  methods: {
    initCountries() {
      // Should go in a config file or database
      this.countries.push({
        icon: 'flag outline',
        name: 'Others',
        value: 'others',
        iconClass: 'icon'
      })

      this.countries.push({ icon: 'af', name: 'Afghanistan' })
      this.countries.push({ icon: 'ax', name: 'Aland Islands' })
      this.countries.push({ icon: 'al', name: 'Albania' })
      this.countries.push({ icon: 'dz', name: 'Algeria' })
      this.countries.push({ icon: 'as', name: 'American Samoa' })
      this.countries.push({ icon: 'ad', name: 'Andorra' })
      this.countries.push({ icon: 'ao', name: 'Angola' })
      this.countries.push({ icon: 'ai', name: 'Anguilla' })
      this.countries.push({ icon: 'ag', name: 'Antigua' })
      this.countries.push({ icon: 'ar', name: 'Argentina' })
      this.countries.push({ icon: 'am', name: 'Armenia' })
      this.countries.push({ icon: 'aw', name: 'Aruba' })
      this.countries.push({ icon: 'au', name: 'Australia' })
      this.countries.push({ icon: 'at', name: 'Austria' })
      this.countries.push({ icon: 'az', name: 'Azerbaijan' })
      this.countries.push({ icon: 'bs', name: 'Bahamas' })
      this.countries.push({ icon: 'bh', name: 'Bahrain' })
      this.countries.push({ icon: 'bd', name: 'Bangladesh' })
      this.countries.push({ icon: 'bb', name: 'Barbados' })
      this.countries.push({ icon: 'by', name: 'Belarus' })
      this.countries.push({ icon: 'be', name: 'Belgium' })
      this.countries.push({ icon: 'bz', name: 'Belize' })
      this.countries.push({ icon: 'bj', name: 'Benin' })
      this.countries.push({ icon: 'bm', name: 'Bermuda' })
      this.countries.push({ icon: 'bt', name: 'Bhutan' })
      this.countries.push({ icon: 'bo', name: 'Bolivia' })
      this.countries.push({ icon: 'ba', name: 'Bosnia' })
      this.countries.push({ icon: 'bw', name: 'Botswana' })
      this.countries.push({ icon: 'bv', name: 'Bouvet Island' })
      this.countries.push({ icon: 'br', name: 'Brazil' })
      this.countries.push({ icon: 'vg', name: 'British Virgin Islands' })
      this.countries.push({ icon: 'bn', name: 'Brunei' })
      this.countries.push({ icon: 'bg', name: 'Bulgaria' })
      this.countries.push({ icon: 'bf', name: 'Burkina Faso' })
      this.countries.push({ icon: 'mm', name: 'Burma' })
      this.countries.push({ icon: 'bi', name: 'Burundi' })
      this.countries.push({ icon: 'tc', name: 'Caicos Islands' })
      this.countries.push({ icon: 'kh', name: 'Cambodia' })
      this.countries.push({ icon: 'cm', name: 'Cameroon' })
      this.countries.push({ icon: 'ca', name: 'Canada' })
      this.countries.push({ icon: 'cv', name: 'Cape Verde' })
      this.countries.push({ icon: 'ky', name: 'Cayman Islands' })
      this.countries.push({ icon: 'cf', name: 'Central African Republic' })
      this.countries.push({ icon: 'td', name: 'Chad' })
      this.countries.push({ icon: 'cl', name: 'Chile' })
      this.countries.push({ icon: 'cn', name: 'China' })
      this.countries.push({ icon: 'cx', name: 'Christmas Island' })
      this.countries.push({ icon: 'cc', name: 'Cocos Islands' })
      this.countries.push({ icon: 'co', name: 'Colombia' })
      this.countries.push({ icon: 'km', name: 'Comoros' })
      this.countries.push({ icon: 'cd', name: 'Congo' })
      this.countries.push({ icon: 'cg', name: 'Congo Brazzaville' })
      this.countries.push({ icon: 'ck', name: 'Cook Islands' })
      this.countries.push({ icon: 'cr', name: 'Costa Rica' })
      this.countries.push({ icon: 'ci', name: 'Cote Divoire' })
      this.countries.push({ icon: 'hr', name: 'Croatia' })
      this.countries.push({ icon: 'cu', name: 'Cuba' })
      this.countries.push({ icon: 'cy', name: 'Cyprus' })
      this.countries.push({ icon: 'cz', name: 'Czech Republic' })
      this.countries.push({ icon: 'dk', name: 'Denmark' })
      this.countries.push({ icon: 'dj', name: 'Djibouti' })
      this.countries.push({ icon: 'dm', name: 'Dominica' })
      this.countries.push({ icon: 'do', name: 'Dominican Republic' })
      this.countries.push({ icon: 'ec', name: 'Ecuador' })
      this.countries.push({ icon: 'eg', name: 'Egypt' })
      this.countries.push({ icon: 'sv', name: 'El Salvador' })
      this.countries.push({ icon: 'gb', name: 'England' })
      this.countries.push({ icon: 'gq', name: 'Equatorial Guinea' })
      this.countries.push({ icon: 'er', name: 'Eritrea' })
      this.countries.push({ icon: 'ee', name: 'Estonia' })
      this.countries.push({ icon: 'et', name: 'Ethiopia' })
      this.countries.push({ icon: 'eu', name: 'European Union' })
      this.countries.push({ icon: 'fk', name: 'Falkland Islands' })
      this.countries.push({ icon: 'fo', name: 'Faroe Islands' })
      this.countries.push({ icon: 'fj', name: 'Fiji' })
      this.countries.push({ icon: 'fi', name: 'Finland' })
      this.countries.push({ icon: 'fr', name: 'France' })
      this.countries.push({ icon: 'gf', name: 'French Guiana' })
      this.countries.push({ icon: 'pf', name: 'French Polynesia' })
      this.countries.push({ icon: 'tf', name: 'French Territories' })
      this.countries.push({ icon: 'ga', name: 'Gabon' })
      this.countries.push({ icon: 'gm', name: 'Gambia' })
      this.countries.push({ icon: 'ge', name: 'Georgia' })
      this.countries.push({ icon: 'de', name: 'Germany' })
      this.countries.push({ icon: 'gh', name: 'Ghana' })
      this.countries.push({ icon: 'gi', name: 'Gibraltar' })
      this.countries.push({ icon: 'gr', name: 'Greece' })
      this.countries.push({ icon: 'gl', name: 'Greenland' })
      this.countries.push({ icon: 'gd', name: 'Grenada' })
      this.countries.push({ icon: 'gp', name: 'Guadeloupe' })
      this.countries.push({ icon: 'gu', name: 'Guam' })
      this.countries.push({ icon: 'gt', name: 'Guatemala' })
      this.countries.push({ icon: 'gn', name: 'Guinea' })
      this.countries.push({ icon: 'gw', name: 'Guinea-Bissau' })
      this.countries.push({ icon: 'gy', name: 'Guyana' })
      this.countries.push({ icon: 'ht', name: 'Haiti' })
      this.countries.push({ icon: 'hm', name: 'Heard Island' })
      this.countries.push({ icon: 'hn', name: 'Honduras' })
      this.countries.push({ icon: 'hk', name: 'Hong Kong' })
      this.countries.push({ icon: 'hu', name: 'Hungary' })
      this.countries.push({ icon: 'is', name: 'Iceland' })
      this.countries.push({ icon: 'in', name: 'India' })
      this.countries.push({ icon: 'io', name: 'Indian Ocean Territory' })
      this.countries.push({ icon: 'id', name: 'Indonesia' })
      this.countries.push({ icon: 'ir', name: 'Iran' })
      this.countries.push({ icon: 'iq', name: 'Iraq' })
      this.countries.push({ icon: 'ie', name: 'Ireland' })
      this.countries.push({ icon: 'il', name: 'Israel' })
      this.countries.push({ icon: 'it', name: 'Italy' })
      this.countries.push({ icon: 'jm', name: 'Jamaica' })
      this.countries.push({ icon: 'sj', name: 'Jan Mayen' })
      this.countries.push({ icon: 'jp', name: 'Japan' })
      this.countries.push({ icon: 'jo', name: 'Jordan' })
      this.countries.push({ icon: 'kz', name: 'Kazakhstan' })
      this.countries.push({ icon: 'ke', name: 'Kenya' })
      this.countries.push({ icon: 'ki', name: 'Kiribati' })
      this.countries.push({ icon: 'kw', name: 'Kuwait' })
      this.countries.push({ icon: 'kg', name: 'Kyrgyzstan' })
      this.countries.push({ icon: 'la', name: 'Laos' })
      this.countries.push({ icon: 'lv', name: 'Latvia' })
      this.countries.push({ icon: 'lb', name: 'Lebanon' })
      this.countries.push({ icon: 'ls', name: 'Lesotho' })
      this.countries.push({ icon: 'lr', name: 'Liberia' })
      this.countries.push({ icon: 'ly', name: 'Libya' })
      this.countries.push({ icon: 'li', name: 'Liechtenstein' })
      this.countries.push({ icon: 'lt', name: 'Lithuania' })
      this.countries.push({ icon: 'lu', name: 'Luxembourg' })
      this.countries.push({ icon: 'mo', name: 'Macau' })
      this.countries.push({ icon: 'mk', name: 'Macedonia' })
      this.countries.push({ icon: 'mg', name: 'Madagascar' })
      this.countries.push({ icon: 'mw', name: 'Malawi' })
      this.countries.push({ icon: 'my', name: 'Malaysia' })
      this.countries.push({ icon: 'mv', name: 'Maldives' })
      this.countries.push({ icon: 'ml', name: 'Mali' })
      this.countries.push({ icon: 'mt', name: 'Malta' })
      this.countries.push({ icon: 'mh', name: 'Marshall Islands' })
      this.countries.push({ icon: 'mq', name: 'Martinique' })
      this.countries.push({ icon: 'mr', name: 'Mauritania' })
      this.countries.push({ icon: 'mu', name: 'Mauritius' })
      this.countries.push({ icon: 'yt', name: 'Mayotte' })
      this.countries.push({ icon: 'mx', name: 'Mexico' })
      this.countries.push({ icon: 'fm', name: 'Micronesia' })
      this.countries.push({ icon: 'md', name: 'Moldova' })
      this.countries.push({ icon: 'mc', name: 'Monaco' })
      this.countries.push({ icon: 'mn', name: 'Mongolia' })
      this.countries.push({ icon: 'me', name: 'Montenegro' })
      this.countries.push({ icon: 'ms', name: 'Montserrat' })
      this.countries.push({ icon: 'ma', name: 'Morocco' })
      this.countries.push({ icon: 'mz', name: 'Mozambique' })
      this.countries.push({ icon: 'na', name: 'Namibia' })
      this.countries.push({ icon: 'nr', name: 'Nauru' })
      this.countries.push({ icon: 'np', name: 'Nepal' })
      this.countries.push({ icon: 'nl', name: 'Netherlands' })
      this.countries.push({ icon: 'an', name: 'Netherlands Antilles' })
      this.countries.push({ icon: 'nc', name: 'New Caledonia' })
      this.countries.push({ icon: 'pg', name: 'New Guinea' })
      this.countries.push({ icon: 'nz', name: 'New Zealand' })
      this.countries.push({ icon: 'ni', name: 'Nicaragua' })
      this.countries.push({ icon: 'ne', name: 'Niger' })
      this.countries.push({ icon: 'ng', name: 'Nigeria' })
      this.countries.push({ icon: 'nu', name: 'Niue' })
      this.countries.push({ icon: 'nf', name: 'Norfolk Island' })
      this.countries.push({ icon: 'kp', name: 'North Korea' })
      this.countries.push({ icon: 'mp', name: 'Northern Mariana Islands' })
      this.countries.push({ icon: 'no', name: 'Norway' })
      this.countries.push({ icon: 'om', name: 'Oman' })
      this.countries.push({ icon: 'pk', name: 'Pakistan' })
      this.countries.push({ icon: 'pw', name: 'Palau' })
      this.countries.push({ icon: 'ps', name: 'Palestine' })
      this.countries.push({ icon: 'pa', name: 'Panama' })
      this.countries.push({ icon: 'py', name: 'Paraguay' })
      this.countries.push({ icon: 'pe', name: 'Peru' })
      this.countries.push({ icon: 'ph', name: 'Philippines' })
      this.countries.push({ icon: 'pn', name: 'Pitcairn Islands' })
      this.countries.push({ icon: 'pl', name: 'Poland' })
      this.countries.push({ icon: 'pt', name: 'Portugal' })
      this.countries.push({ icon: 'pr', name: 'Puerto Rico' })
      this.countries.push({ icon: 'qa', name: 'Qatar' })
      this.countries.push({ icon: 're', name: 'Reunion' })
      this.countries.push({ icon: 'ro', name: 'Romania' })
      this.countries.push({ icon: 'ru', name: 'Russia' })
      this.countries.push({ icon: 'rw', name: 'Rwanda' })
      this.countries.push({ icon: 'sh', name: 'Saint Helena' })
      this.countries.push({ icon: 'kn', name: 'Saint Kitts and Nevis' })
      this.countries.push({ icon: 'lc', name: 'Saint Lucia' })
      this.countries.push({ icon: 'pm', name: 'Saint Pierre' })
      this.countries.push({ icon: 'vc', name: 'Saint Vincent' })
      this.countries.push({ icon: 'ws', name: 'Samoa' })
      this.countries.push({ icon: 'sm', name: 'San Marino' })
      this.countries.push({ icon: 'gs', name: 'Sandwich Islands' })
      this.countries.push({ icon: 'st', name: 'Sao Tome' })
      this.countries.push({ icon: 'sa', name: 'Saudi Arabia' })
      this.countries.push({ icon: 'sn', name: 'Senegal' })
      this.countries.push({ icon: 'cs', name: 'Serbia' })
      this.countries.push({ icon: 'rs', name: 'Serbia' })
      this.countries.push({ icon: 'sc', name: 'Seychelles' })
      this.countries.push({ icon: 'sl', name: 'Sierra Leone' })
      this.countries.push({ icon: 'sg', name: 'Singapore' })
      this.countries.push({ icon: 'sk', name: 'Slovakia' })
      this.countries.push({ icon: 'si', name: 'Slovenia' })
      this.countries.push({ icon: 'sb', name: 'Solomon Islands' })
      this.countries.push({ icon: 'so', name: 'Somalia' })
      this.countries.push({ icon: 'za', name: 'South Africa' })
      this.countries.push({ icon: 'kr', name: 'South Korea' })
      this.countries.push({ icon: 'es', name: 'Spain' })
      this.countries.push({ icon: 'lk', name: 'Sri Lanka' })
      this.countries.push({ icon: 'sd', name: 'Sudan' })
      this.countries.push({ icon: 'sr', name: 'Suriname' })
      this.countries.push({ icon: 'sj', name: 'Svalbard' })
      this.countries.push({ icon: 'sz', name: 'Swaziland' })
      this.countries.push({ icon: 'se', name: 'Sweden' })
      this.countries.push({ icon: 'ch', name: 'Switzerland' })
      this.countries.push({ icon: 'sy', name: 'Syria' })
      this.countries.push({ icon: 'tw', name: 'Taiwan' })
      this.countries.push({ icon: 'tj', name: 'Tajikistan' })
      this.countries.push({ icon: 'tz', name: 'Tanzania' })
      this.countries.push({ icon: 'th', name: 'Thailand' })
      this.countries.push({ icon: 'tl', name: 'Timorleste' })
      this.countries.push({ icon: 'tg', name: 'Togo' })
      this.countries.push({ icon: 'tk', name: 'Tokelau' })
      this.countries.push({ icon: 'to', name: 'Tonga' })
      this.countries.push({ icon: 'tt', name: 'Trinidad' })
      this.countries.push({ icon: 'tn', name: 'Tunisia' })
      this.countries.push({ icon: 'tr', name: 'Turkey' })
      this.countries.push({ icon: 'tm', name: 'Turkmenistan' })
      this.countries.push({ icon: 'tv', name: 'Tuvalu' })
      this.countries.push({ icon: 'ug', name: 'Uganda' })
      this.countries.push({ icon: 'ua', name: 'Ukraine' })
      this.countries.push({ icon: 'ae', name: 'United Arab Emirates' })
      this.countries.push({ icon: 'us', name: 'United States' })
      this.countries.push({ icon: 'uy', name: 'Uruguay' })
      this.countries.push({ icon: 'um', name: 'Us Minor Islands' })
      this.countries.push({ icon: 'vi', name: 'Us Virgin Islands' })
      this.countries.push({ icon: 'uz', name: 'Uzbekistan' })
      this.countries.push({ icon: 'vu', name: 'Vanuatu' })
      this.countries.push({ icon: 'va', name: 'Vatican City' })
      this.countries.push({ icon: 've', name: 'Venezuela' })
      this.countries.push({ icon: 'vn', name: 'Vietnam' })
      this.countries.push({ icon: 'wf', name: 'Wallis and Futuna' })
      this.countries.push({ icon: 'eh', name: 'Western Sahara' })
      this.countries.push({ icon: 'ye', name: 'Yemen' })
      this.countries.push({ icon: 'zm', name: 'Zambia' })
      this.countries.push({ icon: 'zw', name: 'Zimbabwe' })

      this.countries.forEach((c) => {
        if (!c.value) c.value = c.icon + ' - ' + c.name
      })

      this.countries.unshift({ name: 'Select Country', type: 'header' })
    },
    initSignUpReasons() {
      // Should go in a config file or database
      this.signUpReasons.push({
        name: `I'm a Crypto Enthusiast and want to explore`
      })
      this.signUpReasons.push({ name: `I want to invest in Digital Funds` })
      this.signUpReasons.push({ name: `I want to create Digital Funds` })

      this.signUpReasons.forEach((c) => {
        if (!c.value) c.value = c.name
      })

      this.signUpReasons.unshift({
        name: 'Select one or more Sign Up Reason(s)',
        type: 'header'
      })
    },
    signUp() {
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

      console.time(this.$options.name + '.signUp')
      $('#serverMessages').transition('hide')

      this.serverMessages = undefined
      this.inProgress = true

      this.$store
        .dispatch('register', this.fields)
        .then(() => {
          $('#serverMessages').removeClass('negative')
          $('#serverMessages').addClass('positive')
          this.serverMessagesHeader = 'Sign Up request sent'
          this.serverMessages = [
            'Thanks for your interest in the DOMANI platform. We will be in touch soon.'
          ]
        })
        .catch((err) => {
          $('#serverMessages').addClass('negative')
          $('#serverMessages').removeClass('positive')

          if (err.response && err.response.data && err.response.data.errors) {
            this.serverMessages = err.response.data.errors.map((error) => {
              $('#' + error.field).addClass('error')
              return error.message
            })
          } else {
            this.serverMessages = ['Opss... something went wrong. Try again later please.']
          }

          if (this.serverMessages.length > 0) {
            this.serverMessagesHeader = 'Server Error' + (this.serverMessages.length > 1 ? 's' : '')
          }
        })
        .finally(() => {
          console.timeEnd(this.$options.name + '.signUp')
          // Dismissable block fades-in
          $('#serverMessages').transition('fade')
          this.inProgress = false
        })
    }
  }
}
</script>

<style scoped>
a._warning {
  color: inherit;
  font-weight: bold;
  text-decoration: underline;
}

._signUpButton {
  cursor: pointer;
}
._signUpButton.disabled {
  cursor: default;
}
._signUpButton,
._signUpButton:hover {
  color: #9a9a9a;
}

._logInLink,
._logInLink:hover {
  color: #9a9a9a;
  font-weight: bold;
}

.required.field input,
.required.field .selection {
  border-left: 2px solid #9a9a9a !important;
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
