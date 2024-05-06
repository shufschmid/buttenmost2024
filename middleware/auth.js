export default defineNuxtRouteMiddleware((to, from) => {
  const { authenticated } = storeToRefs(useButtenmostStore()); // make authenticated state reactive
  const token = useCookie('token')
  if (authenticated.value === false && !token.value) {
    return navigateTo("/login");
  }
 });


