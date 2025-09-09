import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import PublicSiteLayout from "@/components/layout/PublicSiteLayout";
import { PageLoader } from "@/components/performance/PageLoader";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Lazy load pages for better performance
const Index = React.lazy(() => import("@/pages/Index"));
const DashboardPage = React.lazy(() => import("@/pages/dashboard/DashboardPage"));
const PessoasV2Page = React.lazy(() => import("@/pages/dashboard/PessoasV2Page"));
// People management pages removed
const FinanceiroPage = React.lazy(() => import("@/pages/dashboard/FinanceiroPage"));
const AgendaPage = React.lazy(() => import("@/pages/dashboard/AgendaPage"));
const EventosPage = React.lazy(() => import("@/pages/dashboard/EventosPage"));
const PatrimonioPage = React.lazy(() => import("@/pages/dashboard/PatrimonioPage"));
const EscalasPage = React.lazy(() => import("@/pages/dashboard/EscalasPage"));
const CultosStudioPage = React.lazy(() => import("@/pages/dashboard/CultosStudioPage"));
const LouvorAmbienteStudioPage = React.lazy(() => import("@/pages/dashboard/LouvorAmbienteStudioPage"));
const CelulasPage = React.lazy(() => import("@/pages/dashboard/CelulasPage"));
const AconselhamentoPage = React.lazy(() => import("@/pages/dashboard/AconselhamentoPage"));
const MissoesPage = React.lazy(() => import("@/pages/Dashboard/Missoes"));
const MissoesFinanceiroPage = React.lazy(() => import("@/pages/Dashboard/MissoesFinanceiro"));

// Jornada de Crescimento (novo módulo unificado)
const JornadaCrescimentoPage = React.lazy(() => import("@/pages/jornada/JornadaCrescimentoPage"));
const JornadaTrilhasPage = React.lazy(() => import("@/pages/jornada/JornadaTrilhasPage"));
import JornadaBibliaEnhancedPage from "@/pages/jornada/JornadaBibliaEnhancedPage";
const JornadaBibliaPage = React.lazy(() => import("@/pages/jornada/JornadaBibliaPage"));
const JornadaRankingPage = React.lazy(() => import("@/pages/jornada/JornadaRankingPage"));
const JornadaMedalhasPage = React.lazy(() => import("@/pages/jornada/JornadaMedalhasPage"));

// Páginas de Ensino (mantidas para compatibilidade)
const BibliaLivrosPage = React.lazy(() => import("@/pages/ensino/BibliaLivrosPage"));
const BibliaCapitulosPage = React.lazy(() => import("@/pages/ensino/BibliaCapitulosPage"));
const BibliaLeituraPage = React.lazy(() => import("@/pages/ensino/BibliaLeituraPage"));
const MeusCursosPage = React.lazy(() => import("@/pages/cursos/MeusCursosPage"));
const PortalAlunoPage = React.lazy(() => import("@/pages/ensino/PortalAlunoPage"));

const AnalyticsPage = React.lazy(() => import("@/pages/admin/AnalyticsPage"));
const ConfiguracoesPage = React.lazy(() => import("@/pages/admin/ConfiguracoesPage"));
const ContentManagementPage = React.lazy(() => import("@/pages/admin/ContentManagementPage"));
const GovernancePage = React.lazy(() => import("@/pages/admin/GovernancePage"));
const IAPastoralPage = React.lazy(() => import("@/pages/admin/IAPastoralPage"));
const SitePage = React.lazy(() => import("@/pages/admin/SitePage"));
const BuscaVoluntariosPage = React.lazy(() => import("@/pages/admin/BuscaVoluntariosPage"));
const JornadaQuizzesPage = React.lazy(() => import("@/pages/admin/JornadaQuizzesPage"));
const SuportePage = React.lazy(() => import("@/pages/Suporte"));

// Central de Louvor Routes
const CentralLouvorPage = React.lazy(() => import("@/pages/admin/CentralLouvorPage"));
const MinhasEscalasPage = React.lazy(() => import("@/pages/portal/MinhasEscalasPage"));
const EventoLouvorPage = React.lazy(() => import("@/pages/portal/EventoLouvorPage"));

const PublicHomePage = React.lazy(() => import("@/pages/public/StablePublicHomePage"));
const PublicSobrePage = React.lazy(() => import("@/pages/public/PublicSobrePage"));
const PublicEventoPage = React.lazy(() => import("@/pages/public/PublicEventoPage"));
const PublicCelulasPage = React.lazy(() => import("@/pages/public/PublicCelulasPage"));
const PublicAgendaPage = React.lazy(() => import("@/pages/public/PublicAgendaPage"));
const PublicAconselhamentoPage = React.lazy(() => import("@/pages/public/PublicAconselhamentoPage"));
const PublicGaleriaPage = React.lazy(() => import("@/pages/public/NewPublicGaleriaPage"));
const PublicContatoPageDynamic = React.lazy(() => import("@/pages/public/PublicContatoPageDynamic"));
const PublicVisitePage = React.lazy(() => import("@/pages/public/PublicVisitePage"));

const MemberHomePage = React.lazy(() => import("@/pages/member/MemberHomePage"));
const MemberDashboardPage = React.lazy(() => import("@/pages/member/MemberDashboardPage"));
const SplashPage = React.lazy(() => import("@/pages/SplashPage"));

const AuthPage = React.lazy(() => import("@/pages/auth/AuthPage"));
const ForcePasswordChangePage = React.lazy(() => import("@/pages/auth/ForcePasswordChangePage"));
const ResetPassword = React.lazy(() => import("@/pages/ResetPassword"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const SiteMapPage = React.lazy(() => import("@/pages/SiteMapPage"));
const RecepcaoPage = React.lazy(() => import("@/pages/recepcao/RecepcaoPage"));
const BibleImportPage = React.lazy(() => import("@/pages/BibleImportPage"));
const MuralGenerosidadePage = React.lazy(() => import("@/pages/MuralGenerosidadePage"));

const MinimalLoader = () => <PageLoader type="minimal" />;

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<MinimalLoader />}>
      <Routes>
        {/* Splash Screen - Primeira experiência */}
        <Route path="/splash" element={<SplashPage />} />
        
        {/* Main Public Homepage */}
        <Route path="/" element={<PublicHomePage />} />
        
        {/* Member Routes */}
        <Route path="/membro" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/member/MemberPortalPage")))}</ProtectedRoute>} />
        <Route path="/membro/dashboard" element={<ProtectedRoute><MemberDashboardPage /></ProtectedRoute>} />
        <Route path="/membro/comunidade" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/member/CommunityLifePage")))}</ProtectedRoute>} />
        <Route path="/membro/portal-aluno" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/member/StudentPortalPage")))}</ProtectedRoute>} />
        
        {/* Public Pages Routes */}
        <Route path="/sobre" element={<PublicSobrePage />} />
        <Route path="/biblioteca" element={React.createElement(React.lazy(() => import("@/pages/BibliotecaPage")))} />
        <Route path="/celulas" element={<PublicCelulasPage />} />
        <Route path="/agenda" element={<PublicAgendaPage />} />
        <Route path="/aconselhamento" element={<PublicAconselhamentoPage />} />
        <Route path="/galeria" element={<PublicGaleriaPage />} />
        <Route path="/contato" element={<PublicContatoPageDynamic />} />
        <Route path="/visite" element={<PublicVisitePage />} />
        <Route path="/evento/:id" element={<PublicEventoPage />} />

        {/* Legacy public routes */}
        <Route path="/public" element={<PublicSiteLayout><div /></PublicSiteLayout>}>
          <Route index element={<PublicHomePage />} />
          <Route path="sobre" element={<PublicSobrePage />} />
          <Route path="evento/:id" element={<PublicEventoPage />} />
        </Route>

        {/* Generosity Routes */}
        <Route path="/semear" element={React.createElement(React.lazy(() => import("@/pages/public/SemearTransformarPage")))} />
        <Route path="/semear/:status" element={React.createElement(React.lazy(() => import("@/pages/public/DonationStatusPage")))} />
        <Route path="/mural-da-generosidade" element={<ProtectedRoute><MuralGenerosidadePage /></ProtectedRoute>} />

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/force-password-change" element={<ForcePasswordChangePage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Sitemap */}
        <Route path="/sitemap" element={<SiteMapPage />} />

        {/* Recepção Route - Público para tablets da recepção */}
        <Route path="/recepcao" element={<RecepcaoPage />} />

        {/* Protected Dashboard Routes */}
        <Route path="/admin" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        
        <Route path="/pessoas-v2" element={<ProtectedRoute><PessoasV2Page /></ProtectedRoute>} />
        {/* People management routes removed */}
        <Route path="/dashboard/biblioteca" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/dashboard/BibliotecaPage")))}</ProtectedRoute>} />
        <Route path="/dashboard/celulas" element={<ProtectedRoute><CelulasPage /></ProtectedRoute>} />
        <Route path="/dashboard/aconselhamento" element={<ProtectedRoute><AconselhamentoPage /></ProtectedRoute>} />
        <Route path="/dashboard/financeiro" element={<ProtectedRoute><FinanceiroPage /></ProtectedRoute>} />
        <Route path="/dashboard/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
        <Route path="/dashboard/eventos" element={<ProtectedRoute><EventosPage /></ProtectedRoute>} />
        <Route path="/dashboard/patrimonio" element={<ProtectedRoute><PatrimonioPage /></ProtectedRoute>} />
        <Route path="/dashboard/escalas" element={<ProtectedRoute><EscalasPage /></ProtectedRoute>} />
        <Route path="/dashboard/escalas" element={<ProtectedRoute><EscalasPage /></ProtectedRoute>} />
        <Route path="/dashboard/cultos" element={<ProtectedRoute><CultosStudioPage /></ProtectedRoute>} />
        <Route path="/dashboard/louvor" element={<ProtectedRoute><LouvorAmbienteStudioPage /></ProtectedRoute>} />
        <Route path="/repertorio" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/RepertorioPage")))}</ProtectedRoute>} />
        <Route path="/dashboard/missoes" element={<ProtectedRoute><MissoesPage /></ProtectedRoute>} />
        <Route path="/dashboard/missoes/financeiro" element={<ProtectedRoute><MissoesFinanceiroPage /></ProtectedRoute>} />
        <Route path="/dashboard/missoes/relatorios" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/Dashboard/MissoesRelatorios")))}</ProtectedRoute>} />
        {/* Missoes pessoas route removed */}
        <Route path="/dashboard/missoes/eventos" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/Dashboard/MissoesEventos")))}</ProtectedRoute>} />
        <Route path="/dashboard/missoes/configuracoes" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/Dashboard/MissoesConfiguracoes")))}</ProtectedRoute>} />

        {/* Jornada de Crescimento Routes (novo módulo unificado) */}
        <Route path="/jornada" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/jornada/JornadaPage")))}</ProtectedRoute>} />
        <Route path="/jornada/trilhas" element={<ProtectedRoute><JornadaTrilhasPage /></ProtectedRoute>} />
        <Route path="/jornada/cursos" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/jornada/CursosPage")))}</ProtectedRoute>} />
        <Route path="/jornada/cursos/:id" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/jornada/CursoDetailPage")))}</ProtectedRoute>} />
        <Route path="/jornada/cursos/:courseId/aulas/:aulaId" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/jornada/AulaPage")))}</ProtectedRoute>} />
        <Route path="/biblia" element={<ProtectedRoute><BibliaLivrosPage /></ProtectedRoute>} />
        <Route path="/biblia/capitulos/:bookId" element={<ProtectedRoute><BibliaCapitulosPage /></ProtectedRoute>} />
        <Route path="/biblia/leitura/:chapterId" element={<ProtectedRoute><BibliaLeituraPage /></ProtectedRoute>} />
        <Route path="/jornada/biblia" element={<ProtectedRoute><JornadaBibliaEnhancedPage /></ProtectedRoute>} />
        <Route path="/jornada/biblia/enhanced" element={<ProtectedRoute><JornadaBibliaEnhancedPage /></ProtectedRoute>} />
        <Route path="/jornada/biblia/livros" element={<ProtectedRoute><BibliaLivrosPage /></ProtectedRoute>} />
        <Route path="/jornada/biblia/capitulos/:bookId" element={<ProtectedRoute><BibliaCapitulosPage /></ProtectedRoute>} />
        <Route path="/jornada/biblia/leitura/:chapterId" element={<ProtectedRoute><BibliaLeituraPage /></ProtectedRoute>} />
        <Route path="/ensino/biblia/livros" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/ensino/BibliaLivrosPage")))}</ProtectedRoute>} />
        <Route path="/ensino/biblia/capitulos/:bookId" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/ensino/BibliaCapitulosPage")))}</ProtectedRoute>} />
        <Route path="/ensino/biblia/leitor/:versionId/:bookId/:chapterId" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/ensino/BibliaLeitorPage")))}</ProtectedRoute>} />
        <Route path="/ensino/biblia/gerenciador" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/ensino/BibliaGerenciadorPage")))}</ProtectedRoute>} />
        <Route path="/ensino/biblia/teste" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/ensino/BibliaTestePage")))}</ProtectedRoute>} />
        <Route path="/jornada/biblia/teste" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/ensino/BibliaTestePage")))}</ProtectedRoute>} />
        <Route path="/jornada/ranking" element={<ProtectedRoute><JornadaRankingPage /></ProtectedRoute>} />
        <Route path="/jornada/medalhas" element={<ProtectedRoute><JornadaMedalhasPage /></ProtectedRoute>} />
        <Route path="/jornada/desafios" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/jornada/JornadaDesafiosPage")))}</ProtectedRoute>} />
        <Route path="/jornada/planos-leitura" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/jornada/JornadaPlanosLeituraPage")))}</ProtectedRoute>} />
        <Route path="/jornada/lembretes" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/jornada/JornadaLembretesPage")))}</ProtectedRoute>} />
        
        {/* Legacy Routes - redirecionamentos para compatibilidade */}
        <Route path="/ensino" element={<Navigate to="/jornada" replace />} />
        <Route path="/ensino/biblia" element={<Navigate to="/jornada/biblia" replace />} />
        <Route path="/ensino/biblia/*" element={<Navigate to="/jornada/biblia" replace />} />
        
        {/* Outras rotas de ensino mantidas */}
        <Route path="/portal-aluno" element={<ProtectedRoute><PortalAlunoPage /></ProtectedRoute>} />
        <Route path="/cursos" element={<ProtectedRoute><MeusCursosPage /></ProtectedRoute>} />
        <Route path="/cursos/:cursoId" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/cursos/CursoDetailPage")))}</ProtectedRoute>} />
        <Route path="/cursos/:cursoId/aula/:aulaId" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/cursos/AulaPage")))}</ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/bible-import" element={<ProtectedRoute><BibleImportPage /></ProtectedRoute>} />
        <Route path="/admin/site" element={<ProtectedRoute><SitePage /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/admin/configuracoes" element={<ProtectedRoute><ConfiguracoesPage /></ProtectedRoute>} />
        <Route path="/admin/configuracoes-v2" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/admin/ConfiguracoesV2Page")))}</ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute><ContentManagementPage /></ProtectedRoute>} />
        <Route path="/admin/governanca" element={<ProtectedRoute><GovernancePage /></ProtectedRoute>} />
        <Route path="/admin/ia-pastoral" element={<ProtectedRoute><IAPastoralPage /></ProtectedRoute>} />
        <Route path="/admin/busca-voluntarios" element={<ProtectedRoute><BuscaVoluntariosPage /></ProtectedRoute>} />
        <Route path="/admin/jornada/quizzes" element={<ProtectedRoute><JornadaQuizzesPage /></ProtectedRoute>} />
        <Route path="/admin/jornada/cursos" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/admin/JornadaCursosPage")))}</ProtectedRoute>} />
        <Route path="/admin/jornada/cursos/:courseId/aulas" element={<ProtectedRoute>{React.createElement(React.lazy(() => import("@/pages/admin/JornadaAulasEditorPage")))}</ProtectedRoute>} />
        
        {/* Central de Louvor Routes */}
        <Route path="/admin/louvor" element={<ProtectedRoute><CentralLouvorPage /></ProtectedRoute>} />
        <Route path="/portal/minhas-escalas" element={<ProtectedRoute><MinhasEscalasPage /></ProtectedRoute>} />
        <Route path="/portal/evento-louvor/:id" element={<ProtectedRoute><EventoLouvorPage /></ProtectedRoute>} />
        
        {/* Suporte Route */}
        <Route path="/suporte" element={<ProtectedRoute><SuportePage /></ProtectedRoute>} />

        
        {/* Dynamic Site Pages */}
        <Route path="/:slug" element={React.createElement(React.lazy(() => import("@/pages/DynamicPage")))} />

        {/* Fallback Routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};