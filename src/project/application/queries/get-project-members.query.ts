export class GetProjectMembersQuery {
  constructor(
    public readonly projectId: string,
    public readonly currentUserId: number,
  ) {}
}
