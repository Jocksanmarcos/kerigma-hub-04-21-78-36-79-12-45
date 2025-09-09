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

interface ReservaRecusadaEmailProps {
  nome: string
  livroTitulo: string
  livroAutor: string
  numeroReserva: string
  motivoRecusa: string
  linkBiblioteca: string
}

export const ReservaRecusadaEmail = ({
  nome,
  livroTitulo,
  livroAutor,
  numeroReserva,
  motivoRecusa,
  linkBiblioteca,
}: ReservaRecusadaEmailProps) => (
  <Html>
    <Head />
    <Preview>Informações sobre sua solicitação - {livroTitulo}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📚 Biblioteca CBN Kerigma</Heading>
        
        <Text style={text}>Olá {nome},</Text>
        
        <Text style={text}>
          Agradecemos seu interesse pelo livro <strong>"{livroTitulo}"</strong> de {livroAutor}.
        </Text>

        <Section style={infoBox}>
          <Text style={infoText}>
            <strong>Número da Reserva:</strong> {numeroReserva}<br/>
            <strong>Livro:</strong> {livroTitulo}<br/>
            <strong>Autor:</strong> {livroAutor}<br/>
            <strong>Status:</strong> Não disponível no momento
          </Text>
        </Section>

        {motivoRecusa && (
          <Section style={reasonBox}>
            <Text style={reasonTitle}>ℹ️ Informações:</Text>
            <Text style={reasonText}>{motivoRecusa}</Text>
          </Section>
        )}

        <Text style={text}>
          Não se preocupe! Temos muitos outros livros disponíveis em nossa biblioteca. 
          Convidamos você a explorar outras opções ou fazer uma nova solicitação no futuro.
        </Text>

        <Link
          href={linkBiblioteca}
          target="_blank"
          style={button}
        >
          Explorar Outros Livros
        </Link>

        <Hr style={hr} />

        <Text style={footer}>
          <strong>Biblioteca CBN Kerigma</strong><br/>
          Este é um e-mail automático, não responda a esta mensagem.<br/>
          Para dúvidas, entre em contato conosco diretamente.
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

const reasonBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const reasonTitle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const reasonText = {
  color: '#92400e',
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