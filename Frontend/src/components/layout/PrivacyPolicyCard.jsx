import React from 'react';

function PrivacyPolicyCard({ onBack }) {
  return (
    <section
      className="card policy-card"
      aria-label="Política de Privacidade"
      style={{ margin: '0 auto' }}
    >
      <div className="policy-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h1 style={{ margin: 0 }}>Política de Privacidade</h1>
        <button
          type="button"
          className="header-icon-button"
          onClick={onBack}
          aria-label="Voltar"
          title="Voltar"
        >
          ✕
        </button>
      </div>

      <div className="policy-content">
        <style>{`
          .policy-content ul {
            padding-left: 1.25rem;
            list-style-position: outside;
          }

          .policy-content li {
            margin-left: 0;
          }
        `}</style>
            <p><strong>Última atualização: 09/05/2026</strong></p>

        <h2>1. Quem somos</h2>
        <p>
          Este aplicativo é um jogo simples sobre aves migratórias brasileiras, com recursos de cadastro, login, interação entre usuários, perfil público e acompanhamento de partidas. Esta Política explica quais dados coletamos, como usamos e quais são seus direitos.
        </p>

        <h2>2. Dados que coletamos</h2>
        <p>
          Coletamos apenas os dados necessários para criar e operar a conta e as funcionalidades do jogo:
        </p>
        <ul>
          <li>Email</li>
          <li>Senha, armazenada de forma protegida e nunca exibida em texto puro</li>
          <li>Nome de usuário / codinome</li>
          <li>Quando aplicável, nome, bio, avatar e outras informações opcionais de perfil</li>
          <li>Dados de autenticação via Google, quando o usuário opta por entrar com essa conta</li>
          <li>Dados de uso do sistema, como ações de navegação, acesso a perfis, amizades, convites e partidas, quando necessários para o funcionamento do serviço</li>
        </ul>

        <h2>3. Como usamos os dados</h2>
        <p>Usamos essas informações para:</p>
        <ul>
          <li>Criar e autenticar sua conta</li>
          <li>Permitir login normal ou com Google</li>
          <li>Exibir seu perfil e seu nome de usuário para outros jogadores</li>
          <li>Viabilizar interações sociais, como convites de amizade e visualização de perfis</li>
          <li>Registrar progresso, partidas, pontuações e demais funções do jogo</li>
          <li>Prevenir abuso, fraude e uso indevido da plataforma</li>
          <li>Cumprir obrigações legais, quando aplicável</li>
        </ul>

        <h2>4. Compartilhamento de dados</h2>
        <p>
          Não vendemos seus dados pessoais. Podemos compartilhar informações apenas nos seguintes casos:
        </p>
        <ul>
          <li>Com serviços necessários para autenticação, como o provedor de login do Google</li>
          <li>Com infraestrutura técnica usada para hospedar e manter o aplicativo</li>
          <li>Quando exigido por lei, ordem judicial ou autoridade competente</li>
          <li>Entre usuários da plataforma, apenas nas informações que são parte do funcionamento do app, como nome de usuário, perfil público, avatar e estatísticas visíveis</li>
        </ul>

        <h2>5. Login com Google</h2>
        <p>
          Se você escolher entrar com Google, receberemos os dados fornecidos por esse provedor para autenticação e criação ou associação da conta. Usamos apenas o necessário para identificar você e permitir acesso ao serviço.
        </p>

        <h2>6. Cookies e tecnologias similares</h2>
        <p>
          Podemos usar cookies ou armazenamento local apenas para manter sua sessão, lembrar preferências e permitir o funcionamento básico do sistema. Não usamos cookies para fins publicitários, a menos que isso seja informado futuramente.
        </p>

        <h2>7. Retenção e segurança</h2>
        <p>
          Mantemos seus dados enquanto sua conta existir ou enquanto forem necessários para o funcionamento do aplicativo. Adotamos medidas técnicas e organizacionais razoáveis para proteger as informações, mas nenhum sistema é completamente imune a riscos.
        </p>

        <h2>8. Seus direitos</h2>
        <p>Você pode solicitar, conforme a legislação aplicável:</p>
        <ul>
          <li>Acesso aos seus dados</li>
          <li>Correção de dados incompletos ou incorretos</li>
          <li>Exclusão da conta e dos dados associados, quando possível</li>
          <li>Informação sobre o uso e o tratamento dos seus dados</li>
          <li>Revogação do consentimento, quando o tratamento depender dele</li>
        </ul>

        <h2>9. Menores de idade</h2>
        <p>
          Este serviço não é destinado a crianças sem supervisão adequada. Se houver uso por menor de idade, recomenda-se consentimento e acompanhamento de responsável legal, conforme a legislação local.
        </p>

        <h2>10. Alterações desta política</h2>
        <p>
          Podemos atualizar esta Política para refletir mudanças no aplicativo, na legislação ou em nossas práticas. A versão mais recente sempre estará disponível dentro da aplicação.
        </p>

        <h2>11. Contato</h2>
        <p>
          Se você tiver dúvidas sobre privacidade, entre em contato pelo canal informado na aplicação ou pelo email oficial do projeto, se disponível.
        </p>
      </div>
    </section>
  );
}

export default PrivacyPolicyCard;