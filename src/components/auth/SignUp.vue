<template>
  <div id="signup">
    <div class="signup-form">
      <form @submit.prevent="onSubmit">
        <div class="input" :class="{invalid: $v.email.$error}">
          <label for="email">Mail</label>
          <input
                  type="email"
                  id="email"
                  v-model.trim="$v.email.$model">
          <p class="error" v-if="!$v.email.email">Please enter a valid email.</p>
          <p class="error" v-if="!$v.email.required && $v.email.$dirty">Field is required.</p>
        </div>                  
        <div class="input" :class="{invalid: $v.age.$error}">
          <label for="age">Your Age</label>
          <input
                  type="number"
                  id="age"
                  v-model.number="$v.age.$model">
          <p class="error" v-if="!$v.age.required && $v.age.$dirty">Field is required.</p>
          <p class="error" v-if="!$v.age.minVal">Your have to be at least {{$v.age.$params.minVal.min}} years.</p>
        </div>
        <div class="input" :class="{invalid: $v.password.$error}">
          <label for="password">Password</label>
          <input
                  type="password"
                  id="password"
                  v-model.trim="$v.password.$model">
          <p class="error" v-if="!$v.password.required && $v.password.$dirty">Field is required.</p>
          <p class="error" v-if="!$v.password.minLen">Password must have at least {{$v.password.$params.minLen.min}} letters.</p>
        </div>
        <div class="input" :class="{invalid: $v.confirmPassword.$error}">
          <label for="confirm-password">Confirm Password</label>
          <input
                  type="password"
                  id="confirm-password"
                  v-model="$v.confirmPassword.$model">
          <p class="error" v-if="!$v.confirmPassword.sameAs">Confirm password doesn't match Password.</p>
        </div>
        <div class="input">
          <label for="country">Country</label>
          <select id="country" v-model="country">
            <option value="usa">USA</option>
            <option value="india">India</option>
            <option value="uk">UK</option>
            <option value="germany">Germany</option>
          </select>
        </div>
        <div class="hobbies">
          <h3>Add some Hobbies</h3>
          <button @click="onAddHobby" type="button">Add Hobby</button>
          <div class="hobby-list">
            <div
                    class="input"
                    v-for="(hobbyInput, index) in hobbyInputs"
                    :key="hobbyInput.id" :class="{invalid: $v.hobbyInputs.$each[index].$error}">
              <label :for="hobbyInput.id">Hobby #{{ index }}</label>
              <input
                      type="text"
                      :id="hobbyInput.id"
                      @blur="$v.hobbyInputs.$each[index].value.$touch"
                      v-model="hobbyInput.value">
              <button @click="onDeleteHobby(hobbyInput.id)" type="button">X</button>
            </div>
             <p class="error" v-if="!$v.hobbyInputs.minLen">You have to specify at least {{$v.hobbyInputs.$params.minLen.min}} hobbies.</p>
             <p class="error" v-if="!$v.hobbyInputs.required">You have to specify at least {{$v.hobbyInputs.$params.minLen.min}} hobbies.</p>
          </div>
        </div>
        <div class="input inline" :class="{invalid: $v.terms.$error}">
          <input type="checkbox" id="terms" v-model="$v.terms.$model">
          <label for="terms">Accept Terms of Use</label>
        </div>
        <div class="submit">
          <button type="submit" :disabled="$v.$invalid">Submit</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import { required, email, numeric, minValue, minLength, sameAs, requiredUnless } from 'vuelidate/lib/validators' 
  export default {
    data () {
      return {
        email: '',
        age: null,
        password: '',
        confirmPassword: '',
        country: 'usa',
        hobbyInputs: [],
        terms: false
      }
    },
    validations: {
      email: {
        required,
        email,
        unique: (val) => {
          if (!val) {
            return true;
          }
          return axios.get('/user.json?orderBy="email"&equalTo="' + val + '"')
            .then(res => {
              console.log(res);
              return Object.keys(res.data).length === 0;
            })
        }
      },
      age: {
        required,
        numeric,
        minVal: minValue(18)
      },
      password: {
        required,
        minLen: minLength(6)
      },
      confirmPassword: {
        // sameAs: sameAs('password') // 1
        // 2
        sameAs: sameAs (vm => {
          return vm.password;
        })
      },
      terms: {
        sameAs: sameAs(vm => {
          return true;
        })
      },
      hobbyInputs: {
        required,
        minLen: minLength(1),
        $each: {
          value: {
            required,
            minLen: minLength(5)
          }
        }
      }
    },
    methods: {
      onAddHobby () {
        const newHobby = {
          id: Math.random() * Math.random() * 1000,
          value: ''
        }
        this.hobbyInputs.push(newHobby)
      },
      onDeleteHobby (id) {
        this.hobbyInputs = this.hobbyInputs.filter(hobby => hobby.id !== id)
      },
      onSubmit () {
        this.$v.$touch();
        if (this.$v.$invalid) {
          return;
        }
        const formData = {
          email: this.email,
          age: this.age,
          password: this.password,
          confirmPassword: this.confirmPassword,
          country: this.country,
          hobbies: this.hobbyInputs.map(hobby => hobby.value),
          terms: this.terms
        }
        console.log(formData)
        this.$store.dispatch('signup', formData)
      }
    }
  }
</script>

<style scoped>
  .signup-form {
    width: 400px;
    margin: 30px auto;
    border: 1px solid #eee;
    padding: 20px;
    box-shadow: 0 2px 3px #ccc;
  }

  .input {
    margin: 10px auto;
  }

  .input label {
    display: block;
    color: #4e4e4e;
    margin-bottom: 6px;
  }

  .input.inline label {
    display: inline;
  }

  .input input {
    font: inherit;
    width: 100%;
    padding: 6px 12px;
    box-sizing: border-box;
    border: 1px solid #ccc;
  }

  .input.inline input {
    width: auto;
  }

  .input input:focus {
    outline: none;
    border: 1px solid #521751;
    background-color: #eee;
  }

  .input select {
    border: 1px solid #ccc;
    font: inherit;
  }

  .input.invalid label {
    color: red;
  }
  p.error {
    color: red;
  }

  .hobbies button {
    border: 1px solid #521751;
    background: #521751;
    color: white;
    padding: 6px;
    font: inherit;
    cursor: pointer;
  }

  .hobbies button:hover,
  .hobbies button:active {
    background-color: #8d4288;
  }

  .hobbies input {
    width: 90%;
  }

  .submit button {
    border: 1px solid #521751;
    color: #521751;
    padding: 10px 20px;
    font: inherit;
    cursor: pointer;
  }

  .submit button:hover,
  .submit button:active {
    background-color: #521751;
    color: white;
  }

  .submit button[disabled],
  .submit button[disabled]:hover,
  .submit button[disabled]:active {
    border: 1px solid #ccc;
    background-color: transparent;
    color: #ccc;
    cursor: not-allowed;
  }
</style>