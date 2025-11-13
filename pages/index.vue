<script setup lang="js">
const store = useButtenmostStore();
const showMore = ref(false)

</script>

<template>
  <v-parallax src="/titelbild.jpg" height="450">
    <div class="parallax-center-box">
      <div class="parallax-content-box">
        <h4 class="text-h4 font-weight-thin mb-4" v-if="!store.isSaison">
          Die Buttenmost-Saison ist vorbei.
        </h4>
        <h4 class="text-h4 font-weight-thin mb-4" v-else>
          Es gibt wieder frischen Buttenmost aus Hochwald!
        </h4>
      </div>
    </div>
  </v-parallax>
  
     
  <div
  class="custom-info-box mx-auto my-4" v-if="store.isSaison"
>

  Unser Buttenmost ist ab sofort und bis Mitte November erhältlich am Kirchrain 17 in Hochwald zum Preis von {{ store.preisDirektverkauf.toFixed(2) }} Franken pro Liter, an diversen
    Märkten sowie an über <a href="/verkaufsstellen">70 Verkaufsstellen in der Region</a>. Zudem verschicken ihn schweizweit per Post. 
    <div class="oeffnungszeiten-box my-4 pa-3">
      <div class="font-weight-bold mb-2">Öffnungszeiten Direktverkauf Hochwald</div>
      <div><strong>Montag – Samstag</strong></div>
      <div>08:00 – 12:00 Uhr & 13:00 – 17:00 Uhr</div>
          Kleine Mengen bis 20 Liter können Sie ohne telefonische Ankündigung bei uns abholen.<br/><br/>

    </div>
    
</div>

<v-alert
    type="info"
    variant="tonal"
    class="mx-auto my-4"
    style="max-width: 90%; font-size: 1rem; font-weight: 500"
    border="start" v-if="store.isSaison"
  >
    Hinweis für Kunden, die grössere Mengen Buttenmost für den Weiterverkauf benötigen: Neu gibt es ein Online-Formular zur Vorbestellung. <span v-if="showMore"><br/><br/>
Für Vorberstellungen ab 14 Liter nutzen Sie den 
    <a href="/b2b">Shop für Firmenkunden</a>. Bitte bachten Sie, dass wir Buttenmost zum Wiederverkauf ausschliesslich in Einheiten von jeweils 14 1-Liter-Bechern und gegen Vorauskasse anbieten. <br/><br/>Wenn
    Sie in Kessel abgefüllten Buttenmost (2 bis 28 Liter) beziehen möchten, dann ist weiterhin möglich, jedoch nur noch an vier Daten. Verwenden Sie in diesem Fall für die Bestellung den
    <a href="/shop">Shop für Privatkunden</a>, wählen Sie das gewünschte Datum aus und klicken auf die Option "zum 
    Abholen". Kleinere Mengen bis max. 15 Liter können Sie weiterhin und ohne Vorbestellung bei uns am Kirchrain 17 abholen und vor Ort mit Bargeld oder Twint bezahlen.</span><a href="#" @click.prevent="showMore = !showMore" style="color:#2196f3; font-weight:600;">
      {{ showMore ? 'Weniger anzeigen' : 'Weitere Infos dazu' }}
    </a>
  </v-alert>
  <shop id="shop-section" v-if="store.isSaison"></shop><Social></Social>
  <Verkaufsstellen anzahl="20" v-if="store.isSaison"></Verkaufsstellen>
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
.custom-info-box {
  max-width: 90%;
  font-size: 1 rem;
  background: rgba(255,255,255,0.85);
  color: #153a6b;
  padding: 0 rem 0 rem;
  text-align: left;
}
.oeffnungszeiten-box {
  border: 1px solid #e0e0e0;
  border-left: 5px solid #153a6b;
  background-color: #f7f9fa;
  border-radius: 4px;
}
</style>
