<template>
  <div class="min-h-screen bg-gradient-subtle">
    <div class="container mx-auto py-8 space-y-8">
      <!-- Header -->
      <div class="text-center space-y-4">
        <div class="bg-gradient-primary bg-clip-text text-transparent">
          <h1 class="text-4xl font-bold">Поиск научных публикаций</h1>
        </div>
        <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
          Найдите актуальные научные статьи по ключевым словам с помощью OpenAlex API
        </p>
      </div>

      <!-- Search Form -->
      <div class="shadow-medium border-0 bg-card/50 backdrop-blur-sm rounded-lg">
        <div class="p-6">
          <div class="flex items-center gap-2 mb-2">
            <SearchIcon class="h-5 w-5" />
            <h3 class="text-2xl font-semibold leading-none tracking-tight">Параметры поиска</h3>
          </div>
          <p class="text-sm text-muted-foreground mb-6">
            Укажите ключевые слова и настройте фильтры для поиска
          </p>
          
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="keywords" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Ключевые слова
                </label>
                <input
                  id="keywords"
                  v-model="searchParams.keywords"
                  placeholder="machine learning, AI, neural networks..."
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 focus:shadow-glow"
                />
              </div>
              
              <div class="space-y-2">
                <label for="limit" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Количество результатов
                </label>
                <input
                  id="limit"
                  v-model.number="searchParams.limit"
                  type="number"
                  min="1"
                  max="200"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </div>
              
              <div class="space-y-2">
                <label for="year_from" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Год публикации (от)
                </label>
                <input
                  id="year_from"
                  v-model.number="searchParams.year_from"
                  type="number"
                  min="1900"
                  :max="new Date().getFullYear()"
                  placeholder="2020"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </div>
              
              <div class="flex items-center space-x-2">
                <input
                  id="open_access"
                  v-model="searchParams.open_access"
                  type="checkbox"
                  class="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
                <label for="open_access" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Только открытый доступ
                </label>
              </div>
            </div>
            
            <button 
              @click="handleSearch" 
              :disabled="loading"
              class="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {{ loading ? "Поиск..." : "Найти публикации" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="results" class="space-y-6">
        <!-- Statistics -->
        <div class="shadow-medium border-0 bg-card/50 backdrop-blur-sm rounded-lg">
          <div class="p-6">
            <div class="flex items-center gap-2 mb-4">
              <TrendingUpIcon class="h-5 w-5" />
              <h3 class="text-2xl font-semibold leading-none tracking-tight">Статистика поиска</h3>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center space-y-2">
                <div class="text-2xl font-bold text-primary">{{ results.statistics.total_publications }}</div>
                <div class="text-sm text-muted-foreground">Всего публикаций</div>
              </div>
              <div class="text-center space-y-2">
                <div class="text-2xl font-bold text-success">{{ results.statistics.open_access_count }}</div>
                <div class="text-sm text-muted-foreground">Открытый доступ</div>
              </div>
              <div class="text-center space-y-2">
                <div class="text-2xl font-bold text-accent">{{ results.statistics.avg_citations }}</div>
                <div class="text-sm text-muted-foreground">Среднее цитирований</div>
              </div>
              <div class="text-center space-y-2">
                <div class="text-2xl font-bold text-primary">
                  {{ results.statistics.year_range.min }}-{{ results.statistics.year_range.max }}
                </div>
                <div class="text-sm text-muted-foreground">Диапазон лет</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Publications List -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <BookOpenIcon class="h-6 w-6" />
            Найденные публикации ({{ results.publications.length }})
          </h2>
          
          <div class="grid gap-4">
            <div 
              v-for="pub in results.publications" 
              :key="pub.id"
              class="shadow-soft hover:shadow-medium transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm rounded-lg"
            >
              <div class="pt-6 p-6">
                <div class="space-y-4">
                  <div class="flex justify-between items-start gap-4">
                    <div class="flex-1 space-y-2">
                      <h3 class="font-semibold text-lg leading-tight">{{ pub.title }}</h3>
                      <div class="flex items-center gap-2 text-sm text-muted-foreground">
                        <UsersIcon class="h-4 w-4" />
                        {{ formatAuthors(pub.authors) }}
                      </div>
                    </div>
                    <div class="text-right space-y-2">
                      <span 
                        :class="[
                          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                          pub.open_access 
                            ? 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80'
                            : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        ]"
                      >
                        {{ pub.open_access ? "Открытый доступ" : "Закрытый доступ" }}
                      </span>
                      <div class="text-sm text-muted-foreground">
                        Релевантность: {{ pub.relevance_score }}
                      </div>
                    </div>
                  </div>
                  
                  <div class="shrink-0 bg-border h-[1px] w-full"></div>
                  
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div class="flex items-center gap-2">
                      <CalendarIcon class="h-4 w-4 text-muted-foreground" />
                      {{ pub.year || "Неизвестно" }}
                    </div>
                    <div class="flex items-center gap-2">
                      <FileTextIcon class="h-4 w-4 text-muted-foreground" />
                      {{ pub.citations }} цитирований
                    </div>
                    <div class="text-muted-foreground">
                      Источник: {{ pub.source }}
                    </div>
                    <div v-if="pub.doi" class="text-muted-foreground">
                      DOI: {{ pub.doi.replace("https://doi.org/", "") }}
                    </div>
                  </div>
                  
                  <div class="flex gap-2 flex-wrap">
                    <a 
                      v-if="pub.pdf_url"
                      :href="pub.pdf_url" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                    >
                      <DownloadIcon class="h-4 w-4 mr-2" />
                      PDF
                    </a>
                    <a 
                      v-if="pub.landing_page_url"
                      :href="pub.landing_page_url" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                    >
                      <ExternalLinkIcon class="h-4 w-4 mr-2" />
                      Открыть
                    </a>
                    <a 
                      v-if="pub.doi"
                      :href="pub.doi" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3"
                    >
                      <ExternalLinkIcon class="h-4 w-4 mr-2" />
                      DOI
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { 
  Search as SearchIcon, 
  FileText as FileTextIcon, 
  Calendar as CalendarIcon, 
  Users as UsersIcon, 
  ExternalLink as ExternalLinkIcon, 
  Download as DownloadIcon, 
  BookOpen as BookOpenIcon, 
  TrendingUp as TrendingUpIcon 
} from 'lucide-vue-next'

interface SearchParams {
  keywords: string
  limit: number
  year_from: number
  open_access: boolean
}

interface Publication {
  id: string
  title: string
  authors: string
  year: number
  doi: string | null
  citations: number
  open_access: boolean
  source: string
  pdf_url: string | null
  landing_page_url: string | null
  relevance_score: number
}

interface Statistics {
  total_publications: number
  open_access_count: number
  avg_citations: number
  max_citations: number
  year_range: {
    min: number
    max: number
  }
  top_cited: Array<{
    title: string
    citations: number
    year: number
  }>
}

interface SearchResults {
  search_query: string
  statistics: Statistics
  publications: Publication[]
  generated_at: string
}

const searchParams = reactive<SearchParams>({
  keywords: "",
  limit: 10,
  year_from: 0,
  open_access: false
})

const results = ref<SearchResults | null>(null)
const loading = ref(false)

const showToast = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
  // Simple toast implementation - you can replace with a proper toast library
  console.log(`${variant === 'destructive' ? 'ERROR' : 'INFO'}: ${title} - ${description}`)
  alert(`${title}: ${description}`)
}

const handleSearch = async () => {
  if (!searchParams.keywords.trim()) {
    showToast("Ошибка", "Введите ключевые слова для поиска", "destructive")
    return
  }

  loading.value = true
  try {
    const webhookUrl = "https://n8n.infomirit.ru:8443/webhook/search-publications"
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        keywords: searchParams.keywords,
        limit: searchParams.limit,
        year_from: searchParams.year_from,
        "open_access.any_repository_has_fulltext": searchParams.open_access
      }),
    })

    if (!response.ok) {
      throw new Error("Ошибка при выполнении запроса")
    }

    const data = await response.json()
    console.log("Raw response from n8n:", data)
    
    // Handle different response structures
    let processedData
    if (Array.isArray(data) && data.length > 0) {
      processedData = data[0]
    } else if (data && typeof data === 'object') {
      processedData = data
    } else {
      throw new Error("Неожиданная структура ответа от сервера")
    }
    
    console.log("Processed data:", processedData)
    
    if (!processedData.statistics || !processedData.publications) {
      throw new Error("Данные не содержат необходимые поля (statistics, publications)")
    }
    
    results.value = processedData
    
    showToast("Поиск завершен", `Найдено ${processedData.statistics.total_publications} публикаций`)
  } catch (error) {
    console.error("Search error:", error)
    showToast("Ошибка", "Не удалось выполнить поиск. Проверьте подключение к n8n.", "destructive")
  } finally {
    loading.value = false
  }
}

const formatAuthors = (authors: string) => {
  if (authors.length > 50) {
    return authors.substring(0, 50) + "..."
  }
  return authors
}
</script>