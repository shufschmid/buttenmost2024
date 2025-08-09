<script setup lang="js">
const store = useButtenmostStore();
const showMore = ref(false)

</script>

<template>
  <v-parallax src="/titelbild.jpg" height="450">
    <div class="parallax-center-box">
      <div class="parallax-content-box">
        <h4 class="text-h4 font-weight-thin mb-4" v-if="!store.isSaison">
          Die Buttenmost-Saison beginnt am {{ store.SaisonStartString }}
        </h4>
        <h4 class="text-h4 font-weight-thin mb-4" v-if="store.isSaison">
          Es gibt wieder frischen Buttenmost aus Hochwald!
        </h4>
      </div>
    </div>
  </v-parallax>
  
     
  <div
  class="custom-info-box mx-auto my-4"
>

  Unser Buttenmost ist erhältlich direkt bei uns am Kirchrain 17 in Hochwald, an diversen
    Märkten sowie an über <a href="/verkaufsstellen">70 Verkaufsstellen in der Region</a> und wir verschicken ihn schweizweit per Post.
</div>

<v-alert
    type="info"
    variant="tonal"
    class="mx-auto my-4"
    style="max-width: 90%; font-size: 1rem; font-weight: 500"
    border="start"
  >
    Achtung: Für Kunden, die grössere Mengen Buttenmost für den Weiterverkauf benötigen, gibt es neu ein Online-Formular zur Vorbestellung. <span v-if="showMore"><br/><br/>
Für Vorberstellungen ab 14 Liter nutzen Sie den 
    <a href="/b2b">Shop für Firmenkunden</a>. Bitte bachten Sie, dass wir Buttenmost zum Wiederverkauf ausschliesslich in Einheiten von jeweils 14 1-Liter-Bechern und gegen Vorauskasse anbieten. <br/><br/>Wenn
    Sie in Kessel abgefüllten Buttenmost (2 bis 28 Liter) beziehen möchten, dann ist weiterhin möglich, jedoch nur noch an vier Daten. Verwenden Sie in diesem Fall für die Bestellung den
    <a href="/shop">Shop für Postkunden</a>, wählen Sie das gewünschte Datum aus und klicken auf die Option "zum 
    Abholen". </span><a href="#" @click.prevent="showMore = !showMore" style="color:#2196f3; font-weight:600;">
      {{ showMore ? 'Weniger anzeigen' : 'Weitere Infos dazu' }}
    </a>
  </v-alert>
  <shop id="shop-section"></shop><Social></Social>
  <Verkaufsstellen anzahl="20"></Verkaufsstellen>
</template>

<style scoped>
.parallax-center-box {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
.parallax-content-box {
  background: rgba(255, 255, 255, 0.801); /* halb-transparent schwarz */
  color: #000000;
  padding: 2rem 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 24px rgb(255, 255, 255);
  text-align: center;
  max-width: 90vw;
}

.v-alert a,
.v-alert a:visited {
    color: #0065b7; /* Vuetify info blue */
  text-decoration: underline;
}
.custom-info-box {
  max-width: 90%;
  font-size: 1 rem;
  background: rgba(255,255,255,0.85);
  color: #153a6b;
  padding: 0 rem 0 rem;
  text-align: left;
}
</style>
