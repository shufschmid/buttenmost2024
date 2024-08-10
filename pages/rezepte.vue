<script setup>
const { data } = await useFetch("/api/airtable_get?basis=Rezepte&view=Rezepte");
const items = JSON.parse(JSON.stringify(data.value));
</script>
<template>
  <v-card class="mx-auto" max-width="800">
    <v-container>
      <v-data-iterator
        :items="items"
        :items-per-page="20"
        item-value="Rezepte"
        :sort-desc.sync="false"
      >
        <template v-slot:default="{ items, isExpanded, toggleExpand }">
          <v-row>
            <template v-for="item in items" :key="item.raw.Rezept">
              <v-col md="6" cols="12">
                <v-card>
                  <v-img
                    :src="item.raw.Bild ? item.raw.Bild[0].url : ''"
                    class="align-end"
                    gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
                    height="200px"
                    cover
                  >
                    <v-card-title
                      class="text-white"
                      v-text="item.raw.Rezept"
                    ></v-card-title>
                  </v-img>

                  <v-card-actions
                    ><v-spacer></v-spacer>
                    <v-btn
                      color="medium-emphasis"
                      size="medium"
                      :to="{ name: 'rezept-id', params: { id: item.raw.Id } }"
                      >zum Rezept</v-btn
                    ><v-spacer></v-spacer>
                  </v-card-actions>
                </v-card>
              </v-col>
            </template>
          </v-row>
        </template>
      </v-data-iterator>
    </v-container>
  </v-card>
</template>
