import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ActivitySummary {
  @Field()
  date: string;

  @Field(() => Int)
  totalTime: number;
}
