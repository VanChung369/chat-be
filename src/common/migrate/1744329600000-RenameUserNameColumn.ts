import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUserNameColumn1744329600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('users', 'name', 'userName');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn('users', 'userName', 'name');
  }
}
