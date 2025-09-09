// Script para testar importação das versões bíblicas
const SUPABASE_URL = "https://vsanvmekqtfkbgmrjwoo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYW52bWVrcXRma2JnbXJqd29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MjU0OTUsImV4cCI6MjA2OTEwMTQ5NX0.eJqJcO-lOng2-1OwMhXAOXTYRF1hAsRo7NrkFT34ob8";

async function importAllVersions() {
  console.log("🔄 Iniciando importação de todas as versões bíblicas...");
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/bible-import-enhanced`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'importAllVersions'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Resultado da importação:", JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error("❌ Erro na importação:", error);
    throw error;
  }
}

// Executar importação
importAllVersions();