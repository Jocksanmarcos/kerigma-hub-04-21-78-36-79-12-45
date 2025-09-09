import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface ReservaConfirmacaoEmailProps {
  nome: string
  livroTitulo: string
  livroAutor: string
  numeroReserva: string
  dataExpiracao: string
  linkAcompanhamento: string
}

export const ReservaConfirmacaoEmail = ({
  nome,
  livroTitulo,
  livroAutor,
  numeroReserva,
  dataExpiracao,
  linkAcompanhamento,
}: ReservaConfirmacaoEmailProps) => (
  <Html>
    <Head />
    <Preview>Sua solicitação de empréstimo foi recebida - {livroTitulo}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📚 Biblioteca CBN Kerigma</Heading>
        
        <Text style={text}>Olá {nome},</Text>
        
        <Text style={text}>
          Recebemos sua solicitação de empréstimo para o livro <strong>"{livroTitulo}"</strong> de {livroAutor}.
        </Text>

        <Section style={infoBox}>
          <Text style={infoText}>
            <strong>Número da Reserva:</strong> {numeroReserva}<br/>
            <strong>Livro:</strong> {livroTitulo}<br/>
            <strong>Autor:</strong> {livroAutor}<br/>
            <strong>Expira em:</strong> {dataExpiracao}
          </Text>
        </Section>

        <Text style={text}>
          Nossa equipe analisará sua solicitação e entrará em contato em breve. 
          Você receberá um e-mail de confirmação quando sua reserva for aprovada.
        </Text>

        <Link
          href={linkAcompanhamento}
          target="_blank"
          style={button}
        >
          Acompanhar Solicitação
        </Link>

        <Hr style={hr} />

        <Text style={footer}>
          <strong>Biblioteca CBN Kerigma</strong><br/>
          Este é um e-mail automático, não responda a esta mensagem.
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '16px 0',
}

const infoBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const infoText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '20px 0',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
}

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
  margin: '30px 0',
}