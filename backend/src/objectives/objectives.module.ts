import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectivesService } from './objectives.service';
import { ObjectivesController } from './objectives.controller';
import { Objective, ObjectiveSchema } from './schemas/objective.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Objective.name, schema: ObjectiveSchema }]),
    ProductsModule,
  ],
  controllers: [ObjectivesController],
  providers: [ObjectivesService],
  exports: [ObjectivesService],
})
export class ObjectivesModule {}
