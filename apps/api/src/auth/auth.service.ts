import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceBootstrapService } from '../workspaces/workspace-bootstrap.service';
import type { JwtPayload } from './jwt.strategy';
import { randomUUID } from 'node:crypto';

const GUEST_NAME = 'Vaibhav';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly bootstrap: WorkspaceBootstrapService,
  ) {}

  async loginAsGuest() {
    const handle = randomUUID().slice(0, 8);
    const name = GUEST_NAME;

    const user = await this.prisma.user.create({
      data: {
        email: `guest-${handle}@pyramid.local`,
        name,
        username: `${name.toLowerCase()}${handle.slice(0, 4)}`,
        title: 'Designer',
        isGuest: true,
      },
    });

    const workspace = await this.bootstrap.createStarterWorkspace(
      user.id,
      name,
    );

    return this.issueSession(user.id, workspace.id);
  }

  async getProfile(userId: string, workspaceId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        title: true,
        avatarUrl: true,
        isGuest: true,
      },
    });

    const workspace = await this.prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { id: true, name: true },
    });

    return { user, workspace };
  }

  private async issueSession(userId: string, workspaceId: string) {
    const payload: JwtPayload = { sub: userId, workspaceId };
    const accessToken = await this.jwt.signAsync(payload);
    const { user, workspace } = await this.getProfile(userId, workspaceId);

    return { accessToken, user, workspace };
  }
}
