import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, FileText, Calendar, Users, ExternalLink, Download, BookOpen, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SearchParams {
  keywords: string;
  limit: number;
  year_from: number;
  open_access: boolean;
}

interface Publication {
  id: string;
  title: string;
  authors: string;
  year: number;
  doi: string | null;
  citations: number;
  open_access: boolean;
  source: string;
  pdf_url: string | null;
  landing_page_url: string | null;
  relevance_score: number;
}

interface Statistics {
  total_publications: number;
  open_access_count: number;
  avg_citations: number;
  max_citations: number;
  year_range: {
    min: number;
    max: number;
  };
  top_cited: Array<{
    title: string;
    citations: number;
    year: number;
  }>;
}

interface SearchResults {
  search_query: string;
  statistics: Statistics;
  publications: Publication[];
  generated_at: string;
}

const PublicationSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    keywords: "",
    limit: 10,
    year_from: 0,
    open_access: false
  });
  
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchParams.keywords.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ключевые слова для поиска",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Replace with your actual n8n webhook URL
      const webhookUrl = "YOUR_N8N_WEBHOOK_URL";
      
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
      });

      if (!response.ok) {
        throw new Error("Ошибка при выполнении запроса");
      }

      const data = await response.json();
      setResults(data[0]); // Assuming the response is an array with one object
      
      toast({
        title: "Поиск завершен",
        description: `Найдено ${data[0].statistics.total_publications} публикаций`,
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить поиск. Проверьте подключение к n8n.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAuthors = (authors: string) => {
    if (authors.length > 50) {
      return authors.substring(0, 50) + "...";
    }
    return authors;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="bg-gradient-primary bg-clip-text text-transparent">
            <h1 className="text-4xl font-bold">Поиск научных публикаций</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Найдите актуальные научные статьи по ключевым словам с помощью OpenAlex API
          </p>
        </div>

        {/* Search Form */}
        <Card className="shadow-medium border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Параметры поиска
            </CardTitle>
            <CardDescription>
              Укажите ключевые слова и настройте фильтры для поиска
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="keywords">Ключевые слова</Label>
                <Input
                  id="keywords"
                  placeholder="machine learning, AI, neural networks..."
                  value={searchParams.keywords}
                  onChange={(e) => setSearchParams({ ...searchParams, keywords: e.target.value })}
                  className="transition-all duration-200 focus:shadow-glow"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="limit">Количество результатов</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="200"
                  value={searchParams.limit}
                  onChange={(e) => setSearchParams({ ...searchParams, limit: parseInt(e.target.value) || 10 })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year_from">Год публикации (от)</Label>
                <Input
                  id="year_from"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="2020"
                  value={searchParams.year_from || ""}
                  onChange={(e) => setSearchParams({ ...searchParams, year_from: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="open_access"
                  checked={searchParams.open_access}
                  onCheckedChange={(checked) => setSearchParams({ ...searchParams, open_access: checked as boolean })}
                />
                <Label htmlFor="open_access">Только открытый доступ</Label>
              </div>
            </div>
            
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {loading ? "Поиск..." : "Найти публикации"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Statistics */}
            <Card className="shadow-medium border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Статистика поиска
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-primary">{results.statistics.total_publications}</div>
                    <div className="text-sm text-muted-foreground">Всего публикаций</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-success">{results.statistics.open_access_count}</div>
                    <div className="text-sm text-muted-foreground">Открытый доступ</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-accent">{results.statistics.avg_citations}</div>
                    <div className="text-sm text-muted-foreground">Среднее цитирований</div>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      {results.statistics.year_range.min}-{results.statistics.year_range.max}
                    </div>
                    <div className="text-sm text-muted-foreground">Диапазон лет</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Publications List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Найденные публикации ({results.publications.length})
              </h2>
              
              <div className="grid gap-4">
                {results.publications.map((pub, index) => (
                  <Card key={pub.id} className="shadow-soft hover:shadow-medium transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-lg leading-tight">{pub.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {formatAuthors(pub.authors)}
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <Badge variant={pub.open_access ? "default" : "secondary"}>
                              {pub.open_access ? "Открытый доступ" : "Закрытый доступ"}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              Релевантность: {pub.relevance_score}
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {pub.year || "Неизвестно"}
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {pub.citations} цитирований
                          </div>
                          <div className="text-muted-foreground">
                            Источник: {pub.source}
                          </div>
                          {pub.doi && (
                            <div className="text-muted-foreground">
                              DOI: {pub.doi.replace("https://doi.org/", "")}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          {pub.pdf_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={pub.pdf_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                PDF
                              </a>
                            </Button>
                          )}
                          {pub.landing_page_url && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={pub.landing_page_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Открыть
                              </a>
                            </Button>
                          )}
                          {pub.doi && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={pub.doi} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                DOI
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicationSearch;