import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, UseInterceptors, UploadedFile, Request, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Role } from '../users/schemas/user.schema';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post('img-upload')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads'),
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFile(@UploadedFile() file: any, @Request() req: any) {
    const protocol = req.protocol;
    const host = req.get('host');
    return {
      url: `${protocol}://${host}/uploads/${file.filename}`
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  create(@Body() createProductDto: any, @Request() req: any) {
    return this.productsService.create(createProductDto, req.user.userId);
  }

  @Public()
  @Get()
  findAll(@Query('lang') lang?: string) {
    return this.productsService.findAll(lang);
  }

  @Public()
  @Get('market-comparison')
  getMarketComparison() {
    return this.productsService.getMarketComparison();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.productsService.findOne(id, lang);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.productsService.getHistory(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateProductDto: any, @Request() req: any) {
    return this.productsService.update(id, updateProductDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.productsService.remove(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Put(':id/market-price')
  updateMarketPrice(@Param('id') id: string, @Body() marketPriceData: any, @Request() req: any) {
    return this.productsService.updateMarketPrice(id, marketPriceData, req.user.userId);
  }

}
