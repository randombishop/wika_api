import { ApiProperty } from '@nestjs/swagger';

/**
 * Url data object containing the url string, the MD% hash as the id,
 * and the fields available in the elastic search database
 */
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

  /**
   * The constructor takes the object returned by Elastic Search API and fills in the fields
   */
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
