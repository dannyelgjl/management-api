import { PrismaClient, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.team.deleteMany();

  const product = await prisma.team.create({
    data: {
      name: 'Produto',
      colorHex: '#2563EB',
      description: 'Responsavel por discovery, priorizacao e roadmap.',
    },
  });

  const engineering = await prisma.team.create({
    data: {
      name: 'Engenharia',
      colorHex: '#16A34A',
      description: 'Responsavel por arquitetura, implementacao e qualidade tecnica.',
    },
  });

  const design = await prisma.team.create({
    data: {
      name: 'Design',
      colorHex: '#EA580C',
      description: 'Responsavel por experiencia, interface e prototipos.',
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Revisar backlog inicial',
        description: 'Classificar historias por valor e dependencia.',
        status: TaskStatus.PENDING,
        dueDate: new Date('2026-07-01T12:00:00.000Z'),
      },
      {
        title: 'Definir criterios de aceite',
        description: 'Padronizar exemplos de entradas e saidas esperadas.',
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2026-07-02T12:00:00.000Z'),
      },
      {
        title: 'Criar prototipo navegavel',
        description: 'Validar fluxo principal antes da implementacao.',
        status: TaskStatus.DONE,
        dueDate: new Date('2026-07-03T12:00:00.000Z'),
      },
      {
        title: 'Configurar pipeline de testes',
        description: 'Garantir execucao automatizada de unitarios e e2e.',
        status: TaskStatus.PENDING,
        dueDate: new Date('2026-07-04T12:00:00.000Z'),
      },
      {
        title: 'Documentar contrato REST',
        description: 'Adicionar exemplos cURL no README.',
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2026-07-05T12:00:00.000Z'),
      },
      {
        title: 'Validar labels de time',
        description: 'Conferir cores e nomes exibidos nas tarefas.',
        status: TaskStatus.PENDING,
        dueDate: new Date('2026-07-06T12:00:00.000Z'),
      },
      {
        title: 'Preparar seed demonstrativo',
        description: 'Criar 3 times e 10 tarefas para avaliacao rapida.',
        status: TaskStatus.DONE,
        dueDate: new Date('2026-07-07T12:00:00.000Z'),
      },
      {
        title: 'Mapear cenarios de erro',
        description: 'Definir envelope padrao para validacao e negocio.',
        status: TaskStatus.PENDING,
        dueDate: new Date('2026-07-08T12:00:00.000Z'),
      },
      {
        title: 'Refinar filtros da listagem',
        description: 'Combinar status, time, search, sort e paginacao.',
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2026-07-09T12:00:00.000Z'),
      },
      {
        title: 'Tarefa sem time vinculado',
        description: 'Exemplo para validar relacionamento opcional.',
        status: TaskStatus.PENDING,
        dueDate: null,
      },
    ],
  });

  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, title: true },
  });

  const byTitle = new Map(tasks.map((task) => [task.title, task.id]));

  await prisma.task.update({
    where: { id: byTitle.get('Revisar backlog inicial') },
    data: { teams: { connect: [{ id: product.id }] } },
  });

  await prisma.task.update({
    where: { id: byTitle.get('Definir criterios de aceite') },
    data: { teams: { connect: [{ id: product.id }, { id: engineering.id }] } },
  });

  await prisma.task.update({
    where: { id: byTitle.get('Criar prototipo navegavel') },
    data: { teams: { connect: [{ id: design.id }, { id: product.id }] } },
  });

  await prisma.task.update({
    where: { id: byTitle.get('Configurar pipeline de testes') },
    data: { teams: { connect: [{ id: engineering.id }] } },
  });

  await prisma.task.update({
    where: { id: byTitle.get('Documentar contrato REST') },
    data: { teams: { connect: [{ id: engineering.id }] } },
  });

  await prisma.task.update({
    where: { id: byTitle.get('Validar labels de time') },
    data: { teams: { connect: [{ id: design.id }, { id: engineering.id }] } },
  });

  await prisma.task.update({
    where: { id: byTitle.get('Preparar seed demonstrativo') },
    data: { teams: { connect: [{ id: engineering.id }] } },
  });

  await prisma.task.update({
    where: { id: byTitle.get('Mapear cenarios de erro') },
    data: { teams: { connect: [{ id: product.id }, { id: engineering.id }] } },
  });

  await prisma.task.update({
    where: { id: byTitle.get('Refinar filtros da listagem') },
    data: { teams: { connect: [{ id: product.id }, { id: design.id }] } },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
