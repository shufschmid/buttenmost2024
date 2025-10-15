<script setup>
const store = useButtenmostStore();
const adresse = store.firmenadresse

// Prop für Logo-Variante
const props = defineProps({
  sw: {
    type: Boolean,
    default: false
  }
})
const logoSrc = props.sw ? '/logo.svg' : '/logo.svg'
</script>

<template>
    <div class="firmenadresse">
        <img :src="logoSrc" alt="Buttenmost Logo" style="max-width: 200px; margin-bottom: 1rem;" />
        <div v-if="adresse">
            <b>{{ adresse.name }}</b>
            <p>
                {{ adresse.strasse }}<br>
                {{ adresse.plz }} {{ adresse.ort }}
            </p>
            <p>
                Telefon: <a :href="`tel:${adresse.telefon}`">{{ adresse.telefon }}</a><br>
                E-Mail: <a :href="`mailto:${adresse.email}`">{{ adresse.email }}</a><br>
                Web: <a :href="`https://${adresse.web}`" target="_blank">{{ adresse.web }}</a>
            </p>
            <p>
                MwSt-Nr.: {{ adresse.mehrwertsteuernummer }}
            </p>
        </div>
    </div>
</template>
<style scoped>
.firmenadresse a {
  color: inherit;
  text-decoration: none;
}
.firmenadresse {
  font-size: 0.875rem; /* Entspricht 14px bei einer Basisschriftgröße von 16px */
  line-height: 1.4;
}
</style>