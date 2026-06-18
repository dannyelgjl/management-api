import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  TaskStatus as PrismaTaskStatus,
} from '@prisma/client';

import { buildPaginationMeta } from '../common/pagination';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TasksQueryDto } from './dto/tasks-query.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from './task-status.enum';

const taskInclude = {
  teams: { orderBy: { name: 'asc' } },
} satisfies Prisma.TaskInclude;

type TaskWithTeams = Prisma.TaskGetPayload<{ include: typeof taskInclude }>;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: TasksQueryDto) {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query.sort);

    const [total, tasks] = await this.prisma.$transaction([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy,
        take: limit,
        skip: offset,
      }),
    ]);

    return {
      data: tasks.map((task) => this.serialize(task)),
      meta: buildPaginationMeta(total, limit, offset),
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    return this.serialize(task);
  }

  async create(dto: CreateTaskDto) {
    const teamIds = await this.ensureTeamsExist(dto.teamIds);
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: (dto.status ?? TaskStatus.PENDING) as PrismaTaskStatus,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        teams: teamIds.length
          ? { connect: teamIds.map((id) => ({ id })) }
          : undefined,
      },
      include: taskInclude,
    });

    return this.serialize(task);
  }

  async update(id: string, dto: UpdateTaskDto) {
    const data: Prisma.TaskUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title;
    }

    if (dto.description !== undefined) {
      data.description = dto.description;
    }

    if (dto.status !== undefined) {
      data.status = dto.status as PrismaTaskStatus;
    }

    if (dto.dueDate !== undefined) {
      data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    if (dto.teamIds !== undefined) {
      const teamIds = await this.ensureTeamsExist(dto.teamIds);
      data.teams = { set: teamIds.map((teamId) => ({ id: teamId })) };
    }

    const task = await this.prisma.task.update({
      where: { id },
      data,
      include: taskInclude,
    });

    return this.serialize(task);
  }

  async updateStatus(id: string, dto: UpdateTaskStatusDto) {
    const task = await this.prisma.task.update({
      where: { id },
      data: { status: dto.status as PrismaTaskStatus },
      include: taskInclude,
    });

    return this.serialize(task);
  }

  async remove(id: string) {
    const task = await this.prisma.task.delete({
      where: { id },
      include: taskInclude,
    });

    return this.serialize(task);
  }

  private buildWhere(query: TasksQueryDto): Prisma.TaskWhereInput {
    const search = query.search?.trim();
    const where: Prisma.TaskWhereInput = {};

    if (query.teamId) {
      where.teams = { some: { id: query.teamId } };
    }

    if (query.status) {
      where.status = query.status as PrismaTaskStatus;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private buildOrderBy(sort = 'createdAt:desc'): Prisma.TaskOrderByWithRelationInput {
    const [field, direction] = sort.split(':') as [
      'createdAt' | 'updatedAt' | 'dueDate' | 'title' | 'status',
      'asc' | 'desc',
    ];

    return { [field]: direction };
  }

  private async ensureTeamsExist(teamIds: string[] = []) {
    const uniqueTeamIds = [...new Set(teamIds)];

    if (!uniqueTeamIds.length) {
      return [];
    }

    const teams = await this.prisma.team.findMany({
      where: { id: { in: uniqueTeamIds } },
      select: { id: true },
    });
    const foundIds = new Set(teams.map((team) => team.id));
    const missingTeamIds = uniqueTeamIds.filter((teamId) => !foundIds.has(teamId));

    if (missingTeamIds.length) {
      throw new BadRequestException({
        message: 'One or more teams were not found.',
        details: { teamIds: missingTeamIds },
      });
    }

    return uniqueTeamIds;
  }

  private serialize(task: TaskWithTeams) {
    return task;
  }
}
