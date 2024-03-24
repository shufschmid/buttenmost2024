<template>
  <div>
    <div class="title">
      <h2>Login</h2>
    </div>
    <div class="container form">
      <label for="psw"><b>Password</b></label>
      <input
        v-model="password"
        type="password"
        class="input"
        placeholder="Enter Password"
        name="psw"
        required
      />

      <button @click.prevent="login2" class="button">Login</button>
    </div>
  </div>
</template>
<script setup>
const store = useButtenmostStore();
const password = ref("");
const { login } = useButtenmostStore(); // use authenticateUser action from  auth store

const { authenticated } = storeToRefs(useButtenmostStore()); // make authenticated state reactive with storeToRefs

const login2 = async () => {
  await login(password); // call authenticateUser and pass the user object
  // redirect to homepage if user is authenticated
  if (authenticated) {
    router.push('/admin');
  }
};


const router = useRouter();

</script>
