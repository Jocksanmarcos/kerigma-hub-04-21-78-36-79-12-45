import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlockRenderer } from "@/components/cms/BlockRenderer";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";
import ListaCursosEAD from "@/components/cms/blocks/ListaCursosEAD";

const PublicEnsinoPage: React.FC = () => {
  const [pageContent, setPageContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPageContent();
    // SEO basics
    document.title = 'Centro de Ensino | CBN Kerigma';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name','description'); document.head.appendChild(meta); }
    meta.setAttribute('content','Cursos e estudos bíblicos da CBN Kerigma.');
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel','canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', window.location.href);
  }, []);

  async function loadPageContent() {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('cms-get-page', {
        body: { slug: 'ensino', ttlSeconds: 300 },
      });
      if (!error && data) {
        const d: any = data;
        setPageContent(Array.isArray(d.blocks) ? d.blocks : []);
        return;
      }
      // Fallback
      const { data: pages } = await supabase
        .from('paginas_site')
        .select('*')
        .eq('slug', 'ensino')
        .eq('published', true)
        .maybeSingle();
      if (pages) {
        const { data: blocks } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('page_id', pages.id)
          .order('order');
        setPageContent(blocks || []);
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicSiteLayout>
      {/* Hero Section */}
      <section className="relative bg-accent text-accent-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">Centro de Ensino</h1>
            <p className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto">
              Cresça em conhecimento e fé através dos nossos cursos e estudos bíblicos.
            </p>
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

      {/* Default content if no CMS content - Show the courses list */}
      {!loading && pageContent.length === 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ListaCursosEAD />
          </div>
        </section>
      )}
    </PublicSiteLayout>
  );
};

export default PublicEnsinoPage;