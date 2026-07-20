import { Controller, Get, Post, Body, Param, Put, Delete, Request } from '@nestjs/common';
import { ActorsService } from './actors.service';
import { Actor } from './schemas/actor.schema';

@Controller('actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Post()
  async create(@Body() createActorDto: any): Promise<Actor> {
    return this.actorsService.create(createActorDto);
  }

  @Get()
  async findAll(): Promise<Actor[]> {
    return this.actorsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Actor> {
    return this.actorsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateActorDto: any, @Request() req: any): Promise<Actor> {
    return this.actorsService.update(id, updateActorDto, req.user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any): Promise<Actor> {
    return this.actorsService.remove(id, req.user);
  }
}
