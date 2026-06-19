import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamsService } from './teams.service';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  @ApiOperation({ summary: 'List teams with pagination metadata' })
  @ApiOkResponse({ description: 'Teams wrapped in { data, meta }.' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.teamsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team by ID' })
  @ApiParam({ name: 'id', description: 'Team UUID' })
  @ApiOkResponse({ description: 'Team wrapped in { data }.' })
  @ApiNotFoundResponse({ description: 'Team not found.' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.teamsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a team' })
  @ApiCreatedResponse({ description: 'Created team wrapped in { data }.' })
  create(@Body() dto: CreateTeamDto) {
    return this.teamsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a team' })
  @ApiParam({ name: 'id', description: 'Team UUID' })
  @ApiOkResponse({ description: 'Updated team wrapped in { data }.' })
  @ApiNotFoundResponse({ description: 'Team not found.' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a team' })
  @ApiParam({ name: 'id', description: 'Team UUID' })
  @ApiOkResponse({ description: 'Deleted team wrapped in { data }.' })
  @ApiNotFoundResponse({ description: 'Team not found.' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.teamsService.remove(id);
  }
}
