import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlockRenderer } from "./BlockRenderer";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";
import InPlaceText from "@/components/live-editor/InPlaceText";

interface DynamicPageRendererProps {
  slug: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultHeroTitle?: string;
  defaultHeroSubtitle?: string;
  fallbackContent?: React.ReactNode;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  meta_description?: string;
  meta_keywords?: string;
  published: boolean;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
}

interface ContentBlock {
  id: string;
  type: string;
  content_json: any;
  order: number;
  order_position: number;
  page_id: string;
}

export const DynamicPageRenderer: React.FC<DynamicPageRendererProps> = ({
  slug,
  defaultTitle = "Página",
  defaultDescription = "Conteúdo da nossa igreja",
  defaultHeroTitle,
  defaultHeroSubtitle,
  fallbackContent
}) => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageContent, setPageContent] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageContent();
  }, [slug]);

  useEffect(() => {
    // Set SEO meta tags
    const title = pageData?.title || defaultTitle;
    const description = pageData?.meta_description || defaultDescription;
    
    document.title = `${title} | CBN Kerigma`;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);

    // Update meta keywords if available
    if (pageData?.meta_keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', pageData.meta_keywords);
    }
  }, [pageData, defaultTitle, defaultDescription]);

  async function loadPageContent() {
    try {
      setLoading(true);

      // Try cached Edge Function (ISR-like)
      const { data, error } = await supabase.functions.invoke('cms-get-page', {
        body: { slug, ttlSeconds: 300 },
      });

      if (!error && data) {
        const d: any = data;
        if (d.page) setPageData(d.page);
        if (Array.isArray(d.blocks)) setPageContent(d.blocks);
        return;
      }

      // Fallback: direct queries
      const { data: page } = await supabase
        .from("paginas_site")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (page) {
        setPageData(page);
        const { data: blocks } = await supabase
          .from("content_blocks")
          .select("*")
          .eq("page_id", page.id)
          .order("order_position");
        setPageContent(blocks?.map(block => ({
          ...block,
          order: block.order_position
        })) || []);
      }
    } catch (error) {
      console.error("Erro ao carregar conteúdo da página:", error);
    } finally {
      setLoading(false);
    }
  }

  const heroTitle = pageData?.hero_title || defaultHeroTitle || pageData?.title || defaultTitle;
  const heroSubtitle = pageData?.hero_subtitle || defaultHeroSubtitle;

  return (
    <PublicSiteLayout>
      {/* Hero Section */}
      <section className="relative bg-acolhimento-gradient text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6"><InPlaceText id="hero_title">{heroTitle}</InPlaceText></h1>
            {heroSubtitle && (
              <p className="text-lg md:text-xl opacity-95 max-w-3xl mx-auto">
                <InPlaceText id="hero_subtitle">{heroSubtitle}</InPlaceText>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Content from CMS */}
      {!loading && pageContent.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {pageContent.map((block) => (
                <div key={block.id}>
                  <BlockRenderer block={block} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fallback content if no CMS content */}
      {!loading && pageContent.length === 0 && fallbackContent && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {fallbackContent}
          </div>
        </section>
      )}

      {/* No content message */}
      {!loading && pageContent.length === 0 && !fallbackContent && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-muted-foreground">
              Conteúdo em desenvolvimento. Em breve teremos novidades!
            </p>
          </div>
        </section>
      )}
    </PublicSiteLayout>
  );
};