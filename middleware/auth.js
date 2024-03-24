export default defineNuxtRouteMiddleware((to, from) => {
  const { authenticated } = storeToRefs(useButtenmostStore()); // make authenticated state reactive
  if (authenticated.value === false) {
    return navigateTo("/login");
  }
 });
