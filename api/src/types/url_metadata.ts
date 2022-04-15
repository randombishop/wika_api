import { ApiProperty } from '@nestjs/swagger';

export default class UrlMetadata {
  @ApiProperty()
  public id: string;

  @ApiProperty()
  public url: string;

  @ApiProperty()
  public title: string;

  @ApiProperty()
  public description: string;

  @ApiProperty()
  public icon: string;

  @ApiProperty()
  public updatedAt: Date;

  @ApiProperty()
  public score: number;

  @ApiProperty()
  public numLikesUser: number;

  @ApiProperty()
  public numLikesTotal: number;

  constructor(data) {
    this.id = data._id;
    this.url = data._source.url;
    this.title = data._source.title;
    this.description = data._source.description;
    this.icon = data._source.icon;
    this.updatedAt = data._source.updatedAt;
    this.score = data._score;
  }
}
