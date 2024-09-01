<template>
  <v-container
    ><v-row
      ><v-col cols="12" class="d-flex justify-center"
        ><h4>
          Melden Sie sich für unseren E-Mail-Newsletter an und bleiben Sie auf
          dem Laufenden.
        </h4></v-col
      ></v-row
    ><v-row>
      <v-spacer /><v-col cols="9" md="6">
        <div><Signup></Signup></div></v-col
      ><v-col cols="3" class="d-md-flex child-flex"
        ><v-img
          :aspect-ratio="1"
          src="/Facebook_Logo.png"
          max-height="100px"
          class="ma-2"
          @click="
            navigateTo('https://www.facebook.com/buttenmost', {
              external: true,
            })
          "
        ></v-img>
        <v-img
          :aspect-ratio="1"
          src="/Instagram_Logo.png"
          max-height="100px"
          class="ma-2"
          @click="
            navigateTo('https://www.instagram.com/buttenmost.ch', {
              external: true,
            })
          "
        ></v-img></v-col
      ><v-spacer
    /></v-row>
  </v-container>
</template>
