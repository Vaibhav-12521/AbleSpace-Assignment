import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import {
  CreateStatusDto,
  UpdateProfileDto,
  UpdateStatusDto,
} from './dto/workspace.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspaces: WorkspacesService) {}

  @Get('bootstrap')
  bootstrap(@CurrentUser() user: AuthenticatedUser) {
    return this.workspaces.getBootstrap(user.workspaceId);
  }

  @Post('statuses')
  createStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStatusDto,
  ) {
    return this.workspaces.createStatus(user.workspaceId, dto);
  }

  @Patch('statuses/:id')
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.workspaces.updateStatus(user.workspaceId, id, dto);
  }

  @Delete('statuses/:id')
  deleteStatus(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.workspaces.deleteStatus(user.workspaceId, id);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.workspaces.updateProfile(user.id, dto);
  }
}
