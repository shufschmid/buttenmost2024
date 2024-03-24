<template>
  <div>
    <header>
      <ul>
        <li><nuxt-link to="/">Home</nuxt-link></li>
        <li><nuxt-link to="/admin">admin</nuxt-link></li>
        <li><nuxt-link to="/admin2">admin2</nuxt-link></li>
        
        <li class="loginBtn" style="float: right">
          <nuxt-link to="/login">Login</nuxt-link>
        </li>
      </ul>
    </header>
    <div class="mainContent">
      <slot />
    </div>
    <footer>
      <h1>Footer</h1>
      
    <v-btn>von Layout</v-btn>
    </footer>
    
  </div>
</template>
