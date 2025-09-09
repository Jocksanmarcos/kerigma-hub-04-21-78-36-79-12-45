import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookInfo {
  title?: string;
  authors?: string[];
  description?: string;
  publishedDate?: string;
  publisher?: string;
  pageCount?: number;
  categories?: string[];
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };
  industryIdentifiers?: {
    type: string;
    identifier: string;
  }[];
}

// Function to validate if an image URL is accessible
async function validateImageUrl(url: string): Promise<boolean> {
  if (!url) return false;
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookSearch/1.0)'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Function to get the best quality cover image
async function getBestCoverImage(imageLinks: any): Promise<string> {
  if (!imageLinks) return '';
  
  // Priority order: larger images first, then smaller ones
  const imageUrls = [
    imageLinks.extraLarge,
    imageLinks.large,
    imageLinks.medium,
    imageLinks.small,
    imageLinks.thumbnail?.replace('zoom=1', 'zoom=0'),
    imageLinks.thumbnail,
    imageLinks.smallThumbnail
  ].filter(Boolean).map((url: string) => url.replace('http://', 'https://'));

  // Test each URL until we find a working one
  for (const url of imageUrls) {
    if (await validateImageUrl(url)) {
      return url;
    }
  }
  
  return '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { isbn } = await req.json();
    console.log('ISBN recebido:', isbn);

    if (!isbn) {
      throw new Error('ISBN é obrigatório');
    }

    // Clean ISBN (remove spaces, hyphens)
    const cleanISBN = isbn.replace(/[^0-9X]/g, '');
    console.log('ISBN limpo:', cleanISBN);

    // Try Google Books API first
    let bookData = null;
    try {
      const googleResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`
      );
      
      if (googleResponse.ok) {
        const googleData = await googleResponse.json();
        console.log('Resposta Google Books:', JSON.stringify(googleData, null, 2));
        
        if (googleData.items && googleData.items.length > 0) {
          const bookInfo: BookInfo = googleData.items[0].volumeInfo;
          console.log('Informações do livro encontradas:', bookInfo);
          
          // Get best quality cover image
          const coverImageUrl = await getBestCoverImage(bookInfo.imageLinks);
          console.log('URL da capa encontrada:', coverImageUrl);
          
          bookData = {
            titulo: bookInfo.title || '',
            autor: bookInfo.authors ? bookInfo.authors.join(', ') : '',
            editora: bookInfo.publisher || '',
            ano_publicacao: bookInfo.publishedDate ? 
              parseInt(bookInfo.publishedDate.split('-')[0]) : null,
            sinopse: bookInfo.description || '',
            numero_paginas: bookInfo.pageCount || null,
            categoria: bookInfo.categories ? bookInfo.categories[0] : '',
            imagem_capa_url: coverImageUrl,
            isbn: cleanISBN
          };
          console.log('Dados finais do livro:', bookData);
        }
      }
    } catch (error) {
      console.log('Google Books API falhou, tentando OpenLibrary:', error.message);
    }

    // Fallback to OpenLibrary API if Google Books didn't work
    if (!bookData) {
      try {
        const openLibResponse = await fetch(
          `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`
        );
        
        if (openLibResponse.ok) {
          const openLibData = await openLibResponse.json();
          const bookKey = `ISBN:${cleanISBN}`;
          
          if (openLibData[bookKey]) {
            const bookInfo = openLibData[bookKey];
            
            // Try to get cover from OpenLibrary covers API
            let coverUrl = '';
            if (bookInfo.cover?.large) {
              coverUrl = bookInfo.cover.large;
            } else if (bookInfo.cover?.medium) {
              coverUrl = bookInfo.cover.medium;
            } else {
              // Try OpenLibrary covers API as fallback
              const coverResponse = await fetch(`https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`);
              if (coverResponse.ok) {
                coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`;
              } else {
                // Try medium size
                const mediumCoverResponse = await fetch(`https://covers.openlibrary.org/b/isbn/${cleanISBN}-M.jpg`);
                if (mediumCoverResponse.ok) {
                  coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanISBN}-M.jpg`;
                }
              }
            }
            
            bookData = {
              titulo: bookInfo.title || '',
              autor: bookInfo.authors ? 
                bookInfo.authors.map((a: any) => a.name).join(', ') : '',
              editora: bookInfo.publishers ? 
                bookInfo.publishers.map((p: any) => p.name).join(', ') : '',
              ano_publicacao: bookInfo.publish_date ? 
                parseInt(bookInfo.publish_date.split(' ').pop()) : null,
              sinopse: bookInfo.notes || bookInfo.subtitle || '',
              numero_paginas: bookInfo.number_of_pages || null,
              categoria: bookInfo.subjects ? bookInfo.subjects[0]?.name : '',
              imagem_capa_url: coverUrl,
              isbn: cleanISBN
            };
          }
        }
      } catch (error) {
        console.log('OpenLibrary API também falhou:', error.message);
      }
    }

    if (!bookData) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Livro não encontrado com este ISBN',
        // Return basic structure with ISBN for manual entry
        data: {
          titulo: '',
          autor: '',
          editora: '',
          ano_publicacao: null,
          sinopse: '',
          numero_paginas: null,
          categoria: '',
          imagem_capa_url: '',
          isbn: cleanISBN
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: bookData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});