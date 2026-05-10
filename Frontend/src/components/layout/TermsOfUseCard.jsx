import React from 'react';

function TermsOfUseCard({ onBack }) {
  return (
    <section
      className="card policy-card"
      aria-label="Termos de Uso"
      style={{ margin: '0 auto' }}
    >
      <div className="policy-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h1 style={{ margin: 0 }}>Termos de Uso</h1>
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
        <p><em>Última atualização: 09/05/2026</em></p>

        <h2>1. Aceitação dos termos</h2>
        <p>
          Ao criar uma conta, acessar ou usar este aplicativo, você concorda com estes Termos de Serviço
          e com a Política de Privacidade. Se não concordar, não use o serviço.
        </p>

        <h2>2. Descrição do serviço</h2>
        <p>
          O aplicativo oferece um jogo simples sobre aves migratórias brasileiras, com cadastro de usuários,
          autenticação por email e senha, login com Google, perfis públicos, interações sociais e recursos
          ligados à experiência do jogo.
        </p>

        <h2>3. Conta de usuário</h2>
        <p>Para usar o serviço, você deve:</p>
        <ul>
          <li>Fornecer informações verdadeiras e atualizadas</li>
          <li>Manter sua senha em segurança</li>
          <li>Não compartilhar sua conta com terceiros</li>
          <li>Informar imediatamente qualquer uso não autorizado da sua conta</li>
        </ul>

        <h2>4. Regras de uso</h2>
        <p>Você concorda em não usar o serviço para:</p>
        <ul>
          <li>Violentar a lei ou os direitos de terceiros</li>
          <li>Fazer spam, assédio, abuso, fraude ou intimidação</li>
          <li>Tentar invadir, explorar ou prejudicar a plataforma</li>
          <li>Inserir conteúdo ofensivo, enganoso, discriminatório ou ilegal</li>
          <li>Automatizar o uso do serviço de forma indevida</li>
          <li>Tentar manipular pontuações, convites, amizades ou qualquer mecanismo do jogo</li>
        </ul>

        <h2>5. Interações entre usuários</h2>
        <p>
          O aplicativo pode permitir visualização de perfis, convites, amizades e outras interações. Você é
          responsável pelo conteúdo que publica e pela forma como interage com outros usuários. Não use essas
          funções para assédio ou comportamento inadequado.
        </p>

        <h2>6. Conteúdo e perfis</h2>
        <p>
          Informações públicas do perfil, como nome de usuário, avatar, bio e estatísticas, podem ser exibidas
          para outros usuários conforme o funcionamento do serviço. Evite inserir dados sensíveis ou informações
          que não deseja tornar visíveis.
        </p>

        <h2>7. Propriedade intelectual</h2>
        <p>
          Todo o design, marca, interface, textos, imagens e elementos do aplicativo pertencem aos seus
          respectivos titulares, salvo indicação contrária. Você recebe apenas uma licença limitada para uso
          do serviço conforme estes Termos.
        </p>

        <h2>8. Disponibilidade do serviço</h2>
        <p>
          O serviço é oferecido “como está” e pode ser alterado, suspenso ou encerrado a qualquer momento,
          total ou parcialmente, por motivos técnicos, de manutenção ou de segurança.
        </p>

        <h2>9. Suspensão e encerramento de conta</h2>
        <p>
          Podemos limitar, suspender ou encerrar contas que violem estes Termos, prejudiquem outros usuários
          ou comprometam o funcionamento do sistema.
        </p>

        <h2>10. Isenção de garantias</h2>
        <p>
          Não garantimos funcionamento ininterrupto, livre de erros ou totalmente seguro. Embora o serviço seja
          mantido com cuidado, falhas podem ocorrer.
        </p>

        <h2>11. Limitação de responsabilidade</h2>
        <p>
          Na máxima extensão permitida pela lei, não nos responsabilizamos por danos indiretos, perda de dados,
          interrupções de serviço ou prejuízos causados por uso indevido da plataforma ou por fatores fora do
          nosso controle.
        </p>

        <h2>12. Alterações dos termos</h2>
        <p>
          Podemos atualizar estes Termos a qualquer momento. Se as mudanças forem relevantes, elas devem ser
          disponibilizadas dentro da aplicação. O uso contínuo após a atualização indica concordância com a
          nova versão.
        </p>

        <h2>13. Lei aplicável e foro</h2>
        <p>
          Estes Termos serão regidos pela legislação aplicável ao projeto e, quando necessário, eventuais disputas
          serão resolvidas no foro competente.
        </p>

        <h2>14. Contato</h2>
        <p>Dúvidas sobre estes Termos podem ser enviadas pelo canal oficial informado na aplicação.</p>
      </div>
    </section>
  );
}

export default TermsOfUseCard;