import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Bullet {
  title: string;
  text: string;
}

interface Experience {
  role: string;
  company: string;
  date: string;
  description: string;
  bullets: Bullet[];
}

interface Education {
  degree: string;
  institution: string;
  bullets: Bullet[];
}

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './curriculum.component.html',
  styleUrl: './curriculum.component.scss',
})
export class CurriculumComponent {
  name = 'Luiz Koubatz';
  title = 'Software Engineer · Frontend Developer · Angular';

  about =
    'Desenvolvedor de Software focado em soluções Frontend para o Itaú BBA, o banco de atacado e investimento do Itaú Unibanco. Atuo na construção de plataformas de alta performance e dashboards complexos utilizando Angular, garantindo que as ferramentas de suporte às decisões financeiras para grandes empresas sejam rápidas, seguras e intuitivas.';

  experiences: Experience[] = [
    {
      role: 'Engenheiro de Software Frontend',
      company: 'Itaú BBA · Itaú Unibanco',
      date: 'nov 2021 — presente · 4 anos 6 meses',
      description:
        'Atuação no IBBA (banco de atacado e investimento), desenvolvendo interfaces de alta performance voltadas para o setor de Corporate & Investment Banking. Foco na entrega de soluções escaláveis e seguras, garantindo a melhor experiência em fluxos operacionais críticos e visualização de dados complexos.',
      bullets: [
        {
          title: 'Responsabilidades e Entrega',
          text: 'Desenvolvimento de novas funcionalidades utilizando Angular, com foco total em segurança, acessibilidade e escalabilidade para atender aos padrões rigorosos do banco.',
        },
        {
          title: 'Stack Técnica',
          text: 'Uso avançado de RxJS para manipulação de streams de dados em tempo real, State Management (NgRx) e garantia de qualidade através de testes unitários com Jest e testes integrados com Cypress.',
        },
        {
          title: 'Processos e Colaboração',
          text: 'Atuação em ambiente ágil com CI/CD e revisões de código. Colaboração estreita com times de UX/UI para a implementação fiel do Design System da instituição, assegurando consistência visual e técnica em larga escala.',
        },
        {
          title: 'Diferencial',
          text: 'Experiência em projetos que exigem alta precisão técnica e performance, transformando requisitos complexos de negócio em interfaces intuitivas para o mercado financeiro.',
        },
      ],
    },
    {
      role: 'Frontend Web Developer',
      company: 'Antlia',
      date: 'nov 2020 — nov 2021 · 1 ano 1 mês',
      description:
        'Atuação estratégica como prestador de serviços alocado no Itaú Unibanco, sendo responsável pelo desenvolvimento de funcionalidades essenciais para diversas aplicações do ecossistema digital do banco.',
      bullets: [
        {
          title: 'Desenvolvimento de Produto',
          text: 'Criação e manutenção de funcionalidades complexas utilizando Angular, focando na modularização e reaproveitamento de componentes entre diferentes squads.',
        },
        {
          title: 'Entrega Técnica',
          text: 'Implementação de interfaces responsivas e integradas a APIs REST, garantindo a fidelidade ao Design System e aos requisitos de negócio do setor financeiro.',
        },
        {
          title: 'Qualidade e Padrões',
          text: 'Escrita de código limpo e testes automatizados, seguindo as diretrizes rigorosas de segurança e performance exigidas pelo banco.',
        },
        {
          title: 'Internalização por Performance',
          text: 'Devido ao alto desempenho nas entregas, proatividade e domínio técnico demonstrados durante o período, recebi o convite para ser internalizado diretamente pelo Itaú, transitando para o time oficial de engenharia do banco (IBBA).',
        },
      ],
    },
    {
      role: 'Software Developer',
      company: 'Wevo iPaaS',
      date: 'jun 2019 — out 2020 · 1 ano 4 meses',
      description:
        'Iniciei na Wevo como Estagiário de Desenvolvimento e, devido à rápida curva de aprendizado e entrega de resultados, fui promovido a Analista em apenas 6 meses. Por ser um ambiente dinâmico de startup, atuei com foco Fullstack, participando ativamente de todas as camadas do produto.',
      bullets: [
        {
          title: 'Desenvolvimento Fullstack',
          text: 'Atuação ponta a ponta na criação de novas funcionalidades, trabalhando tanto na construção de interfaces dinâmicas quanto na lógica de back-end e integração de dados.',
        },
        {
          title: 'Agilidade e Versatilidade',
          text: 'Adaptação rápida a diferentes tecnologias e desafios técnicos, característica essencial do ambiente de startup, contribuindo para a evolução constante da plataforma.',
        },
        {
          title: 'Arquitetura e APIs',
          text: 'Desenvolvimento e consumo de APIs, garantindo a comunicação eficiente entre sistemas e a integridade das informações.',
        },
        {
          title: 'Evolução Profissional',
          text: 'Responsável por sustentar e evoluir módulos críticos do sistema, transitando de tarefas de suporte e aprendizado para a tomada de decisão técnica sobre o código em produção.',
        },
      ],
    },
  ];

  education: Education[] = [
    {
      degree: 'Pós-graduação em Front-end Engineering',
      institution: 'FIAP',
      bullets: [
        {
          title: 'Arquiteturas Avançadas',
          text: 'Domínio de Micro-frontends, Clean Architecture e padrões de design para aplicações complexas.',
        },
        {
          title: 'Ecossistema Angular',
          text: 'Aprofundamento em arquitetura, gestão de estado com NgRx/NGXS e otimização de performance.',
        },
        {
          title: 'DevOps e Cloud',
          text: 'Implementação de esteiras CI/CD (GitHub Actions), containerização com Docker e deploy em ambientes cloud (AWS/Azure/GCP).',
        },
        {
          title: 'Qualidade e Segurança',
          text: 'Testes automatizados (Unitários e E2E) e aplicação de práticas de segurança baseadas no OWASP Top 10.',
        },
        {
          title: 'Desenvolvimento Híbrido',
          text: 'Experiência prática com React Native e Flutter para soluções mobile.',
        },
      ],
    },
  ];
}
