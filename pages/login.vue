<template>
  <v-sheet class="bg-grey pa-12" rounded>
    <v-card class="mx-auto px-6 py-8" max-width="344">
      <v-text-field
        v-model="password"
        type="password"
        class="input"
        placeholder="Enter Password"
        name="psw"
        required
      />

      <v-btn
        @click.prevent="login2"
        color="success"
        size="large"
        variant="elevated"
        block
        >Login</v-btn
      >
    </v-card>
  </v-sheet>
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
    router.push("/admin");
  }
};

const router = useRouter();
</script>
