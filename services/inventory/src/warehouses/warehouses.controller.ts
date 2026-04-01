import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto, WarehouseType } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@ApiTags('warehouses')
@ApiBearerAuth('JWT')
@ApiHeader({ name: 'X-Tenant-ID', description: 'Tenant identifier', required: true })
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: 'List all warehouses (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: WarehouseType })
  @ApiQuery({ name: 'country', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Paginated warehouse list' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: string,
    @Query('country') country?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.warehousesService.findAll(tenantId, {
      page,
      limit,
      type,
      country,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('map')
  @ApiOperation({ summary: 'Get all warehouses with coordinates for map view' })
  @ApiResponse({ status: 200, description: 'Warehouses with geolocation data' })
  getMapData(@Headers('x-tenant-id') tenantId: string) {
    return this.warehousesService.getMapData(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by ID with capacity utilization' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Warehouse details with utilization' })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.warehousesService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({ status: 201, description: 'Warehouse created' })
  @ApiResponse({ status: 409, description: 'Warehouse code already exists' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateWarehouseDto,
  ) {
    return this.warehousesService.create(tenantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update warehouse details' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Warehouse updated' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a warehouse (only if empty)' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Warehouse deleted' })
  @ApiResponse({ status: 409, description: 'Warehouse has active inventory' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.warehousesService.remove(tenantId, id);
  }

  @Get(':id/inventory')
  @ApiOperation({ summary: 'Get all inventory items in a warehouse' })
  @ApiParam({ name: 'id', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated inventory for warehouse' })
  getInventory(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.warehousesService.getInventory(tenantId, id, { page, limit });
  }

  @Get(':id/capacity')
  @ApiOperation({ summary: 'Get warehouse capacity utilization stats' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Capacity utilization statistics' })
  getCapacity(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    return this.warehousesService.getCapacity(tenantId, id);
  }
}
