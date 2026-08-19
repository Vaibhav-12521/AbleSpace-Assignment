import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { WorkspaceBootstrapService } from './workspace-bootstrap.service';

@Module({
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceBootstrapService],
  exports: [WorkspaceBootstrapService],
})
export class WorkspacesModule {}
