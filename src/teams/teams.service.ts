import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginationMeta } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

const teamInclude = {
  _count: { select: { tasks: true } },
} satisfies Prisma.TeamInclude;

type TeamWithCount = Prisma.TeamGetPayload<{ include: typeof teamInclude }>;

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto) {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const search = query.search?.trim();
    const where: Prisma.TeamWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, teams] = await this.prisma.$transaction([
      this.prisma.team.count({ where }),
      this.prisma.team.findMany({
        where,
        include: teamInclude,
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset,
      }),
    ]);

    return {
      data: teams.map((team) => this.serialize(team)),
      meta: buildPaginationMeta(total, limit, offset),
    };
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: teamInclude,
    });

    if (!team) {
      throw new NotFoundException('Team not found.');
    }

    return this.serialize(team);
  }

  async create(dto: CreateTeamDto) {
    const team = await this.prisma.team.create({
      data: dto,
      include: teamInclude,
    });

    return this.serialize(team);
  }

  async update(id: string, dto: UpdateTeamDto) {
    const team = await this.prisma.team.update({
      where: { id },
      data: dto,
      include: teamInclude,
    });

    return this.serialize(team);
  }

  async remove(id: string) {
    const team = await this.prisma.team.delete({
      where: { id },
      include: teamInclude,
    });

    return this.serialize(team);
  }

  private serialize(team: TeamWithCount) {
    const { _count, ...data } = team;

    return {
      ...data,
      tasksCount: _count.tasks,
    };
  }
}
