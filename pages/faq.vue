<template>
  <v-container>
    <v-row>
        
      <v-col cols="12" md="8">
        <div v-for="(faq, i) in faqs" :key="faq.question" :id="'faq-' + i" class="mb-4">
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title>
                {{ faq.question }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div v-html="faq.answer"></div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </div>
      </v-col>
    </v-row>
    {{ data}}
  </v-container>
</template>

<script setup>
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()
const faqs = ref([])


const response = await $fetch(
  "/api/airtable_get?basis=FAQ&view=faq"
);
faqs.value = response.map(r => ({
    question: r.question,
    answer: md.render(r.answer)
  }))

</script>