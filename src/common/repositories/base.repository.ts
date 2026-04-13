import {
  DeepPartial,
  DeleteResult,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class BaseRepository<Entity extends ObjectLiteral> {
  protected constructor(protected readonly repository: Repository<Entity>) {}

  create(entityLike: DeepPartial<Entity>): Entity {
    return this.repository.create(entityLike);
  }

  createMany(entityLikes: DeepPartial<Entity>[]): Entity[] {
    return this.repository.create(entityLikes);
  }

  async save(entity: DeepPartial<Entity>): Promise<Entity> {
    return await this.repository.save(entity);
  }

  find(options?: FindManyOptions<Entity>): Promise<Entity[]> {
    return this.repository.find(options);
  }

  findOne(options: FindOneOptions<Entity>): Promise<Entity | null> {
    return this.repository.findOne(options);
  }

  findBy(where: FindOptionsWhere<Entity>): Promise<Entity[]> {
    return this.repository.findBy(where);
  }

  update(
    where: FindOptionsWhere<Entity>,
    partialEntity: QueryDeepPartialEntity<Entity>,
  ): Promise<UpdateResult> {
    return this.repository.update(where, partialEntity);
  }

  delete(where: FindOptionsWhere<Entity>): Promise<DeleteResult> {
    return this.repository.delete(where);
  }

  count(options?: FindManyOptions<Entity>): Promise<number> {
    return this.repository.count(options);
  }

  exists(where: FindOptionsWhere<Entity>): Promise<boolean> {
    return this.repository.exists({ where });
  }
}
