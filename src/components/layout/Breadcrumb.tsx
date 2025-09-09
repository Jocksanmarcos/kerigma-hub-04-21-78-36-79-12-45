import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";

const pathMapping: Record<string, string> = {
  dashboard: "Dashboard",
  pessoas: "Pessoas",
  celulas: "Células",
  ensino: "Ensino",
  agenda: "Agenda",
  missoes: "Missões",
  cultos: "Studio de Cultos",
  eventos: "Eventos",
  financeiro: "Financeiro",
  patrimonio: "Patrimônio",
  escalas: "Escalas",
  admin: "Administração",
  governanca: "Segurança",
  configuracoes: "Configurações",
  cursos: "Meus Cursos",
  biblia: "Jornada Bíblica",
  certificados: "Certificados",
  relatorios: "Relatórios",
  professores: "Professores",
  aconselhamento: "Aconselhamento",
  analytics: "Analytics",
  "ia-pastoral": "IA Pastoral",
  louvor: "Studio de Louvor",
  mensagens: "Mensagens",
  calendario: "Calendário"
};

export const AppBreadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length <= 1) {
    return null; // Don't show breadcrumb on root pages
  }

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const isLast = index === pathSegments.length - 1;
    const title = pathMapping[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    return { path, title, isLast };
  });

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.path}>{item.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};